from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.models import Performer, PerformerTag, Work, WorkPerformer, WorkTag
from app.services.score_calculator import score_calculator


def load_performer(db: Session, performer_id: int) -> Performer:
    p = (
        db.query(Performer)
        .options(
            joinedload(Performer.performer_tags).joinedload(PerformerTag.tag),
            joinedload(Performer.aliases),
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
        )
        .filter(Performer.id == performer_id)
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Performer not found")
    return p


def build_performer_response(p: Performer) -> dict:
    works = [wp.work for wp in p.work_performers if wp.work]
    if not works:
        avg_work_score = 0.0
    else:
        avg_work_score = sum(score_calculator.calculate_work_total_score(w) for w in works) / len(works)

    return {
        "id": p.id,
        "name": p.name,
        "furigana": p.furigana,
        "custom_fields": p.custom_fields,
        "memo": p.memo,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "tags": [{"id": pt.tag.id, "name": pt.tag.name, "score": pt.tag.score} for pt in p.performer_tags],
        "aliases": [{"id": alias.id, "name": alias.name, "furigana": alias.furigana} for alias in p.aliases],
        "total_score": score_calculator.calculate_performer_score(p),
        "work_count": len(p.work_performers),
        "avg_work_score": avg_work_score,
        "cover_image_url": f"/static/covers/{p.cover_image_path}" if p.cover_image_path else None,
    }
