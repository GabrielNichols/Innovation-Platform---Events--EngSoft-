from __future__ import annotations

from typing import Any, Dict

import jwt
from jwt import InvalidTokenError

from .config import Settings
from .errors import UnauthorizedError


def decode_jwt(token: str, settings: Settings) -> Dict[str, Any]:
    """
    Decode and validate a JWT token using the shared settings.

    Raises:
        UnauthorizedError: If the token is invalid or cannot be decoded.
    """
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            options={"verify_aud": False},
        )
    except InvalidTokenError as exc:
        raise UnauthorizedError("Invalid authentication token") from exc
