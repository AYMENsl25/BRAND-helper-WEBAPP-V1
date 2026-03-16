# routers/projects.py
# ─────────────────────────────────────────────────────
# Endpoints:
#   GET    /projects          → get all my projects
#   POST   /projects          → create new project
#   GET    /projects/{id}     → get one project
#   PUT    /projects/{id}     → update project
#   DELETE /projects/{id}     → delete project
# ─────────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from database import get_session
from models.project import Project, Tag, ProjectTag
from schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectRead
)
from routers.auth import get_current_user
from models.user import User
from typing import List, Optional
from datetime import datetime

router = APIRouter()


# ════════════════════════════════════════
#  GET /projects
#  Get all projects for current user
# ════════════════════════════════════════
@router.get("/", response_model=List[ProjectRead])
def get_projects(
    search: Optional[str] = Query(default=None),
    stage: Optional[str] = Query(default=None),
    industry: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Returns all projects belonging to the logged in user.
    Supports optional filtering by search (title), stage, and industry.
    """
    query = select(Project).where(Project.user_id == current_user.id)
    if search:
        query = query.where(Project.title.ilike(f"%{search}%"))
    if stage:
        query = query.where(Project.stage == stage)
    if industry:
        query = query.where(Project.industry == industry)
    return session.exec(query).all()


# ════════════════════════════════════════
#  POST /projects
#  Create a new project
# ════════════════════════════════════════
@router.post("/", response_model=ProjectRead)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Creates a new startup idea project.
    Pydantic validates the data first.
    user_id is taken from the JWT token — not from the client.
    """
    new_project = Project(
        user_id=current_user.id,
        title=project_data.title,
        description=project_data.description,
        industry=project_data.industry,
        stage=project_data.stage,
    )
    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    return new_project


# ════════════════════════════════════════
#  GET /projects/{project_id}
#  Get one specific project
# ════════════════════════════════════════
@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Returns one project by ID.
    Only the owner can see their project.
    """
    project = session.get(Project, project_id)

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this project"
        )
    return project


# ════════════════════════════════════════
#  PUT /projects/{project_id}
#  Update a project
# ════════════════════════════════════════
@router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Updates a project.
    Only sends the fields you want to change.
    Other fields stay the same.
    """
    project = session.get(Project, project_id)

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this project"
        )

    # Update only fields that were sent
    project_dict = project_data.model_dump(exclude_unset=True)
    for key, value in project_dict.items():
        setattr(project, key, value)

    project.updated_at = datetime.utcnow()
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


# ════════════════════════════════════════
#  DELETE /projects/{project_id}
#  Delete a project
# ════════════════════════════════════════
@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Deletes a project and ALL related data:
    analysis, competitors, brand assets etc.
    This works because of ON DELETE CASCADE
    in our MySQL foreign keys.
    """
    project = session.get(Project, project_id)

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this project"
        )

    session.delete(project)
    session.commit()
    return {"message": f"Project '{project.title}' deleted successfully"}


# ════════════════════════════════════════
#  POST /projects/{project_id}/tags
#  Add a tag to a project
# ════════════════════════════════════════
@router.post("/{project_id}/tags/{tag_name}")
def add_tag_to_project(
    project_id: int,
    tag_name: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Adds a tag to a project.
    Creates the tag if it doesn't exist yet.
    """
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Find or create the tag
    tag = session.exec(
        select(Tag).where(Tag.name == tag_name)
    ).first()
    if not tag:
        tag = Tag(name=tag_name)
        session.add(tag)
        session.commit()
        session.refresh(tag)

    # Check if already tagged
    existing = session.exec(
        select(ProjectTag).where(
            ProjectTag.project_id == project_id,
            ProjectTag.tag_id == tag.id
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Tag already added to this project"
        )

    # Add tag to project
    project_tag = ProjectTag(
        project_id=project_id,
        tag_id=tag.id
    )
    session.add(project_tag)
    session.commit()
    return {"message": f"Tag '{tag_name}' added to project"}