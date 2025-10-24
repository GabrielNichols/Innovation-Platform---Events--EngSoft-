import jwt

from shared.config import get_settings


def test_validate_token_without_role_returns_invalid(client):
    settings = get_settings()
    token = jwt.encode({"sub": "user-123"}, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    response = client.post("/api/auth/validate", json={"token": token})
    assert response.status_code == 200
    assert response.json()["valid"] is False
