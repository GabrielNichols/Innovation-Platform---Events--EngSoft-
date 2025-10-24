from __future__ import annotations

from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from shared import (
    Event,
    ForbiddenError,
    Message,
    NotificationSettings,
    NotFoundError,
    User,
    UserRole,
)

from .event_reader import EventReader
from .repository import NotificationsRepository
from .schemas import MessageCreate, MessagesListResponse, NotificationSettingsResponse, NotificationUpdate


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class NotificationsService:
    def __init__(
        self,
        repository: NotificationsRepository,
        event_reader: EventReader,
    ) -> None:
        self._repository = repository
        self._event_reader = event_reader

    def _require_event(self, event_id: str) -> Event:
        event = self._event_reader.get(event_id)
        if not event:
            raise NotFoundError("Event not found")
        return event

    def _assert_event_access(self, user: User, event: Event) -> None:
        if user.role == UserRole.ORGANIZER and event.organizer_id != user.id:
            raise ForbiddenError("Organizers can only manage their own events")
        if user.role == UserRole.USER:
            raise ForbiddenError("Users cannot manage event notifications")

    def send_message(
        self, user: User, event_id: str, payload: MessageCreate
    ) -> Message:
        event = self._require_event(event_id)
        self._assert_event_access(user, event)

        message = Message(
            id=str(uuid4()),
            event_id=event_id,
            recipients=payload.recipients,
            content=payload.content,
            sent_at=_utcnow(),
            sent_by=user.id,
        )
        record = self._repository.insert_message(message)
        return Message.parse_obj(record)

    def list_messages(
        self, user: User, event_id: str
    ) -> MessagesListResponse:
        event = self._require_event(event_id)
        self._assert_event_access(user, event)

        records = self._repository.list_messages(event_id)
        messages: List[Message] = [Message.parse_obj(record) for record in records]
        return MessagesListResponse(messages=messages, total=len(messages))

    def update_settings(
        self, user: User, event_id: str, payload: NotificationUpdate
    ) -> NotificationSettingsResponse:
        event = self._require_event(event_id)
        self._assert_event_access(user, event)

        settings = NotificationSettings(
            event_id=event_id,
            notifications_enabled=payload.notifications_enabled,
            alert_recipients=payload.alert_recipients or [],
            updated_at=_utcnow(),
        )
        record = self._repository.upsert_settings(settings)
        return NotificationSettingsResponse(
            settings=NotificationSettings.parse_obj(record)
        )
