import io
import csv
import json
from collections import Counter
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from app.database import get_db
from app.auth.security import get_current_admin, hash_password
from app.roadmap.roles_data import CAREER_ROLES

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

class RoleUpdateRequest(BaseModel):
    role: str  # 'user' or 'admin'

class AdminCreateUserRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "user"  # 'user' or 'admin'
    target_role: Optional[str] = "Full-Stack Developer"

class AdminJobUpdateRequest(BaseModel):
    title: str
    company: str
    location: str
    is_remote: bool = False
    job_type: str = "Internship"
    experience_level: str = "Entry Level"
    description: str
    required_skills: List[str]
    salary_range: str
    apply_url: str

@router.get("/metrics")
def get_system_metrics(admin: dict = Depends(get_current_admin)):
    """Computes comprehensive academic platform metrics and skill gap analytics."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. User counts breakdown
        cursor.execute("""
            SELECT 
                count(*) as total_users,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
                SUM(CASE WHEN role != 'admin' THEN 1 ELSE 0 END) as total_students
            FROM users
        """)
        user_stats = cursor.fetchone()
        
        # 2. Resume counts & ATS stats
        cursor.execute("""
            SELECT 
                count(*) as total_resumes, 
                avg(ats_score) as avg_score,
                max(ats_score) as max_score
            FROM resumes
        """)
        res_stats = cursor.fetchone()
        
        # 3. Jobs & Roadmaps counts
        cursor.execute("SELECT count(*) as total_jobs FROM jobs")
        total_jobs = cursor.fetchone()["total_jobs"]
        
        cursor.execute("SELECT count(*) as total_roadmaps FROM career_roadmaps")
        total_roadmaps = cursor.fetchone()["total_roadmaps"]

        # 4. Target role distribution
        cursor.execute("""
            SELECT target_role, count(*) as count 
            FROM users 
            WHERE target_role IS NOT NULL AND target_role != '' 
            GROUP BY target_role 
            ORDER BY count DESC
        """)
        role_distribution = cursor.fetchall()
        
        # 5. Top missing & matched skills across all analyses
        cursor.execute("SELECT missing_skills_json, matched_skills_json FROM ats_analyses")
        analysis_rows = cursor.fetchall()
        missing_counter = Counter()
        matched_counter = Counter()
        for r in analysis_rows:
            try:
                for s in json.loads(r["missing_skills_json"] or "[]"):
                    missing_counter[s] += 1
                for s in json.loads(r["matched_skills_json"] or "[]"):
                    matched_counter[s] += 1
            except Exception:
                continue
                
        top_missing_skills = [
            {"skill": skill, "count": count}
            for skill, count in missing_counter.most_common(10)
        ]
        top_matched_skills = [
            {"skill": skill, "count": count}
            for skill, count in matched_counter.most_common(10)
        ]
        
        # 6. Score distribution brackets (0-50, 50-70, 70-85, 85-100)
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN ats_score < 50 THEN 1 ELSE 0 END) as low,
                SUM(CASE WHEN ats_score >= 50 AND ats_score < 70 THEN 1 ELSE 0 END) as average,
                SUM(CASE WHEN ats_score >= 70 AND ats_score < 85 THEN 1 ELSE 0 END) as good,
                SUM(CASE WHEN ats_score >= 85 THEN 1 ELSE 0 END) as excellent
            FROM resumes
        """)
        brackets = cursor.fetchone()
        
        # 7. Recent resumes preview
        cursor.execute("""
            SELECT r.id, r.original_filename, r.ats_score, r.target_role, r.created_at,
                   u.full_name as user_name, u.email as user_email
            FROM resumes r
            JOIN users u ON u.id = r.user_id
            ORDER BY r.id DESC LIMIT 5
        """)
        recent_resumes = cursor.fetchall()
        
        return {
            "total_users": user_stats["total_users"] or 0,
            "total_admins": user_stats["total_admins"] or 0,
            "total_students": user_stats["total_students"] or 0,
            "total_resumes_analyzed": res_stats["total_resumes"] or 0,
            "total_jobs": total_jobs or 0,
            "total_roadmaps": total_roadmaps or 0,
            "average_ats_score": round(res_stats["avg_score"] or 0.0, 1),
            "highest_ats_score": round(res_stats["max_score"] or 0.0, 1),
            "role_distribution": role_distribution,
            "top_missing_skills": top_missing_skills,
            "top_matched_skills": top_matched_skills,
            "recent_resumes": recent_resumes,
            "score_distribution": {
                "needs_improvement": brackets["low"] or 0,
                "average": brackets["average"] or 0,
                "competitive": brackets["good"] or 0,
                "excellent": brackets["excellent"] or 0
            }
        }

