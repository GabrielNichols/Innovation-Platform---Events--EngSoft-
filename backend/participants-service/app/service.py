from __future__ import annotations

import csv
import io
from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from shared import (
    Event,
    EventStatus,
    ForbiddenError,
    NotFoundError,
    Participant,
    ParticipantStatus,
    User,
    UserRole,
    ValidationError,
)

from .event_reader import EventReader
from .repository import ParticipantsRepository
from .schemas import ParticipantRegistration, ParticipantsListResponse


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ParticipantsService:
    def __init__(
        self,
        repository: ParticipantsRepository,
        event_reader: EventReader,
    ) -> None:
        self._repository = repository
        self._event_reader = event_reader

    def _require_event(self, event_id: str) -> Event:
        event = self._event_reader.get(event_id)
        if not event:
            raise NotFoundError("Event not found")
        return event

    def _require_participant(self, participant_id: str) -> Participant:
        record = self._repository.get(participant_id)
        if not record:
            raise NotFoundError("Participant not found")
        return Participant.parse_obj(record)

    def _assert_event_access(self, user: User, event: Event) -> None:
        if user.role == UserRole.ORGANIZER and event.organizer_id != user.id:
            raise ForbiddenError("Organizers can only manage their own events")
        if user.role == UserRole.USER:
            raise ForbiddenError("Users cannot manage participants")

    def list_participants(self, user: User, event_id: str) -> ParticipantsListResponse:
        event = self._require_event(event_id)
        self._assert_event_access(user, event)

        records = self._repository.list_by_event(event_id)
        participants: List[Participant] = [Participant.parse_obj(r) for r in records]
        return ParticipantsListResponse(participants=participants, total=len(participants))

    def register_participant(
        self, user: User, event_id: str, payload: ParticipantRegistration
    ) -> Participant:
        event = self._require_event(event_id)
        if event.status != EventStatus.PUBLISHED:
            raise ValidationError("Registrations are only allowed for published events")

        existing = self._repository.find_by_user(event_id, user.id)
        if existing:
            raise ValidationError("User already registered for this event")

        current_participants = [
            Participant.parse_obj(record)
            for record in self._repository.list_by_event(event_id)
        ]
        active_count = sum(
            1
            for participant in current_participants
            if participant.status in {ParticipantStatus.PENDING, ParticipantStatus.APPROVED}
        )
        status = (
            ParticipantStatus.WAITLIST
            if active_count >= event.max_participants
            else ParticipantStatus.PENDING
        )

        participant = Participant(
            id=str(uuid4()),
            event_id=event_id,
            user_id=user.id,
            name=payload.name,
            email=payload.email,
            skills=payload.skills,
            status=status,
            registered_at=_utcnow(),
            profile_complete=payload.profile_complete,
        )

        record = self._repository.insert(participant)
        return Participant.parse_obj(record)

    def approve_participant(
        self, user: User, event_id: str, participant_id: str
    ) -> Participant:
        event = self._require_event(event_id)
        self._assert_event_access(user, event)

        participant = self._require_participant(participant_id)
        if participant.event_id != event_id:
            raise NotFoundError("Participant not part of this event")
        if participant.status not in {
            ParticipantStatus.PENDING,
            ParticipantStatus.WAITLIST,
        }:
            raise ValidationError("Only pending or waitlisted participants can be approved")

        participant.status = ParticipantStatus.APPROVED
        record = self._repository.update(participant_id, participant)
        if not record:
            raise NotFoundError("Participant not found")
        return Participant.parse_obj(record)

    def reject_participant(
        self, user: User, event_id: str, participant_id: str
    ) -> Participant:
        event = self._require_event(event_id)
        self._assert_event_access(user, event)

        participant = self._require_participant(participant_id)
        if participant.event_id != event_id:
            raise NotFoundError("Participant not part of this event")
        if participant.status == ParticipantStatus.REJECTED:
            raise ValidationError("Participant is already rejected")
        if participant.status not in {
            ParticipantStatus.PENDING,
            ParticipantStatus.WAITLIST,
        }:
            raise ValidationError("Only pending or waitlisted participants can be rejected")

        participant.status = ParticipantStatus.REJECTED
        record = self._repository.update(participant_id, participant)
        if not record:
            raise NotFoundError("Participant not found")
        return Participant.parse_obj(record)

    def export_participants(self, user: User, event_id: str) -> str:
        event = self._require_event(event_id)
        self._assert_event_access(user, event)

        participants = [
            Participant.parse_obj(record)
            for record in self._repository.list_by_event(event_id)
        ]

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["id", "name", "email", "status", "skills", "profile_complete"])
        for participant in participants:
            writer.writerow(
                [
                    participant.id,
                    participant.name,
                    participant.email,
                    participant.status.value,
                    ";".join(participant.skills),
                    "yes" if participant.profile_complete else "no",
                ]
            )

        return buffer.getvalue()
