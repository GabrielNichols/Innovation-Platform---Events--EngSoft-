from __future__ import annotations

from pathlib import Path
from threading import Lock
from typing import Optional, Type

from tinydb import TinyDB
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage, Storage
from tinydb.table import Table

from .config import Settings


class DatabaseManager:
    """
    Wraps TinyDB creation and lifecycle.

    Services should create a single instance on startup and reuse it across
    requests. Tests can instantiate the manager with an in-memory storage.
    """

    _lock = Lock()

    def __init__(
        self,
        settings: Settings,
        *,
        storage: Optional[Type[Storage]] = None,
        path_override: Optional[str] = None,
    ) -> None:
        self._settings = settings
        self._storage_class = storage
        self._path_override = path_override
        self._db = self._create_db()

    def _create_db(self) -> TinyDB:
        if self._storage_class:
            return TinyDB(storage=self._storage_class)

        path = (
            Path(self._path_override)
            if self._path_override
            else self._settings.ensure_data_dir()
        )

        with self._lock:
            path.parent.mkdir(parents=True, exist_ok=True)
            return TinyDB(path, storage=CachingMiddleware(JSONStorage))

    @property
    def db(self) -> TinyDB:
        return self._db

    def table(self, name: str) -> Table:
        return self._db.table(name)

    def close(self) -> None:
        self._db.close()
