from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class WorkFileBase(BaseModel):
    path: str
    display_name: Optional[str] = None
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
    score: Optional[int]
    category_id: int

    model_config = {"from_attributes": True}


class PerformerInWork(BaseModel):
    id: int
    name: str
    furigana: Optional[str]
    is_main: bool
    tags: list[TagInWork] = []
    total_score: int = 0

    model_config = {"from_attributes": True}


class WorkBase(BaseModel):
    title: str
    maker: Optional[str] = None
    series: Optional[str] = None
    custom_fields: Optional[dict[str, Any]] = None


class WorkCreate(WorkBase):
    pass


class WorkUpdate(BaseModel):
    title: Optional[str] = None
    maker: Optional[str] = None
    series: Optional[str] = None
    custom_fields: Optional[dict[str, Any]] = None


class WorkResponse(WorkBase):
    id: int
    created_at: datetime
    updated_at: datetime
    files: list[WorkFileResponse] = []
    performers: list[PerformerInWork] = []
    tags: list[TagInWork] = []
    total_score: int = 0

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
    maker: Optional[str]
    series: Optional[str]
    created_at: datetime
    total_score: int = 0
    performers: list[PerformerNameOnly] = []
    custom_fields: Optional[dict[str, Any]] = None
    tags: list[TagInWorkList] = []

    model_config = {"from_attributes": True}


class AddPerformerToWork(BaseModel):
    performer_id: int
    is_main: bool = False


class SetMainPerformer(BaseModel):
    is_main: bool
