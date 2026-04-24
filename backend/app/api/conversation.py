from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.conversation_service import ConversationService
from app.services.user_service import UserService
from app.models.user import User
from app.core.deps import get_current_user

conversation_service = ConversationService()
user_service = UserService()

router = APIRouter()

@router.post("/")
def create_conversation(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return conversation_service.create_conversation(db, current_user.id)