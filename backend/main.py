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
from routers import auth, projects, analysis, brand, feedback, resources
from fastapi.staticfiles import StaticFiles
import os

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
app.include_router(feedback.router,  prefix="/feedback",  tags=["Feedback"])
app.include_router(resources.router, prefix="/resources", tags=["Resources"])

# ── Static Files ─────────────────────────────────────
# This serves files from the "static" folder at /static URL
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
