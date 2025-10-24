"""
Shared utilities used across backend microservices.
"""

from .config import get_settings, Settings  # noqa: F401
from .database import DatabaseManager  # noqa: F401
from .errors import (  # noqa: F401
    ForbiddenError,
    NotFoundError,
    ServiceError,
    UnauthorizedError,
    ValidationError,
    register_exception_handlers,
)
from .jwt_validator import decode_jwt  # noqa: F401
from .middleware import get_current_user, require_role  # noqa: F401
from .models import (  # noqa: F401
    Event,
    EventStatus,
    Message,
    NotificationSettings,
    Participant,
    ParticipantStatus,
    Project,
    ProjectStatus,
    User,
    UserRole,
)

__all__ = [
    "DatabaseManager",
    "Event",
    "EventStatus",
    "ForbiddenError",
    "Message",
    "NotificationSettings",
    "NotFoundError",
    "Participant",
    "ParticipantStatus",
    "Project",
    "ProjectStatus",
    "ServiceError",
    "Settings",
    "UnauthorizedError",
    "User",
    "UserRole",
    "ValidationError",
    "decode_jwt",
    "get_current_user",
    "get_settings",
    "register_exception_handlers",
    "require_role",
]
