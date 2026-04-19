import uuid
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.enums import TaskStatus, TaskPriority
from app.db.base import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    status = Column(
        Enum(TaskStatus),
        default=TaskStatus.TODO,
        nullable=False
    )

    priority = Column(
        Enum(TaskPriority),
        default=TaskPriority.MEDIUM,
        nullable=False
    )
    estimated_minutes = Column(Integer, nullable=True)

    # 🔗 relation to user
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    # ORM relationship
    owner = relationship("User", back_populates="tasks")