from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: str | None = "medium"
    status: str | None = "todo"
    estimated_minutes: int | None = None
    owner_id: str

class TaskOut(BaseModel):
    id: str
    title: str
    description: str | None
    status: str
    priority: str
    estimated_minutes: int | None
    owner_id: str


    class Config:
        from_attributes = True

class TaskGenerationRequest(BaseModel):
    goal: str
    owner_id: str