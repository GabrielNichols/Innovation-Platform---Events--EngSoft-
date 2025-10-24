from __future__ import annotations

import os
import sys
from pathlib import Path


def pytest_sessionstart(session) -> None:  # type: ignore[no-untyped-def]
    """Ensure backend root is importable so `shared` and `gateway` resolve.

    Pytest runs from `backend/` (rootdir), but package imports in services
    expect that directory to be on `sys.path` for `import shared` and
    `import gateway` to succeed.
    """
    backend_root = Path(__file__).resolve().parent
    backend_str = str(backend_root)
    if backend_str not in sys.path:
        sys.path.insert(0, backend_str)
    # Also set PYTHONPATH for any subprocesses (defensive; not strictly required)
    os.environ["PYTHONPATH"] = os.pathsep.join(filter(None, [backend_str, os.environ.get("PYTHONPATH", "")]))