@router.get("/users")
def get_all_users(admin: dict = Depends(get_current_admin)):
    """Lists all registered users with their roles, target goals, and performance."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, email, full_name, role, target_role, created_at,
                   (SELECT count(*) FROM resumes WHERE user_id = users.id) as resumes_count,
                   (SELECT max(ats_score) FROM resumes WHERE user_id = users.id) as highest_score
            FROM users
            ORDER BY id ASC
            """
        )
        users = cursor.fetchall()
        for u in users:
            u["highest_score"] = round(u["highest_score"] or 0.0, 1)
        return {"users": users, "total": len(users)}

@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user_by_admin(req: AdminCreateUserRequest, admin: dict = Depends(get_current_admin)):
    """Admin-only endpoint to provision a new student or administrator account."""
    if req.role not in {"user", "admin"}:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
        
    clean_email = req.email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE lower(email) = ?", (clean_email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
            
        hashed = hash_password(req.password)
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, full_name, role, target_role)
            VALUES (?, ?, ?, ?, ?)
            """,
            (clean_email, hashed, req.full_name.strip(), req.role, req.target_role or "Full-Stack Developer")
        )
        new_id = cursor.lastrowid
        
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
            (admin["id"], "ADMIN_CREATE_USER", f"Admin created {req.role} account: {clean_email}")
        )
        
        return {"message": f"Created {req.role} account '{clean_email}' successfully.", "user_id": new_id}

@router.put("/users/{user_id}/role")
def change_user_role(user_id: int, req: RoleUpdateRequest, admin: dict = Depends(get_current_admin)):
    """Allows an administrator to promote or demote a user's role."""
    if req.role not in {"user", "admin"}:
        raise HTTPException(status_code=400, detail="Role must be either 'user' or 'admin'.")
        
    if user_id == admin["id"] and req.role != "admin":
        raise HTTPException(status_code=400, detail="Administrators cannot demote themselves.")
        
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email FROM users WHERE id = ?", (user_id,))
        target_user = cursor.fetchone()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found.")
            
        cursor.execute("UPDATE users SET role = ? WHERE id = ?", (req.role, user_id))
        
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
            (admin["id"], "CHANGE_ROLE", f"Changed role of {target_user['email']} (ID: {user_id}) to {req.role}")
        )
        
        return {"message": f"User role successfully updated to {req.role}."}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, admin: dict = Depends(get_current_admin)):
    """Deletes a user account and cascades their resumes and roadmaps."""
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Administrators cannot delete their own active account.")
        
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT email FROM users WHERE id = ?", (user_id,))
        u = cursor.fetchone()
        if not u:
            raise HTTPException(status_code=404, detail="User not found.")
            
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
            (admin["id"], "DELETE_USER", f"Deleted user {u['email']} (ID: {user_id})")
        )
        
        return {"message": "User account deleted successfully."}

@router.get("/resumes")
def get_all_resumes(admin: dict = Depends(get_current_admin)):
    """Lists all uploaded resumes across all users for administrative review."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT r.id, r.original_filename, r.file_type, r.file_size, r.ats_score, 
                   r.target_role, r.created_at, u.full_name as user_name, u.email as user_email,
                   a.jd_match_score, a.matched_skills_json, a.missing_skills_json
            FROM resumes r
            JOIN users u ON u.id = r.user_id
            LEFT JOIN ats_analyses a ON a.resume_id = r.id
            ORDER BY r.id DESC
            """
        )
        rows = cursor.fetchall()
        for r in rows:
            r["ats_score"] = round(r["ats_score"] or 0.0, 1)
            r["jd_match_score"] = round(r["jd_match_score"] or 0.0, 1)
            r["matched_count"] = len(json.loads(r["matched_skills_json"] or "[]"))
            r["missing_count"] = len(json.loads(r["missing_skills_json"] or "[]"))
            r.pop("matched_skills_json", None)
            r.pop("missing_skills_json", None)
        return {"resumes": rows, "total": len(rows)}

