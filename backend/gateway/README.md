# API Gateway

FastAPI-based reverse proxy that consolidates routes from all backend microservices and applies CORS plus request logging.

## Environment Variables

- `AUTH_SERVICE_URL`
- `EVENTS_SERVICE_URL`
- `PROJECTS_SERVICE_URL`
- `PARTICIPANTS_SERVICE_URL`
- `NOTIFICATIONS_SERVICE_URL`
- `PORT` (`8000`)

## Running Locally

```bash
cd backend/gateway
uvicorn main:app --reload --port 8000
```
