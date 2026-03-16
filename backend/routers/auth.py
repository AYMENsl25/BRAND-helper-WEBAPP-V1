# routers/auth.py
# ─────────────────────────────────────────────────────
# Endpoints:
#   POST /auth/register → create new user
#   POST /auth/login    → get JWT token
#   GET  /auth/me       → get current user info
# ─────────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models.user import User, UserProfile
from schemas.user import (
    UserCreate,
    UserRead,
    LoginRequest,
    Token,
    UserProfileCreate,
    UserProfileRead,
    UserStatsRead
)
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── Dependency: Get current logged in user ───────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    """
    This dependency is used in protected routes.
    It reads the JWT token and returns the current user.
    If token is invalid → 401 error automatically.
    """
    email = decode_access_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user = session.exec(
        select(User).where(User.email == email)
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


# ════════════════════════════════════════
#  POST /auth/register
# ════════════════════════════════════════
@router.post("/register", response_model=UserRead)
def register(
    user_data: UserCreate,
    session: Session = Depends(get_session)
):
    """
    Creates a new user account.
    1. Checks if email already exists
    2. Hashes the password
    3. Saves user to database
    4. Auto-creates empty profile
    """
    # Check if email already exists
    existing = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create new user with hashed password
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)



    return new_user


# ════════════════════════════════════════
#  POST /auth/login
# ════════════════════════════════════════
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    """
    Logs in a user and returns a JWT token.
    Accepts form data — compatible with Swagger UI.
    """
    # Find user by email
    user = session.exec(
        select(User).where(User.email == form_data.username)
    ).first()

    # Check user exists and password correct
    if not user or not verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


# ════════════════════════════════════════
#  GET /auth/me
# ════════════════════════════════════════
@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently logged in user.
    Protected route — requires JWT token.
    """
    return current_user


# ════════════════════════════════════════
#  GET /auth/profile
# ════════════════════════════════════════
@router.get("/profile", response_model=UserProfileRead)
def get_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Returns the current user's profile."""
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


# ════════════════════════════════════════
#  GET /auth/stats
# ════════════════════════════════════════
@router.get("/stats", response_model=UserStatsRead)
def get_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Returns stats for the current user."""
    from models.project import Project
    projects = session.exec(
        select(Project).where(Project.user_id == current_user.id)
    ).all()
    return {"total_projects": len(projects), "member_since": current_user.created_at}


# ════════════════════════════════════════
#  PUT /auth/profile
# ════════════════════════════════════════
@router.put("/profile", response_model=UserProfileRead)
def update_profile(
    profile_data: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Updates the current user's profile.
    Protected route — requires JWT token.
    """
    profile = session.exec(
        select(UserProfile).where(
            UserProfile.user_id == current_user.id
        )
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    # Update only fields that were sent
    profile_dict = profile_data.model_dump(exclude_unset=True)
    for key, value in profile_dict.items():
        setattr(profile, key, value)

    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile