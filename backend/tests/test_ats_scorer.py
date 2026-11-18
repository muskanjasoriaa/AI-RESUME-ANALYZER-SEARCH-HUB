from pathlib import Path
from app.nlp.parser import parse_resume_file
from app.scoring.ats_scorer import calculate_general_ats_score
from app.scoring.job_matcher import compare_resume_with_job_description

SAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "sample_resumes"

def test_ats_scoring_comprehensive():
    pdf_path = SAMPLES_DIR / "Software_Engineer_Resume.pdf"
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()
    parsed = parse_resume_file("Software_Engineer_Resume.pdf", file_bytes)
    
    score_res = calculate_general_ats_score(parsed)
    score = score_res["overall_score"]
    
    # Assert score is valid range
    assert 0 <= score <= 100
    assert score >= 75, "High-quality resume should score at least 75"
    assert "category_scores" in score_res
    assert len(score_res["strengths"]) > 0
    assert len(score_res["category_scores"]) == 6
    
    # Entry-level resume should score lower than senior resume
    entry_path = SAMPLES_DIR / "Entry_Level_Student_Resume.pdf"
    with open(entry_path, "rb") as f:
        entry_bytes = f.read()
    parsed_entry = parse_resume_file("Entry_Level_Student_Resume.pdf", entry_bytes)
    score_entry = calculate_general_ats_score(parsed_entry)["overall_score"]
    
    assert score > score_entry, "Senior resume should score higher than entry-level resume"
    assert score_entry < 75

def test_job_description_comparison():
    pdf_path = SAMPLES_DIR / "Software_Engineer_Resume.pdf"
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()
    parsed = parse_resume_file("Software_Engineer_Resume.pdf", file_bytes)
    
    jd = """
    We are seeking a Full-Stack Engineer proficient in React, TypeScript, Python, and Docker.
    Knowledge of Kubernetes and PostgreSQL is a big plus. Experience with AWS is required.
    """
    
    match_result = compare_resume_with_job_description(
        parsed["raw_text"],
        parsed["skills"]["all_skills"],
        jd
    )
    
    assert match_result["match_score"] >= 70
    assert "React" in match_result["matched_skills"]
    assert "Docker" in match_result["matched_skills"]
    assert len(match_result["tailoring_tips"]) > 0
