from shared.models import EventStatus


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _registration_payload(name_suffix: str = "") -> dict:
    return {
        "name": f"User{name_suffix}",
        "email": f"user{name_suffix}@example.com",
        "skills": ["python", "communication"],
        "profile_complete": True,
    }


def test_registration_waitlist_when_capacity_full(client, token_factory, event_factory):
    event = event_factory(max_participants=1)
    first_user = token_factory({"sub": "user-1", "role": "user"})
    second_user = token_factory({"sub": "user-2", "role": "user"})

    client.post(
        f"/api/events/{event.id}/register",
        json=_registration_payload("A"),
        headers=_auth_header(first_user),
    )
    waitlist = client.post(
        f"/api/events/{event.id}/register",
        json=_registration_payload("B"),
        headers=_auth_header(second_user),
    )
    assert waitlist.status_code == 201
    assert waitlist.json()["status"] == "waitlist"


def test_registration_requires_published_event(client, token_factory, event_factory):
    event = event_factory(status=EventStatus.DRAFT)
    token = token_factory({"sub": "user-1", "role": "user"})

    response = client.post(
        f"/api/events/{event.id}/register",
        json=_registration_payload("A"),
        headers=_auth_header(token),
    )
    assert response.status_code == 422


def test_duplicate_registration_fails(client, token_factory, event_factory):
    event = event_factory()
    token = token_factory({"sub": "user-1", "role": "user"})

    client.post(
        f"/api/events/{event.id}/register",
        json=_registration_payload("A"),
        headers=_auth_header(token),
    )
    duplicate = client.post(
        f"/api/events/{event.id}/register",
        json=_registration_payload("B"),
        headers=_auth_header(token),
    )
    assert duplicate.status_code == 422


def test_organizer_cannot_manage_other_event_participants(
    client, token_factory, event_factory
):
    event = event_factory(organizer_id="organizer-1")
    other_event = event_factory(organizer_id="organizer-2")
    organizer_one = token_factory({"sub": "organizer-1", "role": "organizer"})
    user_token = token_factory({"sub": "user-1", "role": "user"})

    participant = client.post(
        f"/api/events/{other_event.id}/register",
        json=_registration_payload("A"),
        headers=_auth_header(user_token),
    ).json()

    response = client.post(
        f"/api/events/{other_event.id}/participants/{participant['id']}/approve",
        headers=_auth_header(organizer_one),
    )
    assert response.status_code == 403
