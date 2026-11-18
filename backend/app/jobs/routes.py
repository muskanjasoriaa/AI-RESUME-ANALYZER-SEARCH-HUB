import json
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from app.database import get_db
from app.auth.security import get_current_user, get_current_admin
from app.jobs.jobs_data import DEFAULT_JOBS
from app.jobs.recommender import match_jobs_for_candidate

router = APIRouter(prefix="/api/jobs", tags=["Jobs & Internships"])

class JobCreateRequest(BaseModel):
    title: str
    company: str
    location: str
    is_remote: bool = False
    job_type: str = "Internship"  # 'Internship' or 'Full-time'
    experience_level: str = "Entry Level"
    description: str
    required_skills: List[str]
    salary_range: str
    apply_url: str

def ensure_default_jobs():
    """Seeds default jobs if table is empty."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) as count FROM jobs")
        if cursor.fetchone()["count"] == 0:
            for job in DEFAULT_JOBS:
                cursor.execute(
                    """
                    INSERT INTO jobs (title, company, location, is_remote, job_type, experience_level, description, required_skills_json, salary_range, apply_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        job["title"], job["company"], job["location"], 1 if job["is_remote"] else 0,
                        job["job_type"], job["experience_level"], job["description"],
                        json.dumps(job["required_skills"]), job["salary_range"], job["apply_url"]
                    )
                )

@router.get("")
def list_jobs(
    job_type: Optional[str] = None,
    remote: Optional[bool] = None,
    search: Optional[str] = None
):
    """Lists jobs with optional filtering."""
    ensure_default_jobs()
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM jobs WHERE 1=1"
        params = []
        if job_type:
            query += " AND lower(job_type) = lower(?)"
            params.append(job_type)
        if remote is not None:
            query += " AND is_remote = ?"
            params.append(1 if remote else 0)
        if search:
            query += " AND (lower(title) LIKE ? OR lower(company) LIKE ?)"
            params.extend([f"%{search.lower()}%", f"%{search.lower()}%"])
            
        query += " ORDER BY id DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        for r in rows:
            r["required_skills"] = json.loads(r["required_skills_json"])
            r["is_remote"] = bool(r["is_remote"])
            
        return {"jobs": rows, "total": len(rows)}

@router.get("/recommendations")
def get_recommendations(current_user: dict = Depends(get_current_user)):
    """Computes personalized job and internship recommendations based on candidate's parsed skills."""
    ensure_default_jobs()
    user_id = current_user["id"]
    target_role = current_user.get("target_role", "Full-Stack Developer")
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get latest resume skills
        cursor.execute(
            "SELECT parsed_data_json FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            (user_id,)
        )
        res_row = cursor.fetchone()
        candidate_skills = []
        if res_row:
            parsed = json.loads(res_row["parsed_data_json"])
            candidate_skills = parsed.get("skills", {}).get("all_skills", [])
            
        # Fetch all jobs
        cursor.execute("SELECT * FROM jobs")
        job_rows = cursor.fetchall()
        for j in job_rows:
            j["required_skills"] = json.loads(j["required_skills_json"])
            
        ranked = match_jobs_for_candidate(candidate_skills, target_role, job_rows)
        return {
            "target_role": target_role,
            "candidate_skills_count": len(candidate_skills),
            "recommendations": ranked
        }

@router.post("", status_code=201)
def add_job(req: JobCreateRequest, admin: dict = Depends(get_current_admin)):
    """Admin-only endpoint to post a new job or internship opportunity."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO jobs (title, company, location, is_remote, job_type, experience_level, description, required_skills_json, salary_range, apply_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                req.title.strip(), req.company.strip(), req.location.strip(),
                1 if req.is_remote else 0, req.job_type, req.experience_level,
                req.description.strip(), json.dumps(req.required_skills),
                req.salary_range.strip(), req.apply_url.strip()
            )
        )
        job_id = cursor.lastrowid
        return {"message": "Job posted successfully.", "job_id": job_id}
