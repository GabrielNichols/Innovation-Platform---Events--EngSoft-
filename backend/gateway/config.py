from __future__ import annotations

from pydantic import BaseSettings, Field


class GatewaySettings(BaseSettings):
    auth_service_url: str = Field("http://localhost:8001", env="AUTH_SERVICE_URL")
    events_service_url: str = Field("http://localhost:8002", env="EVENTS_SERVICE_URL")
    projects_service_url: str = Field("http://localhost:8003", env="PROJECTS_SERVICE_URL")
    participants_service_url: str = Field(
        "http://localhost:8004", env="PARTICIPANTS_SERVICE_URL"
    )
    notifications_service_url: str = Field(
        "http://localhost:8005", env="NOTIFICATIONS_SERVICE_URL"
    )
    allow_origins: list[str] = Field(default_factory=lambda: ["*"])

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
