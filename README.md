# PM Internship Application

This project is a comprehensive platform for managing Prime Minister (PM) Internships, connecting companies with student candidates. It features a modern tech stack encompassing a mobile application, a web frontend, and a robust backend.

## Project Structure

The repository is organized into three main components:

- **`pm_internship_backend/`**: A Python-based backend (FastAPI) handling business logic, AI recommendations, user management, and database interactions.
- **`pm_internship_web/`**: A Next.js web application providing dashboards and interfaces for students, companies, and administrators.
- **`pm_internship_app/`**: A Flutter mobile application designed for students and companies on the go.

## Features

### Students
- Register and build a detailed profile.
- Browse and explore available internships.
- Get AI-powered internship recommendations based on skills and preferences.
- Apply for internships and track application status.

### Companies
- Post new internship opportunities.
- Review student applications.
- Access candidate rankings and analytics to find the best fit.

### Administrators
- Manage platform users (companies and students).
- Oversee internship postings and platform analytics.

## Getting Started

### 1. Backend (`pm_internship_backend`)
The backend is built with FastAPI and Python.
```bash
cd pm_internship_backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 2. Web Application (`pm_internship_web`)
The web frontend is built with Next.js, React, and Tailwind CSS.
```bash
cd pm_internship_web
npm install
npm run dev
```

### 3. Mobile Application (`pm_internship_app`)
The mobile application is built using Flutter.
```bash
cd pm_internship_app
flutter pub get
flutter run
```

## Contributing
Please follow the standard pull request process to propose any changes or enhancements.