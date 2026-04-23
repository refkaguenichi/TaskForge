from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate
from app.services.auth_service import register, login,logout

from app.core.redis import redis_client
from app.core.config import settings

router = APIRouter()

@router.post("/register")
def register_user(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    result = register(db, user)
    response.set_cookie(
        key=settings.TOKEN_NAME,
        value=result[settings.TOKEN_NAME],
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path=settings.COOKIE_PATH,
        max_age=settings.COOKIE_MAX_AGE
    )
    return {"message": "User created"}

@router.post("/login")
def login_user(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    result = login(db, redis_client, user)
    response.set_cookie(
        key=settings.TOKEN_NAME,
        value=result[settings.TOKEN_NAME],
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path=settings.COOKIE_PATH,
        max_age=settings.COOKIE_MAX_AGE
    )
    return {"message": "Logged in"}


@router.post("/logout")
def logout_user(request: Request, response: Response):
    # logout(request, response)
    response.delete_cookie(key=settings.TOKEN_NAME, path=settings.COOKIE_PATH)
    return {"message": "Logged out"}

@router.get("/debug-cookie")
def debug_cookie(request: Request):
    return {
        "cookies": request.cookies
    }