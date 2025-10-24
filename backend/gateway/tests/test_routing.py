from __future__ import annotations

import httpx
import pytest
from fastapi.testclient import TestClient

from gateway.config import GatewaySettings
from gateway.app import create_app


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    settings = GatewaySettings(
        auth_service_url="http://auth-service",
        events_service_url="http://events-service",
        projects_service_url="http://projects-service",
        participants_service_url="http://participants-service",
        notifications_service_url="http://notifications-service",
    )

    async def fake_request(self, method, url, content=None, params=None, headers=None):
        return httpx.Response(200, json={"proxied_url": url, "method": method})

    monkeypatch.setattr(httpx.AsyncClient, "request", fake_request)
    app = create_app(settings)
    return TestClient(app)


def test_routes_forward_to_expected_services(client: TestClient):
    routes = {
        "/api/auth/me": "http://auth-service/api/auth/me",
        "/api/events/available": "http://events-service/api/events/available",
        "/api/events/event-1/projects": "http://projects-service/api/events/event-1/projects",
        "/api/events/event-1/register": "http://participants-service/api/events/event-1/register",
        "/api/notifications/events/event-1/messages": "http://notifications-service/api/notifications/events/event-1/messages",
    }

    for path, expected_url in routes.items():
        response = client.get(path)
        assert response.status_code == 200
        assert response.json()["proxied_url"] == expected_url


def test_unknown_route_returns_404(client: TestClient):
    response = client.get("/unknown/path")
    assert response.status_code == 404
