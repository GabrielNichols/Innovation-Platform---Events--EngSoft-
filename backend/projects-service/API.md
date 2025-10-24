# Projects Service API

All endpoints require `Authorization: Bearer <token>`.

## GET /api/events/{eventId}/projects
List projects for an event (organizers/admins see full list, users see their submissions).

## POST /api/events/{eventId}/projects
Submit a project under an event. The event must be `active` and the category must exist on the event.

## GET /api/events/{eventId}/projects/{id}
Retrieve project details.

## PATCH /api/events/{eventId}/projects/{id}/status
Approves or rejects a project (`submitted -> approved/rejected`). Organizers manage their own events, admins manage all.

## DELETE /api/events/{eventId}/projects/{id}
Removes a project (organizers/admins).
