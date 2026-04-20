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
    tasks = generate_tasks_from_goal(req.goal)

    saved_tasks = []

    for t in tasks:
        task_data = TaskCreate(
            title=t.title,
            description=None,
            owner_id="613e3e37-816d-48ab-9c11-7db7833a1c09",
            status="TODO",
            priority=t.priority,
            estimated_minutes=t.estimated_minutes,
        )

        task = create_task(db=db, task=task_data)
        saved_tasks.append(task)

    return saved_tasks