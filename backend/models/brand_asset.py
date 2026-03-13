# models/brand_asset.py
# ─────────────────────────────────────────────────────
# Entities 11, 12, 13:
# BrandAsset + ColorPalette + LogoPrompt
# ─────────────────────────────────────────────────────

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime


# ═══════════════════════════════════════════
#  ENTITY 11 — BrandAsset
#  MySQL table: brand_assets
#  1:1 with Project
# ═══════════════════════════════════════════
class BrandAsset(SQLModel, table=True):
    __tablename__ = "brand_assets"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    project_id: int = Field(
        foreign_key="projects.id",
        unique=True        # 1:1 with project
    )
    tagline: Optional[str] = Field(
        default=None,
        max_length=191
    )
    brand_voice: Optional[str] = Field(
        default=None,
        max_length=100
    )
    personality_type: Optional[str] = Field(
        default=None,
        max_length=100
    )
    mission_statement: Optional[str] = Field(
        default=None
    )
    generated_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    # Relationships
    project: Optional["Project"] = Relationship(
        back_populates="brand_asset"
    )
    color_palette: Optional["ColorPalette"] = Relationship(
        back_populates="brand_asset"
    )
    logo_prompts: List["LogoPrompt"] = Relationship(
        back_populates="brand_asset"
    )


# ═══════════════════════════════════════════
#  ENTITY 12 — ColorPalette
#  MySQL table: color_palettes
#  1:1 with BrandAsset
# ═══════════════════════════════════════════
class ColorPalette(SQLModel, table=True):
    __tablename__ = "color_palettes"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    brand_asset_id: int = Field(
        foreign_key="brand_assets.id",
        unique=True        # 1:1 with brand_asset
    )
    palette_name: Optional[str] = Field(
        default=None,
        max_length=100
    )

    # All colors stored as HEX codes e.g. #FF5733
    primary_hex: Optional[str] = Field(
        default=None,
        max_length=7
    )
    secondary_hex: Optional[str] = Field(
        default=None,
        max_length=7
    )
    accent_hex: Optional[str] = Field(
        default=None,
        max_length=7
    )
    background_hex: Optional[str] = Field(
        default=None,
        max_length=7
    )
    text_hex: Optional[str] = Field(
        default=None,
        max_length=7
    )

    # Relationship
    brand_asset: Optional[BrandAsset] = Relationship(
        back_populates="color_palette"
    )


# ═══════════════════════════════════════════
#  ENTITY 13 — LogoPrompt
#  MySQL table: logo_prompts
#  Many per BrandAsset
#  (user can generate multiple logo versions)
# ═══════════════════════════════════════════
class LogoPrompt(SQLModel, table=True):
    __tablename__ = "logo_prompts"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )
    brand_asset_id: int = Field(
        foreign_key="brand_assets.id"
    )
    prompt_text: str                    # the AI prompt used
    image_url: Optional[str] = Field(
        default=None,
        max_length=191
    )
    style: Optional[str] = Field(
        default="minimalist",
        max_length=50
    )
    # True = the logo the user chose to keep
    is_selected: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    # Relationship
    brand_asset: Optional[BrandAsset] = Relationship(
        back_populates="logo_prompts"
    )
'''    

## All 4 model files are now done! ✅

Here is the complete picture of what you built:

models/
├── user.py         → User, UserProfile
├── project.py      → Project, Tag, ProjectTag,
│                     Feedback, SavedResource
├── analysis.py     → Analysis, Competitor,
│                     CompetitorFeature,
│                     MarketSegment,
│                     DifferentiationPoint
└── brand_asset.py  → BrandAsset, ColorPalette,
                      LogoPrompt
'''