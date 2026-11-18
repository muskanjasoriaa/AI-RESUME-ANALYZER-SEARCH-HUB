from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Request
from pydantic import BaseModel
from app.database import get_db
from app.auth.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    target_role: Optional[str] = "Full-Stack Developer"

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    reset_code: str
    new_password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, request: Request):
    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )
    
    clean_email = req.email.strip().lower()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE lower(email) = ?", (clean_email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )
            
        hashed = hash_password(req.password)
        # Security requirement: Normal users NEVER register as admin. Role is strictly 'user'.
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, full_name, role, target_role)
            VALUES (?, ?, ?, 'user', ?)
            """,
            (clean_email, hashed, req.full_name.strip(), req.target_role or "Full-Stack Developer")
        )
        user_id = cursor.lastrowid
        
        # Log action
        client_ip = request.client.host if request.client else "127.0.0.1"
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
            (user_id, "USER_REGISTER", f"Registered new account: {clean_email}", client_ip)
        )

        token = create_access_token({"sub": user_id, "email": clean_email, "role": "user"})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": clean_email,
                "full_name": req.full_name.strip(),
                "role": "user",
                "target_role": req.target_role or "Full-Stack Developer",
                "bio": "",
                "github_url": "",
                "linkedin_url": ""
            }
        }

@router.post("/login")
def login(req: LoginRequest, request: Request):
    clean_email = req.email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, email, password_hash, full_name, role, target_role, bio, github_url, linkedin_url
            FROM users WHERE lower(email) = ?
            """,
            (clean_email,)
        )
        user = cursor.fetchone()
        if not user or not verify_password(req.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password combination."
            )
            
        token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
        
        # Log action
        client_ip = request.client.host if request.client else "127.0.0.1"
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
            (user["id"], "USER_LOGIN", f"User logged in: {user['email']}", client_ip)
        )
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
                "target_role": user["target_role"],
                "bio": user["bio"],
                "github_url": user["github_url"],
                "linkedin_url": user["linkedin_url"]
            }
        }

@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}

@router.put("/profile")
def update_profile(req: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        full_name = req.full_name if req.full_name is not None else current_user["full_name"]
        target_role = req.target_role if req.target_role is not None else current_user["target_role"]
        bio = req.bio if req.bio is not None else current_user["bio"]
        github_url = req.github_url if req.github_url is not None else current_user["github_url"]
        linkedin_url = req.linkedin_url if req.linkedin_url is not None else current_user["linkedin_url"]
        
        cursor.execute(
            """
            UPDATE users
            SET full_name = ?, target_role = ?, bio = ?, github_url = ?, linkedin_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (full_name, target_role, bio, github_url, linkedin_url, current_user["id"])
        )
        
        cursor.execute("SELECT id, email, full_name, role, target_role, bio, github_url, linkedin_url FROM users WHERE id = ?", (current_user["id"],))
        updated = cursor.fetchone()
        return {"message": "Profile updated successfully.", "user": updated}

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
        
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE id = ?", (current_user["id"],))
        res = cursor.fetchone()
        if not res or not verify_password(req.current_password, res["password_hash"]):
            raise HTTPException(status_code=400, detail="Current password is incorrect.")
            
        new_hashed = hash_password(req.new_password)
        cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hashed, current_user["id"]))
        return {"message": "Password changed successfully."}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    # Simulated email dispatch with academic mock code
    clean_email = req.email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, full_name FROM users WHERE lower(email) = ?", (clean_email,))
        user = cursor.fetchone()
        if not user:
            # Avoid leaking user existence
            return {"message": "If this email is registered, password reset instructions have been generated."}
        
        # For academic lab demo, provide reset token directly in response
        mock_code = "RESUME-2026-RESET"
        return {
            "message": "Password reset code generated.",
            "demo_reset_code": mock_code,
            "instructions": f"Use code {mock_code} to reset your password on this demo environment."
        }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    clean_email = req.email.strip().lower()
    if req.reset_code != "RESUME-2026-RESET":
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
        
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE lower(email) = ?", (clean_email,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")
            
        new_hashed = hash_password(req.new_password)
        cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hashed, user["id"]))
        return {"message": "Password has been reset successfully. You can now login with your new password."}
