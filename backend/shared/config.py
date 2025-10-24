from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Global settings shared between services."""

    jwt_secret: str = Field("dev-secret-key", env="JWT_SECRET")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    db_path: str = Field("./data/db.json", env="DB_PATH")
    service_name: str = Field("service", env="SERVICE_NAME")
    log_level: str = Field("INFO", env="LOG_LEVEL")
    port: int = Field(8000, env="PORT")

    class Config:
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
