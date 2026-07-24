from collections import Counter

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# -------------------------------------------------
# Helper (Admin Authentication)
# -------------------------------------------------
def get_admin(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can access this endpoint."
        )
    admin = db.query(models.Admin).filter(
        models.Admin.admin_id == int(current_user["sub"])
    ).first()
    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin user not found."
        )
    return admin


# -------------------------------------------------
# Dashboard Statistics
# -------------------------------------------------
@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    total_students = db.query(models.Student).count()
    total_companies = db.query(models.Company).count()
    total_internships = db.query(models.Internship).count()
    total_applications = db.query(models.Application).count()

    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "total_internships": total_internships,
        "total_applications": total_applications,
    }


# -------------------------------------------------
# View All Students
# -------------------------------------------------
@router.get(
    "/students",
    response_model=list[schemas.StudentOut]
)
def get_all_students(
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    return db.query(models.Student).all()


# -------------------------------------------------
# View Single Student
# -------------------------------------------------
@router.get(
    "/students/{student_id}",
    response_model=schemas.StudentOut
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found."
        )

    return student


# -------------------------------------------------
# Delete Student
# -------------------------------------------------
@router.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found."
        )

    db.delete(student)
    db.commit()

    return {"message": "Student deleted successfully."}


# -------------------------------------------------
# View All Companies
# -------------------------------------------------
@router.get(
    "/companies",
    response_model=list[schemas.CompanyOut]
)
def get_all_companies(
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    return db.query(models.Company).all()


# -------------------------------------------------
# View Single Company
# -------------------------------------------------
@router.get(
    "/companies/{company_id}",
    response_model=schemas.CompanyOut
)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    company = db.query(models.Company).filter(
        models.Company.company_id == company_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found."
        )

    return company


# -------------------------------------------------
# Verify Company (Verify / Reject)
# -------------------------------------------------
@router.post("/companies/{company_id}/verify")
def verify_company(
    company_id: int,
    status: str,  # "Verified" or "Rejected"
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    if status not in ["Verified", "Rejected", "Pending"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Must be 'Verified', 'Rejected', or 'Pending'."
        )
        
    company = db.query(models.Company).filter(
        models.Company.company_id == company_id
    ).first()
    
    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found."
        )
        
    company.verification_status = status
    db.commit()
    db.refresh(company)
    
    return {
        "message": f"Company verification status updated to '{status}'.",
        "company_id": company.company_id,
        "verification_status": company.verification_status
    }


# -------------------------------------------------
# Delete Company
# -------------------------------------------------
@router.delete("/companies/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    company = db.query(models.Company).filter(
        models.Company.company_id == company_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found."
        )

    db.delete(company)
    db.commit()

    return {"message": "Company deleted successfully."}


# -------------------------------------------------
# View All Internships
# -------------------------------------------------
@router.get(
    "/internships",
    response_model=list[schemas.InternshipOut]
)
def get_all_internships(
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    return db.query(models.Internship).all()


# -------------------------------------------------
# Delete Internship
# -------------------------------------------------
@router.delete("/internships/{internship_id}")
def delete_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    internship = db.query(models.Internship).filter(
        models.Internship.internship_id == internship_id
    ).first()

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found."
        )

    db.delete(internship)
    db.commit()

    return {"message": "Internship deleted successfully."}


# -------------------------------------------------
# View All Applications
# -------------------------------------------------
@router.get(
    "/applications",
    response_model=list[schemas.ApplicationOut]
)
def get_all_applications(
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    return db.query(models.Application).all()


# -------------------------------------------------
# Analytics
# -------------------------------------------------
@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    total_students = db.query(models.Student).count()
    total_companies = db.query(models.Company).count()
    total_internships = db.query(models.Internship).count()
    total_applications = db.query(models.Application).count()

    # Internship Mode Distribution
    mode_counts = Counter(
        internship.mode.value
        for internship in db.query(models.Internship).all()
        if internship.mode
    )

    # Internship Location Distribution
    location_counts = Counter(
        internship.location
        for internship in db.query(models.Internship).all()
        if internship.location
    )

    # Application Status Distribution
    status_counts = Counter(
        application.status.value
        for application in db.query(models.Application).all()
        if application.status
    )

    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "total_internships": total_internships,
        "total_applications": total_applications,
        "mode_distribution": dict(mode_counts),
        "location_distribution": dict(location_counts),
        "status_distribution": dict(status_counts),
    }


# -------------------------------------------------
# Recent Applications
# -------------------------------------------------
@router.get(
    "/applications/recent",
    response_model=list[schemas.ApplicationOut]
)
def recent_applications(
    limit: int = 10,
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    return (
        db.query(models.Application)
        .order_by(models.Application.applied_at.desc())
        .limit(limit)
        .all()
    )


# -------------------------------------------------
# Top Companies by Internship Count
# -------------------------------------------------
@router.get("/top-companies")
def top_companies(
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
):
    companies = db.query(models.Company).all()

    result = []

    for company in companies:
        internship_count = db.query(models.Internship).filter(
            models.Internship.company_id == company.company_id
        ).count()

        result.append({
            "company_id": company.company_id,
            "company_name": company.company_name,
            "internship_count": internship_count
        })

    result.sort(
        key=lambda x: x["internship_count"],
        reverse=True
    )

    return result
