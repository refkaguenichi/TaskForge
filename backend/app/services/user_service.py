from http.client import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate

def create_user(db: Session, user):

    # ✅ check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    db_user = User(
        email=user.email,
        password=user.password,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users(db: Session):
    return db.query(User).all()


def get_user_by_id(db: Session, id: str):
    return db.query(User).filter(User.id == id).first()