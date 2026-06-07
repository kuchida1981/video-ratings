from datetime import datetime
from typing import Any

from pydantic import BaseModel


class WorkFileBase(BaseModel):
    path: str
    display_name: str | None = None
    order: int = 0


class WorkFileCreate(WorkFileBase):
    pass


class WorkFileResponse(WorkFileBase):
    id: int
    work_id: int

    model_config = {"from_attributes": True}


class TagInWork(BaseModel):
    id: int
    name: str
    score: int | None
    category_id: int

    model_config = {"from_attributes": True}


class PerformerInWork(BaseModel):
    id: int
    name: str
    furigana: str | None
    is_main: bool
    tags: list[TagInWork] = []
    total_score: int = 0
    custom_fields: dict[str, Any] | None = None

    model_config = {"from_attributes": True}


class WorkBase(BaseModel):
    title: str
    maker: str | None = None
    series: str | None = None
    custom_fields: dict[str, Any] | None = None


class WorkCreate(WorkBase):
    pass


class WorkUpdate(BaseModel):
    title: str | None = None
    maker: str | None = None
    series: str | None = None
    custom_fields: dict[str, Any] | None = None


class WorkResponse(WorkBase):
    id: int
    created_at: datetime
    updated_at: datetime
    files: list[WorkFileResponse] = []
    performers: list[PerformerInWork] = []
    tags: list[TagInWork] = []
    total_score: int = 0
    cover_image_url: str | None = None

    model_config = {"from_attributes": True}


class PerformerNameOnly(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class TagInWorkList(BaseModel):
    id: int
    name: str
    category_id: int


class WorkListResponse(BaseModel):
    id: int
    title: str
    maker: str | None
    series: str | None
    created_at: datetime
    total_score: int = 0
    performers: list[PerformerNameOnly] = []
    custom_fields: dict[str, Any] | None = None
    tags: list[TagInWorkList] = []
    cover_image_url: str | None = None

    model_config = {"from_attributes": True}


class AddPerformerToWork(BaseModel):
    performer_id: int
    is_main: bool = False


class SetMainPerformer(BaseModel):
    is_main: bool
