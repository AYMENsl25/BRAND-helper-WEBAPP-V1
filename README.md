# BELIS  AI-Powered Brand Identity & Startup Validation Platform

> "Building the core of your brand and make your ideas real."

BELIS is a full-stack web application that helps entrepreneurs validate their startup ideas and generate complete brand identities using AI.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Database | MySQL + SQLModel |
| AI | Google Gemini API |
| Frontend | React + Vite |
| Styling | CSS-in-JS (inline styles) |
| Auth | JWT Tokens |

---

## 👥 Team Structure

| Role | Responsibilities |
|---|---|
| **Aymen** | Merging PRs, deployment, linking frontend ↔ backend, report |
| **Backend Developer (RAFIK)** | FastAPI endpoints, database, AI integration |
| **Frontend Developer (AMRO)** | React pages, API calls, state management |
| **UI/UX Designer (AMR)** | Styling, animations, presentation, Figma |

---

## 📁 Project Structure

```
BELIS/
├── backend/                  ← FastAPI Python app
│   ├── main.py               ← Entry point
│   ├── database.py           ← MySQL connection
│   ├── .env                  ← Secret keys (never push!)
│   ├── .env.example          ← Template for .env
│   ├── requirements.txt      ← Python packages
│   ├── core/
│   │   ├── config.py         ← Settings from .env
│   │   └── security.py       ← JWT + password hashing
│   ├── models/               ← SQLModel database tables
│   │   ├── user.py           ← User, UserProfile
│   │   ├── project.py        ← Project, Tag, Feedback, SavedResource
│   │   ├── analysis.py       ← Analysis, Competitor, MarketSegment...
│   │   └── brand_asset.py    ← BrandAsset, ColorPalette, LogoPrompt
│   ├── schemas/              ← Pydantic validation schemas
│   │   └── project.py
│   ├── routers/              ← API endpoints
│   │   ├── auth.py           ← /auth/*
│   │   ├── projects.py       ← /projects/*
│   │   ├── analysis.py       ← /analysis/*
│   │   ├── brand.py          ← /brand/*
│   │   ├── feedback.py       ← /feedback/*
│   │   └── resources.py      ← /resources/*
│   └── services/             ← Business logic
│       └── ai_service.py
│
└── frontend/                 ← React Vite app
    ├── src/
    │   ├── main.jsx          ← Entry point
    │   ├── App.jsx           ← Routes
    │   ├── api/
    │   │   └── client.js     ← Axios instance
    │   ├── context/
    │   │   └── AuthContext.jsx ← Global auth state
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   └── pages/
    │       ├── Home.jsx
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Dashboard.jsx
    │       ├── Lab.jsx       ← 5-step wizard
    │       └── ProjectDetail.jsx
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL (via MySQL Workbench or WAMP)
- Git

---

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/BELIS.git
cd BELIS/backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install packages
pip install -r requirements.txt

# 5. Create .env file
cp .env.example .env
# Fill in your MySQL password and API keys

# 6. Create MySQL database
# Open MySQL Workbench and run:
# CREATE DATABASE brandforge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 7. Run the server
uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`
Swagger UI: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
# 1. Go to frontend folder
cd BELIS/frontend

# 2. Install packages
npm install --legacy-peer-deps

# 3. Run the dev server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

### .env File Template

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=brandforge

SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

GEMINI_API_KEY=your_gemini_api_key

APP_NAME=BrandForge
APP_VERSION=1.0.0
```

---

## 🌿 Git Workflow

### Branch Structure:
```
main     → stable production code (protected)
dev      → integration branch (merge here first)
backend  → backend teammate works here
frontend → frontend teammate works here
design   → UI/UX teammate works here
```



## 🌐 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Create account | No |
| POST | /auth/login | Login | No |
| GET | /auth/me | Get current user | Yes |
| PUT | /auth/profile | Update profile | Yes |
| GET | /projects/ | List my projects | Yes |
| POST | /projects/ | Create project | Yes |
| GET | /projects/{id} | Get one project | Yes |
| PUT | /projects/{id} | Update project | Yes |
| DELETE | /projects/{id} | Delete project | Yes |
| POST | /analysis/{id}/analyze | Trigger AI analysis | Yes |
| GET | /analysis/{id} | Get analysis | Yes |
| GET | /analysis/{id}/competitors | Get competitors | Yes |
| POST | /brand/{id}/generate | Generate brand | Yes |
| GET | /brand/{id} | Get brand | Yes |
| POST | /feedback/ | Submit rating | Yes |
| GET | /feedback/{id} | Get project feedback | Yes |
| POST | /resources/ | Save a link | Yes |
| GET | /resources/ | Get my saved links | Yes |
| DELETE | /resources/{id} | Delete saved link | Yes |

---

## 🗄️ Database

15 tables in MySQL (InnoDB):
- users, user_profiles
- projects, tags, project_tags
- analyses, competitors, competitor_features
- market_segments, differentiation_points
- brand_assets, color_palettes, logo_prompts
- feedbacks, saved_resources

---

## 📞 Contact

Project Manager: Aymen — [your email]
