import uuid
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    priority = Column(String(50), nullable=False, default="medium")
    is_completed = Column(Boolean, default=False)

    # 🔗 relation to user
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ORM relationship
    owner = relationship("User", back_populates="tasks")