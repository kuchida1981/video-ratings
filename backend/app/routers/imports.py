import csv
import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Performer, Work, WorkPerformer
from app.schemas.imports import (
    ImportExecuteRequest,
    ImportPreviewResponse,
    ImportResult,
    ImportRow,
)

router = APIRouter(prefix="/import", tags=["import"])


def _parse_csv(content: bytes) -> list[ImportRow]:
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for i, row in enumerate(reader, start=2):
        title = (row.get("title") or "").strip()
        raw_names = (row.get("performer_names") or "").strip()
        raw_furiganas = (row.get("performer_furiganas") or "").strip()
        directory_path = (row.get("directory_path") or "").strip() or None

        performer_names = [n.strip() for n in raw_names.split(",") if n.strip()] if raw_names else []
        performer_furiganas = [f.strip() for f in raw_furiganas.split(",") if f.strip()] if raw_furiganas else []

        errors = []
        if not title:
            errors.append("title is required")

        import_row = ImportRow(
            row_number=i,
            title=title or None,
            performer_names=performer_names,
            performer_furiganas=performer_furiganas,
            directory_path=directory_path,
            errors=errors,
            is_valid=len(errors) == 0,
        )
        rows.append(import_row)
    return rows


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_import(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file required")
    content = await file.read()
    rows = _parse_csv(content)
    valid_count = sum(1 for r in rows if r.is_valid)
    return ImportPreviewResponse(
        rows=rows,
        valid_count=valid_count,
        error_count=len(rows) - valid_count,
    )


@router.post("/execute", response_model=ImportResult)
def execute_import(data: ImportExecuteRequest, db: Session = Depends(get_db)):
    created_count = 0
    skipped_count = 0
    errors = []

    for row in data.rows:
        if not row.is_valid:
            skipped_count += 1
            continue
        try:
            work = Work(title=row.title, custom_fields={})
            if row.directory_path:
                work.files = []
            db.add(work)
            db.flush()

            for idx, name in enumerate(row.performer_names):
                furigana = row.performer_furiganas[idx] if idx < len(row.performer_furiganas) else None
                performer = db.query(Performer).filter(Performer.name == name).first()
                if not performer:
                    performer = Performer(name=name, furigana=furigana)
                    db.add(performer)
                    db.flush()
                wp = WorkPerformer(work_id=work.id, performer_id=performer.id, is_main=(idx == 0))
                db.add(wp)

            db.flush()
            created_count += 1
        except Exception as e:
            errors.append(f"Row {row.row_number}: {str(e)}")
            db.rollback()
            skipped_count += 1
            continue

    db.commit()
    return ImportResult(created_count=created_count, skipped_count=skipped_count, errors=errors)
