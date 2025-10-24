def test_list_requires_auth(client):
    response = client.get("/api/events/event-1/projects")
    assert response.status_code == 401
