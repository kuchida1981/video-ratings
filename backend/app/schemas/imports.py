from pydantic import BaseModel


class ImportRow(BaseModel):
    row_number: int
    title: str | None
    performer_names: list[str]
    performer_furiganas: list[str]
    directory_path: str | None
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
