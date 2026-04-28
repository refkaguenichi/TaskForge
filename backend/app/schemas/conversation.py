from datetime import datetime

from pydantic import BaseModel


class ConversationUpdate(BaseModel):
    title: str | None = None
    is_pinned: bool | None = None
    is_favorite: bool | None = None


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationTaskOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    status: str
    priority: str
    estimated_minutes: int | None = None
    roadmap_id: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: str
    title: str
    is_pinned: bool
    is_favorite: bool
    created_at: datetime
    updated_at: datetime
    messages: list[MessageOut]
    tasks: list[ConversationTaskOut]

    class Config:
        from_attributes = True
