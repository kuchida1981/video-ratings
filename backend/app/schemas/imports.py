from pydantic import BaseModel
from typing import Optional


class ImportRow(BaseModel):
    row_number: int
    title: Optional[str]
    performer_names: list[str]
    performer_furiganas: list[str]
    directory_path: Optional[str]
    errors: list[str] = []
    is_valid: bool = True


class ImportPreviewResponse(BaseModel):
    rows: list[ImportRow]
    valid_count: int
    error_count: int


class ImportExecuteRequest(BaseModel):
    rows: list[ImportRow]


class ImportResult(BaseModel):
    created_count: int
    skipped_count: int
    errors: list[str]
