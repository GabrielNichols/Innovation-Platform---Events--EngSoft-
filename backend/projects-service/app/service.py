from __future__ import annotations

from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from shared import (
    Event,
    EventStatus,
    ForbiddenError,
    NotFoundError,
    Project,
    ProjectStatus,
    User,
    UserRole,
    ValidationError,
)

from .event_reader import EventReader
from .repository import ProjectsRepository
from .schemas import ProjectCreate, ProjectStatusUpdate, ProjectsListResponse


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ProjectsService:
    def __init__(
        self,
        repository: ProjectsRepository,
        event_reader: EventReader,
    ) -> None:
        self._repository = repository
        self._event_reader = event_reader

    def _require_event(self, event_id: str) -> Event:
        event = self._event_reader.get(event_id)
        if not event:
            raise NotFoundError("Event not found for project operation")
        return event

    def _require_project(self, project_id: str) -> Project:
        record = self._repository.get(project_id)
        if not record:
            raise NotFoundError("Project not found")
        return Project.parse_obj(record)

    def _assert_event_access(self, user: User, event: Event) -> None:
        if user.role == UserRole.ORGANIZER and event.organizer_id != user.id:
            raise ForbiddenError("Organizers can only manage their own events")

    def list_projects(self, user: User, event_id: str) -> ProjectsListResponse:
        event = self._require_event(event_id)
        if user.role == UserRole.ORGANIZER:
            self._assert_event_access(user, event)

        records = self._repository.list_by_event(event_id)
        projects: List[Project] = [Project.parse_obj(record) for record in records]
        return ProjectsListResponse(projects=projects, total=len(projects))

    def get_project(self, user: User, event_id: str, project_id: str) -> Project:
        event = self._require_event(event_id)
        if user.role == UserRole.ORGANIZER:
            self._assert_event_access(user, event)

        project = self._require_project(project_id)
        if project.event_id != event_id:
            raise NotFoundError("Project not associated with this event")
        return project

    def create_project(
        self, user: User, event_id: str, payload: ProjectCreate
    ) -> Project:
        event = self._require_event(event_id)
        if event.status != EventStatus.ACTIVE:
            raise ValidationError("Projects can only be submitted to active events")

        if payload.category not in event.categories:
            raise ValidationError("Project category must exist in the event categories")

        now = _utcnow()
        project = Project(
            id=str(uuid4()),
            event_id=event_id,
            title=payload.title,
            description=payload.description,
            team_name=payload.team_name,
            members=payload.members,
            status=ProjectStatus.SUBMITTED,
            category=payload.category,
            skills=payload.skills,
            progress=payload.progress if payload.progress is not None else 0,
            created_by=user.id,
            submitted_at=now,
            created_at=now,
        )

        record = self._repository.insert(project)
        return Project.parse_obj(record)

    def update_status(
        self, user: User, event_id: str, project_id: str, payload: ProjectStatusUpdate
    ) -> Project:
        event = self._require_event(event_id)
        self._assert_event_access(user, event)

        project = self._require_project(project_id)
        if project.event_id != event_id:
            raise NotFoundError("Project not associated with this event")

        if project.status != ProjectStatus.SUBMITTED:
            raise ValidationError("Only submitted projects can change status")

        new_status = ProjectStatus(payload.status)
        project.status = new_status

        record = self._repository.update(project_id, project)
        if not record:
            raise NotFoundError("Project not found")
        return Project.parse_obj(record)

    def delete_project(self, user: User, event_id: str, project_id: str) -> None:
        event = self._require_event(event_id)
        if user.role not in {UserRole.ORGANIZER, UserRole.ADMIN}:
            raise ForbiddenError("Only organizers or admins can delete projects")
        self._assert_event_access(user, event)

        project = self._require_project(project_id)
        if project.event_id != event_id:
            raise NotFoundError("Project not associated with this event")

        if not self._repository.delete(project_id):
            raise NotFoundError("Project not found")
