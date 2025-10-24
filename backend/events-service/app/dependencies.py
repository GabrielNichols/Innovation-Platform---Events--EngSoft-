from __future__ import annotations

from dataclasses import dataclass
from typing import cast

from fastapi import Depends, FastAPI, Request

from shared import DatabaseManager, Settings

from .repository import EventsRepository
from .service import EventsService


@dataclass
class DependencyBundle:
    db_manager: DatabaseManager


def init_dependencies(
    app: FastAPI,
    settings: Settings,
    bundle: DependencyBundle | None = None,
) -> DependencyBundle:
    if bundle is None:
        db_manager = DatabaseManager(settings)
        bundle = DependencyBundle(db_manager=db_manager)

    app.state.db_manager = bundle.db_manager
    return bundle


def get_db_manager(request: Request) -> DatabaseManager:
    return cast(DatabaseManager, request.app.state.db_manager)


def get_repository(
    db_manager: DatabaseManager = Depends(get_db_manager),
) -> EventsRepository:
    return EventsRepository(db_manager)


def get_events_service(
    repository: EventsRepository = Depends(get_repository),
) -> EventsService:
    return EventsService(repository)
