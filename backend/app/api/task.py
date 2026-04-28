from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate
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


@router.patch("/{task_id}")
def update_task(task_id: str, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if payload.status is not None:
        task = task_service.update_task_status(db, task, payload.status)
    return task


@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task_service.delete_task(db, task)
    return {"message": "Task deleted"}
