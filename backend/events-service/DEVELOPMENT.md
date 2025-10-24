# Events Service – Development

```bash
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8002
pytest events-service/tests
mypy events-service shared
```

- Status transitions are enforced by `EventsService.ALLOWED_STATUS_TRANSITIONS`.
- TinyDB data lives under `./data/db.json`; integration tests use in-memory storage.
- Return `shared.errors.ValidationError` for domain rule breaches.
