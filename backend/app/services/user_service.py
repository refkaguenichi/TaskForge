from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.services.memory_service import save_memory
import json
from app.core.redis import redis_client
from app.core.config import settings
from fastapi import Request, Response
from app.core.jwt import decode_token


def register(db: Session, user):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    db_user = User(
        email=user.email,
        password=hash_password(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 🧠 INIT LONG-TERM MEMORY (MySQL)
    save_memory(db, db_user.id, "task_style", "balanced")
    save_memory(db, db_user.id, "experience", "beginner")

    # 🔑 create token مباشرة
    token = create_access_token({"user_id": db_user.id})

    return {
        "access_token": token,
        "user_id": db_user.id
    }
def login(db: Session, redis, credentials):

    db_user = db.query(User).filter(User.email == credentials.email).first()

    if not db_user or not verify_password(credentials.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"user_id": db_user.id})

    redis.set(
        f"session:{db_user.id}",
        json.dumps([]),
        ex=3600
    )

    return {
        "access_token": token,
        "user_id": db_user.id
    }



def logout(request: Request, response: Response):
    token = request.cookies.get(settings.TOKEN_NAME)

    if token:
        payload = decode_token(token)
        user_id = payload.get("sub")

        redis_client.delete(f"session:{user_id}")

def get_users(db: Session):
    return db.query(User).all()


def get_user_by_id(db: Session, id: str):
    return db.query(User).filter(User.id == id).first()