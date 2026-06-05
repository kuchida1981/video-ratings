from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PerformerBase(BaseModel):
    name: str
    furigana: Optional[str] = None


class PerformerCreate(PerformerBase):
    pass


class PerformerUpdate(BaseModel):
    name: Optional[str] = None
    furigana: Optional[str] = None


class TagSummary(BaseModel):
    id: int
    name: str
    score: Optional[int]

    model_config = {"from_attributes": True}


class PerformerResponse(PerformerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    tags: list[TagSummary] = []
    total_score: int = 0

    model_config = {"from_attributes": True}
