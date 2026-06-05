from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.models import CustomFieldDefinition, Work
from app.schemas.custom_field import (
    CustomFieldDefinitionCreate,
    CustomFieldDefinitionUpdate,
    CustomFieldDefinitionResponse,
)

router = APIRouter(prefix="/custom-field-definitions", tags=["custom-fields"])


@router.get("", response_model=list[CustomFieldDefinitionResponse])
def list_definitions(entity_type: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(CustomFieldDefinition)
    if entity_type is not None:
        q = q.filter(CustomFieldDefinition.entity_type == entity_type)
    return q.order_by(CustomFieldDefinition.name).all()


@router.post("", response_model=CustomFieldDefinitionResponse, status_code=status.HTTP_201_CREATED)
def create_definition(data: CustomFieldDefinitionCreate, db: Session = Depends(get_db)):
    existing = db.query(CustomFieldDefinition).filter(CustomFieldDefinition.name == data.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Custom field with this name already exists")
    defn = CustomFieldDefinition(**data.model_dump())
    db.add(defn)
    db.commit()
    db.refresh(defn)
    return defn


@router.put("/{definition_id}", response_model=CustomFieldDefinitionResponse)
def update_definition(definition_id: int, data: CustomFieldDefinitionUpdate, db: Session = Depends(get_db)):
    defn = db.query(CustomFieldDefinition).filter(CustomFieldDefinition.id == definition_id).first()
    if not defn:
        raise HTTPException(status_code=404, detail="Custom field definition not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(defn, field, value)
    db.commit()
    return defn


@router.delete("/{definition_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_definition(definition_id: int, db: Session = Depends(get_db)):
    defn = db.query(CustomFieldDefinition).filter(CustomFieldDefinition.id == definition_id).first()
    if not defn:
        raise HTTPException(status_code=404, detail="Custom field definition not found")
    key = defn.name
    entity_type = defn.entity_type
    db.delete(defn)
    if entity_type == "performer":
        db.execute(
            text("UPDATE performers SET custom_fields = custom_fields - :key WHERE custom_fields ? :key"),
            {"key": key},
        )
    else:
        db.execute(
            text("UPDATE works SET custom_fields = custom_fields - :key WHERE custom_fields ? :key"),
            {"key": key},
        )
    db.commit()
