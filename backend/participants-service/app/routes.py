from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status

from shared import Participant, User
from shared.middleware import get_current_user

from .dependencies import get_participants_service
from .schemas import ParticipantRegistration, ParticipantsListResponse
from .service import ParticipantsService

router = APIRouter(prefix="/api/events/{event_id}", tags=["participants"])


@router.get("/participants", response_model=ParticipantsListResponse)
async def list_participants(
    event_id: str,
    user: User = Depends(get_current_user),
    service: ParticipantsService = Depends(get_participants_service),
) -> ParticipantsListResponse:
    return service.list_participants(user, event_id)


@router.post(
    "/register",
    response_model=Participant,
    status_code=status.HTTP_201_CREATED,
)
async def register_participant(
    event_id: str,
    payload: ParticipantRegistration,
    user: User = Depends(get_current_user),
    service: ParticipantsService = Depends(get_participants_service),
) -> Participant:
    return service.register_participant(user, event_id, payload)


@router.post("/participants/{participant_id}/approve", response_model=Participant)
async def approve_participant(
    event_id: str,
    participant_id: str,
    user: User = Depends(get_current_user),
    service: ParticipantsService = Depends(get_participants_service),
) -> Participant:
    return service.approve_participant(user, event_id, participant_id)


@router.post("/participants/{participant_id}/reject", response_model=Participant)
async def reject_participant(
    event_id: str,
    participant_id: str,
    user: User = Depends(get_current_user),
    service: ParticipantsService = Depends(get_participants_service),
) -> Participant:
    return service.reject_participant(user, event_id, participant_id)


@router.get("/participants/export")
async def export_participants(
    event_id: str,
    user: User = Depends(get_current_user),
    service: ParticipantsService = Depends(get_participants_service),
) -> Response:
    csv_data = service.export_participants(user, event_id)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{event_id}-participants.csv"'},
    )
