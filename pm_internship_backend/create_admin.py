"""
Creates an admin user directly in the database (bypasses the public /auth/signup
endpoint on purpose, since admin accounts should not be self-serve).

Usage:
    python create_admin.py admin@example.com YourPassword123
"""
import sys

from app.database import SessionLocal, Base, engine
from app import models
from app.auth import hash_password


def main():
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)

    email, password = sys.argv[1], sys.argv[2]

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(models.Admin).filter(models.Admin.email == email).first()
        if existing:
            print(f"Admin {email} already exists.")
            return

        admin = models.Admin(
            email=email,
            password=hash_password(password),
        )
        db.add(admin)
        db.commit()
        print(f"Admin user created successfully: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
