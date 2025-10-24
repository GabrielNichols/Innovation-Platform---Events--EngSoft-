def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_user_cannot_send_messages(client, token_factory, event_factory):
    event = event_factory()
    user_token = token_factory({"sub": "user-1", "role": "user"})

    response = client.post(
        f"/api/notifications/events/{event.id}/messages",
        json={"recipients": "all", "content": "Hello"},
        headers=_auth_header(user_token),
    )
    assert response.status_code == 403


def test_organizer_cannot_manage_other_event(client, token_factory, event_factory):
    event_two = event_factory(organizer_id="organizer-2")
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})

    response = client.post(
        f"/api/notifications/events/{event_two.id}/messages",
        json={"recipients": "all", "content": "Hello"},
        headers=_auth_header(organizer_token),
    )
    assert response.status_code == 403
