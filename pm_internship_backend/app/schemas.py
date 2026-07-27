from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, model_validator

from .models import ModeEnum, ApplicationStatusEnum


# ---------------- STUDENT ----------------

class StudentRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    password_confirm: str
    phone: Optional[str] = None
    otp_code: Optional[str] = None

    @model_validator(mode="after")
    def verify_passwords(self):
        if self.password != self.password_confirm:
            raise ValueError("passwords do not match")
        return self


class StudentLogin(BaseModel):
    email: EmailStr
    password: str


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    permanent_address: Optional[str] = None
    
    # AI Matching Preferences
    city: Optional[str] = None
    state: Optional[str] = None
    preferred_work_location: Optional[str] = None
    preferred_work_mode: Optional[ModeEnum] = None
    areas_of_interest: Optional[str] = None
    preferred_internship_duration: Optional[str] = None
    minimum_expected_stipend: Optional[float] = None
    career_goal: Optional[str] = None

    # Academics
    college: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    is_pursuing: bool = False
    
    # Detailed Academics
    ssc_board: Optional[str] = None
    ssc_year: Optional[int] = None
    ssc_score: Optional[float] = None
    
    inter_stream: Optional[str] = None
    inter_year: Optional[int] = None
    inter_score: Optional[float] = None
    
    grad_stream: Optional[str] = None
    grad_specialization: Optional[str] = None
    grad_year: Optional[int] = None
    grad_score: Optional[float] = None
    
    higher_stream: Optional[str] = None
    higher_specialization: Optional[str] = None
    higher_year: Optional[int] = None
    higher_score: Optional[float] = None
    
    languages: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    resume_path: Optional[str] = None
    profile_photo: Optional[str] = None
    device_token: Optional[str] = None
    predicted_career_paths: Optional[str] = None
    location_tier: Optional[str] = None
    created_at: datetime
    profile_completeness: Optional[int] = None


class StudentUpdate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    permanent_address: Optional[str] = None
    
    # AI Matching Preferences
    city: Optional[str] = None
    state: Optional[str] = None
    preferred_work_location: Optional[str] = None
    preferred_work_mode: Optional[ModeEnum] = None
    areas_of_interest: Optional[str] = None
    preferred_internship_duration: Optional[str] = None
    minimum_expected_stipend: Optional[float] = None
    career_goal: Optional[str] = None

    # Academics
    college: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    is_pursuing: bool = False
    
    # Detailed Academics
    ssc_board: Optional[str] = None
    ssc_year: Optional[int] = None
    ssc_score: Optional[float] = None
    
    inter_stream: Optional[str] = None
    inter_year: Optional[int] = None
    inter_score: Optional[float] = None
    
    grad_stream: Optional[str] = None
    grad_specialization: Optional[str] = None
    grad_year: Optional[int] = None
    grad_score: Optional[float] = None
    
    higher_stream: Optional[str] = None
    higher_specialization: Optional[str] = None
    higher_year: Optional[int] = None
    higher_score: Optional[float] = None
    
    languages: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    profile_photo: Optional[str] = None
    device_token: Optional[str] = None
    location_tier: Optional[str] = None


# ---------------- COMPANY ----------------

class CompanyRegister(BaseModel):
    company_name: str
    email: EmailStr
    password: str
    password_confirm: str
    website: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    otp_code: Optional[str] = None

    @model_validator(mode="after")
    def verify_passwords(self):
        if self.password != self.password_confirm:
            raise ValueError("passwords do not match")
        return self


class CompanyLogin(BaseModel):
    email: EmailStr
    password: str


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_id: int
    company_name: str
    email: str
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    
    # Account Contact
    contact_name: Optional[str] = None
    contact_designation: Optional[str] = None
    contact_phone: Optional[str] = None
    
    # Organization Identity
    org_type: Optional[str] = None
    company_size: Optional[str] = None
    logo_path: Optional[str] = None
    
    # Location
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    office_locations: Optional[str] = None
    
    # Verification
    cin_number: Optional[str] = None
    gstin_pan: Optional[str] = None
    email_domain: Optional[str] = None
    verification_doc_path: Optional[str] = None
    verification_status: str
    device_token: Optional[str] = None
    profile_completeness: Optional[int] = None


