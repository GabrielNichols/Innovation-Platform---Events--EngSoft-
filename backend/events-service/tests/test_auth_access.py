from __future__ import annotations


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}

def test_missing_authorization_header(client):
    response = client.get("/api/events/management")
    assert response.status_code == 401


def test_invalid_token(client):
    response = client.get(
        "/api/events/management",
        headers=_auth_header("invalid.token"),
    )
    assert response.status_code == 401
