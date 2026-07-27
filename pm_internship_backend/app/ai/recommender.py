"""
Hybrid Recommendation Engine (Content-Based + Collaborative Filtering)
for the PM Internship Scheme.
"""
from typing import List, Tuple, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from .. import models
import math

DOMAIN_BOOST = 0.12
LOCATION_BOOST = 0.08
WORK_MODE_BOOST = 0.05

def _split_csv(value: str) -> List[str]:
    if not value:
        return []
    return [v.strip().lower() for v in value.split(",") if v.strip()]

def _student_text(student: models.Student) -> str:
    skills_text = " ".join([s.skill_name for s in student.skills]) if student.skills else ""
    return " ".join([
        skills_text,
        student.areas_of_interest or "",
        student.career_goal or "",
        student.degree or "",
        student.branch or ""
    ]).lower()

def _internship_text(internship: models.Internship) -> str:
    skills_text = " ".join([s.skill_name for s in internship.skills]) if internship.skills else ""
    return " ".join([
        internship.title or "",
        internship.domain or "",
        skills_text,
        internship.description or "",
    ]).lower()

def _build_reasons(
    student: models.Student, internship: models.Internship
) -> List[str]:
    reasons = []
    
    student_skills = {s.skill_name.lower().strip() for s in student.skills} if student.skills else set()
    internship_skills = {s.skill_name.lower().strip() for s in internship.skills} if internship.skills else set()
    
    from .nlp_skills import match_skills_semantic
    overlap = sorted(match_skills_semantic(student_skills, internship_skills))
    if overlap:
        shown = ", ".join(s.title() for s in overlap[:5])
        reasons.append(f"Matches your skills: {shown}")
        
    student_career = (student.career_goal or "").lower()
    if student_career and internship.domain and internship.domain.lower() in student_career:
        reasons.append(f"In your preferred domain ({internship.domain})")
        
    if student.preferred_work_location and internship.location:
        if student.preferred_work_location.strip().lower() == internship.location.strip().lower():
            reasons.append(f"Located in your preferred city ({internship.location})")
            
    if student.preferred_work_mode and internship.mode:
        if student.preferred_work_mode.value == internship.mode.value:
            reasons.append(f"Offers your preferred work mode ({internship.mode.value})")
            
    if not reasons:
        reasons.append("General relevance based on your overall profile")
        
    return reasons

def _compute_collaborative_score(student_id: int, internship_id: int, db: Session) -> float:
    # A simplified collaborative filtering memory-based heuristic
    # Finds other students who applied to this internship, and sees what else they applied to
    # Or simply: popularity-based boost + average rating of the internship
    feedbacks = db.query(models.Feedback).filter(models.Feedback.internship_id == internship_id).all()
    if not feedbacks:
        return 0.0
    
    avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks)
    # Normalize rating from 1-5 to 0.0 - 0.2 boost max
    return min(0.2, (avg_rating / 5.0) * 0.2)

def score_internships(
    student: models.Student, internships: List[models.Internship], db: Session = None
) -> List[Tuple[models.Internship, float, List[str]]]:
    """Hybrid approach: Content + Collaborative"""
    if not internships:
        return []
        
    corpus = [_student_text(student)] + [_internship_text(i) for i in internships]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(corpus)
    base_scores = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten().tolist()
    
    results = []
    for internship, base_score in zip(internships, base_scores):
        score = base_score
        
        student_career = (student.career_goal or "").lower()
        if student_career and internship.domain and internship.domain.lower() in student_career:
            score += DOMAIN_BOOST
            
        if student.preferred_work_location and internship.location:
            if student.preferred_work_location.strip().lower() == internship.location.strip().lower():
                score += LOCATION_BOOST
                
        if student.preferred_work_mode and internship.mode:
            if student.preferred_work_mode.value == internship.mode.value:
                score += WORK_MODE_BOOST
                
        # Collaborative filtering boost (if db is provided)
        cf_boost = 0.0
        if db:
            cf_boost = _compute_collaborative_score(student.student_id, internship.internship_id, db)
            score += cf_boost
            
        score = max(0.0, min(1.0, score))
        match_percentage = round(score * 100, 1)
        reasons = _build_reasons(student, internship)
        
        if db and cf_boost > 0.05:
            reasons.append("Highly rated by other interns.")
            
        results.append((internship, match_percentage, reasons))
        
    results.sort(key=lambda r: r[1], reverse=True)
    return results

def score_students(
    internship: models.Internship, students: List[models.Student], db: Session = None
) -> List[Tuple[models.Student, float, List[str]]]:
    if not students:
        return []
        
    corpus = [_internship_text(internship)] + [_student_text(s) for s in students]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(corpus)
    base_scores = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten().tolist()
    
    results = []
    for student, base_score in zip(students, base_scores):
        score = base_score
        
        student_career = (student.career_goal or "").lower()
        if student_career and internship.domain and internship.domain.lower() in student_career:
            score += DOMAIN_BOOST
            
        if student.preferred_work_location and internship.location:
            if student.preferred_work_location.strip().lower() == internship.location.strip().lower():
                score += LOCATION_BOOST
                
        if student.preferred_work_mode and internship.mode:
            if student.preferred_work_mode.value == internship.mode.value:
                score += WORK_MODE_BOOST
                
        score = max(0.0, min(1.0, score))
        match_percentage = round(score * 100, 1)
        reasons = _build_reasons(student, internship)
        results.append((student, match_percentage, reasons))
        
    results.sort(key=lambda r: r[1], reverse=True)
    return results
