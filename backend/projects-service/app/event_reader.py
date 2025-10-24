from __future__ import annotations

from typing import Optional

from tinydb import Query

from shared import DatabaseManager, Event


class EventReader:
    """Utility to read events data from the shared TinyDB storage."""

    def __init__(self, db_manager: DatabaseManager) -> None:
        self._table = db_manager.table("events")

    def get(self, event_id: str) -> Optional[Event]:
        record = self._table.get(Query().id == event_id)
        if not record:
            return None
        event = Event.parse_obj(record)
        if event.deleted_at is not None:
            return None
        return event
