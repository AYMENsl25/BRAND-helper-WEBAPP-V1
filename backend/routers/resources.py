# routers/resources.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.project import SavedResource
from schemas.project import SavedResourceCreate, SavedResourceRead
from routers.auth import get_current_user
from models.user import User
from typing import List

router = APIRouter()


# ════════════════════════════════════════
#  POST /resources/
#  Save a new resource/link
# ════════════════════════════════════════
@router.post("/", response_model=SavedResourceRead)
def create_resource(
    resource_data: SavedResourceCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    resource = SavedResource(
        user_id=current_user.id,
        title=resource_data.title,
        url=resource_data.url,
        category=resource_data.category,
        notes=resource_data.notes,
    )
    session.add(resource)
    session.commit()
    session.refresh(resource)
    return resource


# ════════════════════════════════════════
#  GET /resources/
#  Get all saved resources for current user
# ════════════════════════════════════════
@router.get("/", response_model=List[SavedResourceRead])
def get_resources(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    resources = session.exec(
        select(SavedResource).where(
            SavedResource.user_id == current_user.id
        )
    ).all()
    return resources


# ════════════════════════════════════════
#  DELETE /resources/{resource_id}
#  Delete a saved resource
# ════════════════════════════════════════
@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    resource = session.get(SavedResource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(resource)
    session.commit()
    return {"message": "Resource deleted"}