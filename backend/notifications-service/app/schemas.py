from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from shared import Message, NotificationSettings


class MessageCreate(BaseModel):
    recipients: Literal["all", "approved", "pending"]
    content: str = Field(..., min_length=5)


class NotificationUpdate(BaseModel):
    notifications_enabled: bool = True
    alert_recipients: Optional[List[str]] = Field(default_factory=list)


class MessagesListResponse(BaseModel):
    messages: List[Message]
    total: int


class NotificationSettingsResponse(BaseModel):
    settings: NotificationSettings
