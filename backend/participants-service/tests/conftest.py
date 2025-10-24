from __future__ import annotations

import importlib.util
import json
import sys
from collections.abc import Generator
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable, Dict

import jwt
import pytest
from fastapi.testclient import TestClient
from tinydb.storages import MemoryStorage

PACKAGE_NAME = "participants_service_app"
SERVICE_ROOT = Path(__file__).resolve().parents[1] / "app"

if PACKAGE_NAME not in sys.modules:
    spec = importlib.util.spec_from_file_location(
        PACKAGE_NAME,
        SERVICE_ROOT / "__init__.py",
        submodule_search_locations=[str(SERVICE_ROOT)],
    )
    module = importlib.util.module_from_spec(spec)
    sys.modules[PACKAGE_NAME] = module
    spec.loader.exec_module(module)  # type: ignore[arg-type]

from participants_service_app import create_app  # type: ignore
from participants_service_app.dependencies import DependencyBundle  # type: ignore
from participants_service_app.event_reader import EventReader  # type: ignore
from shared import Event, EventStatus
from shared.config import get_settings
from shared.database import DatabaseManager


@pytest.fixture()
def db_manager(monkeypatch: pytest.MonkeyPatch) -> Generator[DatabaseManager, None, None]:
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    monkeypatch.setenv("JWT_ALGORITHM", "HS256")
    get_settings.cache_clear()  # type: ignore[attr-defined]
    settings = get_settings()
    manager = DatabaseManager(settings, storage=MemoryStorage)
    yield manager
    manager.close()


@pytest.fixture()
def client(db_manager: DatabaseManager) -> Generator[TestClient, None, None]:
    bundle = DependencyBundle(
        db_manager=db_manager,
        event_reader=EventReader(db_manager),
    )
    app = create_app(bundle)
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def token_factory() -> Callable[[Dict], str]:
    def _create(claims: Dict) -> str:
        settings = get_settings()
        payload = {"sub": claims.get("sub", "user-1"), "role": claims.get("role", "user")}
        payload.update({k: v for k, v in claims.items() if k not in {"sub", "role"}})
        return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    return _create


@pytest.fixture()
def event_factory(db_manager: DatabaseManager) -> Callable[..., Event]:
    def _create(
        *,
        organizer_id: str = "organizer-1",
        status: EventStatus = EventStatus.PUBLISHED,
        max_participants: int = 2,
    ) -> Event:
        now = datetime.now(timezone.utc)
        event = Event(
            id=f"event-{organizer_id}-{int(now.timestamp())}",
            name="Participants Event",
            description="Event for participants tests",
            start_date=now + timedelta(days=1),
            end_date=now + timedelta(days=2),
            location="Online",
            status=status,
            organizer_id=organizer_id,
            categories=["software"],
            tags=["test"],
            max_participants=max_participants,
            max_teams=10,
            registered_participants=0,
            submitted_projects=0,
            formed_teams=0,
            created_at=now,
            updated_at=now,
            deleted_at=None,
        )
        db_manager.table("events").insert(json.loads(event.json()))
        return event

    return _create


def auth_header(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def registration_payload(name_suffix: str = "") -> Dict[str, object]:
    return {
        "name": f"User{name_suffix}",
        "email": f"user{name_suffix}@example.com",
        "skills": ["python", "communication"],
        "profile_complete": True,
    }
