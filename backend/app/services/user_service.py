from sqlalchemy.orm import Session
from app.models.user import User


def get_users(db: Session):
    return db.query(User).all()


def get_user_by_id(db: Session, id: str):
    return db.query(User).filter(User.id == id).first()