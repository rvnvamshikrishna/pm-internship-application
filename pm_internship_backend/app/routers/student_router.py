import os
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..ai import score_internships, predict_career_paths, analyze_sentiment

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
    student.phone = payload.phone
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

    # AI Matching Preferences
    student.city = payload.city
    student.state = payload.state
    student.preferred_work_location = payload.preferred_work_location
    student.preferred_work_mode = payload.preferred_work_mode
    student.areas_of_interest = payload.areas_of_interest
    student.preferred_internship_duration = payload.preferred_internship_duration
    student.minimum_expected_stipend = payload.minimum_expected_stipend
    student.career_goal = payload.career_goal
    student.device_token = payload.device_token
    student.location_tier = payload.location_tier

    # Predict career paths based on updated profile
    student.predicted_career_paths = predict_career_paths(student)

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
# Upload Resume & Extract Skills
# -------------------------------------------------
@router.post("/me/resume/extract")
def extract_resume_skills(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    student = get_logged_in_student(db, current_user)

    # 1. Save the file
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"resume_{student.student_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    student.resume_path = file_path
    db.commit()

    # 2. Extract Text
    text_content = ""
    ext = file_ext.lower()
    if ext == ".txt":
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text_content = f.read()
        except Exception:
            pass
    elif ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            pages_text = []
            for page in reader.pages:
                pages_text.append(page.extract_text() or "")
            text_content = "\n".join(pages_text)
        except Exception:
            # Fallback
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                import re
                words = re.findall(rb'[a-zA-Z\s]{4,}', content)
                text_content = " ".join(
                    w.decode('ascii', errors='ignore') for w in words)
            except Exception:
                pass

    # 3. Match Skills
    KNOWN_SKILLS = [
        "python", "java", "javascript", "sql", "html", "css", "react", "node", "express",
        "mongodb", "postgresql", "mysql", "git", "github", "docker", "aws", "excel",
        "pandas", "numpy", "tensorflow", "pytorch", "matplotlib", "nlp", "seo", "canva",
        "power bi", "tableau", "spring", "c++", "c#", "php", "django", "flask", "linux"
    ]

    extracted_skills = []
    text_lower = text_content.lower()
    for skill in KNOWN_SKILLS:
        import re
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            extracted_skills.append(skill)

    # 4. Save to Database
    if extracted_skills:
        # Delete existing skills
        db.query(models.StudentSkill).filter(
            models.StudentSkill.student_id == student.student_id
        ).delete()

        # Add new skills
        for skill_name in extracted_skills:
            student_skill = models.StudentSkill(
                student_id=student.student_id,
                skill_name=skill_name
            )
            db.add(student_skill)
        db.commit()

    return {
        "message": "Resume uploaded and skills extracted successfully.",
        "skills": extracted_skills,
        "file_path": file_path
    }


@router.post("/me/photo")
def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    student = get_logged_in_student(db, current_user)

    file_ext = os.path.splitext(file.filename)[1]
    filename = f"photo_{student.student_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    student.profile_photo = file_path.replace("\\", "/")
    db.commit()

    return {
        "message": "Profile photo uploaded successfully.",
        "file_path": student.profile_photo
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

    # Fetch active internships
    internships = db.query(models.Internship).filter(
        models.Internship.status == "Active",
        models.Internship.last_date >= date.today()
    ).all()

    # Use the Hybrid Recommendation Engine
    scored_internships = score_internships(student, internships, db)

    recommendations = []
    for internship, score, reasons in scored_internships:
        recommendations.append(
            {
                "internship": internship,
                "match_score": score,
                "match_reasons": reasons
            }
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

    # Use AI engine to compute match score
    scored = score_internships(student, [internship], db)
    match_score = scored[0][1] if scored else 50.0

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

    # Check if application exists
    app_record = db.query(models.Application).filter(
        models.Application.student_id == student.student_id,
        models.Application.internship_id == payload.internship_id
    ).first()

    if not app_record:
        # Auto-create application with status Selected for demo convenience
        app_record = models.Application(
            student_id=student.student_id,
            internship_id=payload.internship_id,
            status=models.ApplicationStatusEnum.Selected
        )
        db.add(app_record)
        db.flush()
    elif app_record.status != models.ApplicationStatusEnum.Selected:
        # Auto-promote to Selected for demo convenience
        app_record.status = models.ApplicationStatusEnum.Selected
        db.flush()

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

    # AI Sentiment Analysis
    sentiment = analyze_sentiment(payload.comments)

    feedback = models.Feedback(
        student_id=student.student_id,
        internship_id=payload.internship_id,
        rating=payload.rating,
        comments=payload.comments,
        is_relevant=payload.is_relevant,
        sentiment_score=sentiment
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return feedback
