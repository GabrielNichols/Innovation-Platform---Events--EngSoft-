
import os, json
from pathlib import Path
from typing import Dict, Optional, List
from datetime import datetime
from .models import Ticket

class JsonStorage:
    def __init__(self, root: str):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self.file = self.root / "tickets.json"
        if not self.file.exists():
            self._write({})

    def _read(self) -> Dict[str, dict]:
        with self.file.open("r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, data: Dict[str, dict]):
        with self.file.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)

    def save(self, t: Ticket):
        data = self._read()
        data[t.id] = {
            "id": t.id,
            "event_id": t.event_id,
            "participant_id": t.participant_id,
            "created_at": t.created_at.isoformat(),
            "checked_in_at": t.checked_in_at.isoformat() if t.checked_in_at else None,
            "status": t.status,
        }
        self._write(data)

    def get(self, ticket_id: str) -> Optional[Ticket]:
        data = self._read()
        row = data.get(ticket_id)
        if not row:
            return None
        return Ticket(
            id=row["id"],
            event_id=row["event_id"],
            participant_id=row["participant_id"],
            created_at=datetime.fromisoformat(row["created_at"]),
            checked_in_at=datetime.fromisoformat(row["checked_in_at"]) if row["checked_in_at"] else None,
            status=row["status"],
        )

    def list_by_event(self, event_id: str) -> List[Ticket]:
        data = self._read()
        out = []
        for row in data.values():
            if row["event_id"] == event_id:
                out.append(Ticket(
                    id=row["id"],
                    event_id=row["event_id"],
                    participant_id=row["participant_id"],
                    created_at=datetime.fromisoformat(row["created_at"]),
                    checked_in_at=datetime.fromisoformat(row["checked_in_at"]) if row["checked_in_at"] else None,
                    status=row["status"],
                ))
        return out
