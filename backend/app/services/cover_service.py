import uuid
from pathlib import Path
from typing import Literal

from fastapi import HTTPException, UploadFile

from app.config import settings

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

    covers_dir = Path(settings.upload_dir) / "covers" / entity_type
    covers_dir.mkdir(parents=True, exist_ok=True)

    rel_path = f"{entity_type}/{entity_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = Path(settings.upload_dir) / "covers" / rel_path

    contents = await file.read()
    file_path.write_bytes(contents)

    if old_path and old_path != rel_path:
        try:
            base_dir = (Path(settings.upload_dir) / "covers").resolve()
            target_path = (base_dir / old_path).resolve()
            if target_path.is_relative_to(base_dir):
                target_path.unlink(missing_ok=True)
        except Exception:
            pass

    return rel_path


def delete_cover(cover_path: str | None) -> None:
    if cover_path:
        try:
            base_dir = (Path(settings.upload_dir) / "covers").resolve()
            target_path = (base_dir / cover_path).resolve()
            if target_path.is_relative_to(base_dir):
                target_path.unlink(missing_ok=True)
        except Exception:
            pass
