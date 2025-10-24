# Auth Service API

## GET /api/auth/me

Returns the decoded user from the provided `Authorization: Bearer <token>` header.

**Response 200**
```json
{
  "id": "user-123",
  "role": "organizer",
  "email": "user@example.com",
  "name": "User"
}
```

## POST /api/auth/validate

Validates a JWT for downstream services.

```json
{
  "token": "<jwt>"
}
```

**Response 200**
```json
{
  "valid": true,
  "user": {
    "id": "user-123",
    "role": "user"
  }
}
```

If validation fails the response is `{"valid": false, "detail": "..."}`.
