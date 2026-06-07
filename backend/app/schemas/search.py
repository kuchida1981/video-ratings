from typing import Any

from pydantic import BaseModel


class SearchParams(BaseModel):
    keyword: str | None = None
    tag_ids: list[int] | None = None
    maker: str | None = None
    series: str | None = None
    custom_filters: dict[str, Any] | None = None
    sort_by: str | None = "created_at"  # 'created_at' | 'total_score'
    sort_desc: bool = True
    page: int = 1
    page_size: int = 20
