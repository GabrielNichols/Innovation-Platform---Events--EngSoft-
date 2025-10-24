from __future__ import annotations

import os
import signal
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Tuple


SERVICE_DEFINITIONS: List[Tuple[str, str, int]] = [
    ("auth-service", "auth-service", 8001),
    ("events-service", "events-service", 8002),
    ("projects-service", "projects-service", 8003),
    ("participants-service", "participants-service", 8004),
    ("notifications-service", "notifications-service", 8005),
    ("gateway", "gateway", 8000),
]


def _build_environment(backend_root: Path) -> Dict[str, str]:
    env = os.environ.copy()
    backend_path = str(backend_root.resolve())
    existing = env.get("PYTHONPATH", "")
    if existing:
        env["PYTHONPATH"] = os.pathsep.join([backend_path, existing])
    else:
        env["PYTHONPATH"] = backend_path
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
