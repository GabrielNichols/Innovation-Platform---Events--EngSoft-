# Auth Service – Development

## Prerequisites

- Python 3.12+
- pip install -r ../requirements.txt

## Useful Commands

`ash
uvicorn main:app --reload --port 8001
pytest auth-service/tests
mypy auth-service shared
`

## Coding Standards

- New endpoints must include happy-path and error-path tests.
- Use helpers from shared.middleware for authentication.
- Raise shared.errors.ServiceError derived exceptions for predictable responses.
