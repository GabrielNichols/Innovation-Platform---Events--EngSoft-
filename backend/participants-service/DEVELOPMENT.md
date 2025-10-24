# Participants Service – Development

```bash
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8004
pytest participants-service/tests
mypy participants-service shared
```

- Registrations default to `pending` until approved, and overflow bins to `waitlist`.
- Organizers can only manage participants for their own events; admins manage everything.
- CSV export is generated in-memory via `csv.writer`.
