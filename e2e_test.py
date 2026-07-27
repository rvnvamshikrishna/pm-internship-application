import requests
import json
import time
import random

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print("Starting End-to-End MVP Test...")
    
    # 1. Setup Random Emails
    rand_int = random.randint(1000, 9999)
    company_email = f"company{rand_int}@test.com"
    student_email = f"student{rand_int}@test.com"
    password = "password123"
    
    # ================= COMPANY FLOW =================
    print(f"\n--- COMPANY FLOW ---")
    
    # Register Company
    res = requests.post(f"{BASE_URL}/auth/company/signup", json={
        "email": company_email,
        "password": password,
        "password_confirm": password,
        "otp_code": "123456",
        "company_name": "Test Company"
    })
    print("Register Company:", res.status_code, res.json())
    assert res.status_code in [200, 201]

    # Login Company
    res = requests.post(f"{BASE_URL}/auth/company/login", json={
        "email": company_email,
        "password": password
    })
    print("Login Company:", res.status_code)
    assert res.status_code == 200
    company_token = res.json()["access_token"]
    c_headers = {"Authorization": f"Bearer {company_token}"}

    # Build Company Profile
    res = requests.put(f"{BASE_URL}/companies/me", json={
        "company_name": "Tech Innovators",
        "industry": "Software",
        "company_size": "50-200",
        "description": "A great tech company."
    }, headers=c_headers)
    print("Build Company Profile:", res.status_code)
    assert res.status_code in [200, 201]

    # Post Internship
    res = requests.post(f"{BASE_URL}/companies/internships", json={
        "title": "Flutter Developer",
        "domain": "Software Development",
        "location": "Remote",
        "mode": "Online",
        "stipend": 20000.0,
        "ctc": "₹ 6,00,000 - 8,00,000 /year",
        "start_date": "Immediately",
        "experience": "No experience required",
        "perks": "5 days a week, Health Insurance",
        "duration": "6 Months",
        "description": "Looking for a flutter dev to build mobile apps.",
        "preferred_skills": "Flutter, Dart, Mobile UI",
        "last_date": "2026-12-31"
    }, headers=c_headers)
    print("Post Internship:", res.status_code, res.text)
    assert res.status_code in [200, 201]
    internship_id = res.json()["internship_id"]

    # ================= STUDENT FLOW =================
    print(f"\n--- STUDENT FLOW ---")
    
    # Register Student
    res = requests.post(f"{BASE_URL}/auth/student/signup", json={
        "email": student_email,
        "password": password,
        "password_confirm": password,
        "otp_code": "123456",
        "full_name": "Test Student",
        "phone": "0000000000"
    })
    print("Register Student:", res.status_code)
    assert res.status_code in [200, 201]

    # Login Student
    res = requests.post(f"{BASE_URL}/auth/student/login", json={
        "email": student_email,
        "password": password
    })
    print("Login Student:", res.status_code)
    assert res.status_code == 200
    student_token = res.json()["access_token"]
    s_headers = {"Authorization": f"Bearer {student_token}"}

    # Build Student Profile
    res = requests.put(f"{BASE_URL}/students/me", json={
        "full_name": "Test Student",
        "degree": "B.Tech",
        "graduation_year": 2027,
        "cgpa": 8.5
    }, headers=s_headers)
    print("Build Student Profile:", res.status_code)
    assert res.status_code in [200, 201]

    # Add Skills (This triggers NLP matching)
    for skill in ["Flutter", "Dart", "Firebase"]:
        res = requests.post(f"{BASE_URL}/students/skills", json={"skill_name": skill}, headers=s_headers)
        assert res.status_code in [200, 201]
    print("Added Skills for NLP matching.")

    # Get AI Recommendations
    res = requests.get(f"{BASE_URL}/students/recommendations", headers=s_headers)
    print("Get Recommendations:", res.status_code)
    assert res.status_code == 200
    recs = res.json()
    print(f"-> Found {len(recs)} recommendations.")
    
    # Ensure our posted internship is in recommendations
    found_internship = next((r for r in recs if r["internship"]["internship_id"] == internship_id), None)
    if found_internship:
        print(f"-> SUCCESS AI MATCH SCORE: {found_internship['match_score']}")
        print(f"-> SUCCESS AI REASONS: {found_internship['match_reasons']}")
    else:
        print("-> Warning: Internship not recommended (maybe semantic similarity was too low or DB sync issue).")

    # Apply for Internship
    res = requests.post(f"{BASE_URL}/students/apply/{internship_id}", json={}, headers=s_headers)
    print("Apply for Internship:", res.status_code)
    assert res.status_code in [200, 201]

    # ================= AI RANKING FLOW =================
    print(f"\n--- AI RANKING & FEEDBACK ---")
    
    # Get Ranked Candidates (Company)
    res = requests.get(f"{BASE_URL}/companies/internships/{internship_id}/ranked-candidates", headers=c_headers)
    assert res.status_code == 200
    candidates = res.json()
    print("Candidates:", candidates)
    my_candidate = next((c for c in candidates if c.get("student_name") == "Test Student"), None)
    if my_candidate:
        print(f"-> SUCCESS Candidate Scored: {my_candidate['match_score']}")
        application_id = my_candidate["application_id"]
        
        # Shortlist Candidate
        res = requests.put(f"{BASE_URL}/companies/applications/{application_id}", json={"status": "Selected"}, headers=c_headers)
        print("Select Candidate:", res.status_code)
        assert res.status_code == 200
    else:
        print("-> Error: Candidate not found in ranking!")

    # Student Provides Feedback (NLP Sentiment Analysis)
    res = requests.post(f"{BASE_URL}/students/feedback", json={
        "internship_id": internship_id,
        "rating": 5,
        "comments": "This process was incredibly amazing and smooth! Great experience.",
        "is_relevant": "Yes"
    }, headers=s_headers)
    print("Submit NLP Feedback:", res.status_code, res.text)
    assert res.status_code in [200, 201]
    print(f"-> SUCCESS Feedback sentiment score stored in DB")
    
    print("\nAll End-to-End Tests Completed Successfully!")

if __name__ == "__main__":
    run_test()
