import bcrypt
from fastapi import APIRouter, Request, Response
from pydantic import BaseModel
from sqlalchemy import select

from app.auth import create_session_cookie, verify_session_cookie
from app.database import SessionLocal
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(body: LoginRequest, response: Response):
    db = SessionLocal()
    try:
        user = db.execute(select(User).where(User.username == body.username)).scalar_one_or_none()
        if not user or not bcrypt.checkpw(body.password.encode("utf-8"), user.password_hash.encode("utf-8")):
            return Response(
                content='{"detail":"ユーザー名またはパスワードが正しくありません"}',
                status_code=401,
                media_type="application/json",
            )

        cookie_value = create_session_cookie(user.id, user.username, user.role)
        response = Response(
            content=f'{{"username":"{user.username}","role":"{user.role}"}}',
            media_type="application/json",
        )
        response.set_cookie(
            key="session",
            value=cookie_value,
            httponly=True,
            samesite="lax",
            max_age=7200,
            path="/",
        )
        return response
    finally:
        db.close()


@router.post("/logout")
def logout():
    response = Response(content='{"detail":"logged out"}', media_type="application/json")
    response.delete_cookie(key="session", path="/")
    return response


@router.get("/me")
def me(request: Request):
    cookie_value = request.cookies.get("session")
    if not cookie_value:
        return Response(content='{"detail":"not authenticated"}', status_code=401, media_type="application/json")

    session_data = verify_session_cookie(cookie_value)
    if not session_data:
        return Response(content='{"detail":"not authenticated"}', status_code=401, media_type="application/json")

    return {"username": session_data["username"], "role": session_data["role"]}
