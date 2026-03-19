# BELIS — Brand Identity & Startup Validation Platform

> *"Building the core of your brand."*

BELIS is an AI-powered web application that helps entrepreneurs and startups build, validate, and visualize their brand identity. From SWOT analysis to AI-generated logos and downloadable brand kits — BELIS brings everything together in one place.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Team](#team)

---

## Overview

BELIS combines market intelligence, brand identity generation, and design tooling into a single platform. Users can create project ideas, run AI-powered analysis, generate brand assets, and export a complete brand kit PDF — all in a dark-mode aurora aesthetic.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | UI framework |
| React Router | Client-side routing |
| Axios | API communication |
| react-simple-maps | Interactive world map |
| jsPDF | PDF brand kit export |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| SQLModel | ORM + schema validation |
| MySQL | Relational database |
| JWT | Authentication |
| Uvicorn | ASGI server |

### AI & External Services
| Service | Purpose |
|---|---|
| Google Gemini (gemini-2.5-flash-lite) | SWOT analysis + brand generation |
| HuggingFace FLUX.1-schnell | AI logo image generation |

---

## Features

### Authentication
- Register and login with JWT tokens
- Protected routes with automatic redirect
- Persistent session via localStorage

### Project Management
- Create, view, and delete brand projects
- Search and filter by stage (idea / MVP / launched) and industry
- Pagination support (10 projects per page)
- Tag system for categorization

### AI Analysis
- SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
- Viability score (0–100) with visual circular indicator
- Market size estimation (TAM / SAM)
- Target region and competitor identification

### Brand Identity & Kit
- AI-generated tagline, brand voice, personality type, and mission statement
- AI-generated logo via HuggingFace FLUX.1-schnell
- **3D Logo Studio** — hover to tilt, float animation, shine effect
- **Logo Variants** — Primary (full color), Minimal (grayscale), Inverted (dark background)
- **Logo Download** — exports with selected variant style applied
- **Color Harmony** — Original, Complementary, Analogous, Triadic palettes
- **60-30-10 Rule** — visual color distribution guide
- **Live Type Scale** — 5 font options with Bold/Medium/Regular preview
- **3D Business Card** — mouse-tilt perspective effect, live customization
- **PDF Brand Kit** — logo, palette, typography, business card, letterhead

### Market Intelligence
- Interactive world map highlighting target regions by industry
- TAM / SAM / Demographic metrics row
- Market growth trend chart with glowing line animation

### Feedback System
- Star rating (1–5) per project
- Optional comment
- One feedback submission per user per project

### Resources Library
- Save and organize useful links per project

---

## Project Structure

```
BRAND helper WEBAPP V1/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── core/
│   │   └── config.py            # Environment config
│   ├── models/                  # SQLModel database models
│   ├── schemas/                 # Pydantic schemas
│   ├── routers/
│   │   ├── auth.py              # /auth/* endpoints
│   │   ├── projects.py          # /projects/* endpoints
│   │   ├── analysis.py          # /analysis/* + Gemini AI
│   │   ├── brand.py             # /brand/* + HuggingFace
│   │   ├── feedback.py          # /feedback/* endpoints
│   │   └── resources.py         # /resources/* endpoints
│   ├── static/                  # Generated logo images
│   └── .env                     # Environment variables
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js        # Axios instance
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Toast.jsx
    │   └── pages/
    │       ├── Home.jsx         # Landing page
    │       ├── Login.jsx        # Login page
    │       ├── Register.jsx     # Register page
    │       ├── Dashboard.jsx    # Projects grid
    │       ├── Lab.jsx          # 5-step identity wizard
    │       ├── ProjectDetail.jsx # Analysis/Market/Brand tabs
    │       ├── Profile.jsx      # User settings
    │       └── Resources.jsx    # Saved links
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL (MySQL80 Windows Service or equivalent)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Database Setup

```sql
CREATE DATABASE brandforge;
```

Then import the SQL schema:
```bash
mysql -u root -p brandforge < brandforge.sql
```

---

## Environment Variables

Create a `.env` file in the `backend/` folder:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=brandforge

# Auth
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# AI Services
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# App
APP_NAME=BrandForge
APP_VERSION=1.0.0
```

### Getting API Keys

| Service | URL |
|---|---|
| Gemini API | https://aistudio.google.com/app/apikey |
| HuggingFace | https://huggingface.co/settings/tokens |

> **Note:** Gemini free tier allows 500 requests/day on `gemini-2.5-flash-lite`. If you hit the limit, the app falls back to mock brand data.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login + get JWT token |
| GET | `/auth/me` | Get current user |
| GET | `/projects/` | List projects (search, filter, pagination) |
| POST | `/projects/` | Create project |
| GET | `/projects/{id}` | Get single project |
| DELETE | `/projects/{id}` | Delete project |
| GET | `/analysis/{id}` | Get SWOT analysis |
| POST | `/analysis/{id}/generate` | Generate AI analysis |
| GET | `/analysis/{id}/competitors` | Get competitors |
| GET | `/brand/{id}` | Get brand assets |
| POST | `/brand/{id}/generate` | Generate brand + logo |
| GET | `/feedback/{id}` | Get project feedback |
| POST | `/feedback/` | Submit feedback |
| GET | `/resources/` | Get saved resources |
| POST | `/resources/` | Save resource |

---

## Branch Strategy

```
main                  → stable, production-ready
dev---Aymen           → Aymen's integration branch
Frontend-design       → teammate's feature branch
```

---

## Team

| Member | Role |
|---|---|
| Aymen | Backend, AI integration, Frontend core |
| Teammate | Frontend design, Kit Maker, Profile, Resources |

---

## Database

15 tables in 4NF with full foreign key constraints, 3 triggers, and 3 views.

Key tables: `users`, `projects`, `project_tags`, `analyses`, `swot_items`, `competitors`, `brand_assets`, `color_palettes`, `logo_prompts`, `feedback`, `resources`

---

## Roadmap

```
✅ Phase 1 — Database design
✅ Phase 2 — Backend API
✅ Phase 3 — AI integration
✅ Phase 4 — Frontend
✅ Phase 5 — Team collaboration + merges
🔜 Phase 6 — Deployment (Railway + Vercel)
🔜 Phase 7 — Project report + presentation
```

---

<div align="center">
  <p>Built with ❤️ by the BELIS team</p>
  <p><em>"You make beauty" — Building the core of your brand.</em></p>
</div>
