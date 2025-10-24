from __future__ import annotations

import json
from typing import Any, Dict, List, Optional, cast

from tinydb import Query

from shared import DatabaseManager, Project


class ProjectsRepository:
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._table = db_manager.table("projects")

    def list_by_event(self, event_id: str) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = [dict(record) for record in self._table.search(Query().event_id == event_id)]
        return records

    def get(self, project_id: str) -> Optional[Dict[str, Any]]:
        record = self._table.get(Query().id == project_id)
        if record is None:
            return None
        return dict(cast(Dict[str, Any], record))

    def insert(self, project: Project) -> Dict[str, Any]:
        data: Dict[str, Any] = json.loads(project.json())
        self._table.insert(data)
        return data

    def update(self, project_id: str, project: Project) -> Optional[Dict[str, Any]]:
        existing = self.get(project_id)
        if not existing:
            return None
        data: Dict[str, Any] = json.loads(project.json())
        self._table.update(data, Query().id == project_id)
        return data

    def delete(self, project_id: str) -> bool:
        removed = self._table.remove(Query().id == project_id)
        return bool(removed)
