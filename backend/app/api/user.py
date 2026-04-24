from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserOut
from fastapi import HTTPException
from app.services.user_service import UserService

user_service = UserService()

router = APIRouter()


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return user_service.get_users(db)


# 👉 GET /users/{uid}
@router.get("/{uid}", response_model=UserOut)
def get_user(uid: str, db: Session = Depends(get_db)):
    user = user_service.get_user_by_id(db, uid)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user