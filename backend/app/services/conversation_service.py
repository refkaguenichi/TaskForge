
from app.models.conversation import Conversation

class ConversationService:

    def __init__(self):
        pass

    def create_conversation(self, db, user_id):
        conv = Conversation(user_id=user_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conv

    def get_conversation(self, db, conversation_id):
        return db.query(Conversation).filter_by(id=conversation_id).first()