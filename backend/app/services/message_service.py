from app.models.message import Message


class MessageService:

    def __init__(self):
        pass

    def create_message(self, db, conversation_id, role, content, roadmap_id=None):
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            roadmap_id=roadmap_id
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    def get_messages(self, db, conversation_id):
        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .all()
        )