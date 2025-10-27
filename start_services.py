from __future__ import annotations

import os
import json
import signal
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Tuple


def _env_port(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, str(default)))
    except ValueError:
        return default


SERVICE_DEFINITIONS: List[Tuple[str, str, int]] = [
    ("auth-service", "auth-service", _env_port("AUTH_SERVICE_PORT", 8001)),
    ("events-service", "events-service", _env_port("EVENTS_SERVICE_PORT", 8002)),
    ("projects-service", "projects-service", _env_port("PROJECTS_SERVICE_PORT", 8003)),
    ("participants-service", "participants-service", _env_port("PARTICIPANTS_SERVICE_PORT", 8004)),
    ("notifications-service", "notifications-service", _env_port("NOTIFICATIONS_SERVICE_PORT", 8005)),
    ("gateway", "gateway", _env_port("GATEWAY_PORT", 8080)),
]


def _build_environment(backend_root: Path) -> Dict[str, str]:
    env = os.environ.copy()
    backend_path = str(backend_root.resolve())
    existing = env.get("PYTHONPATH", "")
    if existing:
        env["PYTHONPATH"] = os.pathsep.join([backend_path, existing])
    else:
        env["PYTHONPATH"] = backend_path
    # Default service URLs for gateway if not provided
    env.setdefault("AUTH_SERVICE_URL", f"http://localhost:{_env_port('AUTH_SERVICE_PORT', 8001)}")
    env.setdefault("EVENTS_SERVICE_URL", f"http://localhost:{_env_port('EVENTS_SERVICE_PORT', 8002)}")
    env.setdefault("PROJECTS_SERVICE_URL", f"http://localhost:{_env_port('PROJECTS_SERVICE_PORT', 8003)}")
    env.setdefault("PARTICIPANTS_SERVICE_URL", f"http://localhost:{_env_port('PARTICIPANTS_SERVICE_PORT', 8004)}")
    env.setdefault("NOTIFICATIONS_SERVICE_URL", f"http://localhost:{_env_port('NOTIFICATIONS_SERVICE_PORT', 8005)}")
    # Allow typical local frontend origins for CORS
    env.setdefault(
        "ALLOW_ORIGINS",
        json.dumps([
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:5173",
        ]),
    )
    # Enable dev auth bypass for local testing unless explicitly disabled
    env.setdefault("DEV_AUTH_ENABLED", "true")
    return env


def _terminate_process(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is None:
        try:
            if os.name == "nt":
                process.send_signal(signal.CTRL_BREAK_EVENT)
                time.sleep(0.2)
            process.terminate()
        except Exception:
            process.kill()


def main() -> None:
    repo_root = Path(__file__).parent
    backend_root = repo_root / "backend"
    if not backend_root.exists():
        raise RuntimeError("Backend directory not found. Run this script from the project root.")

    env = _build_environment(backend_root)
    processes: List[Tuple[subprocess.Popen[bytes], str]] = []

    print("Starting backend microservices (Ctrl+C to stop)...\n")
    try:
        for service_name, relative_path, port in SERVICE_DEFINITIONS:
            service_dir = backend_root / relative_path
            if not service_dir.exists():
                raise RuntimeError(f"Service directory not found: {service_dir}")

            cmd = [
                sys.executable,
                "-m",
                "uvicorn",
                "main:app",
                "--host",
                "0.0.0.0",
                "--port",
                str(port),
            ]

            print(f"[BOOT] {service_name} -> http://localhost:{port}")
            creation_flags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0) if os.name == "nt" else 0
            process = subprocess.Popen(
                cmd,
                cwd=str(service_dir),
                env=env,
                stdout=None,
                stderr=None,
                creationflags=creation_flags,
            )
            processes.append((process, service_name))

        print("\nAll services launched. Press Ctrl+C to terminate.")

        while True:
            for process, name in processes:
                return_code = process.poll()
                if return_code is not None:
                    raise RuntimeError(f"{name} exited unexpectedly with code {return_code}.")
            time.sleep(1.0)

    except KeyboardInterrupt:
        print("\nStopping services...")
    except RuntimeError as exc:
        print(f"\n{exc}")
    finally:
        for process, _ in processes:
            _terminate_process(process)

        for process, name in processes:
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                print(f"Forcing shutdown of {name} (pid={process.pid})")
                process.kill()

        print("All services stopped.")


if __name__ == "__main__":
    main()
