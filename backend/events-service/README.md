# Events Service

Manages innovation events lifecycle, including creation, updates, and status transitions.

## Environment Variables

- `JWT_SECRET`
- `JWT_ALGORITHM`
- `DB_PATH` (default `./data/db.json`)
- `SERVICE_NAME` (`events-service`)
- `LOG_LEVEL`
- `PORT` (`8002`)

## Running Locally

```bash
cd backend/events-service
uvicorn main:app --reload --port 8002
```

## Docker

```bash
docker build -t events-service -f backend/events-service/Dockerfile backend
```

## Tests

```bash
pytest events-service/tests
```
