# routers/analysis.py
# ─────────────────────────────────────────────────────
# Endpoints:
#   POST /analysis/{project_id}/analyze  → trigger AI analysis
#   GET  /analysis/{project_id}          → get analysis results
#   GET  /analysis/{project_id}/competitors → get competitors
# ─────────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.project import Project
from models.analysis import (
    Analysis,
    Competitor,
    CompetitorFeature,
    MarketSegment,
    DifferentiationPoint
)
from schemas.project import AnalysisRead
from routers.auth import get_current_user
from models.user import User
from typing import List
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# ── Gemini AI Helper Function ─────────────────────────
async def call_gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "")
    print(f"🔑 API Key: {api_key[:15]}..." if api_key else "❌ NO API KEY!")

    if not api_key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={api_key}"

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30)
            print(f"📡 Gemini status: {response.status_code}")
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"❌ Gemini error: {e}")
        return None


# ── Mock data for testing without API key ────────────
def get_mock_analysis(title: str, description: str) -> dict:
    return {
        "viability_score": 75,
        "summary": f"{title} is a promising startup idea with strong market potential.",
        "strengths": "Innovative approach, clear target market, scalable model",
        "weaknesses": "High competition, requires significant initial investment",
        "opportunities": "Growing market demand, potential for partnerships",
        "threats": "Established competitors, rapid technology changes",
        "estimated_market_size": "$2.5 Billion",
        "target_region": "North America, Europe",
        "competitors": [
            {
                "name": "Competitor A",
                "website": "https://competitorA.com",
                "description": "Leading player in this space",
                "country": "USA",
                "features": [
                    {"name": "Feature 1", "is_free": True},
                    {"name": "Feature 2", "is_free": False}
                ]
            },
            {
                "name": "Competitor B",
                "website": "https://competitorB.com",
                "description": "Growing startup with similar offering",
                "country": "UK",
                "features": [
                    {"name": "Feature 1", "is_free": False}
                ]
            }
        ],
        "market_segments": [
            {
                "name": "Young Professionals",
                "age_range": "25-35",
                "location": "Urban areas",
                "behavior": "Tech-savvy, mobile-first",
                "size": "50M people"
            }
        ],
        "differentiation_points": [
            {
                "title": "AI-Powered Automation",
                "description": "Use AI to automate manual processes",
                "priority": "high"
            },
            {
                "title": "Better UX",
                "description": "Focus on simplicity vs competitors",
                "priority": "medium"
            }
        ]
    }


# ════════════════════════════════════════
#  POST /analysis/{project_id}/analyze
#  Trigger AI analysis for a project
# ════════════════════════════════════════
@router.post("/{project_id}/analyze", response_model=AnalysisRead)
async def analyze_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Triggers AI analysis for a project.
    Uses Gemini AI to generate:
    - Viability score
    - SWOT analysis
    - Competitor research
    - Market segments
    - Differentiation points
    """
    # Get the project
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if analysis already exists
    existing = session.exec(
        select(Analysis).where(Analysis.project_id == project_id)
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Analysis already exists for this project. Delete it first to regenerate."
        )

    # Build the AI prompt
    prompt = f"""
    Analyze this startup idea and respond ONLY with a JSON object:

    Title: {project.title}
    Description: {project.description}
    Industry: {project.industry}
    Stage: {project.stage}

    Return this exact JSON structure:
    {{
        "viability_score": (number 0-100),
        "summary": "brief summary",
        "strengths": "key strengths",
        "weaknesses": "key weaknesses",
        "opportunities": "market opportunities",
        "threats": "main threats",
        "estimated_market_size": "e.g. $5 Billion",
        "target_region": "specific regions e.g. North America, Europe, Asia (REQUIRED - do not leave empty)",
        "competitors": [
            {{
                "name": "company name",
                "website": "url",
                "description": "what they do",
                "country": "country",
                "features": [
                    {{"name": "feature name", "is_free": true/false}}
                ]
            }}
        ],
        "market_segments": [
            {{
                "name": "segment name",
                "age_range": "e.g. 25-35",
                "location": "region",
                "behavior": "description",
                "size": "e.g. 10M people"
            }}
        ],
        "differentiation_points": [
            {{
                "title": "point title",
                "description": "explanation",
                "priority": "high/medium/low"
            }}
        ]
    }}
    """

    # Call Gemini or use mock data
    ai_response = await call_gemini(prompt)

    if ai_response:
        try:
            # Clean response and parse JSON
            clean = ai_response.strip()
            if "```json" in clean:
                clean = clean.split("```json")[1].split("```")[0]
            elif "```" in clean:
                clean = clean.split("```")[1].split("```")[0]
            data = json.loads(clean)
        except:
            data = get_mock_analysis(project.title, project.description)
    else:
        data = get_mock_analysis(project.title, project.description)

    # Save Analysis to database
    analysis = Analysis(
        project_id=project_id,
        viability_score=data.get("viability_score"),
        summary=data.get("summary"),
        strengths=data.get("strengths"),
        weaknesses=data.get("weaknesses"),
        opportunities=data.get("opportunities"),
        threats=data.get("threats"),
        estimated_market_size=data.get("estimated_market_size"),
        target_region=data.get("target_region"),
    )
    session.add(analysis)
    session.commit()
    session.refresh(analysis)

    # Save Competitors
    for comp_data in data.get("competitors", []):
        competitor = Competitor(
            analysis_id=analysis.id,
            name=comp_data.get("name"),
            website=comp_data.get("website"),
            description=comp_data.get("description"),
            country=comp_data.get("country"),
        )
        session.add(competitor)
        session.commit()
        session.refresh(competitor)

        # Save Competitor Features
        for feat in comp_data.get("features", []):
            feature = CompetitorFeature(
                competitor_id=competitor.id,
                feature_name=feat.get("name"),
                is_free=feat.get("is_free"),
            )
            session.add(feature)

    # Save Market Segments
    for seg_data in data.get("market_segments", []):
        segment = MarketSegment(
            analysis_id=analysis.id,
            segment_name=seg_data.get("name"),
            age_range=seg_data.get("age_range"),
            location=seg_data.get("location"),
            behavior_description=seg_data.get("behavior"),
            estimated_size=seg_data.get("size"),
        )
        session.add(segment)

    # Save Differentiation Points
    for diff_data in data.get("differentiation_points", []):
        point = DifferentiationPoint(
            analysis_id=analysis.id,
            title=diff_data.get("title"),
            description=diff_data.get("description"),
            priority=diff_data.get("priority", "medium"),
        )
        session.add(point)

    session.commit()
    session.refresh(analysis)
    return analysis


# ════════════════════════════════════════
#  GET /analysis/{project_id}
#  Get analysis for a project
# ════════════════════════════════════════
@router.get("/{project_id}", response_model=AnalysisRead)
def get_analysis(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis = session.exec(
        select(Analysis).where(Analysis.project_id == project_id)
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found")
    return analysis


# ════════════════════════════════════════
#  GET /analysis/{project_id}/competitors
#  Get competitors for a project
# ════════════════════════════════════════
@router.get("/{project_id}/competitors")
def get_competitors(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis = session.exec(
        select(Analysis).where(Analysis.project_id == project_id)
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found")

    competitors = session.exec(
        select(Competitor).where(Competitor.analysis_id == analysis.id)
    ).all()
    return competitors
