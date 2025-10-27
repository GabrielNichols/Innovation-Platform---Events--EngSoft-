from __future__ import annotations

from typing import Awaitable, Callable, Iterable, Sequence

from fastapi import Depends, Header

from .config import Settings, get_settings
from .errors import ForbiddenError, UnauthorizedError
from .jwt_validator import decode_jwt
from .models import User, UserRole


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise UnauthorizedError("Missing Authorization header")

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise UnauthorizedError("Invalid authorization header format")
    return parts[1]


async def get_current_user(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> User:
    # Development bypass: allow a mock user when enabled
    if settings.dev_auth_enabled and not authorization:
        return User(
            id=settings.dev_user_id,
            role=UserRole(settings.dev_user_role),
            email=settings.dev_user_email,
            name=settings.dev_user_name,
        )

    try:
        token = _extract_bearer_token(authorization)
    except UnauthorizedError:
        if settings.dev_auth_enabled:
            return User(
                id=settings.dev_user_id,
                role=UserRole(settings.dev_user_role),
                email=settings.dev_user_email,
                name=settings.dev_user_name,
            )
        raise

    try:
        payload = decode_jwt(token, settings)
    except UnauthorizedError:
        if settings.dev_auth_enabled:
            return User(
                id=settings.dev_user_id,
                role=UserRole(settings.dev_user_role),
                email=settings.dev_user_email,
                name=settings.dev_user_name,
            )
        raise

    try:
        role = payload.get("role")
        if role is None:
            raise UnauthorizedError("Token missing required role claim")

        user = User(
            id=str(payload["sub"]),
            role=UserRole(role),
            email=payload.get("email"),
            name=payload.get("name"),
        )
    except KeyError as exc:
        raise UnauthorizedError("Token missing required claims") from exc
    except ValueError as exc:
        raise UnauthorizedError("Unsupported user role") from exc

    return user


def _normalize_roles(roles: Iterable[UserRole | str]) -> set[UserRole]:
    normalized: set[UserRole] = set()
    for role in roles:
        if isinstance(role, UserRole):
            normalized.add(role)
        else:
            normalized.add(UserRole(role))
    return normalized


def require_role(
    allowed_roles: Sequence[UserRole | str],
) -> Callable[..., Awaitable[User]]:
    """FastAPI dependency that enforces role-based access control."""

    normalized = _normalize_roles(allowed_roles)

    async def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role == UserRole.ADMIN:
            return user
        if user.role not in normalized:
            raise ForbiddenError("Insufficient permissions for this action")
        return user

    return dependency
