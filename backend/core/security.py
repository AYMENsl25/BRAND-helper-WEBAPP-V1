# core/security.py
# ─────────────────────────────────────────────────────
# Handles password hashing and JWT tokens
# ─────────────────────────────────────────────────────

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from core.config import settings

# ── Password Hashing ─────────────────────────────────
# bcrypt automatically salts and hashes passwords
# NEVER store plain text passwords!
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Converts plain password to hashed version."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if plain password matches the hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Tokens ───────────────────────────────────────
def create_access_token(data: dict) -> str:
    """
    Creates a JWT token that expires after X minutes.
    The token contains the user's email inside it.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def decode_access_token(token: str) -> str:
    """
    Decodes JWT token and returns the email inside it.
    Returns None if token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        return email
    except JWTError:
        return None
