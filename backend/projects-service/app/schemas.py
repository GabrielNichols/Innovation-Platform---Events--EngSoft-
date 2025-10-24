from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from shared import Project, ProjectStatus


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    team_name: str = Field(..., min_length=3)
    members: int = Field(..., ge=1)
    category: str = Field(..., min_length=2)
    skills: List[str] = Field(..., min_items=1)
    progress: Optional[int] = Field(default=0, ge=0, le=100)


class ProjectStatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]


class ProjectsListResponse(BaseModel):
    projects: List[Project]
    total: int
