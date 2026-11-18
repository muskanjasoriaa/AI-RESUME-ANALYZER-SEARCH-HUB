import re
from typing import Dict, List, Set, Tuple

# Comprehensive taxonomy of technical skills
SKILL_TAXONOMY: Dict[str, Dict[str, List[str]]] = {
    "programming_languages": {
        "Python": ["python", "python3", "py"],
        "JavaScript": ["javascript", "js", "ecmascript"],
        "TypeScript": ["typescript", "ts"],
        "Java": ["java", "core java", "j2ee"],
        "C++": ["c++", "cpp"],
        "C#": ["c#", "csharp", "dotnet c#"],
        "C": ["c programming"],
        "Go": ["golang", "go language"],
        "Rust": ["rust"],
        "Ruby": ["ruby"],
        "PHP": ["php"],
        "Swift": ["swift", "swiftui"],
        "Kotlin": ["kotlin"],
        "Dart": ["dart"],
        "SQL": ["sql", "transact-sql", "pl/sql"],
        "R": ["r programming", "r language"],
        "Shell/Bash": ["bash", "shell script", "zsh", "powershell"],
        "Scala": ["scala"],
        "HTML/CSS": ["html", "html5", "css", "css3"]
    },
    "web_frameworks": {
        "React": ["react", "react.js", "reactjs"],
        "Next.js": ["next.js", "nextjs"],
        "Node.js": ["node.js", "nodejs", "node"],
        "Express.js": ["express", "express.js", "expressjs"],
        "Vue.js": ["vue", "vue.js", "vuejs"],
        "Angular": ["angular", "angularjs", "angular 2+"],
        "Django": ["django", "django rest framework"],
        "FastAPI": ["fastapi", "fast-api"],
        "Flask": ["flask"],
        "Spring Boot": ["spring boot", "springboot", "spring framework"],
        "ASP.NET": ["asp.net", ".net core", "dotnet core"],
        "Ruby on Rails": ["ruby on rails", "rails"],
        "Laravel": ["laravel"],
        "Tailwind CSS": ["tailwind", "tailwindcss"],
        "Bootstrap": ["bootstrap", "bootstrap5"],
        "GraphQL": ["graphql", "apollo client"],
        "REST APIs": ["rest api", "restful api", "rest apis", "restful web services"]
    },
    "ai_ml_data": {
        "Machine Learning": ["machine learning", "ml", "supervised learning", "unsupervised learning"],
        "Deep Learning": ["deep learning", "neural networks", "dl", "ann", "cnn", "rnn"],
        "PyTorch": ["pytorch", "torch"],
        "TensorFlow": ["tensorflow", "tf", "keras"],
        "Scikit-Learn": ["scikit-learn", "sklearn"],
        "Pandas": ["pandas"],
        "NumPy": ["numpy"],
        "Natural Language Processing": ["nlp", "natural language processing", "text mining"],
        "Computer Vision": ["computer vision", "cv", "object detection", "image classification"],
        "OpenCV": ["opencv"],
        "Large Language Models": ["llm", "llms", "large language models", "prompt engineering", "genai", "generative ai"],
        "LangChain": ["langchain", "llamaindex"],
        "Hugging Face": ["hugging face", "huggingface", "transformers"],
        "Data Science": ["data science", "data analytics", "data visualization"],
        "Apache Spark": ["spark", "pyspark", "apache spark"],
        "Matplotlib/Seaborn": ["matplotlib", "seaborn"]
    },
    "databases": {
        "PostgreSQL": ["postgresql", "postgres", "psql"],
        "MySQL": ["mysql"],
        "MongoDB": ["mongodb", "mongo"],
        "Redis": ["redis"],
        "SQLite": ["sqlite", "sqlite3"],
        "Firebase": ["firebase", "firestore"],
        "DynamoDB": ["dynamodb", "aws dynamodb"],
        "Cassandra": ["cassandra", "apache cassandra"],
        "Oracle": ["oracle db", "oracle database"],
        "Elasticsearch": ["elasticsearch", "elastic search"],
        "Supabase": ["supabase"]
    },
    "cloud_devops": {
        "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda"],
        "Microsoft Azure": ["azure", "microsoft azure", "azure devops"],
        "Google Cloud Platform": ["gcp", "google cloud", "google cloud platform"],
        "Docker": ["docker", "containerization", "docker compose"],
        "Kubernetes": ["kubernetes", "k8s"],
        "CI/CD": ["ci/cd", "continuous integration", "continuous deployment"],
        "GitHub Actions": ["github actions"],
        "Terraform": ["terraform", "infrastructure as code", "iac"],
        "Linux": ["linux", "ubuntu", "debian", "redhat", "centos"],
        "Ansible": ["ansible"],
        "Jenkins": ["jenkins"],
        "Nginx": ["nginx", "apache server"],
        "Prometheus/Grafana": ["prometheus", "grafana"]
    },
    "tools_methodologies": {
        "Git/GitHub": ["git", "github", "gitlab", "version control"],
        "Jira/Agile": ["jira", "agile", "scrum", "kanban", "sprints"],
        "Postman": ["postman", "api testing"],
        "Microservices": ["microservices", "microservice architecture"],
        "System Design": ["system design", "distributed systems", "high availability"],
        "Unit Testing": ["unit testing", "pytest", "jest", "junit", "tdd", "test driven development"],
        "Figma": ["figma", "ui/ux design"]
    },
    "soft_skills": {
        "Leadership": ["leadership", "team lead", "mentoring", "managed team", "led a team"],
        "Communication": ["communication", "technical presentation", "public speaking", "written communication"],
        "Problem Solving": ["problem solving", "analytical mindset", "troubleshooting", "critical thinking"],
        "Team Collaboration": ["teamwork", "collaboration", "cross-functional", "cross-team"],
        "Time Management": ["time management", "prioritization", "deadline driven", "fast-paced"],
        "Adaptability": ["adaptability", "quick learner", "self-motivated", "growth mindset"]
    }
}

