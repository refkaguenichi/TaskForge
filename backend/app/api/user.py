from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserOut
from app.services.user_service import UserService
from app.core.deps import get_current_user
from app.models.user import User

user_service = UserService()

router = APIRouter()


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return user_service.get_users(db)


@router.get("/{uid}", response_model=UserOut)
def get_user(uid: str, db: Session = Depends(get_db)):
    user = user_service.get_user_by_id(db, uid)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user