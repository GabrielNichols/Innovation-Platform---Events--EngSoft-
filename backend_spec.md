# Backend Microservices Implementation Plan

## Architecture Overview

Create 6 microservices with API Gateway routing, independent JWT validation, Docker containerization, and Kubernetes deployment manifests:

```
backend/
├── gateway/              # API Gateway (routes requests)
├── auth-service/         # JWT validation & role checking
├── events-service/       # Events CRUD & management
├── projects-service/     # Projects within events
├── participants-service/ # Participant management
├── notifications-service/# Messages & notifications
├── shared/              # Shared utilities (JWT, models, errors)
├── docker-compose.yml   # Local development
└── k8s/                 # Kubernetes manifests
```

## Service Responsibilities

### 1. API Gateway (Port 8000)

- Routes `/api/auth/*` → auth-service:8001
- Routes `/api/events/*` → events-service:8002
- Routes `/api/events/:id/projects/*` → projects-service:8003
- Routes `/api/events/:id/participants/*` → participants-service:8004
- Routes `/api/notifications/*` → notifications-service:8005
- CORS handling
- Request logging

### 2. Auth Service (Port 8001)

- `GET /api/auth/me` - Validate JWT and return user info
- `POST /api/auth/validate` - Internal endpoint for other services
- JWT decoding and validation
- Role extraction (user/organizer/admin)
- **Does NOT handle login/register** (assumes another team's service)

### 3. Events Service (Port 8002)

Based on `EVENTS_MICROSERVICE_INTEGRATION.md`:

- `GET /api/events/management` - List events with stats (filtered by organizer)
- `POST /api/events` - Create event (organizer/admin)
- `GET /api/events/:id` - Event details
- `PUT /api/events/:id` - Update event (owner/admin)
- `DELETE /api/events/:id` - Soft delete (admin only)
- `PATCH /api/events/:id/status` - Update status (draft→published→active→finished)
- `GET /api/events/available` - Public events list
- Database: events collection (id, name, description, organizer_id, status, dates, categories, stats)

### 4. Projects Service (Port 8003)

Per `EVENTOS_E_PROJETOS.md` - projects ALWAYS belong to events:

- `GET /api/events/:eventId/projects` - List projects in event
- `POST /api/events/:eventId/projects` - Create project
- `GET /api/events/:eventId/projects/:id` - Project details
- `PATCH /api/events/:eventId/projects/:id/status` - Approve/reject (organizer/admin)
- `DELETE /api/events/:eventId/projects/:id` - Delete project
- Database: projects collection (id, event_id, title, team_name, status, category, skills, progress)
- Validation: event_id must exist, category must be in event.categories

### 5. Participants Service (Port 8004)

Per `EVENTOS_IMPLEMENTACAO_COMPLETA.md`:

- `GET /api/events/:eventId/participants` - List participants
- `POST /api/events/:eventId/register` - Register user to event
- `POST /api/events/:eventId/participants/:id/approve` - Approve participant
- `POST /api/events/:eventId/participants/:id/reject` - Reject participant
- `GET /api/events/:eventId/participants/export` - Export CSV
- Database: participants collection (event_id, user_id, status, skills, registered_at, profile_complete)

### 6. Notifications Service (Port 8005)

Per `EVENTOS_IMPLEMENTACAO_COMPLETA.md` Épico 4:

- `POST /api/events/:eventId/messages` - Send bulk message to participants
- `GET /api/events/:eventId/messages` - Message history
- `PUT /api/events/:eventId/notifications` - Configure auto-alerts
- Database: messages collection (event_id, recipients, content, sent_at), notification_settings

## Shared Module Structure

`backend/shared/` contains:

- `jwt_validator.py` - JWT decode/validate with secret key
- `models.py` - Pydantic models (Event, Project, Participant, User)
- `errors.py` - Custom exceptions and error responses
- `middleware.py` - Auth middleware decorator
- `database.py` - TinyDB wrapper/interface
- `config.py` - Environment variables (JWT_SECRET, DB_PATH, etc)

## Database Schemas (TinyDB/NoSQL)

### Events Collection

```python
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "start_date": "ISO8601",
  "end_date": "ISO8601",
  "location": "string",
  "status": "draft|published|active|finished",
  "organizer_id": "uuid",
  "categories": ["string"],
  "tags": ["string"],
  "max_participants": int,
  "max_teams": int,
  "registered_participants": int,
  "submitted_projects": int,
  "formed_teams": int,
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "deleted_at": "ISO8601|null"
}
```

### Projects Collection

```python
{
  "id": "uuid",
  "event_id": "uuid",  # REQUIRED - foreign key
  "title": "string",
  "description": "string",
  "team_name": "string",
  "members": int,
  "status": "draft|submitted|approved|rejected",
  "category": "string",
  "skills": ["string"],
  "progress": int,  # 0-100
  "created_by": "uuid",
  "submitted_at": "ISO8601",
  "created_at": "ISO8601"
}
```

### Participants Collection

```python
{
  "id": "uuid",
  "event_id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "email": "string",
  "skills": ["string"],
  "status": "pending|approved|rejected|waitlist",
  "registered_at": "ISO8601",
  "profile_complete": bool
}
```

### Messages Collection

```python
{
  "id": "uuid",
  "event_id": "uuid",
  "recipients": "all|approved|pending",
  "content": "string",
  "sent_at": "ISO8601",
  "sent_by": "uuid"
}
```

## Docker Setup

Each service has:

- `Dockerfile` - Multi-stage build with Python 3.11
- `requirements.txt` - FastAPI, uvicorn, tinydb, pyjwt, pydantic
- `.env.example` - Environment variables template

Root `docker-compose.yml`:

```yaml
services:
  gateway:
    build: ./gateway
    ports: ["8000:8000"]
    depends_on: [auth, events, projects, participants, notifications]
  
  auth:
    build: ./auth-service
    ports: ["8001:8001"]
  
  events:
    build: ./events-service
    ports: ["8002:8002"]
  
  # ... other services
```

## Kubernetes Manifests

`backend/k8s/` structure:

- `namespace.yaml` - Create 'backend' namespace
- `gateway-deployment.yaml` + `gateway-service.yaml`
- `auth-deployment.yaml` + `auth-service.yaml`
- `events-deployment.yaml` + `events-service.yaml`
- `projects-deployment.yaml` + `projects-service.yaml`
- `participants-deployment.yaml` + `participants-service.yaml`
- `notifications-deployment.yaml` + `notifications-service.yaml`
- `configmap.yaml` - Shared config (JWT_SECRET as secret)
- `ingress.yaml` - Route external traffic to gateway

Each deployment:

- 2 replicas for HA
- Resource limits (CPU/memory)
- Liveness/readiness probes
- Environment variables from ConfigMap

## Implementation Order

1. **Setup shared module** - JWT validation, models, middleware
2. **Auth service** - Minimal JWT validation endpoint
3. **Events service** - Full CRUD per documentation
4. **Projects service** - CRUD with event_id validation
5. **Participants service** - Registration and approval
6. **Notifications service** - Bulk messaging
7. **API Gateway** - Route configuration
8. **Docker compose** - Local testing
9. **Kubernetes manifests** - Production deployment

## Key Validations (Per Documentation)

From `EVENTS_MICROSERVICE_INTEGRATION.md` and `CHECKLIST_IMPLEMENTACAO.md`:

### Events Service

- Status transitions only forward: draft → published → active → finished
- Organizer sees only own events (filter by organizer_id)
- Admin sees all events
- Only admin can DELETE events
- Soft delete (set deleted_at timestamp)

### Projects Service

- Project MUST have event_id (NOT NULL constraint)
- Project category MUST be in event.categories
- Projects only submittable if event status = 'active'
- Only 'submitted' status can be changed to approved/rejected
- Once approved/rejected, status is final

### Participants Service

- Participants can only register if event status = 'published'
- Check max_participants limit
- Organizer can approve/reject for own events
- Admin can approve/reject any participant

### Auth Middleware

- Decode JWT token from Authorization header
- Extract user_id and role
- Endpoints check: `@require_role(['organizer', 'admin'])`

## Endpoint-to-Frontend Mapping

Critical endpoints from `RESUMO_PARA_GRUPO_EVENTOS.md` (Priority Alta):

1. `GET /api/auth/me` → Returns user with role
2. `GET /api/events/management` → EventsManagementPage stats/events
3. `POST /api/events` → Create event button
4. `GET /api/events/:id` → EventDetailPage
5. `GET /api/events/:id/projects` → Projects tab
6. `PATCH /api/events/:id/projects/:projectId/status` → Approve/reject buttons

## Testing Strategy

Each service includes:

- `tests/test_endpoints.py` - FastAPI TestClient for all routes
- `tests/test_validation.py` - Business rule validation
- `tests/test_auth.py` - JWT middleware testing
- Mock JWT tokens for testing different roles
- TinyDB in-memory for isolated tests

## Environment Variables

Each service `.env`:

```
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
DB_PATH=./data/db.json
SERVICE_NAME=events-service
LOG_LEVEL=INFO
PORT=8002
```

Gateway additional vars:

```
AUTH_SERVICE_URL=http://auth:8001
EVENTS_SERVICE_URL=http://events:8002
PROJECTS_SERVICE_URL=http://projects:8003
PARTICIPANTS_SERVICE_URL=http://participants:8004
NOTIFICATIONS_SERVICE_URL=http://notifications:8005
```

## Documentation Per Service

Each service root:

- `README.md` - Setup, endpoints, testing
- `API.md` - OpenAPI/Swagger documentation
- `DEVELOPMENT.md` - Local development guide

Root backend README:

- Architecture diagram
- Quick start (docker-compose up)
- Service ports and responsibilities
- Integration with frontend guide