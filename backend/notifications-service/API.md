# Notifications Service API

## POST /api/notifications/events/{eventId}/messages
Send a message to participants (`recipients` can be `all`, `approved`, or `pending`).

```json
{
  "recipients": "all",
  "content": "Welcome to the event!"
}
```

## GET /api/notifications/events/{eventId}/messages
List historical messages.

## PUT /api/notifications/events/{eventId}/notifications
Update notification preferences (enabled flag and alert recipients).
