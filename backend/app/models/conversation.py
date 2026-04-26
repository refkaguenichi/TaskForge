from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.models_base import BaseModel

class Conversation(BaseModel):
    __tablename__ = "conversations"
    
    title = Column(String(255), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")