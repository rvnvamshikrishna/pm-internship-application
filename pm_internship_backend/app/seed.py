"""
Seeds the database with demo companies, students, and exactly 10 distinct, realistic internship postings
spread across different domains and Indian cities.

Run with:  python -m app.seed
"""
from datetime import date, timedelta
from sqlalchemy.orm import Session

from sqlalchemy import text
from .database import SessionLocal, engine, Base
from . import models
from .auth import hash_password

CITIES = [
    "Bengaluru", "Hyderabad", "Pune", "Mumbai", "Delhi", "Chennai",
    "Noida", "Gurugram", "Ahmedabad", "Kolkata"
]

WORK_MODES = [models.ModeEnum.remote,
              models.ModeEnum.on_site, models.ModeEnum.Hybrid]

DOMAIN_TEMPLATES = [
    {
        "domain": "Software Development",
        "title": "Software Development Intern",
        "skills": "python, java, git, sql, rest api",
        "description": "Contribute to frontend and backend feature development, write clean code, and collaborate with engineering on our core products.",
    },
    {
        "domain": "Web Development",
        "title": "Frontend React Intern",
        "skills": "html, css, javascript, react, git, tailwind css",
        "description": "Build modern, responsive UI components, improve performance, and integrate REST APIs in our customer web portals.",
    },
    {
        "domain": "Data Science",
        "title": "Data Analyst Intern",
        "skills": "python, pandas, numpy, matplotlib, sql, excel",
        "description": "Work with the product team to clean data pipelines, generate automated reports, and extract user insights.",
    },
    {
        "domain": "Artificial Intelligence",
        "title": "Machine Learning Research Intern",
        "skills": "python, machine learning, deep learning, tensorflow, pytorch",
        "description": "Assist in prototyping computer vision models and evaluating natural language processing algorithms.",
    },
    {
        "domain": "Cloud Computing",
        "title": "Cloud Operations & DevOps Intern",
        "skills": "aws, docker, linux, ci/cd, bash scripting",
        "description": "Support cloud infrastructure deployments, monitor server metrics, and automate environment configurations.",
    },
    {
        "domain": "Cybersecurity",
        "title": "Security Analyst Intern",
        "skills": "networking, linux, security operations, vulnerability testing",
        "description": "Assist the IT security team with network log audits, vulnerability scans, and security documentation.",
    },
    {
        "domain": "Digital Marketing",
        "title": "Digital Marketing & SEO Intern",
        "skills": "seo, content writing, social media, analytics",
        "description": "Create optimized campaigns, assist with copywriting, and track web traffic analytics across channels.",
    },
    {
        "domain": "Finance",
        "title": "Financial Analyst Intern",
        "skills": "excel, financial modeling, accounting basics",
        "description": "Assist with monthly budget tracking, cost optimization modeling, and drafting financial summaries.",
    },
    {
        "domain": "Human Resources",
        "title": "Talent Acquisition Intern",
        "skills": "communication, ms office, interview scheduling",
        "description": "Coordinate candidate screening, track application flows, and help manage onboarding schedules.",
    },
    {
        "domain": "Operations",
        "title": "Business Operations Intern",
        "skills": "excel, communication, process mapping, coordination",
        "description": "Assist with operational process mapping, cross-team scheduling, and maintaining status trackers.",
    }
]


