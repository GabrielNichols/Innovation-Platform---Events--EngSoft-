
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TicketCreate(BaseModel):
    event_id: str = Field(..., examples=["evt_123"])
    participant_id: str = Field(..., examples=["usr_456"])

class TicketRead(BaseModel):
    id: str
    event_id: str
    participant_id: str
    created_at: datetime
    checked_in_at: Optional[datetime] = None
    status: str

class CheckinRequest(BaseModel):
    now: Optional[datetime] = None  # allow override for tests

class BulkIssueRequest(BaseModel):
    event_id: str
    participant_ids: List[str]

class QRPayload(BaseModel):
    ticket_id: str
    event_id: str
    participant_id: str
    ts: datetime
