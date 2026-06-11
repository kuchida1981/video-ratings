from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db
from app.models.models import Performer, PerformerAlias, PerformerTag, Tag, Work, WorkPerformer, WorkTag
from app.schemas.performer import (
    AliasCreate,
    AliasUpdate,
    PerformerCreate,
    PerformerResponse,
    PerformerUpdate,
)
from app.schemas.work import WorkListResponse
from app.services import cover_service, performer_service
from app.services.score_calculator import score_calculator

router = APIRouter(prefix="/performers", tags=["performers"])


@router.get("", response_model=list[PerformerResponse])
def list_performers(db: Session = Depends(get_db)):
    performers = (
        db.query(Performer)
        .options(
            joinedload(Performer.performer_tags).joinedload(PerformerTag.tag),
            joinedload(Performer.work_performers)
            .joinedload(WorkPerformer.work)
            .joinedload(Work.work_tags)
            .joinedload(WorkTag.tag),
            joinedload(Performer.work_performers)
            .joinedload(WorkPerformer.work)
            .joinedload(Work.work_performers)
            .joinedload(WorkPerformer.performer)
            .joinedload(Performer.performer_tags)
            .joinedload(PerformerTag.tag),
            joinedload(Performer.aliases),
        )
        .order_by(Performer.furigana, Performer.name)
        .all()
    )
    return [performer_service.build_performer_response(p) for p in performers]


@router.get("/{performer_id}", response_model=PerformerResponse)
def get_performer(performer_id: int, db: Session = Depends(get_db)):
    return performer_service.build_performer_response(performer_service.load_performer(db, performer_id))


