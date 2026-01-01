from pydantic import BaseModel, Field
from typing import Optional

class QueryParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(100, ge=1, le=500)
    sort_by: Optional[str] = None
    order: str = Field("asc", pattern="^(asc|desc)$")
    q: Optional[str] = None
