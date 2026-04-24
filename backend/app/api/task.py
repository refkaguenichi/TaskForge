from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskOut
from app.services.task_service import TaskService

task_service = TaskService()

router = APIRouter()

@router.post("/", response_model=TaskOut)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = Task(
        title=task.title,
        description=task.description,
        owner_id=task.owner_id
    )
    return task_service.create_task(db, new_task)


@router.get("/", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    return task_service.list_tasks(db)