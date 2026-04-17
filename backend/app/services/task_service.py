from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate
import uuid


def create_task(db: Session, task: TaskCreate):
    db_task = Task(
        uid=str(uuid.uuid4()),
        title=task.title,
        description=task.description,
        owner_uid=task.owner_uid,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_tasks(db: Session):
    return db.query(Task).all()


def get_tasks_by_user(db: Session, owner_uid: str):
    return db.query(Task).filter(Task.owner_uid == owner_uid).all()