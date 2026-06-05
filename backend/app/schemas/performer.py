from pydantic import BaseModel
from typing import Any, Dict, Optional
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
    custom_fields: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    tags: list[TagSummary] = []
    total_score: int = 0
    work_count: int = 0

    model_config = {"from_attributes": True}
