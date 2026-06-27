from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class FieldType(StrEnum):
    text = "text"
    number = "number"
    date = "date"
    boolean = "boolean"


class CustomFieldDefinitionCreate(BaseModel):
    name: str
    field_type: FieldType
    entity_type: str = "work"
    is_sortable: bool = False
    is_search_keyword: bool = False


class CustomFieldDefinitionUpdate(BaseModel):
    name: str | None = None
    is_sortable: bool | None = None
    is_search_keyword: bool | None = None


class CustomFieldDefinitionResponse(BaseModel):
    id: int
    name: str
    field_type: FieldType
    entity_type: str
    sort_order: int
    is_sortable: bool
    is_search_keyword: bool
    created_at: datetime

    model_config = {"from_attributes": True}
