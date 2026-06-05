from pydantic import BaseModel
from typing import Optional
from enum import Enum


class EntityType(str, Enum):
    work = "work"
    performer = "performer"


class TagCategoryBase(BaseModel):
    name: str
    entity_type: EntityType
    is_multi_select: bool = True
    description: Optional[str] = None


class TagCategoryCreate(TagCategoryBase):
    pass


class TagCategoryUpdate(BaseModel):
    name: Optional[str] = None
    is_multi_select: Optional[bool] = None
    description: Optional[str] = None


class TagBase(BaseModel):
    name: str
    score: Optional[int] = None
    description: Optional[str] = None


class TagCreate(TagBase):
    category_id: int


class TagUpdate(BaseModel):
    name: Optional[str] = None
    score: Optional[int] = None
    description: Optional[str] = None


class ReorderRequest(BaseModel):
    ids: list[int]


class TagResponse(TagBase):
    id: int
    category_id: int
    sort_order: int

    model_config = {"from_attributes": True}


class TagCategoryResponse(TagCategoryBase):
    id: int
    sort_order: int
    tags: list[TagResponse] = []

    model_config = {"from_attributes": True}
