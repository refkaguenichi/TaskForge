import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from app.db.models_base import BaseModel


class CalendarEvent(BaseModel):
    __tablename__ = "calendar_events"

    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    task_id = Column(
        String(36),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        index=True
    )

    # 🔗 Google event ID
    external_event_id = Column(String(255), nullable=True)

    provider = Column(String(50), default="google")

    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)