import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.config import UPLOAD_DIR, SAMPLE_RESUMES_DIR, BASE_DIR
from app.database import init_db, get_db
from app.auth.security import hash_password
from app.auth.routes import router as auth_router
from app.resumes.routes import router as resumes_router
from app.roadmap.routes import router as roadmap_router
from app.jobs.routes import router as jobs_router, ensure_default_jobs
from app.admin.routes import router as admin_router

app = FastAPI(
    title="AI Resume Analyzer & Career Roadmap Generator",
    description="Full-Stack Academic Project for Software Engineering Laboratory",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_initial_accounts():
    """Seeds predefined administrator and demo student accounts."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Administrator Account
        cursor.execute("SELECT id FROM users WHERE email = 'admin@resumeai.edu'")
        if not cursor.fetchone():
            cursor.execute(
                """
                INSERT INTO users (email, password_hash, full_name, role, target_role, bio)
                VALUES (?, ?, ?, 'admin', 'DevOps & Cloud Engineer', 'System Administrator & Lab Supervisor')
                """,
                ("admin@resumeai.edu", hash_password("Admin@123"), "Lab Administrator")
            )
            print("Seeded Admin Account: admin@resumeai.edu / Admin@123")
            
        # 2. Student Account
        cursor.execute("SELECT id FROM users WHERE email = 'student@resumeai.edu'")
        if not cursor.fetchone():
            cursor.execute(
                """
                INSERT INTO users (email, password_hash, full_name, role, target_role, bio)
                VALUES (?, ?, ?, 'user', 'Full-Stack Developer', 'Computer Science & Engineering Student')
                """,
                ("student@resumeai.edu", hash_password("Student@123"), "Alex Student")
            )
            print("Seeded Student Account: student@resumeai.edu / Student@123")

@app.on_event("startup")
def startup_event():
    init_db()
    seed_initial_accounts()
    ensure_default_jobs()

# Include REST Routers
app.include_router(auth_router)
app.include_router(resumes_router)
app.include_router(roadmap_router)
app.include_router(jobs_router)
app.include_router(admin_router)

# Mount Uploads and Sample Resumes directory
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/sample_resumes", StaticFiles(directory=str(SAMPLE_RESUMES_DIR)), name="sample_resumes")

# Frontend static files serving (SPA fallback)
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Resume Analyzer & Career Roadmap Generator",
        "version": "1.0.0"
    }

# SPA Catch-all route to serve Vite React build
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or static files
        if full_path.startswith("api/") or full_path.startswith("uploads/") or full_path.startswith("sample_resumes/"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
