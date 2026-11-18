import os
import json
import uuid
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Response
from pydantic import BaseModel
from app.config import UPLOAD_DIR
from app.database import get_db
from app.auth.security import get_current_user
from app.nlp.parser import parse_resume_file
from app.scoring.ats_scorer import calculate_general_ats_score
from app.scoring.job_matcher import compare_resume_with_job_description
from app.roadmap.roles_data import CAREER_ROLES
from app.resumes.report_generator import generate_pdf_report

router = APIRouter(prefix="/api/resume", tags=["Resume Analysis & ATS"])

class CompareJDRequest(BaseModel):
    resume_id: int
    job_description: str

@router.post("/upload")
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form("Full-Stack Developer"),
    current_user: dict = Depends(get_current_user)
):
    """
    Uploads PDF/DOCX resume, parses full structured entities using NLP,
    calculates explainable ATS score, runs skill gap analysis, and saves to database.
    """
    user_id = current_user["id"]
    filename = file.filename or "resume.pdf"
    
    # 1. Read file bytes
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
        
    # 2. Parse file using NLP pipeline
    try:
        parsed_data = parse_resume_file(filename, contents)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal parsing error: {str(e)}")
        
    # 3. Save physical file with unique name
    unique_name = f"{user_id}_{uuid.uuid4().hex[:8]}_{Path(filename).name}"
    save_path = UPLOAD_DIR / unique_name
    with open(save_path, "wb") as f:
        f.write(contents)
        
    # 4. Calculate Explainable ATS Score
    ats_result = calculate_general_ats_score(parsed_data)
    general_score = ats_result["overall_score"]
    
    # 5. Skill Gap Analysis against target role
    target = target_role if target_role in CAREER_ROLES else "Full-Stack Developer"
    role_meta = CAREER_ROLES.get(target, CAREER_ROLES["Full-Stack Developer"])
    
    cand_skills_lower = set(s.lower() for s in parsed_data["skills"]["all_skills"])
    all_role_skills = role_meta["core_skills"] + role_meta["preferred_skills"]
    
    matched_skills = [s for s in all_role_skills if s.lower() in cand_skills_lower]
    missing_skills = [s for s in all_role_skills if s.lower() not in cand_skills_lower]
    
    # Check weak skills (only mentioned once)
    raw_lower = parsed_data["raw_text"].lower()
    weak_skills = [s for s in matched_skills if raw_lower.count(s.lower()) == 1]

    # 6. Persist to Database
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Save resume row
        cursor.execute(
            """
            INSERT INTO resumes (
                user_id, filename, original_filename, file_path, file_size, file_type,
                extracted_text, parsed_data_json, ats_score, target_role
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id, unique_name, filename, str(save_path), len(contents),
                parsed_data["file_type"], parsed_data["raw_text"],
                json.dumps(parsed_data), general_score, target
            )
        )
        resume_id = cursor.lastrowid
        
        # Save analysis row
        cursor.execute(
            """
            INSERT INTO ats_analyses (
                resume_id, user_id, general_score, target_role,
                category_scores_json, matched_skills_json, missing_skills_json,
                weak_skills_json, strengths_json, weaknesses_json, recommendations_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                resume_id, user_id, general_score, target,
                json.dumps(ats_result["category_scores"]),
                json.dumps(matched_skills),
                json.dumps(missing_skills),
                json.dumps(weak_skills),
                json.dumps(ats_result["strengths"]),
                json.dumps(ats_result["weaknesses"]),
                json.dumps(ats_result["recommendations"])
            )
        )
        
        # Update user's latest target role
        cursor.execute("UPDATE users SET target_role = ? WHERE id = ?", (target, user_id))
        
        # Log action
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
            (user_id, "RESUME_UPLOAD", f"Uploaded and analyzed '{filename}' with ATS score {general_score}")
        )
        
    return {
        "message": "Resume successfully parsed and evaluated.",
        "resume_id": resume_id,
        "filename": filename,
        "target_role": target,
        "general_score": general_score,
        "rating_tier": ats_result["rating_tier"],
        "tier_color": ats_result["tier_color"],
        "category_scores": ats_result["category_scores"],
        "strengths": ats_result["strengths"],
        "weaknesses": ats_result["weaknesses"],
        "recommendations": ats_result["recommendations"],
        "skill_gap": {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "weak_skills": weak_skills,
            "match_ratio": round((len(matched_skills) / max(1, len(all_role_skills))) * 100, 1)
        },
        "parsed_entities": {
            "contact_info": parsed_data["contact_info"],
            "education": parsed_data["education"],
            "experience": parsed_data["experience"],
            "skills": parsed_data["skills"],
            "certifications": parsed_data["certifications"],
            "projects": parsed_data["projects"],
            "sections_detected": parsed_data["sections_detected"],
            "readability": parsed_data["readability"],
            "action_verbs": parsed_data["action_verbs"],
            "quantifiable_metrics": parsed_data["quantifiable_metrics"]
        }
    }

