import csv
import io
import unicodedata

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Performer, PerformerAlias, Work, WorkFile, WorkPerformer
from app.schemas.imports import (
    ImportExecuteRequest,
    ImportPreviewResponse,
    ImportResult,
    ImportRow,
    PerformerMatch,
)

router = APIRouter(prefix="/import", tags=["import"])


def _parse_csv(content: bytes) -> list[dict]:
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for i, row in enumerate(reader, start=2):
        title = unicodedata.normalize("NFC", (row.get("title") or "").strip())
        raw_names = (row.get("performer_names") or "").strip()
        raw_furiganas = (row.get("performer_furiganas") or "").strip()
        directory_path = (row.get("directory_path") or "").strip() or None

        performer_names = (
            [unicodedata.normalize("NFC", n.strip()) for n in raw_names.split(",") if n.strip()] if raw_names else []
        )
        performer_furiganas = (
            [unicodedata.normalize("NFC", f.strip()) for f in raw_furiganas.split(",") if f.strip()]
            if raw_furiganas
            else []
        )

        errors = []
        if not title:
            errors.append("title is required")

        rows.append(
            {
                "row_number": i,
                "title": title or None,
                "performer_names": performer_names,
                "performer_furiganas": performer_furiganas,
                "directory_path": directory_path,
                "errors": errors,
                "is_valid": len(errors) == 0,
            }
        )
    return rows


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_import(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file required")
    content = await file.read()
    raw_rows = _parse_csv(content)

    rows = []
    for r in raw_rows:
        errors = r["errors"]
        is_valid = r["is_valid"]

        performer_matches = []
        performer_names = r["performer_names"]
        performer_furiganas = r["performer_furiganas"]

        for idx, name in enumerate(performer_names):
            furigana = performer_furiganas[idx] if idx < len(performer_furiganas) else None

            # NFC/NFD 両形式でDBを検索（DB内に正規化前のデータが混在する可能性への対処）
            name_variants = list({name, unicodedata.normalize("NFD", name)})
            performer = db.query(Performer).filter(Performer.name.in_(name_variants)).first()
            if not performer:
                alias = db.query(PerformerAlias).filter(PerformerAlias.name.in_(name_variants)).first()
                if alias:
                    performer = alias.performer

            if performer:
                existing_aliases = [a.name for a in performer.aliases]
                performer_matches.append(
                    PerformerMatch(
                        name=name,
                        furigana=furigana,
                        existing_id=performer.id,
                        existing_name=performer.name,
                        existing_aliases=existing_aliases,
                    )
                )
            else:
                performer_matches.append(
                    PerformerMatch(
                        name=name, furigana=furigana, existing_id=None, existing_name=None, existing_aliases=[]
                    )
                )

        is_duplicate_suspect = False
        duplicate_hint = None

        if is_valid and r["title"]:
            title = r["title"]
            # 新規出演者が1人でもいれば、既存作品と同一にはなり得ない
            has_new_performers = any(m.existing_id is None for m in performer_matches)
            if not has_new_performers:
                # NFC/NFD 両形式でタイトル検索
                title_variants = list({title, unicodedata.normalize("NFD", title)})
                existing_works = db.query(Work).filter(Work.title.in_(title_variants)).all()
                import_ids = {m.existing_id for m in performer_matches}

                for work in existing_works:
                    db_ids = {wp.performer_id for wp in work.work_performers}
                    if import_ids == db_ids:
                        is_duplicate_suspect = True
                        duplicate_hint = f"既存作品 ID:{work.id} と同一の可能性があります"
                        break

        import_row = ImportRow(
            row_number=r["row_number"],
            title=r["title"],
            performers=performer_matches,
            directory_path=r["directory_path"],
            errors=errors,
            is_valid=is_valid,
            is_duplicate_suspect=is_duplicate_suspect,
            duplicate_hint=duplicate_hint,
        )
        rows.append(import_row)

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
        try:
            work = Work(title=row.title, custom_fields={})
            db.add(work)
            db.flush()

            if row.directory_path:
                work_file = WorkFile(work_id=work.id, path=row.directory_path)
                db.add(work_file)

            for idx, perf_info in enumerate(row.performers):
                if perf_info.performer_id is not None:
                    performer = db.query(Performer).filter(Performer.id == perf_info.performer_id).first()
                    if not performer:
                        raise ValueError(f"Performer with ID {perf_info.performer_id} not found")
                else:
                    performer = Performer(name=perf_info.name, furigana=perf_info.furigana)
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
