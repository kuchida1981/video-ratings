from enum import StrEnum

from pydantic import BaseModel


class EntityType(StrEnum):
    work = "work"
    performer = "performer"


class TagCategoryBase(BaseModel):
    name: str
    entity_type: EntityType
    is_multi_select: bool = True
    description: str | None = None


class TagCategoryCreate(TagCategoryBase):
    pass


class TagCategoryUpdate(BaseModel):
    name: str | None = None
    is_multi_select: bool | None = None
    description: str | None = None


class TagBase(BaseModel):
    name: str
    score: int | None = None
    description: str | None = None


class TagCreate(TagBase):
    category_id: int


class TagUpdate(BaseModel):
    name: str | None = None
    score: int | None = None
    description: str | None = None


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
