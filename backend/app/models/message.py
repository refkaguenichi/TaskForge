from sqlalchemy import Column, String, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.db.models_base import BaseModel
from app.core.enums import MessageRole


class Message(BaseModel):
    __tablename__ = "messages"

    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), index=True)

    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text)

    # optional context
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id"), nullable=True)

    # AI action (optional)
    action = Column(String(50), nullable=True)
    # ex: create_tasks, update_task

    conversation = relationship("Conversation", back_populates="messages")