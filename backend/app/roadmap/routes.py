import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.database import get_db
from app.auth.security import get_current_user
from app.roadmap.roles_data import CAREER_ROLES
from app.roadmap.generator import generate_personalized_roadmap

router = APIRouter(prefix="/api/roadmap", tags=["Career Roadmap"])

class GenerateRoadmapRequest(BaseModel):
    target_role: str
    experience_level: Optional[str] = "Intermediate"

class MilestoneStatusUpdate(BaseModel):
    status: str  # 'todo', 'in_progress', 'completed'

@router.get("/roles")
def get_all_roles():
    """Returns catalog of all predefined tech career roles."""
    return {"roles": list(CAREER_ROLES.values())}

@router.get("/current")
def get_current_roadmap(current_user: dict = Depends(get_current_user)):
    """Retrieves user's active roadmap and real-time milestone progress."""
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Fetch saved roadmap
        cursor.execute(
            """
            SELECT id, target_role, current_level, roadmap_data_json, created_at, updated_at
            FROM career_roadmaps
            WHERE user_id = ?
            ORDER BY id DESC LIMIT 1
            """,
            (user_id,)
        )
        row = cursor.fetchone()
        
        # 2. Fetch milestone status overrides
        cursor.execute(
            "SELECT milestone_key, status FROM milestone_progress WHERE user_id = ?",
            (user_id,)
        )
        status_map = {r["milestone_key"]: r["status"] for r in cursor.fetchall()}
        
        if not row:
            # Auto-generate a default roadmap based on user's target_role or Full-Stack Developer
            target = current_user.get("target_role") or "Full-Stack Developer"
            
            # Check if user has uploaded any resume skills
            cursor.execute(
                "SELECT parsed_data_json FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1",
                (user_id,)
            )
            res_row = cursor.fetchone()
            user_skills = []
            if res_row:
                parsed = json.loads(res_row["parsed_data_json"])
                user_skills = parsed.get("skills", {}).get("all_skills", [])
                
            roadmap_obj = generate_personalized_roadmap(target, user_skills, "Intermediate")
            roadmap_json = json.dumps(roadmap_obj)
            
            cursor.execute(
                """
                INSERT INTO career_roadmaps (user_id, target_role, current_level, roadmap_data_json)
                VALUES (?, ?, 'Intermediate', ?)
                """,
                (user_id, target, roadmap_json)
            )
            roadmap_id = cursor.lastrowid
            row = {
                "id": roadmap_id,
                "target_role": target,
                "current_level": "Intermediate",
                "roadmap_data_json": roadmap_json,
                "created_at": "Just now",
                "updated_at": "Just now"
            }
            
        data = json.loads(row["roadmap_data_json"])
        
        # Merge saved milestone progress
        completed_count = 0
        total_count = 0
        for phase in data.get("phases", []):
            for m in phase.get("milestones", []):
                total_count += 1
                k = m.get("key")
                if k in status_map:
                    m["status"] = status_map[k]
                if m.get("status") == "completed":
                    completed_count += 1
                    
        progress_pct = round((completed_count / max(1, total_count)) * 100, 1)
        data["progress_percentage"] = progress_pct
        data["completed_milestones"] = completed_count
        data["total_milestones"] = total_count
        data["roadmap_id"] = row["id"]
        
        return {"roadmap": data}

@router.post("/generate")
def create_roadmap(req: GenerateRoadmapRequest, current_user: dict = Depends(get_current_user)):
    """Generates a new personalized roadmap for the specified target role."""
    user_id = current_user["id"]
    target = req.target_role
    if target not in CAREER_ROLES:
        raise HTTPException(status_code=400, detail=f"Target role '{target}' is not in the system catalog.")
        
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Update user's target role preference
        cursor.execute("UPDATE users SET target_role = ? WHERE id = ?", (target, user_id))
        
        # Get latest resume skills
        cursor.execute(
            "SELECT parsed_data_json FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            (user_id,)
        )
        res_row = cursor.fetchone()
        user_skills = []
        if res_row:
            parsed = json.loads(res_row["parsed_data_json"])
            user_skills = parsed.get("skills", {}).get("all_skills", [])
            
        roadmap_obj = generate_personalized_roadmap(target, user_skills, req.experience_level or "Intermediate")
        roadmap_json = json.dumps(roadmap_obj)
        
        # Check if existing roadmap exists
        cursor.execute("SELECT id FROM career_roadmaps WHERE user_id = ? AND target_role = ?", (user_id, target))
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                "UPDATE career_roadmaps SET roadmap_data_json = ?, current_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (roadmap_json, req.experience_level or "Intermediate", existing["id"])
            )
            roadmap_id = existing["id"]
        else:
            cursor.execute(
                "INSERT INTO career_roadmaps (user_id, target_role, current_level, roadmap_data_json) VALUES (?, ?, ?, ?)",
                (user_id, target, req.experience_level or "Intermediate", roadmap_json)
            )
            roadmap_id = cursor.lastrowid
            
        # Log action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
            (user_id, "GENERATE_ROADMAP", f"Generated roadmap for role: {target}")
        )
        
        roadmap_obj["roadmap_id"] = roadmap_id
        roadmap_obj["progress_percentage"] = 0.0
        roadmap_obj["completed_milestones"] = 0
        return {"message": "Roadmap generated successfully.", "roadmap": roadmap_obj}

@router.post("/milestones/{milestone_key}/status")
def update_milestone_status(
    milestone_key: str,
    req: MilestoneStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Updates status for a specific roadmap milestone ('todo', 'in_progress', 'completed')."""
    user_id = current_user["id"]
    valid_statuses = {"todo", "in_progress", "completed"}
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Status must be 'todo', 'in_progress', or 'completed'.")
        
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Fetch user's active roadmap
        cursor.execute("SELECT id FROM career_roadmaps WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
        rm = cursor.fetchone()
        roadmap_id = rm["id"] if rm else 1
        
        cursor.execute(
            """
            INSERT INTO milestone_progress (user_id, roadmap_id, milestone_key, status, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, milestone_key) DO UPDATE SET
                status = excluded.status,
                updated_at = CURRENT_TIMESTAMP
            """,
            (user_id, roadmap_id, milestone_key, req.status)
        )
        
        return {"message": "Milestone status updated.", "milestone_key": milestone_key, "status": req.status}
