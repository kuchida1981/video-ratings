from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.auth import SESSION_COOKIE_NAME, SESSION_MAX_AGE, SESSION_SECURE, create_session_cookie, verify_session_cookie
from app.config import settings
from app.database import SessionLocal
from app.models.models import User
from app.routers import auth, custom_fields, data, imports, performers, search, tags, works

COVERS_DIR = Path(settings.upload_dir) / "covers"
COVERS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Video Ratings API",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXEMPT_PATHS = {"/api/health", "/api/auth/login", "/api/auth/logout"}
VIEWER_BLOCKED_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


@app.middleware("http")
async def session_auth_middleware(request: Request, call_next):
    path = request.url.path.rstrip("/")

    if path in EXEMPT_PATHS or not path.startswith("/api/"):
        return await call_next(request)

    cookie_value = request.cookies.get(SESSION_COOKIE_NAME)
    if not cookie_value:
        return Response(content='{"detail":"not authenticated"}', status_code=401, media_type="application/json")

    session = verify_session_cookie(cookie_value)
    if not session:
        return Response(content='{"detail":"session expired"}', status_code=401, media_type="application/json")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == session["user_id"]).first()
        if not user:
            return Response(content='{"detail":"user deleted"}', status_code=401, media_type="application/json")
        session["role"] = user.role
    finally:
        db.close()

    if session["role"] == "viewer" and request.method in VIEWER_BLOCKED_METHODS and not path.startswith("/api/auth/"):
        return Response(content='{"detail":"forbidden"}', status_code=403, media_type="application/json")

    request.state.session = session

    response = await call_next(request)

    new_cookie = create_session_cookie(session["user_id"], session["username"], session["role"])
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=new_cookie,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=SESSION_SECURE,
        path="/",
    )

    return response


app.mount("/static/covers", StaticFiles(directory=str(COVERS_DIR)), name="covers")

app.include_router(auth.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(works.router, prefix="/api")
app.include_router(performers.router, prefix="/api")
app.include_router(tags.router, prefix="/api")
app.include_router(custom_fields.router, prefix="/api")
app.include_router(imports.router, prefix="/api")
app.include_router(data.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope) -> Response:
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as ex:
            if ex.status_code == 404:
                return await super().get_response("index.html", scope)
            raise


if settings.frontend_dir:
    frontend_path = Path(settings.frontend_dir)
    if frontend_path.exists():
        app.mount("/", SPAStaticFiles(directory=str(frontend_path), html=True), name="spa")
