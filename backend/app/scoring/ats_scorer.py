from typing import Dict, Any, List

def calculate_general_ats_score(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes an explainable, deterministic ATS compatibility and resume quality score (0-100).
    Returns total score, category-by-category breakdown, strengths, weaknesses, and recommendations.
    """
    contact = parsed_data.get("contact_info", {})
    sections = parsed_data.get("sections_detected", {})
    skills_data = parsed_data.get("skills", {})
    tech_skills = skills_data.get("technical_skills", [])
    soft_skills = skills_data.get("soft_skills", [])
    categorized = skills_data.get("categorized", {})
    education = parsed_data.get("education", [])
    experience = parsed_data.get("experience", [])
    certifications = parsed_data.get("certifications", [])
    projects = parsed_data.get("projects", [])
    readability = parsed_data.get("readability", {})
    action_verbs = parsed_data.get("action_verbs", [])
    metrics = parsed_data.get("quantifiable_metrics", [])
    
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommendations: List[Dict[str, Any]] = []
    
    # -------------------------------------------------------------
    # 1. Section Completeness (Max 20 pts)
    # -------------------------------------------------------------
    score_sections = 0.0
    
    # Contact completeness (8 pts)
    has_email = bool(contact.get("email"))
    has_phone = bool(contact.get("phone"))
    has_name = bool(contact.get("name") and contact["name"] != "Job Seeker")
    has_github = bool(contact.get("github"))
    has_linkedin = bool(contact.get("linkedin"))
    has_portfolio = bool(contact.get("portfolio"))
    
    contact_pts = 0.0
    if has_email: contact_pts += 2.0
    if has_phone: contact_pts += 1.5
    if has_name: contact_pts += 1.5
    if has_linkedin or has_github or has_portfolio: contact_pts += 3.0
    score_sections += contact_pts
    
    # Core sections presence (12 pts: 2.4 pts each)
    core_keys = ["education", "experience", "projects", "skills", "summary"]
    for k in core_keys:
        if sections.get(k):
            score_sections += 2.4
            
    score_sections = round(min(20.0, score_sections), 1)
    
    if contact_pts >= 7.0 and all(sections.get(k) for k in ["education", "skills", "projects"]):
        strengths.append("High section completeness: Core headers and contact channels are cleanly structured.")
    else:
        if not (has_linkedin or has_github or has_portfolio):
            weaknesses.append("Missing professional online links (LinkedIn, GitHub, or Portfolio) in header.")
            recommendations.append({
                "category": "Contact Information",
                "issue": "No GitHub or LinkedIn profile link detected",
                "action": "Include active links to your GitHub profile and LinkedIn page in your contact header.",
                "potential_gain": "+3 to +5 ATS pts"
            })
        if not sections.get("summary"):
            weaknesses.append("No professional summary or career objective statement detected.")
            recommendations.append({
                "category": "Structure",
                "issue": "Missing Summary section",
                "action": "Add a crisp 2-3 line Professional Summary highlighting your top skills and career focus.",
                "potential_gain": "+2.5 ATS pts"
            })

    # -------------------------------------------------------------
    # 2. Technical & Domain Skills Breadth (Max 25 pts)
    # -------------------------------------------------------------
    score_skills = 0.0
    
    # Skill volume (Max 15 pts) - 10 skills = 15 pts
    tech_count = len(tech_skills)
    skill_vol_pts = min(15.0, (tech_count / 10.0) * 15.0)
    score_skills += skill_vol_pts
    
    # Skill diversity across categories (Max 10 pts)
    # Programming Languages, Web Frameworks, AI/Data, Databases, Cloud/DevOps, Tools
    active_categories = sum(1 for cat, sk in categorized.items() if cat != "soft_skills" and len(sk) > 0)
    diversity_pts = min(10.0, active_categories * 2.0)
    score_skills += diversity_pts
    score_skills = round(min(25.0, score_skills), 1)
    
    if tech_count >= 10 and active_categories >= 4:
        strengths.append(f"Strong technical breadth: Identified {tech_count} skills across {active_categories} technical domains.")
    elif tech_count < 6:
        weaknesses.append(f"Low technical skill count: Only {tech_count} industry skills identified.")
        recommendations.append({
            "category": "Technical Skills",
            "issue": "Limited technical keywords",
            "action": "Expand your Skills section with explicit languages, frameworks, databases, and DevOps tools.",
            "potential_gain": "+6 to +10 ATS pts"
        })

    # -------------------------------------------------------------
    # 3. Action Verbs & Quantifiable Impact (Max 20 pts)
    # -------------------------------------------------------------
    score_impact = 0.0
    
    # Action verbs (Max 10 pts) - 6+ verbs = 10 pts
    verbs_count = len(action_verbs)
    verbs_pts = min(10.0, (verbs_count / 6.0) * 10.0)
    score_impact += verbs_pts
    
    # Quantifiable metrics (Max 10 pts) - 3+ metrics = 10 pts
    metrics_count = len(metrics)
    metrics_pts = min(10.0, (metrics_count / 3.0) * 10.0)
    score_impact += metrics_pts
    score_impact = round(min(20.0, score_impact), 1)
    
    if verbs_count >= 6:
        strengths.append(f"Dynamic language: Contains {verbs_count} high-impact action verbs (e.g. {', '.join(action_verbs[:3])}).")
    else:
        weaknesses.append("Passive wording: Needs more strong engineering action verbs.")
        recommendations.append({
            "category": "Impact & Phrasing",
            "issue": "Low action verb density",
            "action": "Begin bullet points with verbs like 'Architected', 'Spearheaded', 'Optimized', or 'Automated'.",
            "potential_gain": "+4 to +6 ATS pts"
        })
        
    if metrics_count >= 3:
        strengths.append(f"Quantifiable achievements: Detected {metrics_count} quantifiable metrics demonstrating measurable value.")
    else:
        weaknesses.append("Lack of measurable impact metrics (percentages, speedups, user numbers, dollar amounts).")
        recommendations.append({
            "category": "Quantifiable Impact",
            "issue": "Few quantifiable results",
            "action": "Quantify your achievements (e.g. 'Reduced page load time by 40%', 'Handled 5,000+ daily requests').",
            "potential_gain": "+5 to +8 ATS pts"
        })

    # -------------------------------------------------------------
    # 4. Formatting, Structure & Parsability (Max 15 pts)
    # -------------------------------------------------------------
    score_formatting = 0.0
    words = readability.get("word_count", 0)
    
    # Word count score (Max 8 pts) - Optimal 350 to 900 words
    if 350 <= words <= 900:
        score_formatting += 8.0
    elif 250 <= words < 350 or 900 < words <= 1200:
        score_formatting += 5.5
    elif words < 250:
        score_formatting += 3.0
    else:
        score_formatting += 4.0
        
    # Sentence length / conciseness (Max 4 pts) - Optimal 10-24 words
    avg_len = readability.get("avg_words_per_sentence", 15)
    if 8 <= avg_len <= 25:
        score_formatting += 4.0
    else:
        score_formatting += 2.5
        
    # Page length estimation (Max 3 pts) - 1 or 2 pages
    est_pages = readability.get("estimated_pages", 1)
    if est_pages in [1, 2]:
        score_formatting += 3.0
    else:
        score_formatting += 1.5
        
    score_formatting = round(min(15.0, score_formatting), 1)
    
    if 350 <= words <= 900:
        strengths.append(f"Ideal document length: {words} words (approx {est_pages} page) provides balanced detail.")
    elif words < 300:
        weaknesses.append("Resume is too brief and may lack sufficient detail for ATS keyword matching.")
        recommendations.append({
            "category": "Document Length",
            "issue": "Content too sparse",
            "action": "Add more technical details to your projects and responsibilities to reach at least 400 words.",
            "potential_gain": "+3 to +5 ATS pts"
        })

    # -------------------------------------------------------------
    # 5. Education & Credentials (Max 10 pts)
    # -------------------------------------------------------------
    score_education = 0.0
    if education:
        score_education += 6.0
        if any(edu.get("grade") and edu["grade"] != "Good Academic Standing" for edu in education):
            score_education += 2.0
        else:
            score_education += 1.5
            
    if certifications:
        score_education += min(2.0, len(certifications) * 1.0)
        strengths.append(f"Verified certifications: Detected {len(certifications)} credentials ({', '.join(certifications[:2])}).")
    else:
        recommendations.append({
            "category": "Credentials",
            "issue": "No recognized industry certifications found",
            "action": "Consider earning cloud or domain credentials (e.g., AWS Cloud Practitioner, Azure Fundamentals).",
            "potential_gain": "+2 ATS pts"
        })
        
    score_education = round(min(10.0, score_education), 1)

    # -------------------------------------------------------------
    # 6. Soft Skills & Professional Attributes (Max 10 pts)
    # -------------------------------------------------------------
    soft_count = len(soft_skills)
    score_soft = round(min(10.0, soft_count * 2.5), 1)
    
    if soft_count >= 3:
        strengths.append(f"Balanced soft skills: Highlighted {soft_count} collaborative competencies ({', '.join(soft_skills[:3])}).")
    else:
        weaknesses.append("Limited soft skill representation (e.g. leadership, problem solving, collaboration).")
        recommendations.append({
            "category": "Soft Skills",
            "issue": "Missing behavioral keywords",
            "action": "Demonstrate collaboration, agile workflows, and problem-solving within your experience bullets.",
            "potential_gain": "+3 to +5 ATS pts"
        })

    # -------------------------------------------------------------
    # Total Score Calculation (Sum of all 6 components)
    # -------------------------------------------------------------
    total_score = round(score_sections + score_skills + score_impact + score_formatting + score_education + score_soft, 1)
    total_score = max(5.0, min(100.0, total_score))
    
    # Rating Tier
    if total_score >= 85:
        tier = "Excellent (ATS Ready)"
        tier_color = "#10B981" # Green
    elif total_score >= 70:
        tier = "Good (Competitive)"
        tier_color = "#3B82F6" # Blue
    elif total_score >= 50:
        tier = "Average (Needs Polish)"
        tier_color = "#F59E0B" # Amber
    else:
        tier = "Needs Significant Improvement"
        tier_color = "#EF4444" # Red
        
    return {
        "overall_score": total_score,
        "rating_tier": tier,
        "tier_color": tier_color,
        "category_scores": {
            "section_completeness": {"score": score_sections, "max": 20, "label": "Section Completeness"},
            "skills_breadth": {"score": score_skills, "max": 25, "label": "Technical & Domain Skills"},
            "impact_metrics": {"score": score_impact, "max": 20, "label": "Action Verbs & Impact"},
            "formatting_structure": {"score": score_formatting, "max": 15, "label": "Formatting & Readability"},
            "education_credentials": {"score": score_education, "max": 10, "label": "Education & Certifications"},
            "soft_skills": {"score": score_soft, "max": 10, "label": "Soft Skills & Attributes"}
        },
        "strengths": strengths[:6],
        "weaknesses": weaknesses[:6],
        "recommendations": recommendations[:6]
    }
