# Projects Service – Development

## Setup

```bash
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8003
pytest projects-service/tests
mypy projects-service shared
```

## Notes

- Event validation uses TinyDB data written by the events service; ensure fixtures seed event metadata when testing.
- Only `submitted` projects can transition to an end state (`approved` or `rejected`).
- Use `shared.errors.ValidationError` for business rule violations.
