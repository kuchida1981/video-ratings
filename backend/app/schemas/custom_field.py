from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime


class FieldType(str, Enum):
    text = "text"
    number = "number"
    date = "date"
    boolean = "boolean"


class CustomFieldDefinitionCreate(BaseModel):
    name: str
    field_type: FieldType
    entity_type: str = "work"


class CustomFieldDefinitionUpdate(BaseModel):
    name: Optional[str] = None


class CustomFieldDefinitionResponse(BaseModel):
    id: int
    name: str
    field_type: FieldType
    entity_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
