
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from app.db.models_base import BaseModel
class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(191), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    name=Column(String(255), nullable=True)

    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation",back_populates="user",cascade="all, delete-orphan")