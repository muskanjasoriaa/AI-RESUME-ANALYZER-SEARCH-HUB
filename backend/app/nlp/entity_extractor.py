import re
from typing import Dict, List, Any, Optional
from app.nlp.text_processing import extract_action_verbs, extract_quantifiable_metrics

# Standard section header regex patterns
SECTION_PATTERNS = {
    "summary": r'\b(?:summary|professional summary|executive summary|about me|profile|objective|career objective)\b',
    "education": r'\b(?:education|academic background|academic qualifications|academics|qualifications)\b',
    "experience": r'\b(?:experience|work experience|professional experience|employment history|work history|internships|internship experience)\b',
    "projects": r'\b(?:projects|personal projects|academic projects|key projects|technical projects|portfolio projects)\b',
    "skills": r'\b(?:skills|technical skills|technologies|skills & competencies|core competencies|tools & technologies)\b',
    "certifications": r'\b(?:certifications|certificates|licenses|courses & certifications|honors|awards & achievements|achievements)\b'
}

COMMON_DEGREES = [
    r'\b(?:b\.?tech|bachelor of technology)\b',
    r'\b(?:b\.?e\.?|bachelor of engineering)\b',
    r'\b(?:b\.?s\.?|bachelor of science|bsc)\b',
    r'\b(?:m\.?tech|master of technology)\b',
    r'\b(?:m\.?s\.?|master of science|msc)\b',
    r'\b(?:mca|bca|master of computer applications|bachelor of computer applications)\b',
    r'\b(?:ph\.?d\.?|doctor of philosophy)\b',
    r'\b(?:mba|master of business administration)\b',
    r'\b(?:associate degree|diploma)\b'
]

COMMON_MAJORS = [
    "Computer Science", "Information Technology", "Software Engineering", 
    "Data Science", "Artificial Intelligence", "Electrical Engineering", 
    "Electronics and Communication", "Computer Applications", "Mechanical Engineering"
]

POPULAR_CERTS = [
    "AWS Certified", "AWS Certified Solutions Architect", "AWS Certified Developer",
    "Azure Fundamentals", "Azure Solutions Architect", "Google Cloud Associate",
    "Google Cloud Professional Data Engineer", "TensorFlow Developer",
    "Certified Kubernetes Administrator (CKA)", "PMP", "Scrum Master (CSM)",
    "CompTIA Security+", "Cisco CCNA", "Meta Front-End Developer", "DeepLearning.AI"
]

def extract_contact_info(text: str) -> Dict[str, Any]:
    """Extracts email, phone, links, location, and candidate name."""
    # 1. Email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    email = email_match.group(0) if email_match else ""
    
    # 2. Phone
    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', text)
    phone = phone_match.group(0) if phone_match else ""
    
    # 3. LinkedIn
    linkedin_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/([A-Za-z0-9_-]+)', text, re.IGNORECASE)
    linkedin = f"https://linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else ""
    
    # 4. GitHub
    github_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)', text, re.IGNORECASE)
    github = f"https://github.com/{github_match.group(1)}" if github_match else ""
    
    # 5. Portfolio / Website
    portfolio_match = re.search(r'(?:https?:\/\/)?([a-zA-Z0-9-]+\.(?:vercel\.app|netlify\.app|github\.io|me|dev|io|com))\b', text, re.IGNORECASE)
    portfolio = ""
    if portfolio_match:
        url_cand = portfolio_match.group(0)
        if not ("linkedin.com" in url_cand or "github.com" in url_cand or "@" in url_cand):
            portfolio = url_cand if url_cand.startswith("http") else f"https://{url_cand}"

    # 6. Candidate Name
    # Heuristic: the first 1-3 non-empty lines usually hold the candidate name
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    candidate_name = ""
    for line in lines[:5]:
        # Exclude headers, emails, phones, or URLs
        if (len(line) < 40 and not any(char in line for char in ['@', 'http', 'www', '/', '\\', ':'])
            and not re.search(r'\b(resume|curriculum|vitae|page|contact|email|phone)\b', line, re.IGNORECASE)):
            candidate_name = line
            break
            
    if not candidate_name and email:
        # Fallback from email prefix (e.g., john.doe@... -> John Doe)
        prefix = email.split('@')[0]
        cleaned = re.sub(r'[\._0-9]+', ' ', prefix).strip().title()
        if len(cleaned) > 2:
            candidate_name = cleaned

    return {
        "name": candidate_name or "Job Seeker",
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio
    }

def detect_sections(text: str) -> Dict[str, bool]:
    """Identifies which essential resume sections are present."""
    text_lower = text.lower()
    sections_found = {}
    for section_name, pattern in SECTION_PATTERNS.items():
        match = re.search(pattern, text_lower, re.IGNORECASE)
        sections_found[section_name] = bool(match)
    return sections_found

