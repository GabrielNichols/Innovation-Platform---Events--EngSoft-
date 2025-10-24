from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class UserRole(str, Enum):
    USER = "user"
    ORGANIZER = "organizer"
    ADMIN = "admin"


class User(BaseModel):
    id: str = Field(..., description="Unique user identifier (sub claim)")
    role: UserRole = Field(..., description="Role extracted from JWT")
    email: Optional[str] = Field(None, description="Email address if present")
    name: Optional[str] = Field(None, description="Display name if present")


class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ACTIVE = "active"
    FINISHED = "finished"


class Event(BaseModel):
    id: str
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    location: str
    status: EventStatus
    organizer_id: str
    categories: List[str]
    tags: List[str] = Field(default_factory=list)
    max_participants: int
    max_teams: int
    registered_participants: int = 0
    submitted_projects: int = 0
    formed_teams: int = 0
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class ProjectStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"


class Project(BaseModel):
    id: str
    event_id: str
    title: str
    description: str
    team_name: str
    members: int
    status: ProjectStatus
    category: str
    skills: List[str]
    progress: int = Field(0, ge=0, le=100)
    created_by: str
    submitted_at: Optional[datetime] = None
    created_at: datetime


class ParticipantStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    WAITLIST = "waitlist"


class Participant(BaseModel):
    id: str
    event_id: str
    user_id: str
    name: str
    email: str
    skills: List[str]
    status: ParticipantStatus
    registered_at: datetime
    profile_complete: bool = False


class Message(BaseModel):
    id: str
    event_id: str
    recipients: str
    content: str
    sent_at: datetime
    sent_by: str


class NotificationSettings(BaseModel):
    event_id: str
    notifications_enabled: bool = True
    alert_recipients: List[str] = Field(default_factory=list)
    updated_at: datetime
