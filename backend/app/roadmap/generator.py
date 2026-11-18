from typing import Dict, Any, List
from app.roadmap.roles_data import CAREER_ROLES

# High quality curated learning resources database
LEARNING_RESOURCES: Dict[str, List[Dict[str, str]]] = {
    "Docker": [
        {"title": "Docker Official Getting Started Guide", "url": "https://docs.docker.com/get-started/", "type": "Documentation"},
        {"title": "Docker for Beginners - Complete FreeCourse", "url": "https://www.youtube.com/watch?v=fqMOX6JJhGo", "type": "Video Course"}
    ],
    "Kubernetes": [
        {"title": "Kubernetes Official Tutorials", "url": "https://kubernetes.io/docs/tutorials/", "type": "Documentation"},
        {"title": "Kubernetes Course for Beginners (freeCodeCamp)", "url": "https://www.youtube.com/watch?v=X48VuDVv0do", "type": "Video Course"}
    ],
    "React": [
        {"title": "React.dev Official Interactive Tutorial", "url": "https://react.dev/learn", "type": "Interactive Guide"},
        {"title": "Full Modern React Tutorial (Net Ninja)", "url": "https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d", "type": "Video Course"}
    ],
    "Next.js": [
        {"title": "Next.js App Router Documentation", "url": "https://nextjs.org/learn", "type": "Interactive Guide"},
        {"title": "Next.js 14 Full Course (freeCodeCamp)", "url": "https://www.youtube.com/watch?v=wm5gMKuwSYk", "type": "Video Course"}
    ],
    "Node.js": [
        {"title": "Node.js Official Documentation & Guides", "url": "https://nodejs.org/en/learn", "type": "Documentation"},
        {"title": "Node.js and Express.js Full Course", "url": "https://www.youtube.com/watch?v=Oe421EPjeBE", "type": "Video Course"}
    ],
    "FastAPI": [
        {"title": "FastAPI Official Interactive Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/", "type": "Documentation"},
        {"title": "Build Production APIs with FastAPI & Python", "url": "https://www.youtube.com/watch?v=0sOvCWFmrtA", "type": "Video Course"}
    ],
    "Python": [
        {"title": "The Python Tutorial (Official)", "url": "https://docs.python.org/3/tutorial/", "type": "Documentation"},
        {"title": "Python for Everybody (Dr. Chuck)", "url": "https://www.py4e.com/", "type": "Comprehensive Course"}
    ],
    "Machine Learning": [
        {"title": "Machine Learning Specialization (Andrew Ng)", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "type": "Course"},
        {"title": "Scikit-Learn Official User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "Documentation"}
    ],
    "PyTorch": [
        {"title": "PyTorch 60-Minute Blitz", "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", "type": "Interactive Tutorial"},
        {"title": "PyTorch for Deep Learning Bootcamp (freeCodeCamp)", "url": "https://www.youtube.com/watch?v=V_xro1bcAuA", "type": "Video Course"}
    ],
    "TensorFlow": [
        {"title": "TensorFlow Core Tutorials", "url": "https://www.tensorflow.org/tutorials", "type": "Documentation"}
    ],
    "Large Language Models": [
        {"title": "DeepLearning.AI Generative AI for Everyone", "url": "https://www.deeplearning.ai/courses/generative-ai-for-everyone/", "type": "Course"},
        {"title": "Hugging Face NLP Course", "url": "https://huggingface.co/learn/nlp-course/", "type": "Interactive Course"}
    ],
    "PostgreSQL": [
        {"title": "PostgreSQL Tutorial for Beginners", "url": "https://www.postgresqltutorial.com/", "type": "Tutorial"},
        {"title": "PostgreSQL Database Course (freeCodeCamp)", "url": "https://www.youtube.com/watch?v=qw--VYLpxG4", "type": "Video Course"}
    ],
    "Redis": [
        {"title": "Redis University - Free Redis Courses", "url": "https://university.redis.com/", "type": "Interactive Course"}
    ],
    "AWS": [
        {"title": "AWS Skill Builder Free Digital Training", "url": "https://explore.skillbuilder.aws/", "type": "Official Training"},
        {"title": "AWS Certified Cloud Practitioner Training (freeCodeCamp)", "url": "https://www.youtube.com/watch?v=SOTamWNgDKc", "type": "Video Course"}
    ],
    "CI/CD": [
        {"title": "GitHub Actions Documentation", "url": "https://docs.github.com/en/actions", "type": "Documentation"}
    ],
    "System Design": [
        {"title": "System Design Primer (Donne Martin)", "url": "https://github.com/donnemartin/system-design-primer", "type": "Open Source Guide"}
    ]
}

def generate_personalized_roadmap(
    target_role_name: str,
    user_skills: List[str],
    experience_level: str = "Intermediate"
) -> Dict[str, Any]:
    """
    Generates a personalized, 4-phase career progression roadmap
    specifically tailored to the skills missing from the user's resume.
    """
    role_info = CAREER_ROLES.get(target_role_name, CAREER_ROLES["Full-Stack Developer"])
    
    # Normalize skill lists
    user_skills_lower = set(s.lower() for s in user_skills)
    
    core_skills = role_info["core_skills"]
    preferred_skills = role_info["preferred_skills"]
    
    matched_core = [s for s in core_skills if s.lower() in user_skills_lower]
    missing_core = [s for s in core_skills if s.lower() not in user_skills_lower]
    
    matched_pref = [s for s in preferred_skills if s.lower() in user_skills_lower]
    missing_pref = [s for s in preferred_skills if s.lower() not in user_skills_lower]
    
    total_role_skills = len(core_skills) + len(preferred_skills)
    total_matched = len(matched_core) + len(matched_pref)
    readiness_percentage = round((total_matched / max(1, total_role_skills)) * 100, 1)
    
    # Generate Phase Milestones
    phases = []
    
    # -------------------------------------------------------------
    # PHASE 1: Foundations & Core Skill Remediation (Weeks 1-3)
    # -------------------------------------------------------------
    p1_skills = missing_core[:3] if missing_core else core_skills[:2]
    p1_milestones = []
    
    for idx, skill in enumerate(p1_skills):
        res = LEARNING_RESOURCES.get(skill, [
            {"title": f"{skill} Official Reference & Documentation", "url": f"https://www.google.com/search?q={skill}+official+documentation", "type": "Reference"}
        ])
        p1_milestones.append({
            "key": f"p1_m{idx+1}",
            "phase": 1,
            "title": f"Master Core Skill: {skill}",
            "description": f"Build foundational fluency in {skill}, completing hands-on exercises and understanding syntax, design patterns, and idiomatic practices.",
            "skills_covered": [skill],
            "estimated_weeks": "1-2 weeks",
            "priority": "Critical",
            "status": "todo",
            "resources": res,
            "action_items": [
                f"Read official documentation for {skill}",
                f"Write 3 isolated sample programs or scripts utilizing {skill}",
                "Review memory management, error handling, and best practices"
            ]
        })
        
    if not p1_milestones:
        p1_milestones.append({
            "key": "p1_m1",
            "phase": 1,
            "title": "Review Foundational Architecture",
            "description": "Strengthen your core software engineering fundamentals, data structures, and algorithmic complexity.",
            "skills_covered": matched_core[:2],
            "estimated_weeks": "1 week",
            "priority": "High",
            "status": "todo",
            "resources": [{"title": "Data Structures & Algorithms Course", "url": "https://neetcode.io/", "type": "Interactive"}],
            "action_items": ["Solve 10 medium-difficulty algorithm problems", "Review Big-O space and time complexity"]
        })

    phases.append({
        "phase_number": 1,
        "title": "Phase 1: Foundational Mastery & Prerequisite Filling",
        "duration": "Weeks 1 - 3",
        "description": "Remediate core missing competencies and build fundamental syntax and design pattern fluency.",
        "milestones": p1_milestones
    })

    # -------------------------------------------------------------
    # PHASE 2: Advanced Concepts & Framework Ecosystem (Weeks 4-7)
    # -------------------------------------------------------------
    p2_skills = (missing_core[3:] + missing_pref[:2]) if len(missing_core) > 3 else missing_pref[:3]
    if not p2_skills:
        p2_skills = preferred_skills[:2]
        
    p2_milestones = []
    for idx, skill in enumerate(p2_skills):
        res = LEARNING_RESOURCES.get(skill, [
            {"title": f"Learn {skill} in Practice", "url": f"https://www.google.com/search?q=Learn+{skill}+guide", "type": "Tutorial"}
        ])
        p2_milestones.append({
            "key": f"p2_m{idx+1}",
            "phase": 2,
            "title": f"Advanced Specialization: {skill}",
            "description": f"Integrate {skill} into real application workflows, focusing on state management, asynchronous handling, and optimization.",
            "skills_covered": [skill],
            "estimated_weeks": "2 weeks",
            "priority": "High",
            "status": "todo",
            "resources": res,
            "action_items": [
                f"Implement a mini-module or service utilizing {skill}",
                "Write automated unit tests for key module functions",
                "Benchmark and optimize throughput or load performance"
            ]
        })

    phases.append({
        "phase_number": 2,
        "title": "Phase 2: Modern Frameworks & Specialized Ecosystems",
        "duration": "Weeks 4 - 7",
        "description": "Deep dive into production-grade tooling, database tuning, state persistence, and API integration.",
        "milestones": p2_milestones
    })

    # -------------------------------------------------------------
    # PHASE 3: Capstone Portfolio Projects & Deployment (Weeks 8-10)
    # -------------------------------------------------------------
    projects = role_info.get("portfolio_projects", [])
    p3_milestones = []
    for idx, proj in enumerate(projects):
        p3_milestones.append({
            "key": f"p3_m{idx+1}",
            "phase": 3,
            "title": f"Build Capstone Project: {proj['title']}",
            "description": proj["description"],
            "skills_covered": proj["tech_stack"].split(", "),
            "estimated_weeks": "2-3 weeks",
            "priority": "Critical",
            "status": "todo",
            "resources": [
                {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "Architecture Guide"},
                {"title": "GitHub README Best Practices", "url": "https://docs.github.com/en/get-started/writing-on-github", "type": "Documentation"}
            ],
            "action_items": [
                f"Scaffold project repository with clean folder structure ({proj['tech_stack']})",
                "Implement end-to-end user workflows with comprehensive error handling",
                "Deploy live version to Vercel/Render/AWS with public demo URL",
                "Author professional README with architectural diagrams, API docs, and metrics"
            ]
        })

    phases.append({
        "phase_number": 3,
        "title": "Phase 3: Production Portfolio Projects & Cloud Deployment",
        "duration": "Weeks 8 - 10",
        "description": "Create high-impact, verified GitHub portfolio projects demonstrating end-to-end technical mastery.",
        "milestones": p3_milestones
    })

    # -------------------------------------------------------------
    # PHASE 4: ATS Optimization, System Design & Interview Prep (Weeks 11-12)
    # -------------------------------------------------------------
    p4_milestones = [
        {
            "key": "p4_m1",
            "phase": 4,
            "title": "ATS Resume Tailoring & Metric Quantification",
            "description": "Update your resume with your new capstone projects, incorporating action verbs, quantitative metrics (e.g. % improvements), and target role keywords.",
            "skills_covered": ["Resume Optimization", "Technical Writing"],
            "estimated_weeks": "1 week",
            "priority": "High",
            "status": "todo",
            "resources": [
                {"title": "Harvard Mignone Center Resume & Cover Letter Guide", "url": "https://careerservices.fas.harvard.edu/", "type": "Guide"}
            ],
            "action_items": [
                "Re-analyze updated resume on AI Resume Analyzer to verify ATS score >= 85",
                "Ensure every project bullet point has action verb + tech stack + measurable result",
                "Verify GitHub, LinkedIn, and live project demo links are active and prominent"
            ]
        },
        {
            "key": "p4_m2",
            "phase": 4,
            "title": "Mock Technical & Behavioral Interview Drills",
            "description": "Conduct mock coding interviews, system design whiteboard sessions, and behavioral STAR-method storytelling.",
            "skills_covered": ["System Design", "Communication", "STAR Method"],
            "estimated_weeks": "1 week",
            "priority": "High",
            "status": "todo",
            "resources": [
                {"title": "Tech Interview Handbook", "url": "https://www.techinterviewhandbook.org/", "type": "Guide"},
                {"title": "STAR Method Behavioral Interviewing", "url": "https://www.themuse.com/advice/star-interview-method", "type": "Article"}
            ],
            "action_items": [
                "Draft 5 STAR-format stories for leadership, conflict resolution, and technical hurdles",
                "Practice explaining architectural trade-offs for your capstone project",
                "Complete 3 timed mock coding assessments"
            ]
        }
    ]

    phases.append({
        "phase_number": 4,
        "title": "Phase 4: ATS Resume Optimization, System Design & Interview Prep",
        "duration": "Weeks 11 - 12",
        "description": "Finalize your professional resume, maximize ATS score, and practice technical and behavioral interviews.",
        "milestones": p4_milestones
    })

    # Total milestones count
    total_milestones = sum(len(p["milestones"]) for p in phases)

    return {
        "target_role": target_role_name,
        "role_category": role_info.get("category", "Software Engineering"),
        "demand": role_info.get("demand", "High"),
        "readiness_percentage": readiness_percentage,
        "skill_gap_summary": {
            "matched_core_skills": matched_core,
            "missing_critical_skills": missing_core,
            "matched_preferred_skills": matched_pref,
            "missing_preferred_skills": missing_pref
        },
        "recommended_certifications": role_info.get("certifications", []),
        "total_milestones": total_milestones,
        "phases": phases
    }
