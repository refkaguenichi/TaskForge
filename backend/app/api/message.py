from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.message_service import MessageService
from app.services.ai_service import AiService
from app.schemas.message import MessageCreate
from app.core.enums import MessageRole

msg_service = MessageService()
ai_service = AiService()

router = APIRouter()


@router.post("/{conversation_id}/message")
def send_message(conversation_id: str, body: MessageCreate, db: Session = Depends(get_db)):

    # 1. save user message
    user_msg = msg_service.create_message(
        db,
        conversation_id,
        MessageRole.USER,
        body.content
    )

    # 2. get history
    messages = msg_service.get_messages(db, conversation_id)

    # 3. AI response
    ai_response = ai_service.generate_response(messages)

    # 4. save assistant message
    assistant_msg = msg_service.create_message(
        db,
        conversation_id,
        MessageRole.ASSISTANT,
        ai_response
    )

    return {
        "user_message": user_msg,
        "assistant_message": assistant_msg
    }