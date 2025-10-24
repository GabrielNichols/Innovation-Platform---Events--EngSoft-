def test_registration_requires_auth(client):
    response = client.post("/api/events/event-1/register", json={})
    assert response.status_code == 401
