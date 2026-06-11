from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified

from app.config import settings
from app.database import get_db
from app.models.models import Performer, PerformerTag, Tag, Work, WorkFile, WorkPerformer, WorkTag
from app.schemas.work import (
    AddPerformerToWork,
    SetMainPerformer,
    WorkCreate,
    WorkFileCreate,
    WorkFileResponse,
    WorkFileUpdate,
    WorkListResponse,
    WorkResponse,
    WorkUpdate,
)
from app.services import cover_service, work_service
from app.services.score_calculator import score_calculator
from app.services.smb import (
    get_smb_file_size,
    guess_content_type,
    register_smb_session,
    smb_url_to_unc,
    stream_smb_file_async,
)

router = APIRouter(prefix="/works", tags=["works"])


@router.get("", response_model=list[WorkListResponse])
def list_works(db: Session = Depends(get_db)):
    works = (
        db.query(Work)
        .options(
            joinedload(Work.work_performers)
            .joinedload(WorkPerformer.performer)
            .joinedload(Performer.performer_tags)
            .joinedload(PerformerTag.tag),
            joinedload(Work.work_tags).joinedload(WorkTag.tag),
            joinedload(Work.files),
        )
        .order_by(Work.created_at.desc())
        .all()
    )
    result = []
    for w in works:
        result.append(
            {
                "id": w.id,
                "title": w.title,
                "maker": w.maker,
                "series": w.series,
                "created_at": w.created_at,
                "total_score": score_calculator.calculate_work_total_score(w),
                "performers": [{"id": wp.performer.id, "name": wp.performer.name} for wp in w.work_performers],
                "custom_fields": w.custom_fields,
                "tags": [
                    {"id": wt.tag.id, "name": wt.tag.name, "category_id": wt.tag.category_id} for wt in w.work_tags
                ],
                "cover_image_url": f"/static/covers/{w.cover_image_path}" if w.cover_image_path else None,
                "file_count": len(w.files),
            }
        )
    return result


@router.get("/{work_id}", response_model=WorkResponse)
def get_work(work_id: int, db: Session = Depends(get_db)):
    work = work_service.load_work(db, work_id)
    return work_service.build_work_response(work)


@router.post("", response_model=WorkResponse, status_code=status.HTTP_201_CREATED)
def create_work(data: WorkCreate, db: Session = Depends(get_db)):
    work = Work(**data.model_dump())
    db.add(work)
    db.commit()
    db.refresh(work)
    return work_service.build_work_response(work_service.load_work(db, work.id))