def extract_skills_from_text(text: str) -> Dict[str, any]:
    """
    Extracts, categorizes, and scores technical and soft skills present in the resume text.
    Uses regex boundary matching to avoid substring false positives.
    """
    if not text:
        return {
            "all_skills": [],
            "technical_skills": [],
            "soft_skills": [],
            "categorized": {},
            "total_count": 0,
            "category_counts": {}
        }
    
    text_lower = " " + text.lower() + " "
    
    found_skills: Dict[str, Set[str]] = {cat: set() for cat in SKILL_TAXONOMY}
    matched_all: Set[str] = set()
    
    for category, skills_dict in SKILL_TAXONOMY.items():
        for canonical_name, aliases in skills_dict.items():
            for alias in aliases:
                # Handle special chars like c++, c#, .net
                escaped = re.escape(alias)
                # Word boundary check
                pattern = rf'(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])'
                if re.search(pattern, text_lower):
                    found_skills[category].add(canonical_name)
                    matched_all.add(canonical_name)
                    break # Already matched this canonical skill
                    
    # Format into response
    categorized_res = {cat: sorted(list(skills)) for cat, skills in found_skills.items()}
    category_counts = {cat: len(skills) for cat, skills in categorized_res.items()}
    
    technical_skills = []
    for cat in ["programming_languages", "web_frameworks", "ai_ml_data", "databases", "cloud_devops", "tools_methodologies"]:
        technical_skills.extend(categorized_res.get(cat, []))
        
    soft_skills = categorized_res.get("soft_skills", [])
    
    return {
        "all_skills": sorted(list(matched_all)),
        "technical_skills": sorted(list(set(technical_skills))),
        "soft_skills": sorted(list(set(soft_skills))),
        "categorized": categorized_res,
        "total_count": len(matched_all),
        "category_counts": category_counts
    }
