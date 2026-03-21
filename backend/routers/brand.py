# routers/brand.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.project import Project
from models.analysis import Analysis
from models.brand_asset import BrandAsset, ColorPalette, LogoPrompt
from schemas.project import BrandAssetRead
from routers.auth import get_current_user
from models.user import User
from dotenv import load_dotenv
import httpx
import json
import os



load_dotenv()
router = APIRouter()


# ── Gemini AI Call ────────────────────────────────────
async def call_gemini_brand(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "")
    print(f"🔑 Brand API Key: {api_key[:15]}..." if api_key else "❌ NO API KEY!")

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
            print(f"📡 Brand Gemini status: {response.status_code}")
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"❌ Brand Gemini error: {e}")
        return None


async def generate_logo_image(prompt: str) -> str:
    try:
        api_key = os.getenv("HUGGINGFACE_API_KEY", "")
        if not api_key:
            print("❌ No HuggingFace API key!")
            return None

        url = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
        
        headers = {"Authorization": f"Bearer {api_key}"}
        
        payload = {

                     "inputs": f"minimalist flat logo icon, {prompt}, vector art, single color, white background, professional brand identity, clean simple shapes, no text, no words, geometric design, high quality",
                    "parameters": {
                            "num_inference_steps": 30,
                            "guidance_scale": 7.5,
                            "width": 512,
                            "height": 512,
                            }
                }
        

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload,
                timeout=60
            )
            
            print(f"📡 HuggingFace status: {response.status_code}")
            
            if response.status_code == 200:
                # Save image to file instead of base64
                import uuid
                filename = f"logo_{uuid.uuid4().hex[:8]}.jpg"
                filepath = f"static/{filename}"
                
                # Create static folder if not exists
                os.makedirs("static", exist_ok=True)
                
                with open(filepath, "wb") as f:
                    f.write(response.content)
                
                image_url = f"http://localhost:8000/static/{filename}"
                print(f"✅ Logo saved: {image_url}")
                return image_url
            else:
                print(f"❌ HuggingFace error: {response.text}")
                return None

    except Exception as e:
        print(f"❌ Logo generation error: {e}")
        return None

# ── Mock brand data fallback ──────────────────────────
def get_mock_brand(title: str) -> dict:
    return {
        "tagline": f"{title} — Where innovation meets opportunity",
        "brand_voice": "Professional yet approachable",
        "personality_type": "The Innovator",
        "mission_statement": f"To make {title} accessible and valuable to everyone",
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
# ════════════════════════════════════════
@router.post("/{project_id}/generate", response_model=BrandAssetRead)
async def generate_brand(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
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

    # Build AI prompt
    prompt = f"""
    Create a complete brand identity for this startup and respond ONLY with a JSON object:

    Company Name: {project.title}
    Description: {project.description}
    Industry: {project.industry}
    Stage: {project.stage}
    Viability Score: {analysis.viability_score}
    Market Size: {analysis.estimated_market_size}

    Return this EXACT JSON structure:
    {{
        "tagline": "a short catchy tagline (max 10 words)",
        "brand_voice": "e.g. Bold and direct, Warm and friendly, Professional yet approachable",
        "personality_type": "e.g. The Innovator, The Guide, The Hero, The Creator",
        "mission_statement": "one sentence mission statement",
        "colors": {{
            "palette_name": "a creative palette name",
            "primary": "#hexcode",
            "secondary": "#hexcode",
            "accent": "#hexcode",
            "background": "#hexcode",
            "text": "#hexcode"
        }},
        "logo_prompt": "detailed prompt for logo generation"
    }}

    Make the brand identity unique and fitting for the industry and personality.
    Colors should reflect the brand personality.
    Return ONLY the JSON, no other text.
    """

    # Call Gemini AI
    ai_response = await call_gemini_brand(prompt)

    if ai_response:
        try:
            clean = ai_response.strip()
            if "```json" in clean:
                clean = clean.split("```json")[1].split("```")[0]
            elif "```" in clean:
                clean = clean.split("```")[1].split("```")[0]
            data = json.loads(clean)
            print("✅ Brand generated by Gemini AI!")
        except Exception as e:
            print(f"❌ JSON parse error: {e}")
            data = get_mock_brand(project.title)
    else:
        print("⚠️ Using mock brand data")
        data = get_mock_brand(project.title)

    # Save BrandAsset
    brand = BrandAsset(
        project_id=project_id,
        tagline=data.get("tagline"),
        brand_voice=data.get("brand_voice"),
        personality_type=data.get("personality_type"),
        mission_statement=data.get("mission_statement"),
    )
    session.add(brand)
    session.commit()
    session.refresh(brand)

    # Save ColorPalette
    colors = data.get("colors", {})
    palette = ColorPalette(
        brand_asset_id=brand.id,
        palette_name=colors.get("palette_name", "Custom"),
        primary_hex=colors.get("primary", "#2D3748"),
        secondary_hex=colors.get("secondary", "#4299E1"),
        accent_hex=colors.get("accent", "#48BB78"),
        background_hex=colors.get("background", "#F7FAFC"),
        text_hex=colors.get("text", "#1A202C"),
    )
    session.add(palette)

# Generate real logo image
    logo_prompt_text = data.get("logo_prompt", f"Minimalist logo for {project.title}")
    print(f"🎨 Generating logo for: {project.title}")
    image_url = await generate_logo_image(logo_prompt_text)

    # Save LogoPrompt
    logo = LogoPrompt(
        brand_asset_id=brand.id,
        prompt_text=logo_prompt_text,
        image_url=image_url,
        style="minimalist",
        is_selected=True,
    )
    session.add(logo)
    session.commit()
    session.refresh(brand)
    return brand


# ════════════════════════════════════════
#  GET /brand/{project_id}
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