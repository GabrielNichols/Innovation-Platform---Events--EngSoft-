from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field

from shared import Participant


class ParticipantRegistration(BaseModel):
    name: str = Field(..., min_length=3)
    email: str = Field(..., min_length=5)
    skills: List[str] = Field(default_factory=list)
    profile_complete: bool = False


class ParticipantsListResponse(BaseModel):
    participants: List[Participant]
    total: int
