import os
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


# -------------------------------------------------
# Helper Functions
# -------------------------------------------------
def get_logged_in_student(
    db: Session,
    current_user: dict
):
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can access this endpoint."
        )

    student = (
        db.query(models.Student)
        .filter(
            models.Student.student_id == int(current_user["sub"])
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found."
        )

    return student


def calculate_completeness(student: models.Student) -> int:
    # 12 core profile fields
    fields = [
        student.full_name, student.first_name, student.last_name, student.gender, student.date_of_birth,
        student.permanent_address, student.college, student.degree, student.branch,
        student.graduation_year, student.cgpa, student.languages
    ]
    filled = sum(1 for f in fields if f is not None and f != "")
    
    # Check skills (if student has at least one skill)
    if student.skills:
        filled += 1
    # Check resume
    if student.resume_path:
        filled += 1
        
    total_fields = len(fields) + 2
    return int((filled / total_fields) * 100)


# -------------------------------------------------
# View Profile
# -------------------------------------------------
@router.get(
    "/me",
    response_model=schemas.StudentOut
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    student = get_logged_in_student(db, current_user)
    student.profile_completeness = calculate_completeness(student)
    return student


# -------------------------------------------------
# Update Profile
# -------------------------------------------------
@router.put(
    "/me",
    response_model=schemas.StudentOut
)
def update_profile(
    payload: schemas.StudentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    student = get_logged_in_student(db, current_user)

    student.full_name = payload.full_name
    student.first_name = payload.first_name
    student.last_name = payload.last_name
    student.gender = payload.gender
    student.date_of_birth = payload.date_of_birth
    student.permanent_address = payload.permanent_address
    student.college = payload.college
    student.degree = payload.degree
    student.branch = payload.branch
    student.graduation_year = payload.graduation_year
    student.cgpa = payload.cgpa
    student.is_pursuing = payload.is_pursuing
    
    # Detailed Academics
    student.ssc_board = payload.ssc_board
    student.ssc_year = payload.ssc_year
    student.ssc_score = payload.ssc_score
    student.inter_stream = payload.inter_stream
    student.inter_year = payload.inter_year
    student.inter_score = payload.inter_score
    student.grad_stream = payload.grad_stream
    student.grad_specialization = payload.grad_specialization
    student.grad_year = payload.grad_year
    student.grad_score = payload.grad_score
    
    # If pursuing graduation, clear higher education fields
    if payload.is_pursuing:
        student.higher_stream = None
        student.higher_specialization = None
        student.higher_year = None
        student.higher_score = None
    else:
        student.higher_stream = payload.higher_stream
        student.higher_specialization = payload.higher_specialization
        student.higher_year = payload.higher_year
        student.higher_score = payload.higher_score

    student.languages = payload.languages
    student.linkedin = payload.linkedin
    student.github = payload.github
    student.profile_photo = payload.profile_photo

    db.commit()
    db.refresh(student)
    
    student.profile_completeness = calculate_completeness(student)
    return student


# -------------------------------------------------
# Upload Resume File
# -------------------------------------------------
@router.post("/me/resume")
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    student = get_logged_in_student(db, current_user)

    file_ext = os.path.splitext(file.filename)[1]
    filename = f"resume_{student.student_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    student.resume_path = file_path
    db.commit()

    return {
        "message": "Resume uploaded successfully.",
        "file_path": file_path
    }


# -------------------------------------------------
# Add Skill
# -------------------------------------------------
@router.post(
    "/skills",
    response_model=schemas.StudentSkillOut
)
def add_skill(
    payload: schemas.StudentSkillCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    student = get_logged_in_student(db, current_user)

    skill_name = payload.skill_name.strip()

    existing = db.query(models.StudentSkill).filter(
        models.StudentSkill.student_id == student.student_id,
        models.StudentSkill.skill_name.ilike(skill_name)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Skill already exists."
        )

    skill = models.StudentSkill(
        student_id=student.student_id,
        skill_name=skill_name
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill


# -------------------------------------------------
# View Skills
# -------------------------------------------------
@router.get(
    "/skills",
    response_model=list[schemas.StudentSkillOut]
)
def get_skills(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    student = get_logged_in_student(db, current_user)

    return db.query(models.StudentSkill).filter(
        models.StudentSkill.student_id == student.student_id
    ).all()


# -------------------------------------------------
# Delete Skill
# -------------------------------------------------
@router.delete("/skills/{skill_id}")
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    student = get_logged_in_student(db, current_user)

    skill = db.query(models.StudentSkill).filter(
        models.StudentSkill.skill_id == skill_id,
        models.StudentSkill.student_id == student.student_id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found."
        )

    db.delete(skill)
    db.commit()

    return {
        "message": "Skill deleted successfully."
    }


# -------------------------------------------------
# Recommend Skills (Bubble Buttons)
# -------------------------------------------------
@router.get("/skills/recommendations")
def recommend_skills(
    skills_list: str,  # Comma-separated list of selected skills
):
    selected = [s.strip().lower() for s in skills_list.split(",") if s.strip()]
    
    # Skill association dictionary for demo
    skill_rules = {
        "python": ["pandas", "numpy", "sql", "machine learning", "django"],
        "react": ["javascript", "html", "css", "redux", "web development"],
        "html": ["css", "javascript", "react", "bootstrap"],
        "java": ["spring boot", "sql", "git", "software development"],
        "sql": ["python", "excel", "data analytics", "power bi"],
        "excel": ["sql", "power bi", "data analytics", "finance"],
    }
    
    recommendations = set()
    for s in selected:
        if s in skill_rules:
            for rec in skill_rules[s]:
                if rec not in selected:
                    recommendations.add(rec)
                    
    return {"recommended_skills": sorted(list(recommendations))}


# -------------------------------------------------
# Internship Recommendations (Bypasses Cosine logic)
# -------------------------------------------------
@router.get(
    "/recommendations",
    response_model=List[schemas.RecommendationOut]
)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    student = get_logged_in_student(db, current_user)

    student_skills = {
        skill.skill_name.strip().lower()
        for skill in student.skills
    }

    # Fetch active internships
    internships = db.query(models.Internship).filter(
        models.Internship.status == "Active",
        models.Internship.last_date >= date.today()
    ).all()

    recommendations = []

    for internship in internships:
        # Calculate skill intersection
        required_skills = {
            skill.skill_name.strip().lower()
            for skill in internship.skills
        }
        
        matched_skills = student_skills.intersection(required_skills)
        
        # Calculate score (out of 100)
        if required_skills:
            base_score = (len(matched_skills) / len(required_skills)) * 100
        else:
            base_score = 50.0  # Base match if no skills are explicitly required

        # Apply boosts (domain / location / work mode)
        boost = 0.0
        reasons = []
        
        # Skills match reason
        if matched_skills:
            reasons.append(f"Matches your skills: {', '.join([s.title() for s in list(matched_skills)[:3]])}")
        
        # Domain match
        if internship.domain:
            reasons.append(f"Aligned with the {internship.domain} domain.")
            boost += 10.0
            
        # Location match
        if student.permanent_address and internship.location:
            if internship.location.lower() in student.permanent_address.lower():
                reasons.append(f"Located in or near your address ({internship.location}).")
                boost += 15.0

        final_score = min(100.0, base_score + boost)

        if not reasons:
            reasons.append("General matching based on eligibility criteria.")

        recommendations.append(
            {
                "internship": internship,
                "match_score": round(final_score, 1),
                "match_reasons": reasons
            }
        )

    # Sort descending by match score
    recommendations.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return recommendations


# -------------------------------------------------
# Apply for Internship
# -------------------------------------------------
@router.post("/apply/{internship_id}")
def apply_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    student = get_logged_in_student(db, current_user)

    internship = db.query(models.Internship).filter(
        models.Internship.internship_id == internship_id
    ).first()

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found."
        )

    existing = db.query(models.Application).filter(
        models.Application.student_id == student.student_id,
        models.Application.internship_id == internship_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already applied for this internship."
        )

    student_skills = {
        skill.skill_name.strip().lower()
        for skill in student.skills
    }

    required_skills = {
        skill.skill_name.strip().lower()
        for skill in internship.skills
    }

    if required_skills:
        matched = student_skills.intersection(required_skills)
        match_score = (len(matched) / len(required_skills)) * 100
    else:
        match_score = 50.0

    application = models.Application(
        student_id=student.student_id,
        internship_id=internship_id,
        match_score=match_score
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application submitted successfully.",
        "application_id": application.application_id,
        "match_score": round(match_score, 1)
    }


# -------------------------------------------------
# View My Applications
# -------------------------------------------------
@router.get(
    "/applications",
    response_model=list[schemas.ApplicationOut]
)
def my_applications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    student = get_logged_in_student(db, current_user)

    applications = db.query(models.Application).filter(
        models.Application.student_id == student.student_id
    ).all()

    return applications


# -------------------------------------------------
# Student Feedback System (Post-Internship)
# -------------------------------------------------
@router.post("/feedback", response_model=schemas.FeedbackOut)
def submit_feedback(
    payload: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    student = get_logged_in_student(db, current_user)

    # Check if application exists and is selected/accepted
    app_record = db.query(models.Application).filter(
        models.Application.student_id == student.student_id,
        models.Application.internship_id == payload.internship_id,
        models.Application.status == models.ApplicationStatusEnum.Selected
    ).first()

    if not app_record:
        raise HTTPException(
            status_code=400,
            detail="You can only submit feedback for internships in which you were Selected."
        )

    # Check duplicate feedback
    existing_feedback = db.query(models.Feedback).filter(
        models.Feedback.student_id == student.student_id,
        models.Feedback.internship_id == payload.internship_id
    ).first()

    if existing_feedback:
        raise HTTPException(
            status_code=400,
            detail="Feedback already submitted for this internship."
        )

    feedback = models.Feedback(
        student_id=student.student_id,
        internship_id=payload.internship_id,
        rating=payload.rating,
        comments=payload.comments,
        is_relevant=payload.is_relevant
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return feedback
