
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from .config import settings

app = FastAPI(title="Check-in Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.cors_allow_origins == "*" else settings.cors_allow_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/healthz")
def health():
    return {"ok": True, "service": settings.service_name}
