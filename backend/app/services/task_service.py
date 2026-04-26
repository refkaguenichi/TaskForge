from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate
import uuid

class TaskService:
    
    def __init__(self):
        pass

    def create_task(db: Session, task: TaskCreate):
        db_task = Task(
            id=str(uuid.uuid4()),
            title=task.title,
            description=task.description,
            owner_id=task.owner_id,
            priority=task.priority,
            estimated_minutes=task.estimated_minutes,
        )

        db.add(db_task)
        db.commit()
        db.refresh(db_task)

        return db_task

    def bulk_create(self, db: Session, roadmap_id: str, tasks: list):
        db_tasks = []

        for task in tasks:
            db_task = Task(
                id=str(uuid.uuid4()),
                title=task.title,
                description=task.description,
                priority=task.priority,
                estimated_minutes=task.estimated_minutes,
                roadmap_id=roadmap_id
            )
            db_tasks.append(db_task)

        db.add_all(db_tasks)
        db.commit()

        for t in db_tasks:
            db.refresh(t)

        return db_tasks


    def get_tasks(db: Session):
        return db.query(Task).all()


    def get_tasks_by_user(db: Session, owner_id: str):
        return db.query(Task).filter(Task.owner_id == owner_id).all()