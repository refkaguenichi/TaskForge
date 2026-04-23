from fastapi import APIRouter
from app.api import user, task, auth, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(user.router, prefix="/users", tags=["Users"])
api_router.include_router(task.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])