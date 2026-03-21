# schemas/user.py
# ─────────────────────────────────────────────────────
# Pydantic schemas for User and Auth
#
# Pattern:
#   *Create = what client SENDS (POST body)
#   *Read   = what server RETURNS (response)
# ─────────────────────────────────────────────────────

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# ═══════════════════════════════════════════
#  AUTH SCHEMAS
# ═══════════════════════════════════════════

class UserCreate(BaseModel):
    """
    What the client sends when registering.
    Pydantic validates this automatically.
    If email is invalid → 422 error returned.
    If password too short → 422 error returned.
    """
    email: EmailStr        # validates email format
    password: str

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v: str) -> str:
        """
        Custom validation rule.
        Runs automatically on every register request.
        This is W3 Business Logic + Validation ✅
        """
        if len(v) < 8:
            raise ValueError(
                "Password must be at least 8 characters"
            )
        if not any(c.isdigit() for c in v):
            raise ValueError(
                "Password must contain at least one number"
            )
        return v


class UserRead(BaseModel):
    """
    What the server returns after register/login.
    Notice: NO password_hash field — never expose it!
    """
    id: int
    email: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    """What the client sends when logging in."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token returned after successful login."""
    access_token: str
    token_type: str = "bearer"


# ═══════════════════════════════════════════
#  USER PROFILE SCHEMAS
# ═══════════════════════════════════════════

class UserProfileCreate(BaseModel):
    """What client sends when creating/updating profile."""
    full_name: Optional[str] = None
    country: Optional[str] = None
    role: Optional[str] = "founder"
    bio: Optional[str] = None

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        allowed = ["founder", "designer", "developer", "investor"]
        if v not in allowed:
            raise ValueError(
                f"Role must be one of: {allowed}"
            )
        return v


class UserProfileRead(BaseModel):
    """What server returns for a profile."""
    id: int
    user_id: int
    full_name: Optional[str]
    country: Optional[str]
    role: Optional[str]
    bio: Optional[str]

    model_config = {"from_attributes": True}


class UserStatsRead(BaseModel):
    """User statistics summary."""
    total_projects: int
    member_since: datetime