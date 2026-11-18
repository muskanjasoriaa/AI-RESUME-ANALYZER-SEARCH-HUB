import os
import io
from pathlib import Path
from typing import Dict, Any, Tuple
import pypdf
import docx
from fastapi import UploadFile, HTTPException

from app.config import MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS
from app.nlp.text_processing import (
    clean_text,
    compute_readability_metrics,
    extract_action_verbs,
    extract_quantifiable_metrics
)
from app.nlp.skill_extractor import extract_skills_from_text
from app.nlp.entity_extractor import (
    extract_contact_info,
    detect_sections,
    extract_education,
    extract_experience,
    extract_certifications,
    extract_projects
)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from PDF bytes using pypdf."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        if len(reader.pages) == 0:
            raise ValueError("The uploaded PDF file contains zero pages.")
        
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(page_text.strip())
                
        full_text = "\n\n".join(extracted_pages)
        if not full_text.strip():
            raise ValueError("No readable text found. The PDF might be scanned or image-only without an OCR layer.")
        return full_text
    except Exception as e:
        raise ValueError(f"Failed to parse PDF document: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts text from DOCX bytes using python-docx."""
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        
        # Also extract table text (often used in resumes for layout)
        table_texts = []
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    table_texts.append(" | ".join(row_cells))
                    
        full_text = "\n".join(paragraphs + table_texts)
        if not full_text.strip():
            raise ValueError("No readable text could be found inside the DOCX document.")
        return full_text
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX document: {str(e)}")

def parse_resume_file(filename: str, file_bytes: bytes) -> Dict[str, Any]:
    """
    Validates, extracts text, and runs NLP feature extraction on a resume file.
    Returns structured analysis payload.
    """
    # 1. Validation
    if not file_bytes or len(file_bytes) == 0:
        raise ValueError("Uploaded file is empty (0 bytes).")
        
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds maximum limit of {MAX_FILE_SIZE_BYTES // (1024*1024)} MB.")
        
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file format '{ext}'. Only PDF (.pdf) and Word (.docx) resumes are accepted.")

    # 2. Text Extraction
    if ext == ".pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    elif ext == ".docx":
        raw_text = extract_text_from_docx(file_bytes)
    else:
        raise ValueError("Invalid file extension.")

    # 3. NLP Feature Extraction
    contact_info = extract_contact_info(raw_text)
    sections = detect_sections(raw_text)
    skills = extract_skills_from_text(raw_text)
    education = extract_education(raw_text)
    experience = extract_experience(raw_text)
    certifications = extract_certifications(raw_text)
    projects = extract_projects(raw_text)
    readability = compute_readability_metrics(raw_text)
    action_verbs = extract_action_verbs(raw_text)
    metrics = extract_quantifiable_metrics(raw_text)

    return {
        "filename": filename,
        "file_type": ext.lstrip("."),
        "file_size": len(file_bytes),
        "raw_text": raw_text,
        "contact_info": contact_info,
        "sections_detected": sections,
        "skills": skills,
        "education": education,
        "experience": experience,
        "certifications": certifications,
        "projects": projects,
        "readability": readability,
        "action_verbs": action_verbs,
        "quantifiable_metrics": metrics
    }
