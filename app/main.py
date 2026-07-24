from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth_router, student_router, company_router, internship_router, admin_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Smart Internship Recommendation Engine",
    description="Backend API for the PM Internship Scheme recommendation platform.",
    version="1.0.0",
)

# Allow the Flutter web build (and local dev servers) to call this API.
# Tighten allow_origins to your deployed frontend URL(s) before going live.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(student_router.router)
app.include_router(company_router.router)
app.include_router(internship_router.router)
app.include_router(admin_router.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "PM Internship Recommendation Engine API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
