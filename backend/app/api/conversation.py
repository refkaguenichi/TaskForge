# app/api/conversation.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.services.orchestrator_service import ConversationOrchestrator
from app.schemas.message import MessageCreate

router = APIRouter()
orchestrator = ConversationOrchestrator()


@router.post("/send")
def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    message = payload.content
    conversation_id = payload.conversation_id

    return orchestrator.handle(
        db=db,
        user=current_user,
        message=message,
        conversation_id=conversation_id
    )