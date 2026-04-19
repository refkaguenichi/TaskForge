# app/schemas/ai.py

from pydantic import BaseModel
from typing import List

class AITask(BaseModel):
    title: str
    priority: str
    estimated_minutes: int

class AITaskResponse(BaseModel):
    tasks: List[AITask]