import base64
import secrets
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import custom_fields, data, imports, performers, search, tags, works

COVERS_DIR = Path(settings.upload_dir) / "covers"
COVERS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Video Ratings API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def basic_auth_middleware(request: Request, call_next):
    if not settings.basic_auth_enabled:
        return await call_next(request)

    if request.url.path == "/health":
        return await call_next(request)

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return Response(
            content="Unauthorized", status_code=401, headers={"WWW-Authenticate": 'Basic realm="Restricted"'}
        )

    try:
        auth_type, credentials = auth_header.split(" ", 1)
        if auth_type.lower() != "basic":
            raise ValueError()
        decoded = base64.b64decode(credentials).decode("utf-8")
        username, password = decoded.split(":", 1)
    except Exception:
        return Response(
            content="Invalid credentials", status_code=401, headers={"WWW-Authenticate": 'Basic realm="Restricted"'}
        )

    is_user_correct = secrets.compare_digest(username.encode("utf-8"), settings.basic_auth_user.encode("utf-8"))
    is_password_correct = secrets.compare_digest(password.encode("utf-8"), settings.basic_auth_password.encode("utf-8"))

    if not (is_user_correct and is_password_correct):
        return Response(
            content="Unauthorized", status_code=401, headers={"WWW-Authenticate": 'Basic realm="Restricted"'}
        )

    return await call_next(request)


app.mount("/static/covers", StaticFiles(directory=str(COVERS_DIR)), name="covers")

app.include_router(search.router)
app.include_router(works.router)
app.include_router(performers.router)
app.include_router(tags.router)
app.include_router(custom_fields.router)
app.include_router(imports.router)
app.include_router(data.router)


@app.get("/health")
def health():
    return {"status": "ok"}
