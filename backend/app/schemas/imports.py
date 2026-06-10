from pydantic import BaseModel


class PerformerMatch(BaseModel):
    name: str
    furigana: str | None
    existing_id: int | None
    existing_name: str | None
    existing_aliases: list[str]


class ImportRow(BaseModel):
    row_number: int
    title: str | None
    performers: list[PerformerMatch]
    directory_path: str | None
    errors: list[str] = []
    is_valid: bool = True
    is_duplicate_suspect: bool = False
    duplicate_hint: str | None = None


class ImportPreviewResponse(BaseModel):
    rows: list[ImportRow]
    valid_count: int
    error_count: int


class PerformerExecuteInfo(BaseModel):
    name: str
    furigana: str | None
    performer_id: int | None


class ExecuteRow(BaseModel):
    row_number: int
    title: str | None
    performers: list[PerformerExecuteInfo]
    directory_path: str | None


class ImportExecuteRequest(BaseModel):
    rows: list[ExecuteRow]


class ImportResult(BaseModel):
    created_count: int
    skipped_count: int
    errors: list[str]
