# PM Internship Recommendation Engine — Backend

FastAPI backend for the **AI-Powered Smart Internship Recommendation Engine**
built for the PM Internship Scheme. Covers auth, student/company profiles,
50+ seeded internships, a TF-IDF/cosine-similarity recommendation engine with
match % and reasons, one-click apply, company-side ranked candidates, and an
admin analytics endpoint.

## 1. Setup (run locally)

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Seed the database with demo companies + 50+ internships
python -m app.seed

# 4. (Optional) create an admin account for the analytics endpoint
python create_admin.py admin@example.com AdminPass123

# 5. Run the server
uvicorn app.main:app --reload
```

The API will be live at `http://127.0.0.1:8000`.
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

> Note: this code was written and syntax-checked in an offline sandbox, so
> the dependency versions haven't been pip-installed and run end-to-end here.
> Follow the steps above on your machine, and if you hit a version conflict,
> loosen the pins in `requirements.txt` (e.g. `fastapi>=0.111`).

## 2. Project structure

```
pm_internship_backend/
├── app/
│   ├── main.py            # FastAPI app, CORS, router registration
│   ├── database.py        # SQLAlchemy engine/session (SQLite by default)
│   ├── models.py           # User, StudentProfile, CompanyProfile, Internship, Application
│   ├── schemas.py           # Pydantic request/response models
│   ├── auth.py               # JWT creation/validation, password hashing, role guards
│   ├── recommendation.py     # TF-IDF + cosine similarity matching engine
│   ├── seed.py                # Seeds 50+ realistic internships + demo companies
│   └── routers/
│       ├── auth_router.py         # /auth/signup, /auth/login
│       ├── student_router.py       # profile, recommendations, apply
│       ├── company_router.py        # profile, create internship, ranked matches
│       ├── internship_router.py     # public browse/search, application status updates
│       └── admin_router.py           # /admin/analytics
├── create_admin.py         # CLI helper to create an admin account
├── requirements.txt
└── README.md
```

## 3. Auth model

- Sign up as `student`, `company`, or `admin` role via `POST /auth/signup`.
  (In production you'd restrict `admin` signups — use `create_admin.py` instead.)
- Log in via `POST /auth/login` (OAuth2 password form: `username` = email).
- Every protected endpoint expects `Authorization: Bearer <token>`.

## 4. Core API reference

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | anyone | Register (student/company/admin) |
| POST | `/auth/login` | anyone | Get JWT access token |
| POST | `/students/me/profile` | student | Create profile (education, skills, interests, preferences) |
| PUT | `/students/me/profile` | student | Update profile |
| GET | `/students/me/recommendations?domain=&location=&work_mode=&limit=10` | student | Top-N ranked internships with match % and reasons |
| POST | `/students/me/apply/{internship_id}` | student | One-click apply (stores match % at time of application) |
| GET | `/students/me/applications` | student | List my applications + statuses |
| POST | `/companies/me/profile` | company | Create company profile |
| POST | `/companies/me/internships` | company | Post a new internship |
| GET | `/companies/me/internships` | company | List my postings |
| GET | `/companies/me/internships/{id}/matches` | company | Ranked list of best-fit students for a posting |
| GET | `/internships/?domain=&location=&work_mode=&search=` | anyone | Public browse/search/filter |
| GET | `/internships/{id}` | anyone | Internship detail |
| PATCH | `/internships/applications/{id}/status` | company | Shortlist/reject/select an applicant |
| GET | `/admin/analytics` | admin | Totals, popular domains, location distribution, status breakdown |

## 5. How matching works (`recommendation.py`)

1. Student profile text = skills + interests + preferred domain + education.
2. Internship text = title + domain + required skills + description.
3. TF-IDF vectorizes all texts; cosine similarity gives a 0–1 base score.
4. Small transparent boosts (+12% domain match, +8% location match, +5% work-mode
   match) are added, then the score is clipped to [0, 1] and shown as a
   **match percentage**.
5. **Reasons** are generated separately (overlapping skills, domain/location/
   work-mode matches) so the UI can show *why* an internship was recommended —
   this is intentionally simple/explainable rather than a black-box model,
   which is easier to defend in your SRS and demo.

Swapping in a stronger model later (embeddings, a learned ranking model,
feedback-based re-ranking) only requires changing `recommendation.py` — the
API contract (`match_percentage` + `reasons`) stays the same.

## 6. Hindi accessibility toggle (frontend note)

The backend returns plain field values (titles, descriptions, domains) in
English. For the "Hindi as a visible accessibility feature" requirement, the
simplest approach for a 4-person team on a deadline is a **frontend-only**
toggle: keep a small dictionary of static UI strings (labels, buttons, filter
names) in English and Hindi in the Flutter app, and switch based on a locale
setting — no backend changes needed for the MVP.

## 7. Deployment notes

- Swap `SQLALCHEMY_DATABASE_URL` in `app/database.py` to a Postgres URL
  (Render/Supabase) for production; no other code changes needed.
- Set `PM_INTERNSHIP_SECRET_KEY` as an environment variable in production
  instead of relying on the dev default.
- Tighten `allow_origins` in `app/main.py`'s CORS middleware to your deployed
  frontend URL(s) before going live.
- Suggested platform: Render (backend), Vercel/Netlify (Flutter web build),
  and an Android APK build (`flutter build apk`) for the mobile deliverable.

## 8. What's intentionally out of scope here (per your "if time remains" list)

Resume skill extraction, chatbot, feedback-based re-ranking, sentiment
analysis, notifications, and third-party integrations (LinkedIn/GitHub/SMS/
certificates) are not implemented, but the schema and router structure are
built so each can be added as a new router + a small model addition without
restructuring the existing code.
