from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    owner_id: str

class TaskOut(BaseModel):
    id: str
    title: str
    description: str | None
    is_completed: bool
    owner_id: str   # 👈 add this


    class Config:
        from_attributes = True