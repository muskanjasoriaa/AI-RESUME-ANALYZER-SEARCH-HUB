import os
import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

if __name__ == "__main__":
    import uvicorn

    print("=" * 70)
    print(" AI RESUME ANALYZER & CAREER ROADMAP GENERATOR")
    print(" Software Engineering Laboratory Academic Project")
    print("=" * 70)
    print(" * Web Application:        http://127.0.0.1:8000")
    print(" * Interactive API Docs:   http://127.0.0.1:8000/docs")
    print(" * Alternative Redoc:      http://127.0.0.1:8000/redoc")
    print("-" * 70)
    print(" DEMO CREDENTIALS FOR LAB EVALUATION:")
    print(" 1) Student Account:       student@resumeai.edu / Student@123")
    print(" 2) Administrator Account: admin@resumeai.edu   / Admin@123")
    print("=" * 70)

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False
    )
