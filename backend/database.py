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

from sqlmodel import SQLModel, create_engine, Session
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