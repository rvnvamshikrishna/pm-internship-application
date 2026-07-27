import sys
import os

sys.path.insert(0, os.path.abspath('pm_internship_backend'))

from app.database import SessionLocal
from app.routers.auth_router import student_signup
from app.schemas import StudentRegister

db = SessionLocal()

payload = StudentRegister(
    full_name="Test User",
    email="directtest@gmail.com",
    password="password",
    password_confirm="password",
    otp_code="123456",
    phone="0000000000"
)

try:
    res = student_signup(payload=payload, db=db)
    print("Success:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
