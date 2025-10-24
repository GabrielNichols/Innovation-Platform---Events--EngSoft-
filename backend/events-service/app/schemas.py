from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, validator

from shared import Event, EventStatus


class EventBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    start_date: datetime
    end_date: datetime
    location: str = Field(..., min_length=3)
    categories: List[str] = Field(..., min_items=1)
    tags: List[str] = Field(default_factory=list)
    max_participants: int = Field(..., ge=1)
    max_teams: int = Field(..., ge=0)

    @validator("end_date")
    def validate_dates(cls, value: datetime, values: dict) -> datetime:
        start = values.get("start_date")
        if start and value < start:
            raise ValueError("end_date must be after start_date")
        return value


class EventCreate(EventBase):
    organizer_id: Optional[str] = None
    status: EventStatus = EventStatus.DRAFT


class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = Field(None, min_length=3)
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    max_participants: Optional[int] = Field(None, ge=1)
    max_teams: Optional[int] = Field(None, ge=0)
    organizer_id: Optional[str] = None

    @validator("end_date")
    def validate_end_date(cls, value: datetime, values: dict) -> datetime:
        start = values.get("start_date")
        if value and start and value < start:
            raise ValueError("end_date must be after start_date")
        return value


class EventStatusUpdate(BaseModel):
    status: EventStatus


class EventManagementResponse(BaseModel):
    events: List[Event]
    total: int
