from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status

from shared import Event, User
from shared.middleware import get_current_user

from .dependencies import get_events_service
from .schemas import EventCreate, EventManagementResponse, EventStatusUpdate, EventUpdate
from .service import EventsService

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("/management", response_model=EventManagementResponse)
async def list_management(
    user: User = Depends(get_current_user),
    service: EventsService = Depends(get_events_service),
) -> EventManagementResponse:
    return service.list_management(user)


@router.get("/available", response_model=List[Event])
async def list_available(
    service: EventsService = Depends(get_events_service),
) -> List[Event]:
    return service.list_available()


@router.post(
    "",
    response_model=Event,
    status_code=status.HTTP_201_CREATED,
)
async def create_event(
    payload: EventCreate,
    user: User = Depends(get_current_user),
    service: EventsService = Depends(get_events_service),
) -> Event:
    return service.create_event(user, payload)


@router.get("/{event_id}", response_model=Event)
async def get_event(
    event_id: str,
    user: User = Depends(get_current_user),
    service: EventsService = Depends(get_events_service),
) -> Event:
    return service.get_event(event_id)


@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    payload: EventUpdate,
    user: User = Depends(get_current_user),
    service: EventsService = Depends(get_events_service),
) -> Event:
    return service.update_event(user, event_id, payload)


@router.delete("/{event_id}", response_model=Event)
async def delete_event(
    event_id: str,
    user: User = Depends(get_current_user),
    service: EventsService = Depends(get_events_service),
) -> Event:
    return service.delete_event(user, event_id)


@router.patch("/{event_id}/status", response_model=Event)
async def update_event_status(
    event_id: str,
    payload: EventStatusUpdate,
    user: User = Depends(get_current_user),
    service: EventsService = Depends(get_events_service),
) -> Event:
    return service.update_status(user, event_id, payload)
