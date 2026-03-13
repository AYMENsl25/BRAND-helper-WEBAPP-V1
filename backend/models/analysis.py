# models/analysis.py
# ─────────────────────────────────────────────────────
# Entities 6, 7, 8, 9, 10:
# Analysis + Competitor + CompetitorFeature
# + MarketSegment + DifferentiationPoint
# ─────────────────────────────────────────────────────

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime


# ═══════════════════════════════════════════
#  ENTITY 6 — Analysis
#  MySQL table: analyses
#  1:1 with Project
# ═══════════════════════════════════════════
class Analysis(SQLModel, table=True):
    __tablename__ = "analyses"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    project_id: int = Field(
        foreign_key="projects.id",
        unique=True        # 1:1 with project
    )
    viability_score: Optional[int] = Field(
        default=None
    )
    summary: Optional[str] = Field(default=None)

    # SWOT fields — filled by AI
    strengths: Optional[str] = Field(default=None)
    weaknesses: Optional[str] = Field(default=None)
    opportunities: Optional[str] = Field(default=None)
    threats: Optional[str] = Field(default=None)

    estimated_market_size: Optional[str] = Field(
        default=None,
        max_length=191
    )
    target_region: Optional[str] = Field(
        default=None,
        max_length=191
    )
    generated_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    # Relationships
    project: Optional["Project"] = Relationship(
        back_populates="analysis"
    )
    competitors: List["Competitor"] = Relationship(
        back_populates="analysis"
    )
    market_segments: List["MarketSegment"] = Relationship(
        back_populates="analysis"
    )
    differentiation_points: List["DifferentiationPoint"] = Relationship(
        back_populates="analysis"
    )


# ═══════════════════════════════════════════
#  ENTITY 7 — Competitor
#  MySQL table: competitors
#  Many per Analysis
# ═══════════════════════════════════════════
class Competitor(SQLModel, table=True):
    __tablename__ = "competitors"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    analysis_id: int = Field(
        foreign_key="analyses.id"
    )
    name: str = Field(max_length=191)
    website: Optional[str] = Field(
        default=None,
        max_length=191
    )
    description: Optional[str] = Field(default=None)
    founded_year: Optional[int] = Field(default=None)
    funding_stage: Optional[str] = Field(
        default=None,
        max_length=100
    )
    country: Optional[str] = Field(
        default=None,
        max_length=100
    )

    # Relationships
    analysis: Optional[Analysis] = Relationship(
        back_populates="competitors"
    )
    features: List["CompetitorFeature"] = Relationship(
        back_populates="competitor"
    )


# ═══════════════════════════════════════════
#  ENTITY 8 — CompetitorFeature
#  MySQL table: competitor_features
#  Many per Competitor
# ═══════════════════════════════════════════
class CompetitorFeature(SQLModel, table=True):
    __tablename__ = "competitor_features"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    competitor_id: int = Field(
        foreign_key="competitors.id"
    )
    feature_name: str = Field(max_length=191)
    description: Optional[str] = Field(default=None)
    is_free: Optional[bool] = Field(default=None)

    competitor: Optional[Competitor] = Relationship(
        back_populates="features"
    )


# ═══════════════════════════════════════════
#  ENTITY 9 — MarketSegment
#  MySQL table: market_segments
#  Many per Analysis
# ═══════════════════════════════════════════
class MarketSegment(SQLModel, table=True):
    __tablename__ = "market_segments"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    analysis_id: int = Field(
        foreign_key="analyses.id"
    )
    segment_name: str = Field(max_length=191)
    age_range: Optional[str] = Field(
        default=None,
        max_length=50
    )
    location: Optional[str] = Field(
        default=None,
        max_length=191
    )
    behavior_description: Optional[str] = Field(
        default=None
    )
    estimated_size: Optional[str] = Field(
        default=None,
        max_length=100
    )

    analysis: Optional[Analysis] = Relationship(
        back_populates="market_segments"
    )


# ═══════════════════════════════════════════
#  ENTITY 10 — DifferentiationPoint
#  MySQL table: differentiation_points
#  Many per Analysis
# ═══════════════════════════════════════════
class DifferentiationPoint(SQLModel, table=True):
    __tablename__ = "differentiation_points"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    analysis_id: int = Field(
        foreign_key="analyses.id"
    )
    title: str = Field(max_length=191)
    description: Optional[str] = Field(default=None)
    priority: str = Field(
        default="medium",
        max_length=20
    )

    analysis: Optional[Analysis] = Relationship(
        back_populates="differentiation_points"
    )

## Quick Summary of what you just built:
'''
Analysis (1)
    ├── has many → Competitors (7)
    │                └── has many → CompetitorFeatures (8)
    ├── has many → MarketSegments (9)
    └── has many → DifferentiationPoints (10)

All connected through foreign keys
All filled automatically by Gemini AI ✅
'''