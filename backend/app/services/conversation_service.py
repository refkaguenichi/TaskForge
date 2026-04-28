from app.models.conversation import Conversation
from app.models.message import Message
from app.models.task import Task
from sqlalchemy.orm import Session

class ConversationService:

    def __init__(self):
        pass

    def create_conversation(self, db, user_id, title):
        conv = Conversation(user_id=user_id, title=title)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conv

    def get_conversation(self, db, conversation_id):
        return db.query(Conversation).filter_by(id=conversation_id).first()

    def get_user_conversation(self, db: Session, user_id: str, conversation_id: str):
        return (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
            .first()
        )

    def list_user_conversations(self, db: Session, user_id: str):
        return (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc())
            .all()
        )

    def update_conversation(self, db: Session, conversation: Conversation, **fields):
        for key, value in fields.items():
            if value is not None:
                setattr(conversation, key, value)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    def delete_conversation(self, db: Session, conversation: Conversation):
        db.delete(conversation)
        db.commit()

    def get_latest_tasks_for_conversation(self, db: Session, conversation_id: str):
        latest_message_with_roadmap = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id,
                Message.roadmap_id.isnot(None)
            )
            .order_by(Message.created_at.desc())
            .first()
        )

        if not latest_message_with_roadmap:
            return []

        return (
            db.query(Task)
            .filter(Task.roadmap_id == latest_message_with_roadmap.roadmap_id)
            .order_by(Task.created_at.asc())
            .all()
        )
