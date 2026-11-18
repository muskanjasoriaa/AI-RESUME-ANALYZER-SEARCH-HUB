from typing import Dict, Any, List

CAREER_ROLES: Dict[str, Dict[str, Any]] = {
    "Full-Stack Developer": {
        "title": "Full-Stack Developer",
        "category": "Software Engineering",
        "demand": "Very High",
        "description": "Designs and builds end-to-end web applications, encompassing responsive frontends, scalable REST/GraphQL APIs, and database persistence layers.",
        "core_skills": ["JavaScript", "TypeScript", "React", "Node.js", "Express.js", "SQL", "PostgreSQL", "Git/GitHub", "REST APIs", "HTML/CSS"],
        "preferred_skills": ["Next.js", "Docker", "Tailwind CSS", "Redis", "MongoDB", "Unit Testing", "CI/CD", "AWS"],
        "certifications": ["AWS Certified Developer - Associate", "Meta Full-Stack Developer Professional Certificate"],
        "portfolio_projects": [
            {
                "title": "Full-Stack E-Commerce & Subscription Hub",
                "tech_stack": "React, Node.js, Express, PostgreSQL, Stripe API, Docker",
                "description": "Architect a multi-tenant shopping platform with authentication, inventory management, secure webhook payment processing, and containerized deployment."
            },
            {
                "title": "Real-Time Collaborative Workspace",
                "tech_stack": "Next.js, TypeScript, WebSockets, Redis, Tailwind CSS",
                "description": "Build a real-time markdown editor or kanban board with operational transform / CRDT synchronization, presence indicators, and role permissions."
            }
        ]
    },
    "AI / Machine Learning Engineer": {
        "title": "AI / Machine Learning Engineer",
        "category": "Artificial Intelligence",
        "demand": "Extreme",
        "description": "Develops, trains, and deploys predictive machine learning and deep learning models into production systems, including generative AI and LLM agents.",
        "core_skills": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "SQL", "Git/GitHub"],
        "preferred_skills": ["Large Language Models", "LangChain", "Hugging Face", "Computer Vision", "Natural Language Processing", "Docker", "FastAPI", "MLflow"],
        "certifications": ["TensorFlow Developer Certificate", "AWS Certified Machine Learning - Specialty", "DeepLearning.AI Specialization"],
        "portfolio_projects": [
            {
                "title": "Retrieval-Augmented Generation (RAG) Document Assistant",
                "tech_stack": "Python, LangChain, PyTorch, ChromaDB, FastAPI, Streamlit",
                "description": "Build an intelligent Q&A engine that ingests company research PDFs, computes vector embeddings, and performs context-grounded factual generation."
            },
            {
                "title": "Real-Time Computer Vision & Object Tracking Pipeline",
                "tech_stack": "Python, OpenCV, YOLOv8, PyTorch, Docker",
                "description": "Deploy a multi-stream surveillance or defect-detection inference API capable of 30+ FPS object identification and classification."
            }
        ]
    },
    "Data Scientist": {
        "title": "Data Scientist",
        "category": "Data & Analytics",
        "demand": "High",
        "description": "Extracts actionable insights from structured and unstructured data through statistical modeling, feature engineering, and predictive algorithms.",
        "core_skills": ["Python", "SQL", "Data Science", "Pandas", "NumPy", "Scikit-Learn", "Matplotlib/Seaborn", "Machine Learning", "Statistics"],
        "preferred_skills": ["Apache Spark", "Tableau", "PostgreSQL", "R", "Deep Learning", "A/B Testing", "BigQuery"],
        "certifications": ["Google Professional Data Engineer", "IBM Data Science Professional Certificate"],
        "portfolio_projects": [
            {
                "title": "Customer Churn Prediction & Lifetime Value Forecaster",
                "tech_stack": "Python, XGBoost, Scikit-Learn, SHAP, Streamlit",
                "description": "Analyze 100k+ customer records, perform exploratory data analysis, train gradient-boosted trees, and compute explainability with SHAP values."
            },
            {
                "title": "Financial Market Sentiment & Forecasting Engine",
                "tech_stack": "Python, Pandas, NLP, Statsmodels, Plotly",
                "description": "Combine news sentiment analysis with ARIMA / LSTM models to forecast asset volatility."
            }
        ]
    },
    "DevOps & Cloud Engineer": {
        "title": "DevOps & Cloud Engineer",
        "category": "Cloud & Infrastructure",
        "demand": "Very High",
        "description": "Automates software delivery pipelines, manages cloud infrastructure as code, and maintains high availability, reliability, and security of services.",
        "core_skills": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "GitHub Actions", "Terraform", "Shell/Bash", "Git/GitHub"],
        "preferred_skills": ["Microsoft Azure", "Google Cloud Platform", "Ansible", "Nginx", "Prometheus/Grafana", "Python", "Microservices"],
        "certifications": ["AWS Certified Solutions Architect", "Certified Kubernetes Administrator (CKA)", "HashiCorp Certified Terraform Associate"],
        "portfolio_projects": [
            {
                "title": "Production-Grade GitOps Kubernetes Pipeline",
                "tech_stack": "Terraform, AWS EKS, ArgoCD, Docker, GitHub Actions, Helm",
                "description": "Provision VPC, subnets, and an EKS cluster with Terraform, automating continuous deployment with GitOps sync and zero downtime."
            },
            {
                "title": "Automated Cloud Monitoring & Log Aggregation Hub",
                "tech_stack": "Prometheus, Grafana, Docker, Loki, Python alert bots",
                "description": "Set up a centralized observability stack monitoring container metrics, node health, and automated Discord/Slack alerting."
            }
        ]
    },
    "Frontend Engineer": {
        "title": "Frontend Engineer",
        "category": "Software Engineering",
        "demand": "High",
        "description": "Creates intuitive, performant, and accessible user interfaces with modern reactive component architectures and state management.",
        "core_skills": ["JavaScript", "TypeScript", "React", "HTML/CSS", "Tailwind CSS", "Git/GitHub", "REST APIs"],
        "preferred_skills": ["Next.js", "Vue.js", "GraphQL", "Figma", "Unit Testing", "Redux Toolkit", "Web Accessibility (a11y)"],
        "certifications": ["Meta Front-End Developer Certificate"],
        "portfolio_projects": [
            {
                "title": "Modern Interactive SaaS Analytics Dashboard",
                "tech_stack": "React 18, TypeScript, Tailwind CSS, Recharts, Zustand",
                "description": "Build an enterprise metrics portal featuring theme switching, customizable drag-and-drop widgets, and responsive data tables."
            }
        ]
    },
    "Backend Software Engineer": {
        "title": "Backend Software Engineer",
        "category": "Software Engineering",
        "demand": "Very High",
        "description": "Architects high-throughput microservices, database schemas, authentication layers, caching strategies, and distributed systems.",
        "core_skills": ["Java", "Python", "Node.js", "SQL", "PostgreSQL", "REST APIs", "Git/GitHub", "Microservices", "System Design"],
        "preferred_skills": ["Spring Boot", "FastAPI", "Go", "Redis", "Docker", "Kafka", "MongoDB", "Unit Testing"],
        "certifications": ["Oracle Certified Professional Java SE", "AWS Certified Developer"],
        "portfolio_projects": [
            {
                "title": "High-Throughput Distributed Rate Limiter & Cache",
                "tech_stack": "Go or Python FastAPI, Redis, PostgreSQL, Docker",
                "description": "Design a token-bucket rate limiter middleware supporting 20,000 QPS with sub-millisecond response latency."
            }
        ]
    },
    "Cybersecurity Analyst": {
        "title": "Cybersecurity Analyst",
        "category": "Security & Defense",
        "demand": "High",
        "description": "Protects organizational infrastructure, identifies vulnerabilities, monitors network traffic, and implements threat mitigation protocols.",
        "core_skills": ["Linux", "Shell/Bash", "Python", "Git/GitHub", "Problem Solving"],
        "preferred_skills": ["AWS", "Docker", "Unit Testing", "CI/CD"],
        "certifications": ["CompTIA Security+", "Certified Information Systems Security Professional (CISSP)", "CEH"],
        "portfolio_projects": [
            {
                "title": "Automated Vulnerability Scanner & Network Auditor",
                "tech_stack": "Python, Nmap API, Scapy, SQLite, HTML report generator",
                "description": "Develop a tool to audit open network ports, detect outdated software banners, and produce security hardening reports."
            }
        ]
    },
    "Mobile Application Developer": {
        "title": "Mobile Application Developer",
        "category": "Mobile Engineering",
        "demand": "High",
        "description": "Builds performant, native or cross-platform mobile apps with smooth gestures, offline caching, and push notifications.",
        "core_skills": ["JavaScript", "TypeScript", "React", "Git/GitHub", "REST APIs"],
        "preferred_skills": ["Kotlin", "Swift", "Tailwind CSS", "Firebase", "Figma"],
        "certifications": ["Google Associate Android Developer", "Meta React Native Specialization"],
        "portfolio_projects": [
            {
                "title": "Cross-Platform Health & Fitness Tracker",
                "tech_stack": "React Native / Flutter, SQLite offline cache, ChartKit, Firebase Auth",
                "description": "Build a responsive fitness tracker with local sqlite storage, workout planners, and visual trend metrics."
            }
        ]
    }
}
