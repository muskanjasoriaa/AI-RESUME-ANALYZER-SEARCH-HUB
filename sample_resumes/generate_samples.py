import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import docx

SAMPLES_DIR = Path(__file__).resolve().parent

def create_software_engineer_pdf():
    pdf_path = SAMPLES_DIR / "Software_Engineer_Resume.pdf"
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    
    name_style = ParagraphStyle('Name', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor('#0F172A'))
    contact_style = ParagraphStyle('Contact', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#475569'))
    sec_heading = ParagraphStyle('Sec', parent=styles['Heading2'], fontSize=12, leading=15, textColor=colors.HexColor('#1E3A8A'), spaceBefore=8, spaceAfter=4)
    item_title = ParagraphStyle('ItemTitle', parent=styles['Normal'], fontSize=9.5, leading=13, textColor=colors.HexColor('#0F172A'))
    bullet = ParagraphStyle('Bullet', parent=styles['Normal'], fontSize=8.5, leading=12, textColor=colors.HexColor('#334155'), leftIndent=10)
    
    story = [
        Paragraph("<b>ALEXANDER CHEN</b>", name_style),
        Paragraph("San Francisco, CA | alex.chen@example.com | (555) 234-5678 | https://linkedin.com/in/alexchen-dev | https://github.com/alexchen-eng", contact_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#2563EB'), spaceAfter=8, spaceBefore=4),
        
        Paragraph("<b>PROFESSIONAL SUMMARY</b>", sec_heading),
        Paragraph("Results-driven Full-Stack Software Engineer with 3+ years of experience engineering scalable microservices and reactive web applications. Proven track record of improving system latency by 35% and deploying production architectures on AWS and Kubernetes.", bullet),
        
        Paragraph("<b>TECHNICAL SKILLS</b>", sec_heading),
        Paragraph("<b>Languages:</b> Python, JavaScript, TypeScript, Go, SQL, HTML/CSS", bullet),
        Paragraph("<b>Frameworks & Libraries:</b> React, Next.js, Node.js, Express.js, FastAPI, Django, Tailwind CSS", bullet),
        Paragraph("<b>Cloud & DevOps:</b> Docker, Kubernetes, AWS (EC2, S3, Lambda), CI/CD, GitHub Actions, Linux, Nginx", bullet),
        Paragraph("<b>Databases & Caching:</b> PostgreSQL, MongoDB, Redis, MySQL", bullet),
        Paragraph("<b>Tools & Methods:</b> Git/GitHub, Microservices, System Design, REST APIs, Jira/Agile, Unit Testing", bullet),
        Paragraph("<b>Soft Skills:</b> Leadership, Problem Solving, Team Collaboration, Communication", bullet),
        
        Paragraph("<b>WORK EXPERIENCE</b>", sec_heading),
        Paragraph("<b>Senior Full-Stack Developer</b> — CloudScale Systems (2023 - Present)", item_title),
        Paragraph("• Architected and deployed microservices backend using FastAPI and PostgreSQL, serving over 50,000 daily active users.", bullet),
        Paragraph("• Spearheaded migration from monolithic architecture to Docker containers and Kubernetes, reducing server costs by 28%.", bullet),
        Paragraph("• Optimized Redis caching layer, decreasing 95th percentile database query response times by 45%.", bullet),
        Paragraph("• Mentored 4 junior engineers on test-driven development, code reviews, and CI/CD automation pipelines.", bullet),
        
        Paragraph("<b>Software Engineer</b> — NexaTech Solutions (2021 - 2023)", item_title),
        Paragraph("• Engineered interactive user dashboards using React, TypeScript, and Tailwind CSS, boosting user engagement by 40%.", bullet),
        Paragraph("• Implemented secure JWT authentication and role-based access control protocols across 12 distributed endpoints.", bullet),
        Paragraph("• Automated continuous integration and deployment using GitHub Actions, cutting release turnaround times from 3 hours to 15 minutes.", bullet),
        
        Paragraph("<b>KEY PROJECTS</b>", sec_heading),
        Paragraph("<b>Real-Time Financial Analytics Platform</b> | React, Node.js, PostgreSQL, Redis, Docker", item_title),
        Paragraph("• Built high-throughput stock metrics aggregator processing 10,000 WebSocket events per second with sub-50ms latency.", bullet),
        Paragraph("• Integrated automated alert dispatching via Webhooks and Telegram bots with 99.9% uptime reliability.", bullet),
        
        Paragraph("<b>EDUCATION & CERTIFICATIONS</b>", sec_heading),
        Paragraph("<b>Bachelor of Technology in Computer Science & Engineering</b> (2017 - 2021)", item_title),
        Paragraph("University of California, Berkeley | GPA: 3.85 / 4.0", bullet),
        Paragraph("<b>Certifications:</b> AWS Certified Solutions Architect - Associate | Certified Kubernetes Administrator (CKA)", bullet)
    ]
    
    doc.build(story)
    print("Created Software_Engineer_Resume.pdf")

def create_data_scientist_docx():
    docx_path = SAMPLES_DIR / "Data_Scientist_Resume.docx"
    doc = docx.Document()
    
    # Title & Contact
    h = doc.add_heading("PRIYA SHARMA", level=0)
    p_contact = doc.add_paragraph("New York, NY | priya.sharma@example.com | (555) 789-0123 | linkedin.com/in/priyasharma-ai | github.com/priyasharma-data")
    
    # Summary
    doc.add_heading("PROFESSIONAL SUMMARY", level=1)
    doc.add_paragraph("Data Scientist and Machine Learning practitioner with solid background in statistical analysis, predictive modeling, and deep learning architectures. Experienced in building production NLP and computer vision pipelines using Python, PyTorch, and Scikit-Learn.")
    
    # Skills
    doc.add_heading("TECHNICAL SKILLS", level=1)
    doc.add_paragraph("Programming Languages: Python, SQL, R, Shell/Bash")
    doc.add_paragraph("Machine Learning & AI: Machine Learning, Deep Learning, PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, Natural Language Processing, Computer Vision, OpenCV, Large Language Models")
    doc.add_paragraph("Databases & Big Data: PostgreSQL, MySQL, Apache Spark, MongoDB")
    doc.add_paragraph("Tools & DevOps: Git/GitHub, Docker, Linux, Matplotlib/Seaborn, FastAPI")
    doc.add_paragraph("Soft Skills: Problem Solving, Critical Thinking, Teamwork, Communication, Time Management")
    
    # Experience
    doc.add_heading("PROFESSIONAL EXPERIENCE", level=1)
    doc.add_heading("Machine Learning Engineer — AlphaData Analytics (2022 - Present)", level=2)
    doc.add_paragraph("• Developed and deployed a customer churn classification model using XGBoost and Scikit-Learn, achieving an 89% AUC-ROC score.")
    doc.add_paragraph("• Engineered an automated data preprocessing pipeline with Pandas and Apache Spark, reducing feature generation duration by 60%.")
    doc.add_paragraph("• Implemented sentiment analysis service using PyTorch and Hugging Face Transformers, processing 200,000 product reviews daily.")
    
    doc.add_heading("Data Analyst Intern — InsightMetrics Corp (2021 - 2022)", level=2)
    doc.add_paragraph("• Extracted and transformed enterprise database records using complex SQL queries and PostgreSQL.")
    doc.add_paragraph("• Designed executive analytics dashboards in Matplotlib and Seaborn, directly influencing $250k in strategic marketing reallocation.")
    
    # Projects
    doc.add_heading("TECHNICAL PROJECTS", level=1)
    doc.add_heading("Intelligent Medical Imaging Diagnostics | PyTorch, OpenCV, FastAPI", level=2)
    doc.add_paragraph("• Trained a convolutional neural network (CNN) for thoracic abnormality detection on 45,000 X-ray images with 94.2% sensitivity.")
    doc.add_paragraph("• Packaged model into a lightweight FastAPI service containerized with Docker.")
    
    # Education
    doc.add_heading("EDUCATION & CERTIFICATIONS", level=1)
    doc.add_paragraph("Master of Science in Data Science | Columbia University (2020 - 2022) | GPA: 3.9 / 4.0")
    doc.add_paragraph("Bachelor of Engineering in Information Technology | State Technical University (2016 - 2020)")
    doc.add_paragraph("Certifications: TensorFlow Developer Certificate, AWS Certified Cloud Practitioner")
    
    doc.save(str(docx_path))
    print("Created Data_Scientist_Resume.docx")

def create_entry_level_pdf():
    pdf_path = SAMPLES_DIR / "Entry_Level_Student_Resume.pdf"
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    
    name_style = ParagraphStyle('Name', parent=styles['Heading1'], fontSize=16, leading=20, textColor=colors.HexColor('#0F172A'))
    contact_style = ParagraphStyle('Contact', parent=styles['Normal'], fontSize=9, leading=12, textColor=colors.HexColor('#475569'))
    sec_heading = ParagraphStyle('Sec', parent=styles['Heading2'], fontSize=11, leading=14, textColor=colors.HexColor('#334155'), spaceBefore=8, spaceAfter=4)
    item_title = ParagraphStyle('ItemTitle', parent=styles['Normal'], fontSize=9, leading=12, textColor=colors.HexColor('#0F172A'))
    bullet = ParagraphStyle('Bullet', parent=styles['Normal'], fontSize=8.5, leading=11, textColor=colors.HexColor('#334155'), leftIndent=10)
    
    story = [
        Paragraph("<b>JORDAN SMITH</b>", name_style),
        Paragraph("Austin, TX | jordan.smith@university.edu | (555) 901-2345", contact_style),
        HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#94A3B8'), spaceAfter=8, spaceBefore=4),
        
        Paragraph("<b>OBJECTIVE</b>", sec_heading),
        Paragraph("Enthusiastic Computer Science undergraduate seeking a Software Engineering internship to apply academic programming skills in a dynamic team.", bullet),
        
        Paragraph("<b>EDUCATION</b>", sec_heading),
        Paragraph("<b>Bachelor of Science in Computer Science</b> — State University (Expected May 2026)", item_title),
        Paragraph("Relevant Coursework: Data Structures, Algorithms, Database Systems, Object-Oriented Programming, Web Technologies", bullet),
        Paragraph("CGPA: 3.4 / 4.0", bullet),
        
        Paragraph("<b>TECHNICAL SKILLS</b>", sec_heading),
        Paragraph("<b>Languages:</b> Python, Java, C++, HTML/CSS, JavaScript", bullet),
        Paragraph("<b>Databases:</b> MySQL, SQLite", bullet),
        Paragraph("<b>Tools:</b> Git, VS Code", bullet),
        
        Paragraph("<b>ACADEMIC PROJECTS</b>", sec_heading),
        Paragraph("<b>Campus Book Marketplace Web Application</b> (Python, Flask, SQLite)", item_title),
        Paragraph("• Developed a web application for university students to exchange textbooks and supplies.", bullet),
        Paragraph("• Implemented user login and database tables for storing item listings.", bullet),
        
        Paragraph("<b>Student Attendance Tracker</b> (Java, MySQL)", item_title),
        Paragraph("• Created a desktop GUI application using Java Swing to log daily student attendance records.", bullet),
        Paragraph("• Connected application to a local MySQL database to store student information.", bullet),
        
        Paragraph("<b>EXTRACURRICULAR ACTIVITIES</b>", sec_heading),
        Paragraph("• Member, ACM Student Chapter and University Coding Club.", bullet),
        Paragraph("• Participated in 24-hour campus hackathon building an interactive quiz app.", bullet)
    ]
    
    doc.build(story)
    print("Created Entry_Level_Student_Resume.pdf")

if __name__ == "__main__":
    create_software_engineer_pdf()
    create_data_scientist_docx()
    create_entry_level_pdf()
