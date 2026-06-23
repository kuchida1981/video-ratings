import bcrypt
from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import SESSION_COOKIE_NAME, SESSION_MAX_AGE, create_session_cookie
from app.database import get_db
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class MeResponse(BaseModel):
    username: str
    role: str


@router.post("/login")
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not bcrypt.checkpw(data.password.encode("utf-8"), user.password_hash.encode("utf-8")):
        return Response(
            content='{"detail":"ユーザー名またはパスワードが正しくありません"}',
            status_code=401,
            media_type="application/json",
        )

    cookie_value = create_session_cookie(user.id, user.username, user.role)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=cookie_value,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        path="/",
    )
    return {"username": user.username, "role": user.role}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    return {"detail": "logged out"}


@router.get("/me", response_model=MeResponse)
def me(request: Request):
    session = request.state.session if hasattr(request.state, "session") else None
    if not session:
        return Response(content='{"detail":"not authenticated"}', status_code=401, media_type="application/json")
    return {"username": session["username"], "role": session["role"]}
