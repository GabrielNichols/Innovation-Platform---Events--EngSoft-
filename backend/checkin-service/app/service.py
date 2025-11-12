
import uuid
from datetime import datetime
from typing import List, Optional
import httpx
from .models import Ticket
from .storage import JsonStorage
from .config import settings

class CheckinService:
    def __init__(self, storage: JsonStorage):
        self.storage = storage

    def issue_ticket(self, event_id: str, participant_id: str) -> Ticket:
        t = Ticket(
            id=str(uuid.uuid4()),
            event_id=event_id,
            participant_id=participant_id,
            created_at=datetime.utcnow(),
            checked_in_at=None,
            status="issued",
        )
        self.storage.save(t)
        return t

    def bulk_issue(self, event_id: str, participant_ids: List[str]) -> List[Ticket]:
        return [self.issue_ticket(event_id, pid) for pid in participant_ids]

    def get_ticket(self, ticket_id: str) -> Optional[Ticket]:
        return self.storage.get(ticket_id)

    def list_event_tickets(self, event_id: str) -> List[Ticket]:
        return self.storage.list_by_event(event_id)

    async def check_in(self, ticket_id: str, now: Optional[datetime] = None) -> Ticket:
        t = self.storage.get(ticket_id)
        if not t:
            raise ValueError("ticket_not_found")
        if t.status == "canceled":
            raise ValueError("ticket_canceled")
        if t.checked_in_at:
            return t  # idempotent

        t.checked_in_at = now or datetime.utcnow()
        t.status = "checked_in"
        self.storage.save(t)

        # optional webhook to notifications-service
        if settings.notifications_url:
            try:
                async with httpx.AsyncClient(timeout=4) as client:
                    await client.post(
                        settings.notifications_url.rstrip("/") + "/api/notifications/checkin",
                        json={
                            "event_id": t.event_id,
                            "participant_id": t.participant_id,
                            "ticket_id": t.id,
                            "checked_in_at": t.checked_in_at.isoformat(),
                        },
                    )
            except Exception:
                # swallow errors to not block the check-in
                pass
        return t
