# models/project.py
# ─────────────────────────────────────────────────────
# Entities 3, 4, 5, 14, 15:
# Project + Tag + ProjectTag + Feedback + SavedResource
# ─────────────────────────────────────────────────────

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime


# ═══════════════════════════════════════════
#  ENTITY 3 — Project
#  MySQL table: projects
# ═══════════════════════════════════════════
class Project(SQLModel, table=True):
    __tablename__ = "projects"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    user_id: int = Field(foreign_key="users.id")
    title: str = Field(max_length=191)
    description: str
    industry: Optional[str] = Field(
        default=None,
        max_length=100
    )
    stage: str = Field(
        default="idea",
        max_length=50
    )
    is_favourite: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )
    updated_at: Optional[datetime] = Field(default=None)

    # Relationships
    user: Optional["User"] = Relationship(
        back_populates="projects"
    )
    project_tags: List["ProjectTag"] = Relationship(
        back_populates="project"
    )
    analysis: Optional["Analysis"] = Relationship(
        back_populates="project"
    )
    brand_asset: Optional["BrandAsset"] = Relationship(
        back_populates="project"
    )
    feedbacks: List["Feedback"] = Relationship(
        back_populates="project"
    )


# ═══════════════════════════════════════════
#  ENTITY 5 — Tag
#  MySQL table: tags
# ═══════════════════════════════════════════
class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    name: str = Field(unique=True, max_length=50)
    description: Optional[str] = Field(
        default=None,
        max_length=191
    )

    project_tags: List["ProjectTag"] = Relationship(
        back_populates="tag"
    )


# ═══════════════════════════════════════════
#  ENTITY 4 — ProjectTag
#  MySQL table: project_tags
#  Junction table — many:many between
#  Project and Tag
# ═══════════════════════════════════════════
class ProjectTag(SQLModel, table=True):
    __tablename__ = "project_tags"

    project_id: Optional[int] = Field(
        default=None,
        foreign_key="projects.id",
        primary_key=True
    )
    tag_id: Optional[int] = Field(
        default=None,
        foreign_key="tags.id",
        primary_key=True
    )

    project: Optional[Project] = Relationship(
        back_populates="project_tags"
    )
    tag: Optional[Tag] = Relationship(
        back_populates="project_tags"
    )


# ═══════════════════════════════════════════
#  ENTITY 14 — Feedback
#  MySQL table: feedbacks
# ═══════════════════════════════════════════
class Feedback(SQLModel, table=True):
    __tablename__ = "feedbacks"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    user_id: int = Field(foreign_key="users.id")
    project_id: int = Field(foreign_key="projects.id")
    rating: int      # 1 to 5
    comment: Optional[str] = Field(default=None)
    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    user: Optional["User"] = Relationship(
        back_populates="feedbacks"
    )
    project: Optional[Project] = Relationship(
        back_populates="feedbacks"
    )


# ═══════════════════════════════════════════
#  ENTITY 15 — SavedResource
#  MySQL table: saved_resources
# ═══════════════════════════════════════════
class SavedResource(SQLModel, table=True):
    __tablename__ = "saved_resources"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    user_id: int = Field(foreign_key="users.id")
    title: str = Field(max_length=191)
    url: str = Field(max_length=191)
    category: str = Field(
        default="article",
        max_length=50
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=191
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    user: Optional["User"] = Relationship(
        back_populates="saved_resources"
    )


## Quick note on ProjectTag:
'''
Project ←→ ProjectTag ←→ Tag

One project can have many tags:
  "BrandForge" → ["AI", "SaaS", "B2B"]

One tag can be on many projects:
  "AI" → ["BrandForge", "ChatApp", "HealthBot"]

ProjectTag is the BRIDGE between them
It has NO id — the primary key is
the COMBINATION of project_id + tag_id ✅
'''