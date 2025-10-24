from __future__ import annotations

from datetime import datetime, timedelta, timezone

from shared.models import EventStatus


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _event_payload(name: str) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "name": name,
        "description": f"{name} description",
        "start_date": (now + timedelta(days=1)).isoformat(),
        "end_date": (now + timedelta(days=2)).isoformat(),
        "location": "Innovation Hub",
        "categories": ["ai", "iot"],
        "tags": ["tech"],
        "max_participants": 100,
        "max_teams": 10,
        "status": EventStatus.DRAFT.value,
    }


def _create_event(client, token, name="Validation Event"):
    response = client.post(
        "/api/events",
        json=_event_payload(name),
        headers=_auth_header(token),
    )
    return response.json()["id"]


def test_invalid_status_transition(client, token_factory):
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    event_id = _create_event(client, organizer_token)

    response = client.patch(
        f"/api/events/{event_id}/status",
        json={"status": EventStatus.ACTIVE.value},
        headers=_auth_header(organizer_token),
    )
    assert response.status_code == 422


def test_organizer_cannot_update_other_events(client, token_factory):
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    other_token = token_factory({"sub": "organizer-2", "role": "organizer"})
    event_id = _create_event(client, organizer_token)

    update = client.put(
        f"/api/events/{event_id}",
        json={"description": "Malicious update"},
        headers=_auth_header(other_token),
    )
    assert update.status_code == 403


def test_update_requires_valid_dates(client, token_factory):
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    event_id = _create_event(client, organizer_token)
    now = datetime.now(timezone.utc)

    response = client.put(
        f"/api/events/{event_id}",
        json={
            "start_date": (now + timedelta(days=5)).isoformat(),
            "end_date": (now + timedelta(days=4)).isoformat(),
        },
        headers=_auth_header(organizer_token),
    )
    assert response.status_code == 422
