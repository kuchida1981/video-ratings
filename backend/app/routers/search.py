from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import Performer, PerformerTag, Work, WorkPerformer, WorkTag
from app.schemas.work import WorkListResponse
from app.services.score_calculator import score_calculator

router = APIRouter(prefix="/works/search", tags=["search"])


@router.get("", response_model=list[WorkListResponse])
def search_works(
    keyword: str | None = Query(None),
    tag_ids: list[int] | None = Query(None),
    maker: str | None = Query(None),
    series: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_desc: bool = Query(True),
    db: Session = Depends(get_db),
):
    q = db.query(Work).options(
        joinedload(Work.work_performers)
        .joinedload(WorkPerformer.performer)
        .joinedload(Performer.performer_tags)
        .joinedload(PerformerTag.tag),
        joinedload(Work.work_tags).joinedload(WorkTag.tag),
    )

    if keyword:
        like = f"%{keyword}%"
        q = (
            q.outerjoin(Work.work_performers)
            .outerjoin(WorkPerformer.performer)
            .filter(
                or_(
                    Work.title.ilike(like),
                    Work.maker.ilike(like),
                    Work.series.ilike(like),
                    Performer.name.ilike(like),
                    Performer.furigana.ilike(like),
                )
            )
            .distinct()
        )

    if maker:
        q = q.filter(Work.maker.ilike(f"%{maker}%"))

    if series:
        q = q.filter(Work.series.ilike(f"%{series}%"))

    if tag_ids:
        for tid in tag_ids:
            q = q.filter(Work.work_tags.any(WorkTag.tag_id == tid))

    works = q.all()

    result = [
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
        }
        for w in works
    ]

    if sort_by == "total_score":
        result.sort(key=lambda x: x["total_score"], reverse=sort_desc)
    else:
        result.sort(key=lambda x: x["created_at"], reverse=sort_desc)

    return result
