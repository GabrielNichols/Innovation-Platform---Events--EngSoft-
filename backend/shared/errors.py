from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class ServiceError(Exception):
    """Base class for service-level errors."""

    status_code: int = 500
    detail: str = "Internal service error"
    code: str = "service_error"

    def __init__(self, detail: str | None = None, *, code: str | None = None) -> None:
        super().__init__(detail or self.detail)
        if detail:
            self.detail = detail
        if code:
            self.code = code


class UnauthorizedError(ServiceError):
    status_code = 401
    detail = "Unauthorized"
    code = "unauthorized"


class ForbiddenError(ServiceError):
    status_code = 403
    detail = "Forbidden"
    code = "forbidden"


class NotFoundError(ServiceError):
    status_code = 404
    detail = "Resource not found"
    code = "not_found"


class ValidationError(ServiceError):
    status_code = 422
    detail = "Validation failed"
    code = "validation_error"


def register_exception_handlers(app: FastAPI) -> None:
    """Register exception handlers for shared service errors."""

    @app.exception_handler(ServiceError)
    async def _handle_service_error(
        request: Request, exc: ServiceError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "code": exc.code},
        )
