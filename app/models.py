import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Enum,
    DECIMAL,
    Boolean,
)
from sqlalchemy.orm import relationship

from .database import Base


# -------------------- ENUMS --------------------

class ModeEnum(str, enum.Enum):
    Online = "Online"
    Offline = "Offline"
    Hybrid = "Hybrid"


class ApplicationStatusEnum(str, enum.Enum):
    Applied = "Applied"
    Under_Review = "Under Review"
    Shortlisted = "Shortlisted"
    Rejected = "Rejected"
    Selected = "Selected"
    Ongoing = "Ongoing"
    Completed = "Completed"


# -------------------- STUDENT --------------------

class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(15))
    gender = Column(String(20))  # dropdown choice
    date_of_birth = Column(Date)
    permanent_address = Column(Text)
    
    # AI Matching Preferences
    city = Column(String(100))
    state = Column(String(100))
    preferred_work_location = Column(String(100))
    preferred_work_mode = Column(Enum(ModeEnum))
    areas_of_interest = Column(Text)  # Comma-separated list
    preferred_internship_duration = Column(String(50))
    minimum_expected_stipend = Column(DECIMAL(10, 2))
    career_goal = Column(Text)
    predicted_career_paths = Column(Text)
    location_tier = Column(String(20))
    device_token = Column(String(255))

    # Academics
    college = Column(String(150))
    university = Column(String(150))
    degree = Column(String(100))
    branch = Column(String(100))
    graduation_year = Column(Integer)
    cgpa = Column(DECIMAL(3, 2))
    is_pursuing = Column(Boolean, default=False)
    
    # Detailed Academics
    ssc_board = Column(String(100))
    ssc_year = Column(Integer)
    ssc_score = Column(DECIMAL(5, 2))
    
    inter_stream = Column(String(100))
    inter_year = Column(Integer)
    inter_score = Column(DECIMAL(5, 2))
    
    grad_stream = Column(String(100))
    grad_specialization = Column(String(100))
    grad_year = Column(Integer)
    grad_score = Column(DECIMAL(5, 2))
    
    higher_stream = Column(String(100))
    higher_specialization = Column(String(100))
    higher_year = Column(Integer)
    higher_score = Column(DECIMAL(5, 2))
    
    languages = Column(Text)  # Comma-separated list of languages
    linkedin = Column(String(255))
    github = Column(String(255))
    resume_path = Column(String(255))
    profile_photo = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    skills = relationship(
        "StudentSkill",
        back_populates="student",
        cascade="all, delete-orphan"
    )

    resumes = relationship(
        "ResumeData",
        back_populates="student",
        cascade="all, delete-orphan"
    )

    applications = relationship(
        "Application",
        back_populates="student",
        cascade="all, delete-orphan"
    )

    feedbacks = relationship(
        "Feedback",
        back_populates="student",
        cascade="all, delete-orphan"
    )


# -------------------- STUDENT SKILLS --------------------

class StudentSkill(Base):
    __tablename__ = "student_skills"

    skill_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    skill_name = Column(String(100))

    student = relationship("Student", back_populates="skills")


# -------------------- RESUME DATA --------------------

class ResumeData(Base):
    __tablename__ = "resume_data"

    resume_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))

    extracted_name = Column(String(100))
    extracted_email = Column(String(100))
    extracted_phone = Column(String(20))
    extracted_college = Column(String(150))
    extracted_degree = Column(String(100))
    extracted_text = Column(Text)

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="resumes")


# -------------------- COMPANY --------------------

class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    industry = Column(String(100))
    location = Column(String(100))  # Kept for compatibility
    website = Column(String(255))
    description = Column(Text)
    
    # Account Contact
    contact_name = Column(String(100))
    contact_designation = Column(String(100))  # e.g., HR Manager
    contact_phone = Column(String(20))
    
    # Organization Identity
    org_type = Column(String(50))  # Company, Startup, NGO, Government/PSU, Educational institution
    company_size = Column(String(50))  # 1–10, 11–50, 51–200, 200+
    logo_path = Column(String(255))
    
    # Location details
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    pincode = Column(String(20))
    office_locations = Column(Text)
    
    # Verification details
    cin_number = Column(String(50))
    gstin_pan = Column(String(50))
    email_domain = Column(String(100))
    verification_doc_path = Column(String(255))
    verification_status = Column(String(50), default="Pending")  # Pending, Verified, Rejected
    device_token = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    internships = relationship(
        "Internship",
        back_populates="company",
        cascade="all, delete-orphan"
    )


# -------------------- INTERNSHIP --------------------

class Internship(Base):
    __tablename__ = "internships"

    internship_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"))

    title = Column(String(150), nullable=False)
    domain = Column(String(100))  # Domain/category
    description = Column(Text)
    location = Column(String(100))
    stipend = Column(DECIMAL(10, 2))
    duration = Column(String(50))  # e.g., "3 months"
    mode = Column(Enum(ModeEnum), default=ModeEnum.Offline)
    last_date = Column(Date)
    
    # Additional requirements
    preferred_skills = Column(Text)
    eligible_course = Column(String(100))
    eligible_year = Column(Integer)
    min_cgpa = Column(DECIMAL(3, 2))
    positions = Column(Integer, default=1)
    selection_process = Column(Text)
    status = Column(String(50), default="Active")  # Draft, Active, Closed

    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="internships")

    skills = relationship(
        "InternshipSkill",
        back_populates="internship",
        cascade="all, delete-orphan"
    )

    applications = relationship(
        "Application",
        back_populates="internship",
        cascade="all, delete-orphan"
    )

    feedbacks = relationship(
        "Feedback",
        back_populates="internship",
        cascade="all, delete-orphan"
    )


# -------------------- INTERNSHIP SKILLS --------------------

class InternshipSkill(Base):
    __tablename__ = "internship_skills"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.internship_id"))
    skill_name = Column(String(100))

    internship = relationship("Internship", back_populates="skills")


# -------------------- APPLICATION --------------------

class Application(Base):
    __tablename__ = "applications"

    application_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    internship_id = Column(Integer, ForeignKey("internships.internship_id"))
    match_score = Column(DECIMAL(5, 2))
    certificate_url = Column(String(255))
    status = Column(
        Enum(ApplicationStatusEnum),
        default=ApplicationStatusEnum.Applied
    )
    applied_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="applications")
    internship = relationship("Internship", back_populates="applications")


# -------------------- FEEDBACK --------------------

class Feedback(Base):
    __tablename__ = "feedbacks"

    feedback_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    internship_id = Column(Integer, ForeignKey("internships.internship_id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comments = Column(Text)
    is_relevant = Column(String(10), default="Yes")  # "Yes" / "No"
    sentiment_score = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="feedbacks")
    internship = relationship("Internship", back_populates="feedbacks")


# -------------------- ADMIN --------------------

class Admin(Base):
    __tablename__ = "admins"

    admin_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------- NOTIFICATION --------------------

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    recipient_role = Column(String(20), nullable=False)  # student or company
    recipient_id = Column(Integer, nullable=False)       # student_id or company_id
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
