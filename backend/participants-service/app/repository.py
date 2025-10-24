from __future__ import annotations

import json
from typing import Any, Dict, List, Optional, cast

from tinydb import Query

from shared import DatabaseManager, Participant


class ParticipantsRepository:
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._table = db_manager.table("participants")

    def list_by_event(self, event_id: str) -> List[Dict[str, Any]]:
        return [dict(record) for record in self._table.search(Query().event_id == event_id)]

    def get(self, participant_id: str) -> Optional[Dict[str, Any]]:
        record = self._table.get(Query().id == participant_id)
        if record is None:
            return None
        return dict(cast(Dict[str, Any], record))

    def find_by_user(self, event_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        query = Query()
        record = self._table.get((query.event_id == event_id) & (query.user_id == user_id))
        if record is None:
            return None
        return dict(cast(Dict[str, Any], record))

    def insert(self, participant: Participant) -> Dict[str, Any]:
        data: Dict[str, Any] = json.loads(participant.json())
        self._table.insert(data)
        return data

    def update(self, participant_id: str, participant: Participant) -> Optional[Dict[str, Any]]:
        existing = self.get(participant_id)
        if not existing:
            return None
        data: Dict[str, Any] = json.loads(participant.json())
        self._table.update(data, Query().id == participant_id)
        return data
