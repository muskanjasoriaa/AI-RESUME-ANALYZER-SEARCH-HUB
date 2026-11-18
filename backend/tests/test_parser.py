import os
from pathlib import Path
from app.nlp.parser import parse_resume_file
from app.nlp.text_processing import calculate_cosine_similarity, tokenize
from app.nlp.skill_extractor import extract_skills_from_text

SAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "sample_resumes"

def test_parse_software_engineer_pdf():
    pdf_path = SAMPLES_DIR / "Software_Engineer_Resume.pdf"
    assert pdf_path.exists(), "Sample PDF must exist"
    
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()
        
    result = parse_resume_file("Software_Engineer_Resume.pdf", file_bytes)
    assert result["file_type"] == "pdf"
    assert len(result["raw_text"]) > 200
    assert result["contact_info"]["email"] == "alex.chen@example.com"
    assert "github.com" in result["contact_info"]["github"]
    
    skills = result["skills"]["all_skills"]
    assert "Python" in skills
    assert "Docker" in skills
    assert "React" in skills
    assert "Kubernetes" in skills
    
    assert len(result["action_verbs"]) >= 3
    assert len(result["quantifiable_metrics"]) >= 1

def test_parse_data_scientist_docx():
    docx_path = SAMPLES_DIR / "Data_Scientist_Resume.docx"
    assert docx_path.exists(), "Sample DOCX must exist"
    
    with open(docx_path, "rb") as f:
        file_bytes = f.read()
        
    result = parse_resume_file("Data_Scientist_Resume.docx", file_bytes)
    assert result["file_type"] == "docx"
    assert "priya" in result["contact_info"]["name"].lower()
    
    skills = result["skills"]["all_skills"]
    assert "Python" in skills
    assert "Machine Learning" in skills
    assert "Scikit-Learn" in skills
    assert "PyTorch" in skills

def test_nlp_cosine_similarity():
    text1 = "Senior Full-Stack Developer with expertise in React, Node.js, PostgreSQL, Docker and AWS."
    text2 = "Looking for a Full-Stack Engineer with React, Node.js, and cloud AWS experience."
    text3 = "Pastry chef specializing in artisan French sourdough bread and croissants."
    
    sim_high = calculate_cosine_similarity(text1, text2)
    sim_low = calculate_cosine_similarity(text1, text3)
    
    assert sim_high > 0.3
    assert sim_low < 0.1
    assert sim_high > sim_low
