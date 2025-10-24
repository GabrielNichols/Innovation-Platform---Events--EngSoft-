from __future__ import annotations

from fastapi import FastAPI

from shared import get_settings, register_exception_handlers

from .routes import router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Auth Service",
        version="1.0.0",
        description="JWT validation service for the innovation platform.",
    )

    app.include_router(router)
    register_exception_handlers(app)

    return app
