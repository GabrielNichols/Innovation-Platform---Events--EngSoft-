from __future__ import annotations

import logging
from typing import Awaitable, Callable, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

# Import works differently when running tests (importing package `gateway`)
# versus running uvicorn from within the service directory (top-level modules).
try:
    from gateway.config import GatewaySettings  # type: ignore
except Exception:  # pragma: no cover - fallback for runtime within service dir
    from config import GatewaySettings  # type: ignore

logger = logging.getLogger("gateway")


def create_app(settings: GatewaySettings | None = None) -> FastAPI:
    settings = settings or GatewaySettings()  # type: ignore[call-arg]
    app = FastAPI(
        title="API Gateway",
        version="1.0.0",
        description="Routes API requests to backend microservices.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    @app.middleware("http")
    async def log_requests(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        logger.info("Incoming request %s %s", request.method, request.url.path)
        response = await call_next(request)
        logger.info(
            "Response %s %s -> %s", request.method, request.url.path, response.status_code
        )
        return response

    client = httpx.AsyncClient(timeout=30.0, verify=False)

    @app.on_event("shutdown")
    async def shutdown_client() -> None:
        await client.aclose()

    async def proxy_request(request: Request, target_base: str) -> Response:
        path = request.url.path
        url = f"{target_base.rstrip('/')}{path}"
        headers = dict(request.headers)
        headers.pop("host", None)
        body = await request.body()

        try:
            proxied = await client.request(
                request.method,
                url,
                content=body,
                params=request.query_params,
                headers=headers,
            )
        except httpx.RequestError as exc:
            logger.error("Proxy error for %s: %s", url, exc)
            raise HTTPException(status_code=503, detail="Service unavailable") from exc

        return Response(
            content=proxied.content,
            status_code=proxied.status_code,
            headers={k: v for k, v in proxied.headers.items() if k.lower() != "content-length"},
        )

    def resolve_target(path: str) -> Optional[str]:
        if path.startswith("/api/auth"):
            return settings.auth_service_url
        if path.startswith("/api/notifications"):
            return settings.notifications_service_url
        if path.startswith("/api/events"):
            if "/projects" in path:
                return settings.projects_service_url
            if "/participants" in path or path.endswith("/register"):
                return settings.participants_service_url
            return settings.events_service_url
        return None

    @app.api_route(
        "/{path:path}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )
    async def gateway_route(path: str, request: Request) -> Response:
        full_path = f"/{path}" if path else ""
        target = resolve_target(full_path)
        if not target:
            raise HTTPException(status_code=404, detail="Route not handled by gateway")
        return await proxy_request(request, target)

    return app