@router.post("/compare-jd")
def compare_with_job_description(
    req: CompareJDRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Evaluates resume against a specific target Job Description.
    Calculates TF-IDF Cosine Similarity, keyword density, and custom match score.
    """
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT extracted_text, parsed_data_json FROM resumes WHERE id = ? AND user_id = ?",
            (req.resume_id, user_id)
        )
        res = cursor.fetchone()
        if not res:
            raise HTTPException(status_code=404, detail="Resume record not found.")
            
        parsed = json.loads(res["parsed_data_json"])
        candidate_skills = parsed.get("skills", {}).get("all_skills", [])
        
        result = compare_resume_with_job_description(
            res["extracted_text"],
            candidate_skills,
            req.job_description
        )
        
        # Update analysis record if present
        cursor.execute(
            "UPDATE ats_analyses SET jd_match_score = ? WHERE resume_id = ?",
            (result["match_score"], req.resume_id)
        )
        
        return result

@router.get("/history")
def get_user_resume_history(current_user: dict = Depends(get_current_user)):
    """Retrieves list of user's past uploaded resumes and scores."""
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, filename, original_filename, file_size, file_type, ats_score, target_role, created_at
            FROM resumes
            WHERE user_id = ?
            ORDER BY id DESC
            """,
            (user_id,)
        )
        rows = cursor.fetchall()
        return {"resumes": rows, "count": len(rows)}

@router.get("/{resume_id}")
def get_resume_analysis(resume_id: int, current_user: dict = Depends(get_current_user)):
    """Retrieves full analysis for a specific resume."""
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT r.id, r.original_filename, r.file_size, r.file_type, r.target_role, r.created_at,
                   a.general_score, a.category_scores_json, a.matched_skills_json, a.missing_skills_json,
                   a.weak_skills_json, a.strengths_json, a.weaknesses_json, a.recommendations_json,
                   r.parsed_data_json
            FROM resumes r
            JOIN ats_analyses a ON a.resume_id = r.id
            WHERE r.id = ? AND r.user_id = ?
            """,
            (resume_id, user_id)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Resume analysis not found.")
            
        parsed = json.loads(row["parsed_data_json"])
        return {
            "resume_id": row["id"],
            "filename": row["original_filename"],
            "target_role": row["target_role"],
            "general_score": row["general_score"],
            "created_at": row["created_at"],
            "category_scores": json.loads(row["category_scores_json"]),
            "skill_gap": {
                "matched_skills": json.loads(row["matched_skills_json"]),
                "missing_skills": json.loads(row["missing_skills_json"]),
                "weak_skills": json.loads(row["weak_skills_json"])
            },
            "strengths": json.loads(row["strengths_json"]),
            "weaknesses": json.loads(row["weaknesses_json"]),
            "recommendations": json.loads(row["recommendations_json"]),
            "parsed_entities": parsed
        }

@router.get("/{resume_id}/export-report")
def export_pdf_report(resume_id: int, current_user: dict = Depends(get_current_user)):
    """Generates and downloads an official PDF diagnostic report."""
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT r.id, r.original_filename, r.target_role, a.general_score,
                   a.category_scores_json, a.matched_skills_json, a.missing_skills_json,
                   a.strengths_json, a.weaknesses_json, a.recommendations_json, r.parsed_data_json
            FROM resumes r
            JOIN ats_analyses a ON a.resume_id = r.id
            WHERE r.id = ? AND r.user_id = ?
            """,
            (resume_id, user_id)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Resume record not found.")
            
        parsed = json.loads(row["parsed_data_json"])
        payload = {
            "filename": row["original_filename"],
            "target_role": row["target_role"],
            "general_score": row["general_score"],
            "rating_tier": "Optimal Match" if row["general_score"] >= 80 else "Needs Optimization",
            "contact_info": parsed.get("contact_info", {}),
            "category_scores": json.loads(row["category_scores_json"]),
            "strengths": json.loads(row["strengths_json"]),
            "weaknesses": json.loads(row["weaknesses_json"]),
            "recommendations": json.loads(row["recommendations_json"]),
            "matched_skills": json.loads(row["matched_skills_json"]),
            "missing_skills": json.loads(row["missing_skills_json"])
        }
        
        pdf_stream = generate_pdf_report(payload)
        return Response(
            content=pdf_stream.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=ATS_Report_{resume_id}.pdf"}
        )
