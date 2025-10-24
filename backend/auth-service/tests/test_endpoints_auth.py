from __future__ import annotations

def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_me_returns_user_info(client, token_factory):
    token = token_factory({"sub": "user-123", "role": "organizer", "email": "user@example.com"})
    response = client.get("/api/auth/me", headers=_auth_header(token))
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "user-123"
    assert body["role"] == "organizer"
    assert body["email"] == "user@example.com"


def test_validate_token_success(client, token_factory):
    token = token_factory({"sub": "user-123", "role": "user"})
    response = client.post("/api/auth/validate", json={"token": token})
    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is True
    assert body["user"]["id"] == "user-123"


def test_validate_token_failure(client):
    response = client.post("/api/auth/validate", json={"token": "invalid"})
    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is False