def extract_education(text: str) -> List[Dict[str, Any]]:
    """Extracts degrees, institutions, graduation years, and GPAs."""
    results = []
    text_lines = text.split('\n')
    
    # Find graduation years (e.g. 2018 - 2022, 2024, May 2025)
    year_pattern = r'\b(201\d|202\d|2030)\b'
    # GPA pattern (e.g. 3.8/4.0, 8.5/10, 85%)
    gpa_pattern = r'\b(?:cgpa|gpa|percentage)?\s*:?\s*(\d(?:\.\d{1,2})?\s*\/\s*(?:4(?:\.0)?|10(?:\.0)?)|[789]\d(?:\.\d+)?%)\b'

    detected_degrees = []
    for deg_pat in COMMON_DEGREES:
        matches = re.finditer(deg_pat, text, re.IGNORECASE)
        for m in matches:
            detected_degrees.append(m.group(0).upper().replace('.', ''))

    # Deduplicate degrees
    detected_degrees = list(dict.fromkeys(detected_degrees))
    
    # Try to find degree entries with context
    years_found = re.findall(year_pattern, text)
    gpa_match = re.search(gpa_pattern, text, re.IGNORECASE)
    found_gpa = gpa_match.group(0) if gpa_match else ""

    # Check for university/college keywords
    uni_pattern = r'([A-Z][a-zA-Z\s]+(?:University|Institute of Technology|College of Engineering|Academy|College))'
    unis_found = re.findall(uni_pattern, text)

    # Detected major
    found_major = "Computer Science & Engineering"
    for major in COMMON_MAJORS:
        if re.search(rf'\b{re.escape(major)}\b', text, re.IGNORECASE):
            found_major = major
            break

    if detected_degrees:
        for idx, deg in enumerate(detected_degrees[:3]):
            results.append({
                "degree": deg,
                "field_of_study": found_major,
                "institution": unis_found[idx] if idx < len(unis_found) else (unis_found[0] if unis_found else "Accredited University"),
                "year": years_found[-1] if years_found else "Recent",
                "grade": found_gpa or "Good Academic Standing"
            })
    else:
        # Fallback if university found
        if unis_found:
            results.append({
                "degree": "Bachelor of Technology / B.S.",
                "field_of_study": found_major,
                "institution": unis_found[0],
                "year": years_found[-1] if years_found else "Recent",
                "grade": found_gpa or "Completed"
            })

    return results

def extract_experience(text: str) -> List[Dict[str, Any]]:
    """Extracts job titles, companies, bullet points, and impact."""
    experience_list = []
    
    # Common job titles
    title_pattern = r'\b(?:Software Engineer|Full Stack Developer|Frontend Developer|Backend Engineer|Data Scientist|Machine Learning Engineer|DevOps Engineer|Cloud Engineer|Intern|Software Engineering Intern|Research Intern|Technical Lead|System Analyst)\b'
    
    matches = list(re.finditer(title_pattern, text, re.IGNORECASE))
    for i, m in enumerate(matches[:5]):
        title = m.group(0)
        # Search around match for company name or dates
        start = max(0, m.start() - 50)
        end = min(len(text), m.end() + 250)
        snippet = text[start:end].replace('\n', ' ')
        
        # Check action verbs in snippet
        verbs = extract_action_verbs(snippet)
        metrics = extract_quantifiable_metrics(snippet)
        
        experience_list.append({
            "title": title.title(),
            "summary": snippet[:150] + "...",
            "action_verbs": verbs[:5],
            "quantifiable_impact": [m["metric"] for m in metrics[:3]]
        })
        
    return experience_list

def extract_certifications(text: str) -> List[str]:
    """Finds professional industry certifications."""
    certs_found = []
    text_lower = text.lower()
    for cert in POPULAR_CERTS:
        if cert.lower() in text_lower:
            certs_found.append(cert)
            
    # Generic certification regex
    generic_matches = re.findall(r'Certified\s+[A-Za-z0-9\s]+(?:Associate|Professional|Specialist|Developer)', text)
    for g in generic_matches:
        if len(g.strip()) < 40 and g.strip() not in certs_found:
            certs_found.append(g.strip())
            
    return list(dict.fromkeys(certs_found))

def extract_projects(text: str) -> List[Dict[str, Any]]:
    """Extracts candidate projects, tech stack used, and descriptions."""
    projects = []
    
    # Split text into potential project lines
    # Often lines following "Projects" section have bold or bullet patterns
    project_indicators = [
        r'(?:Project|System|Platform|Application|App|Tool|Engine|Dashboard|Portal)\b'
    ]
    
    lines = [line.strip() for line in text.split('\n') if len(line.strip()) > 10]
    for line in lines:
        if any(re.search(p, line, re.IGNORECASE) for p in project_indicators) and len(line) < 60:
            if not any(header in line.lower() for header in ["academic projects", "key projects", "project description"]):
                projects.append({
                    "title": line.strip(" -:•*"),
                    "tech_stack": [],
                    "description": ""
                })
                if len(projects) >= 4:
                    break
                    
    return projects
