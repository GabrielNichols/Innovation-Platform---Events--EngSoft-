# Notifications Service – Development

```bash
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8005
pytest notifications-service/tests
mypy notifications-service shared
```

- Messages and settings are stored using TinyDB tables (`messages` and `notification_settings`).
- Organizers can only send messages for events they own; admins can message any event.
- Ensure new endpoints keep JSON payloads concise for consumption by the frontend.
