
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Ticket:
    id: str
    event_id: str
    participant_id: str
    created_at: datetime
    checked_in_at: Optional[datetime] = None
    status: str = "issued"  # issued | checked_in | canceled
