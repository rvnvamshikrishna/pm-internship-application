import requests

base_url = "http://127.0.0.1:8000"

def test_flow():
    # Login
    login_url = f"{base_url}/auth/student/login"
    login_data = {
        "email": "directtest@gmail.com",
        "password": "password"
    }
    res2 = requests.post(login_url, json=login_data)
    print(f"Login Status: {res2.status_code}")
    if res2.status_code != 200:
        return
        
    token = res2.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Update profile
    put_url = f"{base_url}/students/me"
    put_data = {
        "full_name": "Test Name",
        "degree": "BTech",
        "preferred_work_location": "Bangalore"
    }
    res3 = requests.put(put_url, json=put_data, headers=headers)
    print(f"PUT Status: {res3.status_code}")
    print(f"PUT Body: {res3.text}")

if __name__ == "__main__":
    test_flow()
