# main.py
# ─────────────────────────────────────────────────────
# This is the ENTRY POINT of the entire backend.
# When you run: uvicorn main:app --reload
# FastAPI starts here.
# ─────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from core.config import settings
from routers import auth, projects, analysis, brand
# from routers import analysis, brand

# ── Create the FastAPI app ────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Brand Identity & Startup Validation Platform",
)


# ── CORS Middleware ───────────────────────────────────
# This allows our React frontend to call this API
# Without this → browser will block all requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup Event ─────────────────────────────────────
# Runs ONCE when the server starts
# Creates/verifies all tables in MySQL
@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# ── Health Check ──────────────────────────────────────
# First endpoint to test if server is running
# Go to: http://localhost:8000
@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running 🚀",
        "docs": "http://localhost:8000/docs"
    }


# ── Routers ───────────────────────────────────────────
# We will uncomment these as we build them
# ── Routers ───────────────────────────────────────────
from routers import auth
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(brand.router,    prefix="/brand",    tags=["Brand"])
'''

## Your backend folder should now look like this:
```
backend/
├── main.py           ← just created ✅
├── database.py       ✅
├── requirements.txt  ✅
├── .env              ✅
├── core/
│   ├── __init__.py
│   └── config.py     ✅
├── models/
│   ├── __init__.py
│   ├── user.py       ✅
│   ├── project.py    ✅
│   ├── analysis.py   ✅
│   └── brand_asset.py ✅
├── schemas/
│   └── __init__.py
├── routers/
│   └── __init__.py
└── services/
    └── __init__.py
    '''

