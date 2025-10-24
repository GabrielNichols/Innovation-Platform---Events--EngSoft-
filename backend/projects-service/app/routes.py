from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Response, status

from shared import Project, User
from shared.middleware import get_current_user

from .dependencies import get_projects_service
from .schemas import ProjectCreate, ProjectStatusUpdate, ProjectsListResponse
from .service import ProjectsService

router = APIRouter(prefix="/api/events/{event_id}/projects", tags=["projects"])


@router.get("", response_model=ProjectsListResponse)
async def list_projects(
    event_id: str,
    user: User = Depends(get_current_user),
    service: ProjectsService = Depends(get_projects_service),
) -> ProjectsListResponse:
    return service.list_projects(user, event_id)


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    event_id: str,
    payload: ProjectCreate,
    user: User = Depends(get_current_user),
    service: ProjectsService = Depends(get_projects_service),
) -> Project:
    return service.create_project(user, event_id, payload)


@router.get("/{project_id}", response_model=Project)
async def get_project(
    event_id: str,
    project_id: str,
    user: User = Depends(get_current_user),
    service: ProjectsService = Depends(get_projects_service),
) -> Project:
    return service.get_project(user, event_id, project_id)


@router.patch("/{project_id}/status", response_model=Project)
async def update_project_status(
    event_id: str,
    project_id: str,
    payload: ProjectStatusUpdate,
    user: User = Depends(get_current_user),
    service: ProjectsService = Depends(get_projects_service),
) -> Project:
    return service.update_status(user, event_id, project_id, payload)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    event_id: str,
    project_id: str,
    user: User = Depends(get_current_user),
    service: ProjectsService = Depends(get_projects_service),
) -> Response:
    service.delete_project(user, event_id, project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
