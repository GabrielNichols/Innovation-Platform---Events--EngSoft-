from __future__ import annotations

from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from shared import Event, EventStatus, ForbiddenError, NotFoundError, User, UserRole, ValidationError

from .repository import EventsRepository
from .schemas import EventCreate, EventManagementResponse, EventStatusUpdate, EventUpdate


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


ALLOWED_STATUS_TRANSITIONS: dict[EventStatus, list[EventStatus]] = {
    EventStatus.DRAFT: [EventStatus.PUBLISHED],
    EventStatus.PUBLISHED: [EventStatus.ACTIVE],
    EventStatus.ACTIVE: [EventStatus.FINISHED],
    EventStatus.FINISHED: [],
}


class EventsService:
    def __init__(self, repository: EventsRepository) -> None:
        self._repository = repository

    def _load_event(self, event_id: str, *, include_deleted: bool = False) -> Event:
        record = self._repository.get_event(event_id)
        if not record:
            raise NotFoundError("Event not found")

        event = Event.parse_obj(record)
        if not include_deleted and event.deleted_at is not None:
            raise NotFoundError("Event not found")
        return event

    def list_management(self, user: User) -> EventManagementResponse:
        records = self._repository.list_events()
        events: List[Event] = [Event.parse_obj(record) for record in records]

        if user.role == UserRole.ORGANIZER:
            events = [event for event in events if event.organizer_id == user.id]

        return EventManagementResponse(events=events, total=len(events))

    def list_available(self) -> List[Event]:
        records = self._repository.list_events()
        events = [Event.parse_obj(record) for record in records]
        return [
            event
            for event in events
            if event.status in {EventStatus.PUBLISHED, EventStatus.ACTIVE}
            and event.deleted_at is None
        ]

    def get_event(self, event_id: str) -> Event:
        return self._load_event(event_id)

    def create_event(self, user: User, payload: EventCreate) -> Event:
        if user.role not in {UserRole.ORGANIZER, UserRole.ADMIN}:
            raise ForbiddenError("Only organizers and admins can create events")

        organizer_id = payload.organizer_id or user.id
        if user.role == UserRole.ORGANIZER and organizer_id != user.id:
            raise ForbiddenError("Organizers can only create events for themselves")

        now = _utcnow()
        event = Event(
            id=str(uuid4()),
            name=payload.name,
            description=payload.description,
            start_date=payload.start_date,
            end_date=payload.end_date,
            location=payload.location,
            status=payload.status,
            organizer_id=organizer_id,
            categories=payload.categories,
            tags=payload.tags,
            max_participants=payload.max_participants,
            max_teams=payload.max_teams,
            registered_participants=0,
            submitted_projects=0,
            formed_teams=0,
            created_at=now,
            updated_at=now,
            deleted_at=None,
        )

        data = self._repository.insert(event)
        return Event.parse_obj(data)

    def update_event(self, user: User, event_id: str, payload: EventUpdate) -> Event:
        event = self._load_event(event_id)
        if user.role not in {UserRole.ORGANIZER, UserRole.ADMIN}:
            raise ForbiddenError("Only organizers and admins can update events")
        if user.role == UserRole.ORGANIZER and event.organizer_id != user.id:
            raise ForbiddenError("Organizers can only update their own events")

        updated_data = event.dict()
        payload_data = payload.dict(exclude_unset=True)
        if "organizer_id" in payload_data:
            if user.role != UserRole.ADMIN:
                raise ForbiddenError("Only admins can reassign events")
            updated_data["organizer_id"] = payload_data["organizer_id"]

        for key, value in payload_data.items():
            if key == "organizer_id":
                continue
            updated_data[key] = value

        updated_data["updated_at"] = _utcnow()

        updated_event = Event.parse_obj(updated_data)
        data = self._repository.update(event_id, updated_event)
        if not data:
            raise NotFoundError("Event not found")
        return Event.parse_obj(data)

    def delete_event(self, user: User, event_id: str) -> Event:
        if user.role != UserRole.ADMIN:
            raise ForbiddenError("Only administrators can delete events")
        event = self._load_event(event_id)
        deleted = self._repository.soft_delete(event_id, _utcnow())
        if not deleted:
            raise NotFoundError("Event not found")
        return Event.parse_obj(deleted)

    def update_status(
        self, user: User, event_id: str, payload: EventStatusUpdate
    ) -> Event:
        event = self._load_event(event_id)
        if user.role not in {UserRole.ORGANIZER, UserRole.ADMIN}:
            raise ForbiddenError("Insufficient permissions to change event status")
        if user.role == UserRole.ORGANIZER and event.organizer_id != user.id:
            raise ForbiddenError("Organizers can only update their own events")

        allowed = ALLOWED_STATUS_TRANSITIONS[event.status]
        if payload.status not in allowed:
            raise ValidationError(
                f"Cannot transition event from {event.status.value} to {payload.status.value}"
            )

        event.status = payload.status
        event.updated_at = _utcnow()
        record = self._repository.update(event_id, event)
        if not record:
            raise NotFoundError("Event not found")
        return Event.parse_obj(record)
