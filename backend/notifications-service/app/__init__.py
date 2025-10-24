from __future__ import annotations

from fastapi import FastAPI

from shared import get_settings, register_exception_handlers

from .dependencies import DependencyBundle, init_dependencies
from .routes import router


def create_app(bundle: DependencyBundle | None = None) -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Notifications Service",
        version="1.0.0",
        description="Manage bulk messaging and notification settings for events.",
    )

    dependency_bundle = init_dependencies(app, settings, bundle)
    app.include_router(router)
    register_exception_handlers(app)

    @app.on_event("shutdown")
    async def _shutdown() -> None:
        dependency_bundle.db_manager.close()

    return app
