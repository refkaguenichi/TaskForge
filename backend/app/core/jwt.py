# core/jwt.py
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings
from datetime import timezone


def create_access_token(user_id: str):
    expire = datetime.now(timezone.utc) + timedelta(hours=2)
    payload = {
        "sub": user_id,  
        "exp": expire
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str):
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )