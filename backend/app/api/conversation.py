# app/api/conversation.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.conversation import ConversationOut, ConversationUpdate
from app.services.orchestrator_service import ConversationOrchestrator
from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService
from app.schemas.message import MessageCreate

router = APIRouter()
orchestrator = ConversationOrchestrator()
conversation_service = ConversationService()
message_service = MessageService()


def serialize_message(message):
    return {
        "id": message.id,
        "role": message.role.value if hasattr(message.role, "value") else str(message.role),
        "content": message.content,
        "created_at": message.created_at,
    }


def serialize_task(task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status.value if hasattr(task.status, "value") else str(task.status),
        "priority": task.priority.value if hasattr(task.priority, "value") else str(task.priority),
        "estimated_minutes": task.estimated_minutes,
        "roadmap_id": task.roadmap_id,
        "created_at": task.created_at,
    }


def serialize_conversation(db: Session, conversation):
    messages = message_service.get_messages(db, conversation.id)
    tasks = conversation_service.get_latest_tasks_for_conversation(db, conversation.id)

    return {
        "id": conversation.id,
        "title": conversation.title,
        "is_pinned": bool(conversation.is_pinned),
        "is_favorite": bool(conversation.is_favorite),
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
        "messages": [serialize_message(message) for message in messages],
        "tasks": [serialize_task(task) for task in tasks],
    }


@router.get("/", response_model=list[ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversations = conversation_service.list_user_conversations(db, current_user.id)
    return [serialize_conversation(db, conversation) for conversation in conversations]


@router.get("/{conversation_id}", response_model=ConversationOut)
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = conversation_service.get_user_conversation(db, current_user.id, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return serialize_conversation(db, conversation)


@router.patch("/{conversation_id}", response_model=ConversationOut)
def update_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = conversation_service.get_user_conversation(db, current_user.id, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation_service.update_conversation(
        db,
        conversation,
        title=payload.title,
        is_pinned=payload.is_pinned,
        is_favorite=payload.is_favorite
    )
    return serialize_conversation(db, conversation)


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = conversation_service.get_user_conversation(db, current_user.id, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conversation_service.delete_conversation(db, conversation)
    return {"message": "Conversation deleted"}


@router.post("/send")
def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    message = payload.content
    conversation_id = payload.conversation_id

    result = orchestrator.handle(
        db=db,
        user=current_user,
        message=message,
        conversation_id=conversation_id
    )
    conversation = conversation_service.get_user_conversation(db, current_user.id, result["conversation_id"])
    return serialize_conversation(db, conversation)
