# routers/brand.py
# ─────────────────────────────────────────────────────
# Endpoints:
#   POST /brand/{project_id}/generate → generate brand
#   GET  /brand/{project_id}          → get brand assets
# ─────────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.project import Project
from models.analysis import Analysis
from models.brand_asset import BrandAsset, ColorPalette, LogoPrompt
from schemas.project import BrandAssetRead
from routers.auth import get_current_user
from models.user import User
import json

router = APIRouter()


# ── Mock brand data for testing ───────────────────────
def get_mock_brand(title: str) -> dict:
    return {
        "tagline": f"{title} — Where great design meets opportunity",
        "brand_voice": "Professional yet approachable",
        "personality_type": "The Innovator",
        "mission_statement": f"To make {title} accessible to everyone",
        "colors": {
            "palette_name": "Modern Tech",
            "primary": "#2D3748",
            "secondary": "#4299E1",
            "accent": "#48BB78",
            "background": "#F7FAFC",
            "text": "#1A202C"
        },
        "logo_prompt": f"Minimalist logo for {title}, modern, clean, tech startup style"
    }


# ════════════════════════════════════════
#  POST /brand/{project_id}/generate
#  Generate brand identity for a project
# ════════════════════════════════════════
@router.post("/{project_id}/generate", response_model=BrandAssetRead)
async def generate_brand(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Generates full brand identity:
    - Tagline
    - Brand voice and personality
    - Color palette
    - Logo prompt
    Requires analysis to exist first.
    """
    # Get project
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check analysis exists
    analysis = session.exec(
        select(Analysis).where(Analysis.project_id == project_id)
    ).first()
    if not analysis:
        raise HTTPException(
            status_code=400,
            detail="Please run analysis first before generating brand"
        )

    # Check if brand already exists
    existing = session.exec(
        select(BrandAsset).where(BrandAsset.project_id == project_id)
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Brand already exists. Delete it first to regenerate."
        )

    # Use mock data for now
    data = get_mock_brand(project.title)

    # Save BrandAsset
    brand = BrandAsset(
        project_id=project_id,
        tagline=data["tagline"],
        brand_voice=data["brand_voice"],
        personality_type=data["personality_type"],
        mission_statement=data["mission_statement"],
    )
    session.add(brand)
    session.commit()
    session.refresh(brand)

    # Save ColorPalette
    colors = data["colors"]
    palette = ColorPalette(
        brand_asset_id=brand.id,
        palette_name=colors["palette_name"],
        primary_hex=colors["primary"],
        secondary_hex=colors["secondary"],
        accent_hex=colors["accent"],
        background_hex=colors["background"],
        text_hex=colors["text"],
    )
    session.add(palette)

    # Save LogoPrompt
    logo = LogoPrompt(
        brand_asset_id=brand.id,
        prompt_text=data["logo_prompt"],
        style="minimalist",
    )
    session.add(logo)
    session.commit()
    session.refresh(brand)
    return brand


# ════════════════════════════════════════
#  GET /brand/{project_id}
#  Get brand assets for a project
# ════════════════════════════════════════
@router.get("/{project_id}", response_model=BrandAssetRead)
def get_brand(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    brand = session.exec(
        select(BrandAsset).where(BrandAsset.project_id == project_id)
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="No brand found")
    return brand