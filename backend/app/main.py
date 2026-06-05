from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import works, performers, tags, custom_fields, search, imports

app = FastAPI(title="Video Ratings API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(works.router)
app.include_router(performers.router)
app.include_router(tags.router)
app.include_router(custom_fields.router)
app.include_router(imports.router)


@app.get("/health")
def health():
    return {"status": "ok"}