@router.put("/{work_id}", response_model=WorkResponse)
def update_work(work_id: int, data: WorkUpdate, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(work, field, value)
    db.commit()
    return work_service.build_work_response(work_service.load_work(db, work_id))


@router.delete("/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work(work_id: int, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    db.delete(work)
    db.commit()


@router.post("/{work_id}/files", response_model=WorkFileResponse, status_code=status.HTTP_201_CREATED)
def add_file(work_id: int, data: WorkFileCreate, db: Session = Depends(get_db)):
    if not db.query(Work).filter(Work.id == work_id).first():
        raise HTTPException(status_code=404, detail="Work not found")
    f = WorkFile(work_id=work_id, **data.model_dump())
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@router.patch("/{work_id}/files/{file_id}", response_model=WorkFileResponse)
def update_file(work_id: int, file_id: int, data: WorkFileUpdate, db: Session = Depends(get_db)):
    f = db.query(WorkFile).filter(WorkFile.id == file_id, WorkFile.work_id == work_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(f, key, value)
    db.commit()
    db.refresh(f)
    return f


@router.get("/{work_id}/files/{file_id}/stream")
async def stream_file(work_id: int, file_id: int, request: Request, db: Session = Depends(get_db)):
    f = db.query(WorkFile).filter(WorkFile.id == file_id, WorkFile.work_id == work_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")
    if not f.path.startswith("smb://"):
        raise HTTPException(status_code=400, detail="Not an SMB path")
    if not settings.smb_username or not settings.smb_password:
        raise HTTPException(status_code=503, detail="SMB credentials not configured")

    try:
        host, unc_path = smb_url_to_unc(f.path)
        register_smb_session(host, settings.smb_username, settings.smb_password)
        file_size = get_smb_file_size(unc_path)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"SMB error: {e}")

    content_type = guess_content_type(f.path)
    range_header = request.headers.get("Range")

    if range_header:
        try:
            range_spec = range_header.removeprefix("bytes=")
            start_str, end_str = range_spec.split("-", 1)
            start = int(start_str)
            end = int(end_str) if end_str else file_size - 1
        except (ValueError, AttributeError):
            raise HTTPException(status_code=400, detail="Invalid Range header")
        end = min(end, file_size - 1)
        return StreamingResponse(
            stream_smb_file_async(unc_path, start, end),
            status_code=206,
            media_type=content_type,
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Content-Length": str(end - start + 1),
                "Accept-Ranges": "bytes",
            },
        )

    return StreamingResponse(
        stream_smb_file_async(unc_path, 0, file_size - 1),
        media_type=content_type,
        headers={
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes",
        },
    )


@router.delete("/{work_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_file(work_id: int, file_id: int, db: Session = Depends(get_db)):
    f = db.query(WorkFile).filter(WorkFile.id == file_id, WorkFile.work_id == work_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")
    db.delete(f)
    db.commit()


@router.post("/{work_id}/performers", response_model=WorkResponse)
def add_performer(work_id: int, data: AddPerformerToWork, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    if not db.query(Performer).filter(Performer.id == data.performer_id).first():
        raise HTTPException(status_code=404, detail="Performer not found")
    existing = (
        db.query(WorkPerformer)
        .filter(WorkPerformer.work_id == work_id, WorkPerformer.performer_id == data.performer_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Performer already associated")
    if data.is_main:
        db.query(WorkPerformer).filter(WorkPerformer.work_id == work_id).update({"is_main": False})
    wp = WorkPerformer(work_id=work_id, performer_id=data.performer_id, is_main=data.is_main)
    db.add(wp)
    db.commit()
    return work_service.build_work_response(work_service.load_work(db, work_id))


@router.delete("/{work_id}/performers/{performer_id}", response_model=WorkResponse)
def remove_performer(work_id: int, performer_id: int, db: Session = Depends(get_db)):
    wp = (
        db.query(WorkPerformer)
        .filter(WorkPerformer.work_id == work_id, WorkPerformer.performer_id == performer_id)
        .first()
    )
    if not wp:
        raise HTTPException(status_code=404, detail="Association not found")
    db.delete(wp)
    db.commit()
    return work_service.build_work_response(work_service.load_work(db, work_id))


@router.patch("/{work_id}/performers/{performer_id}", response_model=WorkResponse)
def set_main_performer(work_id: int, performer_id: int, data: SetMainPerformer, db: Session = Depends(get_db)):
    wp = (
        db.query(WorkPerformer)
        .filter(WorkPerformer.work_id == work_id, WorkPerformer.performer_id == performer_id)
        .first()
    )
    if not wp:
        raise HTTPException(status_code=404, detail="Association not found")
    if data.is_main:
        db.query(WorkPerformer).filter(WorkPerformer.work_id == work_id).update({"is_main": False})
    wp.is_main = data.is_main
    db.commit()
    return work_service.build_work_response(work_service.load_work(db, work_id))


@router.post("/{work_id}/tags/{tag_id}", response_model=WorkResponse)
def add_tag(work_id: int, tag_id: int, db: Session = Depends(get_db)):
    work_service.load_work(db, work_id)
    tag = db.query(Tag).options(joinedload(Tag.category)).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag.category.entity_type != "work":
        raise HTTPException(status_code=400, detail="Tag does not belong to a work category")

    if not tag.category.is_multi_select:
        same_cat_tag_ids = [t.id for t in tag.category.tags]
        db.query(WorkTag).filter(WorkTag.work_id == work_id, WorkTag.tag_id.in_(same_cat_tag_ids)).delete(
            synchronize_session=False
        )

    existing = db.query(WorkTag).filter(WorkTag.work_id == work_id, WorkTag.tag_id == tag_id).first()
    if not existing:
        db.add(WorkTag(work_id=work_id, tag_id=tag_id))
        db.commit()
    return work_service.build_work_response(work_service.load_work(db, work_id))


@router.delete("/{work_id}/tags/{tag_id}", response_model=WorkResponse)
def remove_tag(work_id: int, tag_id: int, db: Session = Depends(get_db)):
    wt = db.query(WorkTag).filter(WorkTag.work_id == work_id, WorkTag.tag_id == tag_id).first()
    if not wt:
        raise HTTPException(status_code=404, detail="Tag association not found")
    db.delete(wt)
    db.commit()
    return work_service.build_work_response(work_service.load_work(db, work_id))


@router.post("/{work_id}/cover", response_model=WorkResponse)
async def upload_cover(work_id: int, file: UploadFile, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    rel_path = await cover_service.save_cover(file, "works", work_id, work.cover_image_path)
    work.cover_image_path = rel_path
    db.commit()
    return work_service.build_work_response(work_service.load_work(db, work_id))


@router.delete("/{work_id}/cover", response_model=WorkResponse)
def delete_cover(work_id: int, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    if work.cover_image_path:
        cover_service.delete_cover(work.cover_image_path)
        work.cover_image_path = None
        db.commit()
    return work_service.build_work_response(work_service.load_work(db, work_id))


@router.patch("/{work_id}/custom-fields", response_model=WorkResponse)
def update_custom_fields(work_id: int, fields: dict[str, Any], db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    current = dict(work.custom_fields or {})
    current.update(fields)
    work.custom_fields = {k: v for k, v in current.items() if v is not None}
    flag_modified(work, "custom_fields")
    db.commit()
    return work_service.build_work_response(work_service.load_work(db, work_id))
