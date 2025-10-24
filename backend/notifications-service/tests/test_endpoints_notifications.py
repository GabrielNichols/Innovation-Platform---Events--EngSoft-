from __future__ import annotations


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_send_and_list_messages(client, token_factory, event_factory):
    event = event_factory()
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})

    send = client.post(
        f"/api/notifications/events/{event.id}/messages",
        json={"recipients": "all", "content": "Welcome!"},
        headers=_auth_header(organizer_token),
    )
    assert send.status_code == 200
    message_id = send.json()["id"]

    listing = client.get(
        f"/api/notifications/events/{event.id}/messages",
        headers=_auth_header(organizer_token),
    )
    assert listing.status_code == 200
    data = listing.json()
    assert data["total"] == 1
    assert data["messages"][0]["id"] == message_id


def test_update_notification_settings(client, token_factory, event_factory):
    event = event_factory()
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})

    response = client.put(
        f"/api/notifications/events/{event.id}/notifications",
        json={"notifications_enabled": False, "alert_recipients": ["team@example.com"]},
        headers=_auth_header(organizer_token),
    )
    assert response.status_code == 200
    settings = response.json()["settings"]
    assert settings["notifications_enabled"] is False
    assert settings["alert_recipients"] == ["team@example.com"]
