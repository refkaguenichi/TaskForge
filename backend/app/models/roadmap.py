
from app.db.base import Base
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.models_base import BaseModel

class Roadmap(BaseModel):
    __tablename__ = "roadmaps"

    title = Column(String(255), nullable=False)
    goal = Column(Text, nullable=True)

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)

    user = relationship("User", back_populates="roadmaps")

    tasks = relationship("Task", back_populates="roadmap", cascade="all, delete-orphan")