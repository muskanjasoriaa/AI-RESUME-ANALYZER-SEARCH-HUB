from app.auth.security import hash_password, verify_password, create_access_token, decode_access_token
from app.database import init_db, get_db

def test_password_hashing():
    raw_pass = "SecurePass@2026"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_flow():
    user_payload = {"sub": 42, "email": "test@student.edu", "role": "user"}
    token = create_access_token(user_payload)
    assert isinstance(token, str)
    
    decoded = decode_access_token(token)
    assert decoded["sub"] == "42"
    assert decoded["email"] == "test@student.edu"
    assert decoded["role"] == "user"

def test_admin_seeding():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT email, role FROM users WHERE email = 'admin@resumeai.edu'")
        admin = cursor.fetchone()
        if admin:
            assert admin["role"] == "admin"
