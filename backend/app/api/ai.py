from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.services.ai_service import generate_tasks_from_goal
from app.services.task_service import create_task
from app.schemas.task import TaskGenerationRequest

from app.schemas.task import TaskCreate


router = APIRouter()

@router.post("/generate-tasks")
def generate_tasks(req: TaskGenerationRequest, db: Session = Depends(get_db)):
    result = generate_tasks_from_goal(req.goal)
    tasks = result["tasks"]
    saved_tasks = []

    for t in tasks:
        task_data = TaskCreate(
            title=t.get("title"),
            description=t.get("description"),
            owner_id="613e3e37-816d-48ab-9c11-7db7833a1c09",
            status=t.get("status", "TODO"),
            priority=t.get("priority", "MEDIUM"),
            estimated_minutes=t.get("estimated_minutes", 30),
        )

        task = create_task(db=db, task=task_data)
        saved_tasks.append(task)

    return saved_tasks