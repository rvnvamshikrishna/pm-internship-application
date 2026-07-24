"""
Recommendation engine for matching students to internships.

Approach (deliberately simple + explainable for an SRS/demo):
1. Build a text profile for the student: skills + interests + preferred domain.
2. Build a text profile for each internship: title + domain + required skills + description.
3. Vectorize all profiles with TF-IDF and compute cosine similarity between the
   student and every internship -> a base content-match score (0-1).
4. Apply small, transparent boosts for exact preferred-domain / location /
   work-mode matches, then clip to [0, 1].
5. Convert to a 0-100 match percentage and generate human-readable reasons
   (overlapping skills, domain match, location match, work-mode match).

This keeps the model interpretable, which matters for the "clear reasons"
requirement and is easy to explain in a viva/demo.
"""
from typing import List, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from . import models

DOMAIN_BOOST = 0.12
LOCATION_BOOST = 0.08
WORK_MODE_BOOST = 0.05


def _split_csv(value: str) -> List[str]:
    return [v.strip().lower() for v in value.split(",") if v.strip()]


def _student_text(student: models.StudentProfile) -> str:
    return " ".join([
        student.skills or "",
        student.interests or "",
        student.preferred_domain or "",
        student.education or "",
    ])


def _internship_text(internship: models.Internship) -> str:
    return " ".join([
        internship.title,
        internship.domain,
        internship.required_skills,
        internship.description,
    ])


def _base_similarity_scores(
    student: models.StudentProfile, internships: List[models.Internship]
) -> List[float]:
    if not internships:
        return []
    corpus = [_student_text(student)] + [_internship_text(i) for i in internships]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(corpus)
    sims = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()
    return sims.tolist()


def _build_reasons(
    student: models.StudentProfile, internship: models.Internship
) -> List[str]:
    reasons = []

    student_skills = set(_split_csv(student.skills))
    internship_skills = set(_split_csv(internship.required_skills))
    overlap = sorted(student_skills & internship_skills)
    if overlap:
        shown = ", ".join(s.title() for s in overlap[:5])
        reasons.append(f"Matches your skills: {shown}")

    if student.preferred_domain and student.preferred_domain.strip().lower() == internship.domain.strip().lower():
        reasons.append(f"In your preferred domain ({internship.domain})")

    if student.preferred_location and student.preferred_location.strip().lower() == internship.location.strip().lower():
        reasons.append(f"Located in your preferred city ({internship.location})")

    if student.preferred_work_mode and student.preferred_work_mode.value == internship.work_mode.value:
        reasons.append(f"Offers your preferred work mode ({internship.work_mode.value})")

    student_interests = set(_split_csv(student.interests))
    interest_overlap = sorted(student_interests & internship_skills.union({internship.domain.lower()}))
    if interest_overlap and not overlap:
        reasons.append("Aligned with your stated interests")

    if not reasons:
        reasons.append("General relevance based on your overall profile")

    return reasons


def score_internships(
    student: models.StudentProfile, internships: List[models.Internship]
) -> List[Tuple[models.Internship, float, List[str]]]:
    """Returns (internship, match_percentage, reasons) sorted by match desc."""
    base_scores = _base_similarity_scores(student, internships)

    results = []
    for internship, base_score in zip(internships, base_scores):
        score = base_score

        if student.preferred_domain and student.preferred_domain.strip().lower() == internship.domain.strip().lower():
            score += DOMAIN_BOOST
        if student.preferred_location and student.preferred_location.strip().lower() == internship.location.strip().lower():
            score += LOCATION_BOOST
        if student.preferred_work_mode and student.preferred_work_mode.value == internship.work_mode.value:
            score += WORK_MODE_BOOST

        score = max(0.0, min(1.0, score))
        match_percentage = round(score * 100, 1)
        reasons = _build_reasons(student, internship)
        results.append((internship, match_percentage, reasons))

    results.sort(key=lambda r: r[1], reverse=True)
    return results


def score_students(
    internship: models.Internship, students: List[models.StudentProfile]
) -> List[Tuple[models.StudentProfile, float, List[str]]]:
    """Rank students against a single internship (used on the company side)."""
    if not students:
        return []

    corpus = [_internship_text(internship)] + [_student_text(s) for s in students]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(corpus)
    sims = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten().tolist()

    results = []
    for student, base_score in zip(students, sims):
        score = base_score
        if student.preferred_domain and student.preferred_domain.strip().lower() == internship.domain.strip().lower():
            score += DOMAIN_BOOST
        if student.preferred_location and student.preferred_location.strip().lower() == internship.location.strip().lower():
            score += LOCATION_BOOST
        if student.preferred_work_mode and student.preferred_work_mode.value == internship.work_mode.value:
            score += WORK_MODE_BOOST
        score = max(0.0, min(1.0, score))
        match_percentage = round(score * 100, 1)
        reasons = _build_reasons(student, internship)
        results.append((student, match_percentage, reasons))

    results.sort(key=lambda r: r[1], reverse=True)
    return results
