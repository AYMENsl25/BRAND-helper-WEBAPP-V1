# models/user.py
# ─────────────────────────────────────────────────────
# Entities 1 & 2:  User + UserProfile
#
# IMPORTANT CONCEPT:
# Each class = one MySQL table
# Each attribute = one column
# table=True → tells SQLModel to create a real table
# ─────────────────────────────────────────────────────

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime


# ═══════════════════════════════════════════
#  ENTITY 1 — User
#  MySQL table: users
# ═══════════════════════════════════════════
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    email: str = Field(
        unique=True,
        index=True,
        max_length=191
    )
    password_hash: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    # Relationships
    profile: Optional["UserProfile"] = Relationship(
        back_populates="user"
    )
    projects: List["Project"] = Relationship(
        back_populates="user"
    )
    feedbacks: List["Feedback"] = Relationship(
        back_populates="user"
    )
    saved_resources: List["SavedResource"] = Relationship(
        back_populates="user"
    )


# ═══════════════════════════════════════════
#  ENTITY 2 — UserProfile
#  MySQL table: user_profiles
#  1:1 with User
# ═══════════════════════════════════════════
class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    user_id: int = Field(
        foreign_key="users.id",
        unique=True
    )
    full_name: Optional[str] = Field(
        default=None,
        max_length=100
    )
    country: Optional[str] = Field(
        default=None,
        max_length=100
    )
    role: Optional[str] = Field(
        default="founder",
        max_length=50
    )
    avatar_url: Optional[str] = Field(
        default=None,
        max_length=191
    )
    bio: Optional[str] = Field(default=None)

    # Relationship back to User
    user: Optional[User] = Relationship(
        back_populates="profile"
    )


## What is happening here?
'''
class User(SQLModel, table=True):
      ↑                    ↑
  Python class         Makes a real
                       MySQL table

__tablename__ = "users"
→ Must match EXACTLY your MySQL table name

id: Optional[int] = Field(primary_key=True)
→ Same as: id INT AUTO_INCREMENT PRIMARY KEY

email: str = Field(unique=True, max_length=191)
→ Same as: email VARCHAR(191) UNIQUE

user_id: int = Field(foreign_key="users.id")
→ Same as: FOREIGN KEY (user_id) REFERENCES users(id)

Relationship(back_populates="user")
→ Lets you do: user.projects to get all projects
→ Or: project.user to get the owner
→ No extra SQL needed — SQLModel handles it
'''