class CompanyUpdate(BaseModel):
    company_name: str
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    
    # Account Contact
    contact_name: Optional[str] = None
    contact_designation: Optional[str] = None
    contact_phone: Optional[str] = None
    
    # Organization Identity
    org_type: Optional[str] = None
    company_size: Optional[str] = None
    logo_path: Optional[str] = None
    
    # Location
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    office_locations: Optional[str] = None
    
    # Verification
    cin_number: Optional[str] = None
    gstin_pan: Optional[str] = None
    email_domain: Optional[str] = None
    device_token: Optional[str] = None


# ---------------- INTERNSHIP ----------------

class InternshipCreate(BaseModel):
    title: str
    domain: str
    description: str
    location: str
    stipend: Decimal
    ctc: Optional[str] = None
    start_date: Optional[str] = None
    experience: Optional[str] = None
    perks: Optional[str] = None
    duration: str
    mode: ModeEnum
    last_date: date
    preferred_skills: Optional[str] = None
    eligible_course: Optional[str] = None
    eligible_year: Optional[int] = None
    min_cgpa: Optional[Decimal] = None
    positions: Optional[int] = 1
    selection_process: Optional[str] = None


class InternshipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    internship_id: int
    company_id: int
    title: str
    domain: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    stipend: Decimal
    ctc: Optional[str] = None
    start_date: Optional[str] = None
    experience: Optional[str] = None
    perks: Optional[str] = None
    duration: Optional[str] = None
    mode: ModeEnum
    last_date: date
    preferred_skills: Optional[str] = None
    eligible_course: Optional[str] = None
    eligible_year: Optional[int] = None
    min_cgpa: Optional[float] = None
    positions: int
    selection_process: Optional[str] = None
    status: str
    created_at: datetime
    company_name: Optional[str] = None
    id: Optional[int] = None


class InternshipUpdate(BaseModel):
    title: str
    domain: str
    description: str
    location: str
    stipend: Decimal
    ctc: Optional[str] = None
    start_date: Optional[str] = None
    experience: Optional[str] = None
    perks: Optional[str] = None
    duration: str
    mode: ModeEnum
    last_date: date
    preferred_skills: Optional[str] = None
    eligible_course: Optional[str] = None
    eligible_year: Optional[int] = None
    min_cgpa: Optional[Decimal] = None
    positions: Optional[int] = 1
    selection_process: Optional[str] = None
    status: Optional[str] = "Active"


# ---------------- INTERNSHIP SKILLS ----------------

class InternshipSkillCreate(BaseModel):
    skill_name: str


class InternshipSkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    internship_id: int
    skill_name: str


# ---------------- APPLICATION ----------------

class ApplicationCreate(BaseModel):
    internship_id: int


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    application_id: int
    student_id: int
    internship_id: int
    match_score: Optional[float] = None
    certificate_url: Optional[str] = None
    status: ApplicationStatusEnum
    applied_at: datetime
    internship: Optional[InternshipOut] = None


class StatusUpdate(BaseModel):
    status: ApplicationStatusEnum


# ---------------- STUDENT SKILLS ----------------

class StudentSkillCreate(BaseModel):
    skill_name: str


class StudentSkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: int
    student_id: int
    skill_name: str


# ---------------- RESUME ----------------

class ResumeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    resume_id: int
    student_id: int
    extracted_name: Optional[str] = None
    extracted_email: Optional[str] = None
    extracted_phone: Optional[str] = None
    extracted_college: Optional[str] = None
    extracted_degree: Optional[str] = None
    extracted_text: Optional[str] = None


# ---------------- FEEDBACK ----------------

class FeedbackCreate(BaseModel):
    internship_id: int
    rating: int  # 1-5
    comments: Optional[str] = None
    is_relevant: Optional[str] = "Yes"  # "Yes" / "No"
    sentiment_score: Optional[str] = None


class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feedback_id: int
    student_id: int
    internship_id: int
    rating: int
    comments: Optional[str]
    is_relevant: str
    sentiment_score: Optional[str] = None
    created_at: datetime


# ---------------- ADMIN ----------------

class AdminRegister(BaseModel):
    email: EmailStr
    password: str


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    admin_id: int
    email: str
    created_at: datetime


# ---------------- COMPANY STATS ----------------

class CompanyDashboardStats(BaseModel):
    active_internships: int
    total_applications: int
    shortlisted_candidates: int
    average_match_quality: float


# ---------------- RECOMMENDATION ----------------

class RecommendationOut(BaseModel):
    internship: InternshipOut
    match_score: float
    match_reasons: List[str]


# ---------------- TOKEN ----------------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
