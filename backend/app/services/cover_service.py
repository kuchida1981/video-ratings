import uuid
from pathlib import Path
from typing import Literal

from fastapi import HTTPException, UploadFile

_ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


async def save_cover(
    file: UploadFile,
    entity_type: Literal["works", "performers"],
    entity_id: int,
    old_path: str | None,
) -> str:
    ext = Path(file.filename or "image.jpg").suffix.lower() or ".jpg"
    if ext not in _ALLOWED_IMAGE_EXTS:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    covers_dir = Path("uploads/covers") / entity_type
    covers_dir.mkdir(parents=True, exist_ok=True)

    rel_path = f"{entity_type}/{entity_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = Path("uploads/covers") / rel_path

    if old_path and old_path != rel_path:
        try:
            (Path("uploads/covers") / old_path).unlink(missing_ok=True)
        except Exception:
            pass

    contents = await file.read()
    file_path.write_bytes(contents)
    return rel_path


def delete_cover(cover_path: str | None) -> None:
    if cover_path:
        try:
            (Path("uploads/covers") / cover_path).unlink(missing_ok=True)
        except Exception:
            pass
