from __future__ import annotations

from dataclasses import dataclass
from typing import cast

from fastapi import Depends, FastAPI, Request

from shared import DatabaseManager, Settings

from .event_reader import EventReader
from .repository import NotificationsRepository
from .service import NotificationsService


@dataclass
class DependencyBundle:
    db_manager: DatabaseManager
    event_reader: EventReader


def init_dependencies(
    app: FastAPI,
    settings: Settings,
    bundle: DependencyBundle | None = None,
) -> DependencyBundle:
    if bundle is None:
        db_manager = DatabaseManager(settings)
        bundle = DependencyBundle(
            db_manager=db_manager, event_reader=EventReader(db_manager)
        )

    app.state.db_manager = bundle.db_manager
    app.state.event_reader = bundle.event_reader
    return bundle


def get_db_manager(request: Request) -> DatabaseManager:
    return cast(DatabaseManager, request.app.state.db_manager)


def get_event_reader(request: Request) -> EventReader:
    return cast(EventReader, request.app.state.event_reader)


def get_repository(
    db_manager: DatabaseManager = Depends(get_db_manager),
) -> NotificationsRepository:
    return NotificationsRepository(db_manager)


def get_notifications_service(
    repository: NotificationsRepository = Depends(get_repository),
    event_reader: EventReader = Depends(get_event_reader),
) -> NotificationsService:
    return NotificationsService(repository, event_reader)

