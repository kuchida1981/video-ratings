from datetime import datetime
from typing import Any

from pydantic import BaseModel


class PerformerBase(BaseModel):
    name: str
    furigana: str | None = None


class PerformerCreate(PerformerBase):
    pass


class PerformerUpdate(BaseModel):
    name: str | None = None
    furigana: str | None = None


class TagSummary(BaseModel):
    id: int
    name: str
    score: int | None

    model_config = {"from_attributes": True}


class AliasCreate(BaseModel):
    name: str
    furigana: str | None = None


class AliasUpdate(BaseModel):
    name: str | None = None
    furigana: str | None = None


class AliasResponse(BaseModel):
    id: int
    name: str
    furigana: str | None = None

    model_config = {"from_attributes": True}


class PerformerResponse(PerformerBase):
    id: int
    custom_fields: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime
    tags: list[TagSummary] = []
    aliases: list[AliasResponse] = []
    total_score: int = 0
    work_count: int = 0
    cover_image_url: str | None = None

    model_config = {"from_attributes": True}
