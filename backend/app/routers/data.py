import io
import json
import shutil
import zipfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import (
    CustomFieldDefinition,
    Performer,
    PerformerTag,
    Tag,
    TagCategory,
    Work,
    WorkFile,
    WorkPerformer,
    WorkTag,
)

router = APIRouter(prefix="", tags=["data"])

COVERS_DIR = Path("uploads/covers")


def _get_schema_version(db: Session) -> str:
    row = db.execute(text("SELECT version_num FROM alembic_version LIMIT 1")).fetchone()
    return row[0] if row else ""


def _row_to_dict(row: Any) -> dict:
    d = {}
    for col in row.__table__.columns:
        val = getattr(row, col.name)
        if isinstance(val, datetime):
            val = val.isoformat()
        d[col.name] = val
    return d


@router.get("/export")
def export_data(db: Session = Depends(get_db)):
    schema_version = _get_schema_version(db)
    data_json = json.dumps(
        {
            "schema_version": schema_version,
            "exported_at": datetime.now(UTC).isoformat(),
            "data": {
                "tag_categories": [_row_to_dict(r) for r in db.query(TagCategory).all()],
                "tags": [_row_to_dict(r) for r in db.query(Tag).all()],
                "works": [_row_to_dict(r) for r in db.query(Work).all()],
                "performers": [_row_to_dict(r) for r in db.query(Performer).all()],
                "work_performers": [_row_to_dict(r) for r in db.query(WorkPerformer).all()],
                "work_files": [_row_to_dict(r) for r in db.query(WorkFile).all()],
                "work_tags": [_row_to_dict(r) for r in db.query(WorkTag).all()],
                "performer_tags": [_row_to_dict(r) for r in db.query(PerformerTag).all()],
                "custom_field_definitions": [_row_to_dict(r) for r in db.query(CustomFieldDefinition).all()],
            },
        },
        ensure_ascii=False,
    ).encode("utf-8")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("data.json", data_json)
        for subdir in ("works", "performers"):
            covers_subdir = COVERS_DIR / subdir
            if covers_subdir.exists():
                for img_path in covers_subdir.iterdir():
                    if img_path.is_file():
                        zf.write(img_path, arcname=f"covers/{subdir}/{img_path.name}")

    buf.seek(0)
    date_str = datetime.now(UTC).strftime("%Y-%m-%d")
    filename = f"video-ratings-export-{date_str}.zip"
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/import")
def import_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        file.file.seek(0)
        zf = zipfile.ZipFile(file.file)
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="ZIPファイルが不正です")

    if "data.json" not in zf.namelist():
        raise HTTPException(status_code=400, detail="ZIPに data.json が含まれていません")

    try:
        payload = json.loads(zf.read("data.json").decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(status_code=400, detail="data.json のパースに失敗しました")

    schema_version = payload.get("schema_version")
    if not schema_version:
        raise HTTPException(status_code=400, detail="schema_version が指定されていません")

    current_version = _get_schema_version(db)
    if schema_version != current_version:
        raise HTTPException(
            status_code=400,
            detail=f"schema_version が一致しません (ファイル: {schema_version}, DB: {current_version})",
        )

    data = payload.get("data")
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="data フィールドが不正です")

    try:
        # 外部キー順を考慮した削除（依存が多いものから先に削除）
        db.query(WorkTag).delete()
        db.query(PerformerTag).delete()
        db.query(WorkPerformer).delete()
        db.query(WorkFile).delete()
        db.query(Work).delete()
        db.query(Performer).delete()
        db.query(Tag).delete()
        db.query(TagCategory).delete()
        db.query(CustomFieldDefinition).delete()

        # 再挿入（外部キー順を考慮して親から先に挿入）
        for row in data.get("tag_categories", []):
            db.execute(TagCategory.__table__.insert().values(**row))
        for row in data.get("tags", []):
            db.execute(Tag.__table__.insert().values(**row))
        for row in data.get("works", []):
            db.execute(Work.__table__.insert().values(**row))
        for row in data.get("performers", []):
            db.execute(Performer.__table__.insert().values(**row))
        for row in data.get("work_performers", []):
            db.execute(WorkPerformer.__table__.insert().values(**row))
        for row in data.get("work_files", []):
            db.execute(WorkFile.__table__.insert().values(**row))
        for row in data.get("work_tags", []):
            db.execute(WorkTag.__table__.insert().values(**row))
        for row in data.get("performer_tags", []):
            db.execute(PerformerTag.__table__.insert().values(**row))
        for row in data.get("custom_field_definitions", []):
            db.execute(CustomFieldDefinition.__table__.insert().values(**row))

        # シーケンスを最大 ID に合わせてリセット（SERIAL カラムを持つテーブルのみ）
        for table, col in [
            ("tag_categories", "id"),
            ("tags", "id"),
            ("works", "id"),
            ("performers", "id"),
            ("work_files", "id"),
            ("custom_field_definitions", "id"),
        ]:
            db.execute(
                text(
                    f"SELECT setval(pg_get_serial_sequence('{table}', '{col}'),"
                    f" COALESCE((SELECT MAX({col}) FROM {table}), 1))"
                )
            )

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"インポートに失敗しました: {str(e)}")

    # 画像の洗い替え（DBコミット後に実行）
    # 一時ディレクトリに展開・検証後、アトミックにディレクトリを差し替え
    temp_dir = COVERS_DIR.parent / "covers_tmp"
    shutil.rmtree(temp_dir, ignore_errors=True)
    temp_dir.mkdir(parents=True)

    try:
        resolved_temp = temp_dir.resolve()
        cover_entries = [name for name in zf.namelist() if name.startswith("covers/") and not name.endswith("/")]
        for entry in cover_entries:
            dest = (temp_dir / Path(entry).relative_to("covers")).resolve()
            if not dest.is_relative_to(resolved_temp):
                raise HTTPException(status_code=400, detail="不正なファイルパスが含まれています")
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(zf.read(entry))
    except HTTPException:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"画像の展開に失敗しました: {str(e)}")

    shutil.rmtree(COVERS_DIR, ignore_errors=True)
    temp_dir.rename(COVERS_DIR)

    return {"message": "インポートが完了しました"}
