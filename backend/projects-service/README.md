# Projects Service

Handles project submissions and approval workflow tied to events.

## Environment Variables

- `JWT_SECRET`
- `JWT_ALGORITHM`
- `DB_PATH`
- `SERVICE_NAME` (`projects-service`)
- `LOG_LEVEL`
- `PORT` (`8003`)

## Running Locally

```bash
cd backend/projects-service
uvicorn main:app --reload --port 8003
```

## Tests

```bash
pytest projects-service/tests
```
