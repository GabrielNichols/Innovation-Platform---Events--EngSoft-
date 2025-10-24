# Gateway – Development

```bash
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
pytest gateway/tests
mypy gateway shared
```

- Routing is defined in `gateway/app/__init__.py` through prefix matching.
- `httpx.AsyncClient` is used for proxying; adjust timeouts or headers there.
- Ensure new service routes are reflected in both the resolver and documentation.
