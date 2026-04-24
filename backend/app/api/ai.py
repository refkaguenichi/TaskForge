from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil

from app.db.session import get_db
from app.schemas.task import TaskGenerationRequest, TaskCreate
from app.services.ai_service import generate_tasks_from_goal, generate_tasks_from_file
from app.services.task_service import create_task
from app.utils.file_reader import read_file

UPLOAD_DIR = "uploads"

router = APIRouter()


# -----------------------------
# 🔥 COMMON HELPERS (NO REPETITION)
# -----------------------------

OWNER_ID = "613e3e37-816d-48ab-9c11-7db7833a1c09"


def build_task(t):
    return TaskCreate(
        title=t.title,
        description=getattr(t, "description", None),
        owner_id=OWNER_ID,
        status=getattr(t, "status", "TODO"),
        priority=t.priority,
        estimated_minutes=t.estimated_minutes,
    )


def save_tasks(db: Session, tasks):
    return [
        create_task(db=db, task=build_task(t))
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
    tasks = generate_tasks_from_goal(req.goal)
    return save_tasks(db, tasks)


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

    tasks = generate_tasks_from_file(file_text)

    return save_tasks(db, tasks)

