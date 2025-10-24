# Notifications Service

Stores notification preferences and allows bulk messaging to event participants.

## Environment Variables

- `JWT_SECRET`
- `JWT_ALGORITHM`
- `DB_PATH`
- `SERVICE_NAME` (`notifications-service`)
- `LOG_LEVEL`
- `PORT` (`8005`)

## Running Locally

```bash
cd backend/notifications-service
uvicorn main:app --reload --port 8005
```

## Tests

```bash
pytest notifications-service/tests
```
