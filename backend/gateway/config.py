from __future__ import annotations

from pydantic import Field

# Support both Pydantic v1 and v2
try:  # Pydantic v2 path
    from pydantic_settings import BaseSettings as _BaseSettings, SettingsConfigDict
    _USES_PYDANTIC_V2 = True
except Exception:  # Fallback to Pydantic v1
    from pydantic import BaseSettings as _BaseSettings  # type: ignore
    SettingsConfigDict = None  # type: ignore
    _USES_PYDANTIC_V2 = False


class GatewaySettings(_BaseSettings):
    auth_service_url: str = Field("http://localhost:8001", env="AUTH_SERVICE_URL")
    events_service_url: str = Field("http://localhost:8002", env="EVENTS_SERVICE_URL")
    projects_service_url: str = Field("http://localhost:8003", env="PROJECTS_SERVICE_URL")
    participants_service_url: str = Field(
        "http://localhost:8004", env="PARTICIPANTS_SERVICE_URL"
    )
    notifications_service_url: str = Field(
        "http://localhost:8005", env="NOTIFICATIONS_SERVICE_URL"
    )
    allow_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:5173",
        ],
        env="ALLOW_ORIGINS",
    )

    if _USES_PYDANTIC_V2:
        model_config = SettingsConfigDict(  # type: ignore[call-arg]
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore",  # ignore unrelated env like PORT
        )
    else:
        class Config:  # type: ignore[no-redef]
            env_file = ".env"
            env_file_encoding = "utf-8"
            extra = "ignore"  # ignore unrelated env like PORT
