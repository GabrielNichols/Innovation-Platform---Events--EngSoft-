from __future__ import annotations

from fastapi import APIRouter, Depends

from shared import Message, User
from shared.middleware import get_current_user

from .dependencies import get_notifications_service
from .schemas import MessageCreate, MessagesListResponse, NotificationSettingsResponse, NotificationUpdate
from .service import NotificationsService

router = APIRouter(prefix="/api/notifications/events/{event_id}", tags=["notifications"])


@router.post("/messages", response_model=Message)
async def send_message(
    event_id: str,
    payload: MessageCreate,
    user: User = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> Message:
    return service.send_message(user, event_id, payload)


@router.get("/messages", response_model=MessagesListResponse)
async def list_messages(
    event_id: str,
    user: User = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> MessagesListResponse:
    return service.list_messages(user, event_id)


@router.put("/notifications", response_model=NotificationSettingsResponse)
async def update_settings(
    event_id: str,
    payload: NotificationUpdate,
    user: User = Depends(get_current_user),
    service: NotificationsService = Depends(get_notifications_service),
) -> NotificationSettingsResponse:
    return service.update_settings(user, event_id, payload)
