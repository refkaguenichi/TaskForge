from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import create_user, get_users, get_user_by_uid
from fastapi import HTTPException

router = APIRouter()

@router.post("/", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

# 👉 GET /users
@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return get_users(db)


# 👉 GET /users/{uid}
@router.get("/{uid}", response_model=UserOut)
def get_user(uid: str, db: Session = Depends(get_db)):
    user = get_user_by_uid(db, uid)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user