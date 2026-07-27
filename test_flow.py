import requests

base_url = "http://127.0.0.1:8000"

def test_flow():
    # 1. Signup
    signup_url = f"{base_url}/auth/student/signup"
    signup_data = {
        "email": "frontend_test@gmail.com",
        "password": "password",
        "password_confirm": "password",
        "otp_code": "123456",
        "full_name": "Frontend Test User",
        "phone": "0000000000"
    }
    
    print("Sending Signup...")
    res1 = requests.post(signup_url, json=signup_data)
    print(f"Signup Status: {res1.status_code}")
    print(f"Signup Body: {res1.text}")
    
    if res1.status_code not in (200, 201):
        print("Signup failed, aborting.")
        return
        
    # 2. Login
    login_url = f"{base_url}/auth/student/login"
    login_data = {
        "username": "frontend_test@gmail.com",
        "password": "password"
    }
    
    print("\nSending Login...")
    res2 = requests.post(login_url, data=login_data) # Form data
    print(f"Login Status: {res2.status_code}")
    print(f"Login Body: {res2.text}")

if __name__ == "__main__":
    test_flow()
