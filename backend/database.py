# database.py
# ─────────────────────────────────────────────────────
# This file does 3 things:
#
# 1. ENGINE   → The permanent connection to MySQL
#               Like a phone line that stays open
#
# 2. TABLES   → Creates all 15 tables automatically
#               when the server starts
#
# 3. SESSION  → One conversation with the DB per request
#               Like one phone call — open, talk, close
# ─────────────────────────────────────────────────────

from unittest import result

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text
from core.config import settings


# ── 1. ENGINE ────────────────────────────────────────
# echo=True → prints every SQL query in terminal
# Great for learning — you see what SQLModel is doing
# Set to False later in production
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
)


# ── 2. CREATE ALL TABLES ─────────────────────────────
def create_db_and_tables():
    """
    Called once when the server starts.
    SQLModel reads all model classes and creates
    the tables in MySQL automatically.
    Safe to run multiple times — won't drop tables.
    """
    # Import all models so SQLModel knows about them
    import models.user
    import models.project
    import models.analysis
    import models.brand_asset

    SQLModel.metadata.create_all(engine)

    # ── Safe column migrations ────────────────────────
    # create_all() won't add columns to existing tables,
    # so we do it manually here. The IF NOT EXISTS check
    # makes it safe to run on every server restart.
    with engine.connect() as conn:
        result = conn.execute(text(
    "SELECT COUNT(*) FROM information_schema.columns "
    "WHERE table_schema = DATABASE() "
    "AND table_name = 'projects' "
    "AND column_name = 'is_favourite'"
))
        if result.scalar() == 0:
            conn.execute(text(
             "ALTER TABLE projects "
             "ADD COLUMN is_favourite BOOLEAN NOT NULL DEFAULT FALSE"
    ))
        conn.commit()

    print("✅ Database connected and tables verified!")


# ── 3. SESSION DEPENDENCY ────────────────────────────
def get_session():
    """
    FastAPI dependency — injected into every router
    that needs to talk to the database.

    How to use it in a router:
    ─────────────────────────────────────────
    from fastapi import Depends
    from sqlmodel import Session
    from database import get_session

    @router.get("/projects")
    def get_projects(session: Session = Depends(get_session)):
        projects = session.exec(select(Project)).all()
        return projects
    ─────────────────────────────────────────
    The 'with' block closes the session automatically
    after every request — even if an error happens
    """
    with Session(engine) as session:
        yield session



'''
## The 3 concepts simply explained:

#ENGINE:
#Created ONCE when server starts
#Stays open the whole time
#Like WiFi connection — always on

#SESSION:
#Created for EACH request
#Closed after request finishes
#Like opening a browser tab — use it, close it

#@create_db_and_tables():
#Runs ONCE at startup
#Checks if tables exist → creates if not
#Your 15 tables are already in MySQL so it
#will just verify them ✅
'''