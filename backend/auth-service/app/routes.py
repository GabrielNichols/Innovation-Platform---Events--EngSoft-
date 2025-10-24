from __future__ import annotations

from fastapi import APIRouter, Depends

from shared import User, UserRole, decode_jwt, get_current_user, get_settings
from shared.config import Settings
from shared.errors import UnauthorizedError

from .schemas import TokenValidationRequest, TokenValidationResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me", response_model=User)
async def read_me(user: User = Depends(get_current_user)) -> User:
    return user


@router.post("/validate", response_model=TokenValidationResponse)
async def validate_token(
    payload: TokenValidationRequest,
    settings: Settings = Depends(get_settings),
) -> TokenValidationResponse:
    try:
        claims = decode_jwt(payload.token, settings)
    except UnauthorizedError as exc:
        return TokenValidationResponse(valid=False, detail=str(exc))

    role = claims.get("role")
    if role is None:
        return TokenValidationResponse(valid=False, detail="Token missing role claim")

    try:
        user = User(
            id=str(claims.get("sub")),
            role=UserRole(role),
            email=claims.get("email"),
            name=claims.get("name"),
        )
    except ValueError:
        return TokenValidationResponse(valid=False, detail="Unsupported user role")

    return TokenValidationResponse(valid=True, user=user)
