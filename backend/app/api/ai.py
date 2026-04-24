from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil

from app.db.session import get_db
from app.schemas.task import TaskGenerationRequest, TaskCreate
from app.utils.file_reader import read_file

from app.services.ai_service import AiService
from app.services.task_service import TaskService

ai_service = AiService()
task_service = TaskService()


UPLOAD_DIR = "uploads"

router = APIRouter()


# -----------------------------
# 🔥 COMMON HELPERS (NO REPETITION)
# -----------------------------


def build_task(t, owner_id:str):
    return TaskCreate(
        title=t.title,
        description=getattr(t, "description", None),
        owner_id=owner_id,
        status=getattr(t, "status", "TODO"),
        priority=t.priority,
        estimated_minutes=t.estimated_minutes,
    )


def save_tasks(db: Session, tasks, owner_id:str):
    return [
        task_service.create_task(db=db, task=build_task(t, owner_id))
        for t in tasks
    ]


def save_uploaded_file(file: UploadFile):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


# -----------------------------
# 1. GENERATE FROM GOAL
# -----------------------------
@router.post("/generate-tasks")
def generate_tasks(req: TaskGenerationRequest, db: Session = Depends(get_db)):
    tasks = ai_service.generate_tasks_from_goal(req.goal)
    return save_tasks(db, tasks, req.owner_id)


# -----------------------------
# 2. GENERATE FROM FILE
# -----------------------------
@router.post("/upload-file-generate-tasks")
async def upload_file_generate_tasks(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_path = save_uploaded_file(file)

    file_text = read_file(file_path)

    tasks = ai_service.generate_tasks_from_file(file_text)

    return save_tasks(db, tasks)

