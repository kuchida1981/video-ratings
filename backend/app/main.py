from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.auth import create_session_cookie, verify_session_cookie
from app.config import settings
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

EXEMPT_PATHS = {"/api/health", "/api/auth/login", "/api/auth/logout", "/api/auth/me"}


@app.middleware("http")
async def session_auth_middleware(request: Request, call_next):
    path = request.url.path.rstrip("/")

    if path in EXEMPT_PATHS or not path.startswith("/api/"):
        return await call_next(request)

    cookie_value = request.cookies.get("session")
    if not cookie_value:
        return JSONResponse({"detail": "not authenticated"}, status_code=401)

    session_data = verify_session_cookie(cookie_value)
    if not session_data:
        return JSONResponse({"detail": "not authenticated"}, status_code=401)

    if session_data["role"] == "viewer" and request.method in ("POST", "PUT", "PATCH", "DELETE"):
        return JSONResponse({"detail": "forbidden"}, status_code=403)

    response = await call_next(request)

    new_cookie = create_session_cookie(session_data["user_id"], session_data["username"], session_data["role"])
    response.set_cookie(
        key="session",
        value=new_cookie,
        httponly=True,
        samesite="lax",
        max_age=7200,
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
