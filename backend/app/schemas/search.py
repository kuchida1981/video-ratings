from pydantic import BaseModel
from typing import Optional, Any


class SearchParams(BaseModel):
    keyword: Optional[str] = None
    tag_ids: Optional[list[int]] = None
    maker: Optional[str] = None
    series: Optional[str] = None
    custom_filters: Optional[dict[str, Any]] = None
    sort_by: Optional[str] = "created_at"  # 'created_at' | 'total_score'
    sort_desc: bool = True
    page: int = 1
    page_size: int = 20
