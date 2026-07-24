"""
Seeds the database with demo companies, students, and 50 realistic internship postings
spread across common PM Internship Scheme domains and Indian cities.

Run with:  python -m app.seed
"""
from datetime import date, timedelta
from sqlalchemy.orm import Session

from .database import SessionLocal, engine, Base
from . import models
from .auth import hash_password

CITIES = [
    "Bengaluru", "Hyderabad", "Pune", "Mumbai", "Delhi", "Chennai",
    "Noida", "Gurugram", "Ahmedabad", "Kolkata", "Jaipur", "Chandigarh",
]

WORK_MODES = [models.ModeEnum.Online, models.ModeEnum.Offline, models.ModeEnum.Hybrid]

DOMAIN_TEMPLATES = [
    {
        "domain": "Data Science",
        "titles": ["Data Science Intern", "Data Analytics Intern", "ML Research Intern"],
        "skills": "python, pandas, numpy, matplotlib, sql, machine learning",
        "description": "Work with the analytics team to clean datasets, build predictive models, and present insights using Python and standard ML libraries.",
    },
    {
        "domain": "Artificial Intelligence",
        "titles": ["AI Intern", "NLP Intern", "Computer Vision Intern"],
        "skills": "python, nlp, deep learning, tensorflow, pytorch, opencv",
        "description": "Assist in building and evaluating AI models for real-world use cases, including NLP pipelines and computer vision prototypes.",
    },
    {
        "domain": "Software Development",
        "titles": ["Software Development Intern", "Backend Developer Intern", "Full Stack Intern"],
        "skills": "python, java, git, sql, rest api, flask, django",
        "description": "Contribute to feature development, write clean and tested code, and collaborate with a small engineering team on an existing product.",
    },
    {
        "domain": "Web Development",
        "titles": ["Frontend Developer Intern", "Web Development Intern"],
        "skills": "html, css, javascript, react, git",
        "description": "Build responsive UI components, fix bugs, and improve performance of customer-facing web applications.",
    },
    {
        "domain": "Cloud Computing",
        "titles": ["Cloud Support Intern", "DevOps Intern"],
        "skills": "aws, linux, docker, ci/cd, networking basics",
        "description": "Support cloud infrastructure tasks, monitor deployments, and assist with basic DevOps automation scripts.",
    },
    {
        "domain": "Cybersecurity",
        "titles": ["Cybersecurity Intern", "Security Analyst Intern"],
        "skills": "networking, linux, security fundamentals, python",
        "description": "Assist the security team with vulnerability scanning, log analysis, and documentation of security best practices.",
    },
    {
        "domain": "Digital Marketing",
        "titles": ["Digital Marketing Intern", "SEO Intern", "Social Media Intern"],
        "skills": "seo, content writing, social media, analytics, canva",
        "description": "Support campaign planning, content creation, and performance tracking across digital marketing channels.",
    },
    {
        "domain": "Finance",
        "titles": ["Finance Intern", "Financial Analyst Intern"],
        "skills": "excel, financial modeling, accounting basics, analytics",
        "description": "Assist with budget tracking, financial reporting, and building simple models to support business decisions.",
    },
    {
        "domain": "Human Resources",
        "titles": ["HR Intern", "Talent Acquisition Intern"],
        "skills": "communication, ms office, screening, coordination",
        "description": "Support recruitment coordination, onboarding documentation, and employee engagement activities.",
    },
    {
        "domain": "Operations",
        "titles": ["Operations Intern", "Business Operations Intern"],
        "skills": "excel, process improvement, communication, coordination",
        "description": "Help streamline daily operations, maintain trackers, and support cross-functional coordination tasks.",
    },
    {
        "domain": "Content Writing",
        "titles": ["Content Writing Intern", "Technical Writing Intern"],
        "skills": "writing, research, seo, editing, english",
        "description": "Create clear, well-researched content for blogs, documentation, and marketing collateral.",
    },
    {
        "domain": "Mechanical Engineering",
        "titles": ["Mechanical Design Intern", "Product Engineering Intern"],
        "skills": "autocad, solidworks, gd&t, manufacturing basics",
        "description": "Assist design engineers with CAD modeling, tolerance checks, and preparation of manufacturing drawings.",
    },
    {
        "domain": "Electrical Engineering",
        "titles": ["Electrical Design Intern", "Embedded Systems Intern"],
        "skills": "circuit design, embedded c, microcontrollers, matlab",
        "description": "Support the hardware team with circuit testing, embedded firmware tasks, and documentation.",
    },
]


