# Events Service API

## GET /api/events/management
Returns events visible to the current user (organizers only see their own).

## POST /api/events
Creates a new event. Organizer ID is inferred from the JWT unless provided by an admin.

```json
{
  "name": "Hackathon",
  "description": "Great event",
  "start_date": "2025-01-10T12:00:00Z",
  "end_date": "2025-01-11T12:00:00Z",
  "location": "Innovation Hub",
  "categories": ["ai", "iot"],
  "tags": ["tech"],
  "max_participants": 100,
  "max_teams": 10,
  "status": "draft"
}
```

## GET /api/events/{id}
Returns full event details.

## PUT /api/events/{id}
Updates event metadata (organizer may update own events, admins can update any).

## DELETE /api/events/{id}
Soft-deletes an event (admins only).

## PATCH /api/events/{id}/status
Transitions status forward (`draft -> published -> active -> finished`).

## GET /api/events/available
Lists public events (`published` and `active`). No authentication required.
