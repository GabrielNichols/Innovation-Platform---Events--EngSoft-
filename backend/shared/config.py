from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field

# Support both Pydantic v1 and v2
try:  # Pydantic v2 path
    from pydantic_settings import BaseSettings as _BaseSettings, SettingsConfigDict
    _USES_PYDANTIC_V2 = True
except Exception:  # Fallback to Pydantic v1
    from pydantic import BaseSettings as _BaseSettings  # type: ignore
    SettingsConfigDict = None  # type: ignore
    _USES_PYDANTIC_V2 = False


class Settings(_BaseSettings):
    """Global settings shared between services."""

    jwt_secret: str = Field("dev-secret-key", env="JWT_SECRET")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    db_path: str = Field("./data/db.json", env="DB_PATH")
    service_name: str = Field("service", env="SERVICE_NAME")
    log_level: str = Field("INFO", env="LOG_LEVEL")
    port: int = Field(8000, env="PORT")

    # Development auth bypass (for local frontend without real login)
    dev_auth_enabled: bool = Field(False, env="DEV_AUTH_ENABLED")
    dev_user_id: str = Field("dev-user", env="DEV_USER_ID")
    dev_user_role: str = Field("admin", env="DEV_USER_ROLE")
    dev_user_name: Optional[str] = Field("Dev User", env="DEV_USER_NAME")
    dev_user_email: Optional[str] = Field("dev@example.com", env="DEV_USER_EMAIL")

    if _USES_PYDANTIC_V2:
        # Pydantic v2 settings
        model_config = SettingsConfigDict(  # type: ignore[call-arg]
            env_file=".env",
            env_file_encoding="utf-8",
        )
    else:
        # Pydantic v1 settings
        class Config:  # type: ignore[no-redef]
            env_file = ".env"
            env_file_encoding = "utf-8"

    def ensure_data_dir(self) -> Path:
        """Ensure that the database directory exists and return its path."""
        path = Path(self.db_path).expanduser().resolve()
        path.parent.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a singleton settings instance."""
    return Settings()  # type: ignore[call-arg]
