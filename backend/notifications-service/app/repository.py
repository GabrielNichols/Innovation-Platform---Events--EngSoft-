from __future__ import annotations

import json
from typing import Any, Dict, List, Optional, cast

from tinydb import Query

from shared import DatabaseManager, Message, NotificationSettings


class NotificationsRepository:
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._messages = db_manager.table("messages")
        self._settings = db_manager.table("notification_settings")

    # Messages
    def list_messages(self, event_id: str) -> List[Dict[str, Any]]:
        return [dict(record) for record in self._messages.search(Query().event_id == event_id)]

    def insert_message(self, message: Message) -> Dict[str, Any]:
        data: Dict[str, Any] = json.loads(message.json())
        self._messages.insert(data)
        return data

    # Settings
    def get_settings(self, event_id: str) -> Optional[Dict[str, Any]]:
        record = self._settings.get(Query().event_id == event_id)
        if record is None:
            return None
        return dict(cast(Dict[str, Any], record))

    def upsert_settings(self, settings: NotificationSettings) -> Dict[str, Any]:
        data: Dict[str, Any] = json.loads(settings.json())
        query = Query().event_id == settings.event_id
        if self._settings.contains(query):
            self._settings.update(data, query)
        else:
            self._settings.insert(data)
        return data
