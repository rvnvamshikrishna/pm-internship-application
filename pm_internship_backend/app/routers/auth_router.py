from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------- STUDENT SIGNUP ----------------

@router.post("/student/signup")
def student_signup(payload: schemas.StudentRegister, db: Session = Depends(get_db)):
    # 1. OTP Verification Check
    if not payload.otp_code or payload.otp_code != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. For demo, please enter '123456'."
        )

    # 2. Email duplication check
    existing = db.query(models.Student).filter(
        models.Student.email == payload.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )

    # 3. Create student
    student = models.Student(
        full_name=payload.full_name,
        email=payload.email,
        password=hash_password(payload.password),
        phone=payload.phone,
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    token = create_access_token({"sub": str(student.student_id), "role": "student"})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ---------------- STUDENT LOGIN ----------------

@router.post("/student/login")
def student_login(payload: schemas.StudentLogin, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.email == payload.email
    ).first()

    if not student or not verify_password(payload.password, student.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": str(student.student_id), "role": "student"})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ---------------- COMPANY SIGNUP ----------------

@router.post("/company/signup")
def company_signup(payload: schemas.CompanyRegister, db: Session = Depends(get_db)):
    # 1. OTP Verification Check
    if not payload.otp_code or payload.otp_code != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. For demo, please enter '123456'."
        )

    # 2. Email duplication check
    existing = db.query(models.Company).filter(
        models.Company.email == payload.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )

    # 3. Create company
    company = models.Company(
        company_name=payload.company_name,
        email=payload.email,
        password=hash_password(payload.password),
        website=payload.website,
        industry=payload.industry,
        location=payload.location,
        verification_status="Pending"
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    token = create_access_token({"sub": str(company.company_id), "role": "company"})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ---------------- COMPANY LOGIN ----------------

@router.post("/company/login")
def company_login(payload: schemas.CompanyLogin, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(
        models.Company.email == payload.email
    ).first()

    if not company or not verify_password(payload.password, company.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": str(company.company_id), "role": "company"})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ---------------- ADMIN SIGNUP ----------------

@router.post("/admin/signup", response_model=schemas.AdminOut)
def admin_signup(payload: schemas.AdminRegister, db: Session = Depends(get_db)):
    existing = db.query(models.Admin).filter(
        models.Admin.email == payload.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Admin email already registered"
        )

    admin = models.Admin(
        email=payload.email,
        password=hash_password(payload.password)
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin


# ---------------- ADMIN LOGIN ----------------

@router.post("/admin/login")
def admin_login(payload: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(
        models.Admin.email == payload.email
    ).first()

    if not admin or not verify_password(payload.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": str(admin.admin_id), "role": "admin"})

    return {
        "access_token": token,
        "token_type": "bearer"
    }
