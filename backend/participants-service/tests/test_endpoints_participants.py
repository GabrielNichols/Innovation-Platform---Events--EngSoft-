from __future__ import annotations


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _registration_payload(name_suffix: str = "") -> dict:
    return {
        "name": f"User{name_suffix}",
        "email": f"user{name_suffix}@example.com",
        "skills": ["python", "communication"],
        "profile_complete": True,
    }


def test_register_participant(client, token_factory, event_factory):
    event = event_factory()
    token = token_factory({"sub": "user-123", "role": "user"})

    response = client.post(
        f"/api/events/{event.id}/register",
        json=_registration_payload("A"),
        headers=_auth_header(token),
    )
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending"


def test_list_participants_requires_privileged_role(client, token_factory, event_factory):
    event = event_factory()
    user_token = token_factory({"sub": "user-1", "role": "user"})
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})

    client.post(
        f"/api/events/{event.id}/register",
        json=_registration_payload("A"),
        headers=_auth_header(user_token),
    )

    forbidden = client.get(
        f"/api/events/{event.id}/participants",
        headers=_auth_header(user_token),
    )
    assert forbidden.status_code == 403

    allowed = client.get(
        f"/api/events/{event.id}/participants",
        headers=_auth_header(organizer_token),
    )
    assert allowed.status_code == 200
    assert allowed.json()["total"] == 1


def test_approve_and_reject_participants(client, token_factory, event_factory):
    event = event_factory(organizer_id="organizer-1")
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    user_token = token_factory({"sub": "user-1", "role": "user"})

    participant = client.post(
        f"/api/events/{event.id}/register",
        json=_registration_payload("A"),
        headers=_auth_header(user_token),
    ).json()

    approved = client.post(
        f"/api/events/{event.id}/participants/{participant['id']}/approve",
        headers=_auth_header(organizer_token),
    )
    assert approved.status_code == 200
    assert approved.json()["status"] == "approved"

    rejection = client.post(
        f"/api/events/{event.id}/participants/{participant['id']}/reject",
        headers=_auth_header(organizer_token),
    )
    assert rejection.status_code == 422


def test_export_participants(client, token_factory, event_factory):
    event = event_factory(organizer_id="organizer-1")
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    user_token = token_factory({"sub": "user-1", "role": "user"})

    client.post(
        f"/api/events/{event.id}/register",
        json=_registration_payload("A"),
        headers=_auth_header(user_token),
    )

    export = client.get(
        f"/api/events/{event.id}/participants/export",
        headers=_auth_header(organizer_token),
    )
    assert export.status_code == 200
    assert "text/csv" in export.headers["Content-Type"]
