from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)


# -------------------------------------------------
# Helper Functions
# -------------------------------------------------
def get_logged_in_company(
    db: Session,
    current_user: dict
):
    if current_user.get("role") != "company":
        raise HTTPException(
            status_code=403,
            detail="Only companies can access this endpoint."
        )

    company = db.query(models.Company).filter(
        models.Company.company_id == int(current_user["sub"])
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found."
        )

    return company


def calculate_company_completeness(company: models.Company) -> int:
    fields = [
        company.company_name, company.industry, company.website, company.description,
        company.contact_name, company.contact_designation, company.contact_phone,
        company.org_type, company.company_size, company.logo_path,
        company.city, company.state, company.country, company.pincode,
        company.office_locations, company.cin_number
    ]
    filled = sum(1 for f in fields if f is not None and f != "")
    return int((filled / len(fields)) * 100)


# -------------------------------------------------
# View Company Profile
# -------------------------------------------------
@router.get(
    "/me",
    response_model=schemas.CompanyOut
)
def get_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    company = get_logged_in_company(db, current_user)
    company.profile_completeness = calculate_company_completeness(company)
    return company


# -------------------------------------------------
# Update Company Profile
# -------------------------------------------------
@router.put(
    "/me",
    response_model=schemas.CompanyOut
)
def update_profile(
    payload: schemas.CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    company = get_logged_in_company(db, current_user)

    company.company_name = payload.company_name
    company.industry = payload.industry
    company.location = payload.location
    company.website = payload.website
    company.description = payload.description
    
    # Account Contact
    company.contact_name = payload.contact_name
    company.contact_designation = payload.contact_designation
    company.contact_phone = payload.contact_phone
    
    # Organization Identity
    company.org_type = payload.org_type
    company.company_size = payload.company_size
    company.logo_path = payload.logo_path
    
    # Location
    company.city = payload.city
    company.state = payload.state
    company.country = payload.country
    company.pincode = payload.pincode
    company.office_locations = payload.office_locations
    
    # Verification
    company.cin_number = payload.cin_number
    company.gstin_pan = payload.gstin_pan
    company.email_domain = payload.email_domain

    db.commit()
    db.refresh(company)

    company.profile_completeness = calculate_company_completeness(company)
    return company


# -------------------------------------------------
# Company Dashboard Stats
# -------------------------------------------------
@router.get("/dashboard", response_model=schemas.CompanyDashboardStats)
def company_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    company = get_logged_in_company(db, current_user)
    
    internships = db.query(models.Internship).filter(
        models.Internship.company_id == company.company_id
    ).all()
    
    internship_ids = [i.internship_id for i in internships]
    active_internships = sum(1 for i in internships if i.status == "Active")
    
    if not internship_ids:
        return {
            "active_internships": 0,
            "total_applications": 0,
            "shortlisted_candidates": 0,
            "average_match_quality": 0.0
        }
        
    applications = db.query(models.Application).filter(
        models.Application.internship_id.in_(internship_ids)
    ).all()
    
    total_applications = len(applications)
    shortlisted_candidates = sum(1 for a in applications if a.status == models.ApplicationStatusEnum.Shortlisted)
    
    scores = [float(a.match_score) for a in applications if a.match_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    
    return {
        "active_internships": active_internships,
        "total_applications": total_applications,
        "shortlisted_candidates": shortlisted_candidates,
        "average_match_quality": avg_score
    }


# -------------------------------------------------
# Create Internship
# -------------------------------------------------
@router.post(
    "/internships",
    response_model=schemas.InternshipOut
)
def create_internship(
    payload: schemas.InternshipCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    company = get_logged_in_company(db, current_user)

    internship = models.Internship(
        company_id=company.company_id,
        title=payload.title,
        domain=payload.domain,
        description=payload.description,
        location=payload.location,
        stipend=payload.stipend,
        duration=payload.duration,
        mode=payload.mode,
        last_date=payload.last_date,
        preferred_skills=payload.preferred_skills,
        eligible_course=payload.eligible_course,
        eligible_year=payload.eligible_year,
        min_cgpa=payload.min_cgpa,
        positions=payload.positions if payload.positions else 1,
        selection_process=payload.selection_process,
        status="Active"
    )

    db.add(internship)
    db.flush()

    # Automatically add to InternshipSkill table as well for indexing/search
    if payload.preferred_skills:
        skills = [s.strip() for s in payload.preferred_skills.split(",") if s.strip()]
        for skill_name in skills:
            skill = models.InternshipSkill(
                internship_id=internship.internship_id,
                skill_name=skill_name
            )
            db.add(skill)

    db.commit()
    db.refresh(internship)

    return internship


# -------------------------------------------------
# View My Internships
# -------------------------------------------------
@router.get(
    "/internships",
    response_model=list[schemas.InternshipOut]
)
def get_my_internships(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    company = get_logged_in_company(db, current_user)

    internships = db.query(models.Internship).filter(
        models.Internship.company_id == company.company_id
    ).all()

    return internships


# -------------------------------------------------
# Update Internship
# -------------------------------------------------
@router.put(
    "/internships/{internship_id}",
    response_model=schemas.InternshipOut
)
def update_internship(
    internship_id: int,
    payload: schemas.InternshipUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    company = get_logged_in_company(db, current_user)

    internship = db.query(models.Internship).filter(
        models.Internship.internship_id == internship_id,
        models.Internship.company_id == company.company_id
    ).first()

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found."
        )

    internship.title = payload.title
    internship.domain = payload.domain
    internship.description = payload.description
    internship.location = payload.location
    internship.stipend = payload.stipend
    internship.duration = payload.duration
    internship.mode = payload.mode
    internship.last_date = payload.last_date
    internship.preferred_skills = payload.preferred_skills
    internship.eligible_course = payload.eligible_course
    internship.eligible_year = payload.eligible_year
    internship.min_cgpa = payload.min_cgpa
    internship.positions = payload.positions if payload.positions else 1
    internship.selection_process = payload.selection_process
    internship.status = payload.status if payload.status else "Active"

    db.commit()
    db.refresh(internship)

    return internship


# -------------------------------------------------
# Delete Internship
# -------------------------------------------------
@router.delete("/internships/{internship_id}")
def delete_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    company = get_logged_in_company(db, current_user)

    internship = db.query(models.Internship).filter(
        models.Internship.internship_id == internship_id,
        models.Internship.company_id == company.company_id
    ).first()

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found."
        )

    db.delete(internship)
    db.commit()

    return {
        "message": "Internship deleted successfully."
    }


# -------------------------------------------------
# View Applicants
# -------------------------------------------------
@router.get(
    "/internships/{internship_id}/applications",
    response_model=list[schemas.ApplicationOut]
)
def view_applications(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    company = get_logged_in_company(db, current_user)

    internship = db.query(models.Internship).filter(
        models.Internship.internship_id == internship_id,
        models.Internship.company_id == company.company_id
    ).first()

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found."
        )

    return db.query(models.Application).filter(
        models.Application.internship_id == internship_id
    ).all()


# -------------------------------------------------
# Update Application Status (Shortlist/Reject)
# -------------------------------------------------
@router.put(
    "/applications/{application_id}",
    response_model=schemas.ApplicationOut
)
def update_application_status(
    application_id: int,
    payload: schemas.StatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    company = get_logged_in_company(db, current_user)

    application = db.query(models.Application).filter(
        models.Application.application_id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found."
        )

    internship = db.query(models.Internship).filter(
        models.Internship.internship_id == application.internship_id,
        models.Internship.company_id == company.company_id
    ).first()

    if not internship:
        raise HTTPException(
            status_code=403,
            detail="Not authorized."
        )

    application.status = payload.status

    db.commit()
    db.refresh(application)

    return application


# -------------------------------------------------
# Candidate Ranking & Shortlist (AI explainability)
# -------------------------------------------------
@router.get("/internships/{internship_id}/ranked-candidates")
def get_ranked_candidates(
    internship_id: int,
    min_score: Optional[float] = None,
    skill: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    company = get_logged_in_company(db, current_user)
    
    internship = db.query(models.Internship).filter(
        models.Internship.internship_id == internship_id,
        models.Internship.company_id == company.company_id
    ).first()
    
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found.")
        
    applications = db.query(models.Application).filter(
        models.Application.internship_id == internship_id
    ).all()
    
    ranked = []
    for app in applications:
        student = app.student
        if not student:
            continue
            
        student_skills = [s.skill_name for s in student.skills]
        
        # Skill filter
        if skill and not any(skill.lower() in s.lower() for s in student_skills):
            continue
            
        score = float(app.match_score) if app.match_score is not None else 0.0
        if min_score and score < min_score:
            continue
            
        # Build explainability reasons
        reasons = []
        required = [s.skill_name.strip().lower() for s in internship.skills]
        matched = [s for s in student_skills if s.strip().lower() in required]
        
        if matched:
            reasons.append(f"Skills Match: {', '.join([s.title() for s in matched])}.")
        if internship.location and student.permanent_address:
            if internship.location.lower() in student.permanent_address.lower():
                reasons.append("Preferred location matches.")
        if internship.eligible_year and student.graduation_year:
            if student.graduation_year == internship.eligible_year:
                reasons.append("Academic eligibility matches.")
                
        if not reasons:
            reasons.append("Meets general requirements.")
            
        ranked.append({
            "application_id": app.application_id,
            "student_id": student.student_id,
            "student_name": student.full_name,
            "college": student.college,
            "course": student.degree,
            "year": student.graduation_year,
            "skills": student_skills,
            "location": student.permanent_address,
            "match_score": round(score, 1),
            "match_reasons": reasons,
            "status": app.status
        })
        
    ranked.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked


# -------------------------------------------------
# Candidate Profile Details with history
# -------------------------------------------------
@router.get("/candidates/{student_id}")
def get_candidate_details(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    company = get_logged_in_company(db, current_user)
    
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
        
    # Get history for this company only
    internships = db.query(models.Internship).filter(
        models.Internship.company_id == company.company_id
    ).all()
    internship_ids = [i.internship_id for i in internships]
    
    applications = db.query(models.Application).filter(
        models.Application.student_id == student_id,
        models.Application.internship_id.in_(internship_ids)
    ).all()
    
    history = []
    for app in applications:
        history.append({
            "application_id": app.application_id,
            "internship_title": app.internship.title,
            "applied_at": app.applied_at,
            "status": app.status,
            "match_score": float(app.match_score) if app.match_score is not None else 0.0
        })
        
    student_skills = [s.skill_name for s in student.skills]
    
    return {
        "student": {
            "student_id": student.student_id,
            "full_name": student.full_name,
            "email": student.email,
            "phone": student.phone,
            "gender": student.gender,
            "date_of_birth": student.date_of_birth,
            "college": student.college,
            "degree": student.degree,
            "branch": student.branch,
            "graduation_year": student.graduation_year,
            "cgpa": float(student.cgpa) if student.cgpa is not None else None,
            "permanent_address": student.permanent_address,
            "languages": student.languages,
            "skills": student_skills,
            "linkedin": student.linkedin,
            "github": student.github,
            "resume_path": student.resume_path,
            "profile_photo": student.profile_photo
        },
        "application_history": history
    }


# -------------------------------------------------
# Company Analytics
# -------------------------------------------------
@router.get("/analytics")
def get_company_analytics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    company = get_logged_in_company(db, current_user)
    
    internships = db.query(models.Internship).filter(
        models.Internship.company_id == company.company_id
    ).all()
    
    internship_ids = [i.internship_id for i in internships]
    
    if not internship_ids:
        return {
            "total_applications": 0,
            "shortlisted_count": 0,
            "selected_count": 0,
            "average_match_score": 0.0,
            "applications_by_internship": {},
            "location_distribution": {},
            "diversity_metrics": {"rural": 0, "tier2": 0, "tier3": 0, "tier1": 0}
        }
        
    applications = db.query(models.Application).filter(
        models.Application.internship_id.in_(internship_ids)
    ).all()
    
    total_applications = len(applications)
    shortlisted_count = sum(1 for a in applications if a.status == models.ApplicationStatusEnum.Shortlisted)
    selected_count = sum(1 for a in applications if a.status == models.ApplicationStatusEnum.Selected)
    
    scores = [float(a.match_score) for a in applications if a.match_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    
    apps_by_int = {}
    for i in internships:
        count = sum(1 for a in applications if a.internship_id == i.internship_id)
        apps_by_int[i.title] = count
        
    locations = {}
    diversity = {"rural": 0, "tier2": 0, "tier3": 0, "tier1": 0}
    
    for a in applications:
        student = a.student
        if student and student.permanent_address:
            loc = student.permanent_address.split(",")[-1].strip().title()
            locations[loc] = locations.get(loc, 0) + 1
            
            addr = student.permanent_address.lower()
            if any(k in addr for k in ["village", "rural", "post office", "p.o.", "taluk", "dist"]):
                diversity["rural"] += 1
            elif any(k in addr for k in ["mumbai", "delhi", "bengaluru", "kolkata", "chennai", "hyderabad", "pune"]):
                diversity["tier1"] += 1
            elif any(k in addr for k in ["jaipur", "lucknow", "nagpur", "patna", "indore", "bhopal", "coimbatore"]):
                diversity["tier2"] += 1
            else:
                diversity["tier3"] += 1
                
    return {
        "total_applications": total_applications,
        "shortlisted_count": shortlisted_count,
        "selected_count": selected_count,
        "average_match_score": avg_score,
        "applications_by_internship": apps_by_int,
        "location_distribution": locations,
        "diversity_metrics": diversity
    }
