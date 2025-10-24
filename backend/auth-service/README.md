# Auth Service

Validates JWT tokens and exposes identity information for downstream services.

## Environment Variables

- `JWT_SECRET`
- `JWT_ALGORITHM`
- `SERVICE_NAME`
- `LOG_LEVEL`
- `PORT`

## Running Locally

```bash
cd backend/auth-service
uvicorn main:app --reload --port 8001
```

## Tests

```bash
pytest auth-service/tests
```