@router.delete("/resumes/{resume_id}")
def delete_resume_admin(resume_id: int, admin: dict = Depends(get_current_admin)):
    """Admin-only endpoint to remove a resume submission."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT original_filename FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Resume not found.")
            
        cursor.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
            (admin["id"], "DELETE_RESUME", f"Removed resume '{row['original_filename']}' (ID: {resume_id})")
        )
        return {"message": "Resume submission deleted successfully."}

@router.get("/jobs")
def get_all_jobs_admin(admin: dict = Depends(get_current_admin)):
    """Lists all jobs and internships for admin CRUD management."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM jobs ORDER BY id DESC")
        rows = cursor.fetchall()
        for r in rows:
            r["required_skills"] = json.loads(r["required_skills_json"] or "[]")
            r["is_remote"] = bool(r["is_remote"])
        return {"jobs": rows, "total": len(rows)}

@router.put("/jobs/{job_id}")
def update_job_admin(job_id: int, req: AdminJobUpdateRequest, admin: dict = Depends(get_current_admin)):
    """Updates an existing job listing."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM jobs WHERE id = ?", (job_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Job listing not found.")
            
        cursor.execute(
            """
            UPDATE jobs
            SET title = ?, company = ?, location = ?, is_remote = ?, job_type = ?,
                experience_level = ?, description = ?, required_skills_json = ?,
                salary_range = ?, apply_url = ?
            WHERE id = ?
            """,
            (
                req.title.strip(), req.company.strip(), req.location.strip(),
                1 if req.is_remote else 0, req.job_type, req.experience_level,
                req.description.strip(), json.dumps(req.required_skills),
                req.salary_range.strip(), req.apply_url.strip(), job_id
            )
        )
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
            (admin["id"], "UPDATE_JOB", f"Updated job listing '{req.title}' (ID: {job_id})")
        )
        return {"message": "Job listing updated successfully."}

@router.delete("/jobs/{job_id}")
def delete_job_admin(job_id: int, admin: dict = Depends(get_current_admin)):
    """Deletes a job or internship listing."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT title, company FROM jobs WHERE id = ?", (job_id,))
        job = cursor.fetchone()
        if not job:
            raise HTTPException(status_code=404, detail="Job listing not found.")
            
        cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
            (admin["id"], "DELETE_JOB", f"Deleted job '{job['title']}' at {job['company']} (ID: {job_id})")
        )
        return {"message": "Job listing deleted successfully."}

@router.get("/roles-catalog")
def get_roles_catalog(admin: dict = Depends(get_current_admin)):
    """Returns the complete career roles & skill benchmark catalog."""
    return {"roles": list(CAREER_ROLES.values()), "total": len(CAREER_ROLES)}

@router.get("/export-csv")
def export_cohort_csv(admin: dict = Depends(get_current_admin)):
    """Exports a CSV report of all registered users, resume counts, and top ATS scores."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT u.id, u.full_name, u.email, u.role, u.target_role, u.created_at,
                   (SELECT count(*) FROM resumes WHERE user_id = u.id) as resumes_count,
                   (SELECT max(ats_score) FROM resumes WHERE user_id = u.id) as highest_score
            FROM users u
            ORDER BY u.id ASC
            """
        )
        rows = cursor.fetchall()
        
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["User ID", "Full Name", "Email", "Role", "Target Career Goal", "Resumes Analyzed", "Highest ATS Score", "Joined Date"])
    for r in rows:
        writer.writerow([
            r["id"],
            r["full_name"],
            r["email"],
            r["role"],
            r["target_role"] or "",
            r["resumes_count"],
            round(r["highest_score"] or 0.0, 1),
            r["created_at"]
        ])
        
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Cohort_ATS_Report.csv"}
    )

@router.get("/audit-logs")
def get_audit_logs(admin: dict = Depends(get_current_admin)):
    """Retrieves recent system security and action audit logs."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT a.id, a.action, a.details, a.ip_address, a.created_at, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON u.id = a.user_id
            ORDER BY a.id DESC LIMIT 100
            """
        )
        logs = cursor.fetchall()
        return {"logs": logs}
