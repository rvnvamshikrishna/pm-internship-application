from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath('pm_internship_backend'))
from app.main import app

client = TestClient(app)

data = {
    "email": "testclient@gmail.com",
    "password": "password",
    "password_confirm": "password",
    "otp_code": "123456",
    "full_name": "Test User",
    "phone": "0000000000"
}

try:
    response = client.post("/auth/student/signup", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    import traceback
    traceback.print_exc()
