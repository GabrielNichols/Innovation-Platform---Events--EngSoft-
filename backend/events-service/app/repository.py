from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Optional, cast

from tinydb import Query

from shared import DatabaseManager, Event


class EventsRepository:
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._table = db_manager.table("events")

    def list_events(self, include_deleted: bool = False) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = [dict(record) for record in self._table.all()]
        if include_deleted:
            return records
        return [record for record in records if record.get("deleted_at") is None]

    def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        record = self._table.get(Query().id == event_id)
        if record is None:
            return None
        return dict(cast(Dict[str, Any], record))

    def insert(self, payload: Event) -> Dict[str, Any]:
        data: Dict[str, Any] = json.loads(payload.json())
        self._table.insert(data)
        return data

    def update(self, event_id: str, payload: Event) -> Optional[Dict[str, Any]]:
        existing = self.get_event(event_id)
        if not existing:
            return None
        data: Dict[str, Any] = json.loads(payload.json())
        self._table.update(data, Query().id == event_id)
        return data

    def soft_delete(self, event_id: str, deleted_at: datetime) -> Optional[Dict[str, Any]]:
        existing = self.get_event(event_id)
        if not existing:
            return None
        existing["deleted_at"] = deleted_at.isoformat()
        self._table.update({"deleted_at": existing["deleted_at"]}, Query().id == event_id)
        return existing
