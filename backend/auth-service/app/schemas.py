from __future__ import annotations

from typing import Optional

from pydantic import BaseModel

from shared import User


class TokenValidationRequest(BaseModel):
    token: str


class TokenValidationResponse(BaseModel):
    valid: bool
    user: Optional[User] = None
    detail: Optional[str] = None
