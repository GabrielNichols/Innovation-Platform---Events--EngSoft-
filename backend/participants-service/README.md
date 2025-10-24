# Participants Service

Handles event registrations and organizer approvals.

## Environment Variables

- `JWT_SECRET`
- `JWT_ALGORITHM`
- `DB_PATH`
- `SERVICE_NAME` (`participants-service`)
- `LOG_LEVEL`
- `PORT` (`8004`)

## Running Locally

```bash
cd backend/participants-service
uvicorn main:app --reload --port 8004
```

## Tests

```bash
pytest participants-service/tests
```