def seed():
    db: Session = SessionLocal()
    try:
        print("Disabling foreign key checks...")
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        db.commit()

        print("Dropping all existing tables...")
        Base.metadata.drop_all(bind=engine)
        print("Creating all tables from new schema...")
        Base.metadata.create_all(bind=engine)

        print("Enabling foreign key checks...")
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()

        print("Seeding database...")

        # 1. Seed Demo Admin
        admin = models.Admin(
            email="admin@example.com",
            password=hash_password("AdminPass123")
        )
        db.add(admin)
        db.flush()
        print("Created Admin: admin@example.com / AdminPass123")

        # 2. Seed Demo Companies
        demo_companies = []
        company_names = [
            "NovaTech Solutions", "BrightPath Analytics", "Skyline Software Labs",
            "GreenGrid Energy", "Quantify Finance", "Urban Mobility Works",
            "Clarity Health Systems", "NextGen Robotics", "Apex Industries", "Quantum Group"
        ]

        for index, name in enumerate(company_names):
            email = name.lower().replace(" ", "").replace(".", "") + "@example.com"
            status_opts = ["Verified", "Pending", "Rejected"]
            # Let's seed: first 6 are Verified, next 3 are Pending, last 1 is Rejected
            if index < 6:
                status = "Verified"
            elif index < 9:
                status = "Pending"
            else:
                status = "Rejected"

            company = models.Company(
                company_name=name,
                email=email,
                password=hash_password("Password@123"),
                industry="Technology",
                location="Hyderabad",
                website=f"https://www.{email.split('@')[1]}",
                description=f"{name} is a leading organization specializing in advanced technical products, offering high-impact hands-on experience and direct mentorship for career-focused students.",
                org_type="Company",
                company_size="51–200",
                city="Hyderabad",
                state="Telangana",
                country="India",
                pincode="500081",
                verification_status=status,
                cin_number=f"U72200TG2020PLC1{10000 + index}",
                gstin_pan=f"36AABCC{1000 + index}K1ZP",
                contact_name=f"Manager {index + 1}",
                contact_designation="HR Director",
                contact_phone=f"987654321{index}"
            )
            db.add(company)
            db.flush()
            demo_companies.append(company)
            print(
                f"Created Company: {email} / Password@123 (Status: {status})")

        # 3. Seed Demo Students
        demo_students = [
            {
                "full_name": "Krishna Kumar",
                "email": "krishna@example.com",
                "phone": "9876543210",
                "gender": "Male",
                "college": "IIT Hyderabad",
                "degree": "B.Tech",
                "branch": "Computer Science",
                "graduation_year": 2027,
                "cgpa": 8.95,
                "permanent_address": "Flat 402, Sai Residency, Madhapur, Hyderabad, Telangana",
                "languages": "English, Hindi, Telugu",
                "skills": ["python", "sql", "pandas"]
            },
            {
                "full_name": "Sneha Reddy",
                "email": "sneha@example.com",
                "phone": "9876543212",
                "gender": "Female",
                "college": "Osmania University",
                "degree": "B.Sc",
                "branch": "Data Science",
                "graduation_year": 2027,
                "cgpa": 9.10,
                "permanent_address": "H.No. 12-3-45, Tarnaka, Secunderabad, Telangana",
                "languages": "English, Telugu",
                "skills": ["python", "sql", "excel", "pandas"]
            }
        ]

        for s_data in demo_students:
            student = models.Student(
                full_name=s_data["full_name"],
                first_name=s_data["full_name"].split(" ")[0],
                last_name=s_data["full_name"].split(" ")[1],
                email=s_data["email"],
                password=hash_password("Password@123"),
                phone=s_data["phone"],
                gender=s_data["gender"],
                college=s_data["college"],
                degree=s_data["degree"],
                branch=s_data["branch"],
                graduation_year=s_data["graduation_year"],
                cgpa=s_data["cgpa"],
                permanent_address=s_data["permanent_address"],
                languages=s_data["languages"]
            )
            db.add(student)
            db.flush()
            print(f"Created Student: {s_data['email']} / Password@123")

            # Seed student skills
            for skill_name in s_data["skills"]:
                student_skill = models.StudentSkill(
                    student_id=student.student_id,
                    skill_name=skill_name
                )
                db.add(student_skill)
            db.flush()

        # 4. Seed exactly 10 distinct internships
        for i, template in enumerate(DOMAIN_TEMPLATES):
            city = CITIES[i % len(CITIES)]
            mode = WORK_MODES[i % len(WORK_MODES)]
            company = demo_companies[i % len(demo_companies)]

            internship = models.Internship(
                company_id=company.company_id,
                title=template["title"],
                domain=template["domain"],
                preferred_skills=template["skills"],
                description=template["description"],
                location=city,
                mode=mode,
                duration=f"{[2, 3, 6][i % 3]} months",
                stipend=5000 + (i * 1500),
                positions=1 + (i % 2),
                last_date=date.today() + timedelta(days=30),
                status="Active"
            )
            db.add(internship)
            db.flush()

            # Seed internship skills
            skills = [s.strip()
                      for s in template["skills"].split(",") if s.strip()]
            for skill_name in skills:
                internship_skill = models.InternshipSkill(
                    internship_id=internship.internship_id,
                    skill_name=skill_name
                )
                db.add(internship_skill)
            db.flush()
            print(
                f"Created Internship: {template['title']} by {company.company_name}")

        db.commit()
        print("\nDatabase seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
