from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.models import Performer, PerformerTag, Work, WorkPerformer, WorkTag
from app.services.score_calculator import score_calculator


def load_work(db: Session, work_id: int) -> Work:
    work = (
        db.query(Work)
        .options(
            joinedload(Work.work_performers)
            .joinedload(WorkPerformer.performer)
            .joinedload(Performer.performer_tags)
            .joinedload(PerformerTag.tag),
            joinedload(Work.files),
            joinedload(Work.work_tags).joinedload(WorkTag.tag),
        )
        .filter(Work.id == work_id)
        .first()
    )
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    return work


def build_work_response(work: Work) -> dict[str, Any]:
    total_score = score_calculator.calculate_work_total_score(work)
    performers = [
        {
            "id": wp.performer.id,
            "name": wp.performer.name,
            "furigana": wp.performer.furigana,
            "is_main": wp.is_main,
            "tags": [
                {
                    "id": pt.tag.id,
                    "name": pt.tag.name,
                    "score": pt.tag.score,
                    "category_id": pt.tag.category_id,
                }
                for pt in wp.performer.performer_tags
            ],
            "total_score": score_calculator.calculate_performer_score(wp.performer),
            "custom_fields": wp.performer.custom_fields,
        }
        for wp in work.work_performers
    ]
    tags = [
        {
            "id": wt.tag.id,
            "name": wt.tag.name,
            "score": wt.tag.score,
            "category_id": wt.tag.category_id,
        }
        for wt in work.work_tags
    ]
    return {
        "id": work.id,
        "title": work.title,
        "maker": work.maker,
        "series": work.series,
        "custom_fields": work.custom_fields,
        "memo": work.memo,
        "created_at": work.created_at,
        "updated_at": work.updated_at,
        "files": work.files,
        "performers": performers,
        "tags": tags,
        "total_score": total_score,
        "cover_image_url": f"/static/covers/{work.cover_image_path}" if work.cover_image_path else None,
    }
