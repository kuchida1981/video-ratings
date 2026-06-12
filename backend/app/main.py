from pathlib import Path

from fastapi import FastAPI
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
