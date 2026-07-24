from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(
    prefix="/internships",
    tags=["Internships"]
)


# -------------------------------------------------
# View All Internships
# -------------------------------------------------
@router.get("/", response_model=List[schemas.InternshipOut])
def get_all_internships(
    location: Optional[str] = Query(None),
    mode: Optional[models.ModeEnum] = Query(None),
    title: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):

    query = db.query(models.Internship)

    if location:
        query = query.filter(
            models.Internship.location.ilike(f"%{location}%")
        )

    if mode:
        query = query.filter(
            models.Internship.mode == mode
        )

    if title:
        query = query.filter(
            models.Internship.title.ilike(f"%{title}%")
        )

    if skill:
        query = (
            query.join(models.InternshipSkill)
            .filter(
                models.InternshipSkill.skill_name.ilike(
                    f"%{skill}%"
                )
            )
            .distinct()
        )

    internships = query.offset(skip).limit(limit).all()

    return internships


# -------------------------------------------------
# View Internship Details
# -------------------------------------------------
@router.get(
    "/{internship_id}",
    response_model=schemas.InternshipOut
)
def get_internship(
    internship_id: int,
    db: Session = Depends(get_db),
):

    internship = db.query(models.Internship).filter(
        models.Internship.internship_id == internship_id
    ).first()

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found."
        )

    return internship


# -------------------------------------------------
# View Required Skills
# -------------------------------------------------
@router.get(
    "/{internship_id}/skills",
    response_model=List[schemas.InternshipSkillOut]
)
def get_required_skills(
    internship_id: int,
    db: Session = Depends(get_db),
):

    internship = db.query(models.Internship).filter(
        models.Internship.internship_id == internship_id
    ).first()

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found."
        )

    skills = db.query(models.InternshipSkill).filter(
        models.InternshipSkill.internship_id == internship_id
    ).all()

    return skills

# -------------------------------------------------
# Latest Internships
# -------------------------------------------------
@router.get(
    "/latest",
    response_model=list[schemas.InternshipOut]
)
def latest_internships(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Internship)
        .order_by(models.Internship.created_at.desc())
        .limit(limit)
        .all()
    )


# -------------------------------------------------
# Internships by Company
# -------------------------------------------------
@router.get(
    "/company/{company_id}",
    response_model=list[schemas.InternshipOut]
)
def internships_by_company(
    company_id: int,
    db: Session = Depends(get_db),
):

    company = db.query(models.Company).filter(
        models.Company.company_id == company_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found."
        )

    return db.query(models.Internship).filter(
        models.Internship.company_id == company_id
    ).all()


# -------------------------------------------------
# Internships by Mode
# -------------------------------------------------
@router.get(
    "/mode/{mode}",
    response_model=list[schemas.InternshipOut]
)
def internships_by_mode(
    mode: models.ModeEnum,
    db: Session = Depends(get_db),
):

    return db.query(models.Internship).filter(
        models.Internship.mode == mode
    ).all()


# -------------------------------------------------
# Internships by Location
# -------------------------------------------------
@router.get(
    "/location/{location}",
    response_model=list[schemas.InternshipOut]
)
def internships_by_location(
    location: str,
    db: Session = Depends(get_db),
):

    return db.query(models.Internship).filter(
        models.Internship.location.ilike(f"%{location}%")
    ).all()


# -------------------------------------------------
# Search by Title
# -------------------------------------------------
@router.get(
    "/search/title",
    response_model=list[schemas.InternshipOut]
)
def search_title(
    keyword: str,
    db: Session = Depends(get_db),
):

    return db.query(models.Internship).filter(
        models.Internship.title.ilike(f"%{keyword}%")
    ).all()


# -------------------------------------------------
# Search by Skill
# -------------------------------------------------
@router.get(
    "/search/skill",
    response_model=list[schemas.InternshipOut]
)
def search_skill(
    skill: str,
    db: Session = Depends(get_db),
):

    return (
        db.query(models.Internship)
        .join(models.InternshipSkill)
        .filter(
            models.InternshipSkill.skill_name.ilike(f"%{skill}%")
        )
        .distinct()
        .all()
    )

