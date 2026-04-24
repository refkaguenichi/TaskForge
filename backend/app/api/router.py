from fastapi import APIRouter
from app.api import user, task, auth, ai, conversation, message

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(user.router, prefix="/users", tags=["Users"])
api_router.include_router(task.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(conversation.router, prefix="/conversations", tags=["Conversations"])
api_router.include_router(message.router, prefix="/messages", tags=["Messages"])