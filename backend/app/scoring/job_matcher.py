from typing import Dict, Any, List, Set
from app.nlp.text_processing import calculate_cosine_similarity, tokenize, STOP_WORDS
from app.nlp.skill_extractor import extract_skills_from_text

def compare_resume_with_job_description(
    resume_text: str,
    resume_skills: List[str],
    job_description: str
) -> Dict[str, Any]:
    """
    Compares resume content against a specific job description.
    Distinguishes from general ATS score by focusing on role-specific keyword overlap,
    TF-IDF cosine similarity, matched skills, and critical missing requirements.
    """
    if not job_description or not job_description.strip():
        return {
            "match_score": 0.0,
            "cosine_similarity": 0.0,
            "matched_skills": [],
            "missing_skills": [],
            "weak_skills": [],
            "tailoring_tips": ["Provide a target job description to run job-specific ATS matching."]
        }
        
    # 1. Extract skills from the target job description
    jd_skills_data = extract_skills_from_text(job_description)
    jd_skills = jd_skills_data.get("all_skills", [])
    
    # Lowercase set of resume skills for fast matching
    resume_skills_set = set(s.lower() for s in resume_skills)
    resume_text_lower = resume_text.lower()
    
    matched_skills = []
    missing_skills = []
    weak_skills = []
    
    for skill in jd_skills:
        skill_lower = skill.lower()
        if skill_lower in resume_skills_set:
            matched_skills.append(skill)
            # Check if skill only appears once (potential weak proof)
            count = resume_text_lower.count(skill_lower)
            if count == 1:
                weak_skills.append(skill)
        else:
            missing_skills.append(skill)
            
    # 2. Semantic TF-IDF Cosine Similarity between resume and JD
    cosine_sim = calculate_cosine_similarity(resume_text, job_description)
    
    # 3. Calculate skill coverage ratio
    if jd_skills:
        skill_overlap_ratio = len(matched_skills) / len(jd_skills)
    else:
        skill_overlap_ratio = 0.5  # Neutral if JD has no strict keywords
        
    # 4. Keyword density analysis
    jd_tokens = [t for t in tokenize(job_description) if t not in STOP_WORDS and len(t) > 3]
    top_jd_keywords = set(jd_tokens[:40])
    res_tokens = set(tokenize(resume_text))
    matched_keywords = top_jd_keywords.intersection(res_tokens)
    keyword_coverage = len(matched_keywords) / max(1, len(top_jd_keywords))
    
    # 5. Composite Job-Specific ATS Match Score (0 - 100)
    # Weights: Skill Overlap (60%), Semantic Cosine Similarity (25%), Keyword Coverage (15%)
    weighted_score = (skill_overlap_ratio * 60.0) + (cosine_sim * 25.0) + (keyword_coverage * 15.0)
    if skill_overlap_ratio >= 0.8:
        weighted_score += 10.0  # High skill match boost
        
    final_match_score = round(min(100.0, max(5.0, weighted_score)), 1)
    
    # 6. Tailoring Recommendations
    tips = []
    if missing_skills:
        top_missing = missing_skills[:5]
        tips.append(f"Add critical missing skills required by the job posting: {', '.join(top_missing)}.")
        
    if weak_skills:
        tips.append(f"Strengthen weak skills: {', '.join(weak_skills[:3])} is only mentioned once. Provide a project bullet point proving practical application.")
        
    if cosine_sim < 0.4:
        tips.append("Align your resume phrasing and terminology with the job description to improve semantic relevance.")
    else:
        tips.append("Good semantic alignment with the role's language and responsibilities.")
        
    if final_match_score >= 80:
        match_tier = "High Match (Ready to Apply)"
        match_color = "#10B981"
    elif final_match_score >= 60:
        match_tier = "Moderate Match (Tailor 3-4 Points)"
        match_color = "#3B82F6"
    elif final_match_score >= 40:
        match_tier = "Fair Match (Significant Gaps)"
        match_color = "#F59E0B"
    else:
        match_tier = "Low Match (Prerequisites Needed)"
        match_color = "#EF4444"

    return {
        "match_score": final_match_score,
        "match_tier": match_tier,
        "match_color": match_color,
        "cosine_similarity": round(cosine_sim * 100, 1),
        "skill_overlap_percent": round(skill_overlap_ratio * 100, 1),
        "total_jd_skills_found": len(jd_skills),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "weak_skills": weak_skills,
        "tailoring_tips": tips
    }
