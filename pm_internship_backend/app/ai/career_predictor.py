"""
Career Path Prediction Engine.
"""
from typing import List, Set
from .. import models

# A predefined set of career rules. In a real production system with thousands of students,
# this would be replaced with a multi-label classification model (e.g. Scikit-Learn Random Forest)
# trained on historical student -> successful career paths.
CAREER_MAP = {
    "Software Engineer": ["python", "java", "c++", "c", "javascript", "react", "node", "django", "spring"],
    "Data Scientist / ML Engineer": ["python", "r", "machine learning", "ml", "deep learning", "ai", "pandas", "numpy", "tensorflow", "pytorch", "data analysis"],
    "Frontend Developer": ["html", "css", "javascript", "react", "angular", "vue", "ui", "ux"],
    "Backend Developer": ["node.js", "django", "flask", "java", "spring", "sql", "postgresql", "mongodb", "docker", "aws"],
    "Business Analyst / PM": ["excel", "sql", "communication", "leadership", "agile", "scrum", "product management", "tableau", "power bi"],
    "Financial Analyst": ["finance", "accounting", "excel", "economics", "modeling", "tally", "gst"],
    "Digital Marketer": ["seo", "sem", "marketing", "social media", "content writing", "google ads", "analytics"],
    "Cloud/DevOps Engineer": ["aws", "azure", "gcp", "docker", "kubernetes", "linux", "ci/cd", "jenkins", "bash"],
}

def predict_career_paths(student: models.Student) -> str:
    """
    Predicts the top career paths based on the student's skills and education.
    Returns a comma-separated string of predicted paths.
    """
    student_skills = {s.skill_name.lower().strip() for s in student.skills} if student.skills else set()
    student_text = " ".join([
        student.degree or "",
        student.branch or "",
        student.areas_of_interest or ""
    ]).lower()

    scores = {}
    
    for career, keywords in CAREER_MAP.items():
        score = 0
        for kw in keywords:
            if kw in student_skills:
                score += 2  # Stronger weight for explicit skills
            if kw in student_text:
                score += 1  # Weaker weight for mentions in degree/interest
        
        if score > 0:
            scores[career] = score

    if not scores:
        return "General Management / Analyst"

    # Get top 2 careers by score
    sorted_careers = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_careers = [c[0] for c in sorted_careers[:2]]
    
    return ", ".join(top_careers)
