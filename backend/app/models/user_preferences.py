from sqlalchemy import Column, String, ForeignKey
from app.db.models_base import BaseModel

class UserPreferences(BaseModel):
    __tablename__ = "user_preferences"

    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    key = Column(String(100), nullable=False, index=True)
    value = Column(String(255), nullable=True)