import requests
import json

url = "http://127.0.0.1:8000/auth/student/signup"
data = {
    "email": "test@gmail.com",
    "password": "password",
    "password_confirm": "password",
    "otp_code": "123456",
    "full_name": "Test User",
    "phone": "0000000000"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