def seed():
    print("Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables from new schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if database already seeded
        if db.query(models.Internship).count() >= 50:
            print("Database already has 50+ internships. Skipping seed.")
            return

        print("Seeding database...")

        # 1. Seed Demo Admin
        admin = db.query(models.Admin).filter(models.Admin.email == "admin@example.com").first()
        if not admin:
            admin = models.Admin(
                email="admin@example.com",
                password=hash_password("AdminPass123")
            )
            db.add(admin)
            db.flush()
            print("Created default admin: admin@example.com")

        # 2. Seed Demo Companies
        demo_companies = []
        company_names = [
            "NovaTech Solutions", "BrightPath Analytics", "Skyline Software Labs",
            "GreenGrid Energy", "Quantify Finance", "Urban Mobility Works",
            "Clarity Health Systems", "NextGen Robotics",
        ]
        
        for name in company_names:
            email = name.lower().replace(" ", "").replace(".", "") + "@example.com"
            existing = db.query(models.Company).filter(models.Company.email == email).first()
            if existing:
                company = existing
            else:
                company = models.Company(
                    company_name=name,
                    email=email,
                    password=hash_password("Password@123"),
                    industry="Technology",
                    location="Hyderabad",
                    website=f"https://www.{email.split('@')[1]}",
                    description=f"{name} is a growing organization offering hands-on internship experience.",
                    org_type="Company",
                    company_size="51–200",
                    city="Hyderabad",
                    state="Telangana",
                    country="India",
                    pincode="500081",
                    verification_status="Verified"
                )
                db.add(company)
                db.flush()
            demo_companies.append(company)

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
                "skills": ["python", "sql", "machine learning", "pandas"]
            },
            {
                "full_name": "Madhav Sharma",
                "email": "madhav@example.com",
                "phone": "9876543211",
                "gender": "Male",
                "college": "NIT Trichy",
                "degree": "B.Tech",
                "branch": "Information Technology",
                "graduation_year": 2027,
                "cgpa": 8.20,
                "permanent_address": "12th Street, Anna Nagar, Chennai, Tamil Nadu",
                "languages": "English, Tamil, Hindi",
                "skills": ["react", "javascript", "html", "css", "git"]
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
                "skills": ["python", "sql", "excel", "pandas", "power bi"]
            },
            {
                "full_name": "Rohan Gupta",
                "email": "rohan@example.com",
                "phone": "9876543213",
                "gender": "Male",
                "college": "COEP Pune",
                "degree": "B.Tech",
                "branch": "Electronics",
                "graduation_year": 2026,
                "cgpa": 7.85,
                "permanent_address": "Viman Nagar, Pune, Maharashtra",
                "languages": "English, Hindi, Marathi",
                "skills": ["circuit design", "embedded c", "microcontrollers"]
            }
        ]

        for s_data in demo_students:
            existing = db.query(models.Student).filter(models.Student.email == s_data["email"]).first()
            if not existing:
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

                # Seed student skills
                for skill_name in s_data["skills"]:
                    student_skill = models.StudentSkill(
                        student_id=student.student_id,
                        skill_name=skill_name
                    )
                    db.add(student_skill)
                db.flush()

        # 4. Seed 50+ Internships across domains/cities
        count = 0
        template_idx = 0
        city_idx = 0
        mode_idx = 0
        company_idx = 0

        while count < 52:
            template = DOMAIN_TEMPLATES[template_idx % len(DOMAIN_TEMPLATES)]
            title = template["titles"][count % len(template["titles"])]
            city = CITIES[city_idx % len(CITIES)]
            mode = WORK_MODES[mode_idx % len(WORK_MODES)]
            company = demo_companies[company_idx % len(demo_companies)]

            internship = models.Internship(
                company_id=company.company_id,
                title=f"{title} #{count + 1}",
                domain=template["domain"],
                preferred_skills=template["skills"],
                description=template["description"],
                location=city,
                mode=mode,
                duration=f"{[2, 3, 6][count % 3]} months",
                stipend=5000 + (count % 6) * 2000,
                positions=1 + (count % 3),
                last_date=date.today() + timedelta(days=30),
                status="Active"
            )
            db.add(internship)
            db.flush()

            # Seed internship skills
            skills = [s.strip() for s in template["skills"].split(",") if s.strip()]
            for skill_name in skills:
                internship_skill = models.InternshipSkill(
                    internship_id=internship.internship_id,
                    skill_name=skill_name
                )
                db.add(internship_skill)
            db.flush()

            count += 1
            template_idx += 1
            city_idx += 1
            mode_idx += 1
            company_idx += 1

        db.commit()
        print(f"Successfully seeded database with {count} internships, demo students, and companies.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
