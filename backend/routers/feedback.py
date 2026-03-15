# routers/feedback.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.project import Feedback
from schemas.project import FeedbackCreate, FeedbackRead
from routers.auth import get_current_user
from models.user import User
from typing import List

router = APIRouter()


# ════════════════════════════════════════
#  POST /feedback/
#  Submit a rating for a project
# ════════════════════════════════════════
@router.post("/", response_model=FeedbackRead)
def create_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Check if user already rated this project
    existing = session.exec(
        select(Feedback).where(
            Feedback.user_id == current_user.id,
            Feedback.project_id == feedback_data.project_id
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already rated this project"
        )

    feedback = Feedback(
        user_id=current_user.id,
        project_id=feedback_data.project_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment,
    )
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback


# ════════════════════════════════════════
#  GET /feedback/{project_id}
#  Get all feedback for a project
# ════════════════════════════════════════
@router.get("/{project_id}", response_model=List[FeedbackRead])
def get_feedback(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    feedbacks = session.exec(
        select(Feedback).where(
            Feedback.project_id == project_id
        )
    ).all()
    return feedbacks


# ════════════════════════════════════════
#  DELETE /feedback/{feedback_id}
#  Delete a feedback
# ════════════════════════════════════════
@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    feedback = session.get(Feedback, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(feedback)
    session.commit()
    return {"message": "Feedback deleted"}