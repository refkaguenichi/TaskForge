from sqlalchemy import Column, String,Text, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship
from app.db.models_base import BaseModel
from app.core.enums import TaskStatus, TaskPriority


class Task(BaseModel):
    __tablename__ = "tasks"

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    status = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)

    estimated_minutes = Column(Integer, nullable=True)

    roadmap_id = Column(String(36), ForeignKey("roadmaps.id", ondelete="CASCADE"), index=True)

    roadmap = relationship("Roadmap", back_populates="tasks")