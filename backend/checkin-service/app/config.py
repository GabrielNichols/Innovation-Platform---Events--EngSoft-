
import os
from pydantic import BaseModel

class Settings(BaseModel):
    service_name: str = "checkin-service"
    storage_path: str = os.getenv("STORAGE_PATH", "data")
    base_url: str = os.getenv("BASE_URL", "http://localhost:8006")
    # for gateway integration example
    cors_allow_origins: str = os.getenv("ALLOW_ORIGINS", "*")
    notifications_url: str = os.getenv("NOTIFICATIONS_URL", "")  # optional webhook to notifications-service
    gateway_shared_secret: str = os.getenv("GATEWAY_SHARED_SECRET", "")  # if you want simple shared-secret auth

settings = Settings()
