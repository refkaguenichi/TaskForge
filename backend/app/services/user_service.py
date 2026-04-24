from sqlalchemy.orm import Session
from app.models.user import User


class UserService:

    def __init__(self):
        pass

    def get_users(self, db: Session):
        return db.query(User).all()

    def get_user_by_id(self, db: Session, id: str):
        return db.query(User).filter(User.id == id).first()