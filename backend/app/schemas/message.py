
from pydantic import BaseModel
from typing import Optional

class MessageCreate(BaseModel):
    content: str 
    conversation_id: Optional[str] = None 