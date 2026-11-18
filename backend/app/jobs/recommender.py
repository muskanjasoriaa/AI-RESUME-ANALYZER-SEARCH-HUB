import json
from typing import List, Dict, Any

def match_jobs_for_candidate(
    candidate_skills: List[str],
    candidate_target_role: str,
    jobs: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Ranks job listings based on candidate's skill profile and target career role.
    Computes exact matched skills, missing skills, and match percentage.
    """
    candidate_skills_set = set(s.lower() for s in candidate_skills)
    results = []
    
    for job in jobs:
        req_skills = job.get("required_skills", [])
        if isinstance(req_skills, str):
            try:
                req_skills = json.loads(req_skills)
            except Exception:
                req_skills = [s.strip() for s in req_skills.split(",")]
                
        matched = []
        missing = []
        
        for r_skill in req_skills:
            if r_skill.lower() in candidate_skills_set:
                matched.append(r_skill)
            else:
                missing.append(r_skill)
                
        total_req = max(1, len(req_skills))
        base_match = (len(matched) / total_req) * 100.0
        
        # Role relevance bonus (up to 10%)
        role_bonus = 0.0
        if candidate_target_role and candidate_target_role.lower() in job.get("title", "").lower():
            role_bonus = 10.0
            
        final_match = round(min(100.0, base_match + role_bonus), 1)
        
        results.append({
            "id": job.get("id"),
            "title": job.get("title"),
            "company": job.get("company"),
            "location": job.get("location"),
            "is_remote": bool(job.get("is_remote")),
            "job_type": job.get("job_type"),
            "experience_level": job.get("experience_level"),
            "description": job.get("description"),
            "salary_range": job.get("salary_range"),
            "apply_url": job.get("apply_url"),
            "match_percentage": final_match,
            "matched_skills": matched,
            "missing_skills": missing,
            "is_high_match": final_match >= 70.0
        })
        
    # Sort descending by match percentage
    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results
