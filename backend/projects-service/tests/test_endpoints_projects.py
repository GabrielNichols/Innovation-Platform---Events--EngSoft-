from __future__ import annotations

from shared.models import ProjectStatus


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


def test_create_and_list_projects(client, token_factory, event_factory):
    event = event_factory()
    token = token_factory({"sub": "user-123", "role": "user"})

    create = client.post(
        f"/api/events/{event.id}/projects",
        json=_project_payload(),
        headers=_auth_header(token),
    )
    assert create.status_code == 201
    project_id = create.json()["id"]

    list_response = client.get(
        f"/api/events/{event.id}/projects",
        headers=_auth_header(token),
    )
    assert list_response.status_code == 200
    body = list_response.json()
    assert body["total"] == 1
    assert body["projects"][0]["id"] == project_id


def test_get_project_details(client, token_factory, event_factory):
    event = event_factory()
    token = token_factory({"sub": "user-123", "role": "user"})
    created = client.post(
        f"/api/events/{event.id}/projects",
        json=_project_payload(),
        headers=_auth_header(token),
    ).json()

    detail = client.get(
        f"/api/events/{event.id}/projects/{created['id']}",
        headers=_auth_header(token),
    )
    assert detail.status_code == 200
    assert detail.json()["id"] == created["id"]


def test_update_project_status(client, token_factory, event_factory):
    event = event_factory(organizer_id="organizer-1")
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    user_token = token_factory({"sub": "user-123", "role": "user"})

    project = client.post(
        f"/api/events/{event.id}/projects",
        json=_project_payload(),
        headers=_auth_header(user_token),
    ).json()

    status_response = client.patch(
        f"/api/events/{event.id}/projects/{project['id']}/status",
        json={"status": "approved"},
        headers=_auth_header(organizer_token),
    )
    assert status_response.status_code == 200
    assert status_response.json()["status"] == ProjectStatus.APPROVED.value


def test_delete_project(client, token_factory, event_factory):
    event = event_factory(organizer_id="organizer-1")
    organizer_token = token_factory({"sub": "organizer-1", "role": "organizer"})
    user_token = token_factory({"sub": "user-123", "role": "user"})

    project = client.post(
        f"/api/events/{event.id}/projects",
        json=_project_payload(),
        headers=_auth_header(user_token),
    ).json()

    delete_response = client.delete(
        f"/api/events/{event.id}/projects/{project['id']}",
        headers=_auth_header(organizer_token),
    )
    assert delete_response.status_code == 204

