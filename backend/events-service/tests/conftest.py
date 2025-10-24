from __future__ import annotations

from collections.abc import Generator
from pathlib import Path
from typing import Callable, Dict

import importlib.util
import jwt
import pytest
from fastapi.testclient import TestClient
from tinydb.storages import MemoryStorage
import sys

PACKAGE_NAME = "events_service_app"
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

from events_service_app import create_app  # type: ignore
from events_service_app.dependencies import DependencyBundle  # type: ignore
from shared.config import get_settings
from shared.database import DatabaseManager


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    monkeypatch.setenv("JWT_ALGORITHM", "HS256")
    get_settings.cache_clear()  # type: ignore[attr-defined]

    settings = get_settings()
    db_manager = DatabaseManager(settings, storage=MemoryStorage)
    app = create_app(DependencyBundle(db_manager=db_manager))

    with TestClient(app) as test_client:
        yield test_client

    db_manager.close()


@pytest.fixture()
def token_factory() -> Callable[[Dict], str]:
    def _create(claims: Dict) -> str:
        settings = get_settings()
        payload = {"sub": claims.get("sub", "user-1"), "role": claims.get("role", "user")}
        payload.update({k: v for k, v in claims.items() if k not in {"sub", "role"}})
        return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    return _create


def auth_header(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}"}
