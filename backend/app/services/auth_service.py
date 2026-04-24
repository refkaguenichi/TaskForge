from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
import json
from app.core.redis import redis_client
from app.core.config import settings
from fastapi import Request, Response
from app.core.jwt import decode_token


class AuthService:

    def __init__(self):
        pass

    def register(self, db: Session, user):
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")
        db_user = User(
            email=user.email,
            password=hash_password(user.password),
            name=user.name or user.email.split("@")[0],
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # 🔑 create token مباشرة
        token = create_access_token({"user_id": db_user.id})

        return {
            "access_token": token,
            "user_id": db_user.id
        }
    
    def login(self, db: Session, redis, credentials):

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

    def logout(self, request: Request, response: Response):
        token = request.cookies.get(settings.TOKEN_NAME)

        if token:
            payload = decode_token(token)
            user_id = payload.get("sub")

            redis_client.delete(f"session:{user_id}")