from __future__ import annotations

from datetime import datetime, timedelta, timezone

from shared.models import EventStatus


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _event_payload(name: str, status: EventStatus = EventStatus.DRAFT) -> dict:
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
        "status": status.value,
    }


def test_create_and_get_event(client, token_factory):
    token = token_factory({"sub": "organizer-1", "role": "organizer"})
    response = client.post(
        "/api/events",
        json=_event_payload("Hackathon 1"),
        headers=_auth_header(token),
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Hackathon 1"
    assert data["organizer_id"] == "organizer-1"

    event_id = data["id"]
    detail = client.get(
        f"/api/events/{event_id}",
        headers=_auth_header(token),
    )
    assert detail.status_code == 200
    assert detail.json()["id"] == event_id


def test_management_filters_by_organizer(client, token_factory):
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    other_token = token_factory({"sub": "organizer-2", "role": "organizer"})
    admin_token = token_factory({"sub": "admin-1", "role": "admin"})

    client.post(
        "/api/events",
        json=_event_payload("Organized Event"),
        headers=_auth_header(organizer_token),
    )
    client.post(
        "/api/events",
        json=_event_payload("Other Event"),
        headers=_auth_header(other_token),
    )

    response = client.get(
        "/api/events/management",
        headers=_auth_header(organizer_token),
    )
    assert response.status_code == 200
    assert response.json()["total"] == 1

    admin_response = client.get(
        "/api/events/management",
        headers=_auth_header(admin_token),
    )
    assert admin_response.status_code == 200
    assert admin_response.json()["total"] == 2


def test_update_and_status_transition(client, token_factory):
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    response = client.post(
        "/api/events",
        json=_event_payload("Draft Event"),
        headers=_auth_header(organizer_token),
    )
    event_id = response.json()["id"]

    update_response = client.put(
        f"/api/events/{event_id}",
        json={"description": "Updated description"},
        headers=_auth_header(organizer_token),
    )
    assert update_response.status_code == 200
    assert update_response.json()["description"] == "Updated description"

    status_response = client.patch(
        f"/api/events/{event_id}/status",
        json={"status": EventStatus.PUBLISHED.value},
        headers=_auth_header(organizer_token),
    )
    assert status_response.status_code == 200
    assert status_response.json()["status"] == EventStatus.PUBLISHED.value


def test_delete_event_requires_admin(client, token_factory):
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    admin_token = token_factory({"sub": "admin-1", "role": "admin"})

    created = client.post(
        "/api/events",
        json=_event_payload("To Delete"),
        headers=_auth_header(organizer_token),
    )
    event_id = created.json()["id"]

    forbidden = client.delete(
        f"/api/events/{event_id}",
        headers=_auth_header(organizer_token),
    )
    assert forbidden.status_code == 403

    deleted = client.delete(
        f"/api/events/{event_id}",
        headers=_auth_header(admin_token),
    )
    assert deleted.status_code == 200
    assert deleted.json()["deleted_at"] is not None


def test_available_events_endpoint(client, token_factory):
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    # Draft event should not appear
    client.post(
        "/api/events",
        json=_event_payload("Draft Event", status=EventStatus.DRAFT),
        headers=_auth_header(organizer_token),
    )
    # Published event should appear
    client.post(
        "/api/events",
        json=_event_payload("Published Event", status=EventStatus.PUBLISHED),
        headers=_auth_header(organizer_token),
    )

    available = client.get("/api/events/available")
    assert available.status_code == 200
    names = [event["name"] for event in available.json()]
    assert "Published Event" in names
    assert "Draft Event" not in names