@router.post("", response_model=PerformerResponse, status_code=status.HTTP_201_CREATED)
def create_performer(data: PerformerCreate, db: Session = Depends(get_db)):
    p = Performer(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return performer_service.build_performer_response(performer_service.load_performer(db, p.id))


@router.put("/{performer_id}", response_model=PerformerResponse)
def update_performer(performer_id: int, data: PerformerUpdate, db: Session = Depends(get_db)):
    p = db.query(Performer).filter(Performer.id == performer_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Performer not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    db.commit()
    return performer_service.build_performer_response(performer_service.load_performer(db, performer_id))


@router.delete("/{performer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_performer(performer_id: int, db: Session = Depends(get_db)):
    p = db.query(Performer).filter(Performer.id == performer_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Performer not found")
    db.delete(p)
    db.commit()


@router.get("/{performer_id}/works", response_model=list[WorkListResponse])
def get_performer_works(performer_id: int, db: Session = Depends(get_db)):
    if not db.query(Performer).filter(Performer.id == performer_id).first():
        raise HTTPException(status_code=404, detail="Performer not found")
    works = (
        db.query(Work)
        .join(WorkPerformer)
        .options(
            joinedload(Work.work_performers)
            .joinedload(WorkPerformer.performer)
            .joinedload(Performer.performer_tags)
            .joinedload(PerformerTag.tag),
            joinedload(Work.work_tags).joinedload(WorkTag.tag),
        )
        .filter(WorkPerformer.performer_id == performer_id)
        .all()
    )
    return [
        {
            "id": w.id,
            "title": w.title,
            "maker": w.maker,
            "series": w.series,
            "created_at": w.created_at,
            "total_score": score_calculator.calculate_work_total_score(w),
            "performers": [{"id": wp.performer.id, "name": wp.performer.name} for wp in w.work_performers],
            "custom_fields": w.custom_fields,
            "tags": [{"id": wt.tag.id, "name": wt.tag.name, "category_id": wt.tag.category_id} for wt in w.work_tags],
            "cover_image_url": f"/static/covers/{w.cover_image_path}" if w.cover_image_path else None,
        }
        for w in works
    ]


@router.post("/{performer_id}/tags/{tag_id}", response_model=PerformerResponse)
def add_tag(performer_id: int, tag_id: int, db: Session = Depends(get_db)):
    p = performer_service.load_performer(db, performer_id)
    tag = db.query(Tag).options(joinedload(Tag.category)).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag.category.entity_type != "performer":
        raise HTTPException(status_code=400, detail="Tag does not belong to a performer category")

    if not tag.category.is_multi_select:
        same_cat_tag_ids = [t.id for t in tag.category.tags]
        db.query(PerformerTag).filter(
            PerformerTag.performer_id == performer_id, PerformerTag.tag_id.in_(same_cat_tag_ids)
        ).delete(synchronize_session=False)

    existing = (
        db.query(PerformerTag).filter(PerformerTag.performer_id == performer_id, PerformerTag.tag_id == tag_id).first()
    )
    if not existing:
        db.add(PerformerTag(performer_id=performer_id, tag_id=tag_id))
        db.commit()
    return performer_service.build_performer_response(p)


@router.delete("/{performer_id}/tags/{tag_id}", response_model=PerformerResponse)
def remove_tag(performer_id: int, tag_id: int, db: Session = Depends(get_db)):
    pt = db.query(PerformerTag).filter(PerformerTag.performer_id == performer_id, PerformerTag.tag_id == tag_id).first()
    if not pt:
        raise HTTPException(status_code=404, detail="Tag association not found")
    db.delete(pt)
    db.commit()
    return performer_service.build_performer_response(performer_service.load_performer(db, performer_id))


@router.post("/{performer_id}/aliases", response_model=PerformerResponse)
def add_alias(performer_id: int, data: AliasCreate, db: Session = Depends(get_db)):
    p = performer_service.load_performer(db, performer_id)
    if not data.name or not data.name.strip():
        raise HTTPException(status_code=400, detail="Alias name cannot be empty")
    alias = PerformerAlias(performer_id=performer_id, name=data.name, furigana=data.furigana)
    db.add(alias)
    db.commit()
    db.refresh(p)
    return performer_service.build_performer_response(p)


@router.put("/{performer_id}/aliases/{alias_id}", response_model=PerformerResponse)
def update_alias(performer_id: int, alias_id: int, data: AliasUpdate, db: Session = Depends(get_db)):
    p = performer_service.load_performer(db, performer_id)
    alias = (
        db.query(PerformerAlias)
        .filter(PerformerAlias.id == alias_id, PerformerAlias.performer_id == performer_id)
        .first()
    )
    if not alias:
        raise HTTPException(status_code=404, detail="Alias not found")

    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data:
        if update_data["name"] is None or not update_data["name"].strip():
            raise HTTPException(status_code=400, detail="Alias name cannot be empty")
        alias.name = update_data["name"]
    if "furigana" in update_data:
        alias.furigana = update_data["furigana"]

    db.commit()
    db.refresh(p)
    return performer_service.build_performer_response(p)


@router.delete("/{performer_id}/aliases/{alias_id}", response_model=PerformerResponse)
def remove_alias(performer_id: int, alias_id: int, db: Session = Depends(get_db)):
    p = performer_service.load_performer(db, performer_id)
    alias = (
        db.query(PerformerAlias)
        .filter(PerformerAlias.id == alias_id, PerformerAlias.performer_id == performer_id)
        .first()
    )
    if not alias:
        raise HTTPException(status_code=404, detail="Alias not found")

    db.delete(alias)
    db.commit()
    db.refresh(p)
    return performer_service.build_performer_response(p)


@router.post("/{performer_id}/cover", response_model=PerformerResponse)
async def upload_cover(performer_id: int, file: UploadFile, db: Session = Depends(get_db)):
    p = db.query(Performer).filter(Performer.id == performer_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Performer not found")
    rel_path = await cover_service.save_cover(file, "performers", performer_id, p.cover_image_path)
    p.cover_image_path = rel_path
    db.commit()
    return performer_service.build_performer_response(performer_service.load_performer(db, performer_id))


@router.delete("/{performer_id}/cover", response_model=PerformerResponse)
def delete_cover(performer_id: int, db: Session = Depends(get_db)):
    p = db.query(Performer).filter(Performer.id == performer_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Performer not found")
    if p.cover_image_path:
        cover_service.delete_cover(p.cover_image_path)
        p.cover_image_path = None
        db.commit()
    return performer_service.build_performer_response(performer_service.load_performer(db, performer_id))


@router.patch("/{performer_id}/custom-fields", response_model=PerformerResponse)
def update_custom_fields(performer_id: int, fields: dict[str, Any], db: Session = Depends(get_db)):
    p = db.query(Performer).filter(Performer.id == performer_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Performer not found")
    current = dict(p.custom_fields or {})
    current.update(fields)
    p.custom_fields = {k: v for k, v in current.items() if v is not None}
    flag_modified(p, "custom_fields")
    db.commit()
    return performer_service.build_performer_response(performer_service.load_performer(db, performer_id))
