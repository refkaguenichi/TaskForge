from functools import wraps
from fastapi import Request, HTTPException
from jose import jwt, JWTError

from app.models.user import User
from app.core.config import settings

from app.db.session import get_db



def require_user(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):

        request: Request = kwargs.get("request")

        if not request:
            raise HTTPException(500, "Request missing")

        auth = request.headers.get("Authorization")

        if not auth:
            raise HTTPException(status_code=401, detail="No token")

        try:
            token = auth.split(" ")[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

            user_id = payload.get("sub")

        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

        db = get_db()
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        kwargs["current_user"] = user

        return await func(*args, **kwargs)

    return wrapper