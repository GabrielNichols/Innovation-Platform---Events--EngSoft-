def test_messages_require_auth(client):
    response = client.get("/api/notifications/events/event-1/messages")
    assert response.status_code == 401
