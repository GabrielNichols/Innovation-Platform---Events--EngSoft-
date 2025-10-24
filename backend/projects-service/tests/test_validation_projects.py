from __future__ import annotations

from shared.models import EventStatus


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _project_payload(category: str = "software") -> dict:
    return {
        "title": "Project A",
        "description": "Innovative project description",
        "team_name": "Team Alpha",
        "members": 4,
        "category": category,
        "skills": ["python", "fastapi"],
        "progress": 25,
    }


def test_project_category_validation(client, token_factory, event_factory):
    event = event_factory(categories=["hardware"])
    token = token_factory({"sub": "user-1", "role": "user"})

    response = client.post(
        f"/api/events/{event.id}/projects",
        json=_project_payload(category="software"),
        headers=_auth_header(token),
    )
    assert response.status_code == 422


def test_project_requires_active_event(client, token_factory, event_factory):
    event = event_factory(status=EventStatus.DRAFT)
    token = token_factory({"sub": "user-1", "role": "user"})

    response = client.post(
        f"/api/events/{event.id}/projects",
        json=_project_payload(category="software"),
        headers=_auth_header(token),
    )
    assert response.status_code == 422


def test_only_organizer_can_approve(client, token_factory, event_factory):
    event = event_factory(organizer_id="organizer-1")
    user_token = token_factory({"sub": "user-1", "role": "user"})
    other_token = token_factory({"sub": "organizer-2", "role": "organizer"})

    project = client.post(
        f"/api/events/{event.id}/projects",
        json=_project_payload(),
        headers=_auth_header(user_token),
    ).json()

    response = client.patch(
        f"/api/events/{event.id}/projects/{project['id']}/status",
        json={"status": "approved"},
        headers=_auth_header(other_token),
    )
    assert response.status_code == 403


def test_status_cannot_change_after_final(client, token_factory, event_factory):
    event = event_factory(organizer_id="organizer-1")
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    user_token = token_factory({"sub": "user-1", "role": "user"})

    project = client.post(
        f"/api/events/{event.id}/projects",
        json=_project_payload(),
        headers=_auth_header(user_token),
    ).json()

    client.patch(
        f"/api/events/{event.id}/projects/{project['id']}/status",
        json={"status": "approved"},
        headers=_auth_header(organizer_token),
    )

    second = client.patch(
        f"/api/events/{event.id}/projects/{project['id']}/status",
        json={"status": "rejected"},
        headers=_auth_header(organizer_token),
    )
    assert second.status_code == 422
