# schemas/project.py
# ─────────────────────────────────────────────────────
# Pydantic schemas for Project, Analysis, Brand
# ─────────────────────────────────────────────────────

from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


# ═══════════════════════════════════════════
#  PROJECT SCHEMAS
# ═══════════════════════════════════════════

class ProjectCreate(BaseModel):
    """What client sends when creating a project."""
    title: str
    description: str
    industry: Optional[str] = None
    stage: Optional[str] = "idea"

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

    @field_validator("stage")
    @classmethod
    def stage_must_be_valid(cls, v: str) -> str:
        allowed = ["idea", "mvp", "launched"]
        if v not in allowed:
            raise ValueError(
                f"Stage must be one of: {allowed}"
            )
        return v


class ProjectUpdate(BaseModel):
    """What client sends when updating a project."""
    title: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None


class ProjectRead(BaseModel):
    """What server returns for a project."""
    id: int
    user_id: int
    title: str
    description: str
    industry: Optional[str]
    stage: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
#  FEEDBACK SCHEMAS
# ═══════════════════════════════════════════

class FeedbackCreate(BaseModel):
    project_id: int
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class FeedbackRead(BaseModel):
    id: int
    user_id: int
    project_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
#  SAVED RESOURCE SCHEMAS
# ═══════════════════════════════════════════

class SavedResourceCreate(BaseModel):
    title: str
    url: str
    category: Optional[str] = "article"
    notes: Optional[str] = None


class SavedResourceRead(BaseModel):
    id: int
    user_id: int
    title: str
    url: str
    category: str
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
#  ANALYSIS SCHEMAS
# ═══════════════════════════════════════════

class AnalysisRead(BaseModel):
    id: int
    project_id: int
    viability_score: Optional[int]
    summary: Optional[str]
    strengths: Optional[str]
    weaknesses: Optional[str]
    opportunities: Optional[str]
    threats: Optional[str]
    estimated_market_size: Optional[str]
    generated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
#  BRAND SCHEMAS
# ═══════════════════════════════════════════

class ColorPaletteRead(BaseModel):
    id: int
    primary_hex: Optional[str]
    secondary_hex: Optional[str]
    accent_hex: Optional[str]
    background_hex: Optional[str]
    palette_name: Optional[str]

    model_config = {"from_attributes": True}


class BrandAssetRead(BaseModel):
    id: int
    project_id: int
    tagline: Optional[str]
    brand_voice: Optional[str]
    personality_type: Optional[str]
    mission_statement: Optional[str]
    color_palette: Optional[ColorPaletteRead]

    model_config = {"from_attributes": True}
'''

## How Pydantic validation works:
```
Client sends POST /register:
{
  "email": "notanemail",
  "password": "123"
}

Pydantic checks automatically:
  ❌ email is not valid
  ❌ password less than 8 chars

FastAPI returns automatically:
{
  "detail": [
    { "msg": "value is not a valid email" },
    { "msg": "Password must be at least 8 characters" }
  ]
}

No extra code needed — Pydantic does it all ✅
'''