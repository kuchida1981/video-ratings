from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import TagCategory, Tag
from app.schemas.tag import (
    TagCategoryCreate,
    TagCategoryUpdate,
    TagCategoryResponse,
    TagCreate,
    TagUpdate,
    TagResponse,
    ReorderRequest,
)

router = APIRouter(tags=["tags"])


@router.put("/tag-categories/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_categories(data: ReorderRequest, db: Session = Depends(get_db)):
    for i, category_id in enumerate(data.ids):
        db.query(TagCategory).filter(TagCategory.id == category_id).update({"sort_order": i})
    db.commit()


@router.put("/tags/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_tags(data: ReorderRequest, db: Session = Depends(get_db)):
    for i, tag_id in enumerate(data.ids):
        db.query(Tag).filter(Tag.id == tag_id).update({"sort_order": i})
    db.commit()


@router.get("/tag-categories", response_model=list[TagCategoryResponse])
def list_categories(entity_type: str | None = None, db: Session = Depends(get_db)):
    q = db.query(TagCategory).options(joinedload(TagCategory.tags))
    if entity_type:
        q = q.filter(TagCategory.entity_type == entity_type)
    return q.order_by(TagCategory.sort_order.asc(), TagCategory.id.asc()).all()


@router.post("/tag-categories", response_model=TagCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(data: TagCategoryCreate, db: Session = Depends(get_db)):
    max_order = db.query(func.max(TagCategory.sort_order)).filter(TagCategory.entity_type == data.entity_type).scalar()
    if max_order is None:
        max_order = -1
    cat = TagCategory(**data.model_dump(), sort_order=max_order + 1)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return db.query(TagCategory).options(joinedload(TagCategory.tags)).filter(TagCategory.id == cat.id).first()


@router.put("/tag-categories/{category_id}", response_model=TagCategoryResponse)
def update_category(category_id: int, data: TagCategoryUpdate, db: Session = Depends(get_db)):
    cat = db.query(TagCategory).filter(TagCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    db.commit()
    return db.query(TagCategory).options(joinedload(TagCategory.tags)).filter(TagCategory.id == category_id).first()


@router.delete("/tag-categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(TagCategory).filter(TagCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()


@router.get("/tags", response_model=list[TagResponse])
def list_tags(category_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(Tag)
    if category_id:
        q = q.filter(Tag.category_id == category_id)
    return q.all()


@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(data: TagCreate, db: Session = Depends(get_db)):
    if not db.query(TagCategory).filter(TagCategory.id == data.category_id).first():
        raise HTTPException(status_code=404, detail="Category not found")
    max_order = db.query(func.max(Tag.sort_order)).filter(Tag.category_id == data.category_id).scalar()
    if max_order is None:
        max_order = -1
    tag = Tag(**data.model_dump(), sort_order=max_order + 1)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.put("/tags/{tag_id}", response_model=TagResponse)
def update_tag(tag_id: int, data: TagUpdate, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(tag, field, value)
    db.commit()
    return tag


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
