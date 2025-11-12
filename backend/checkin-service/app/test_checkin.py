
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
import os, shutil

client = TestClient(app)

def setup_function():
    # reset storage
    if os.path.exists(settings.storage_path):
        shutil.rmtree(settings.storage_path, ignore_errors=True)

def test_issue_and_checkin():
    # issue
    r = client.post("/api/checkin/tickets", json={"event_id":"evt_1","participant_id":"usr_1"}, headers={"X-Shared-Secret": ""})
    assert r.status_code == 200, r.text
    ticket = r.json()
    assert ticket["status"] == "issued"

    # get qr payload
    r2 = client.get(f"/api/checkin/tickets/{ticket['id']}/qr")
    assert r2.status_code == 200

    # checkin
    r3 = client.post(f"/api/checkin/tickets/{ticket['id']}/checkin", json={})
    assert r3.status_code == 200
    checked = r3.json()
    assert checked["status"] == "checked_in"
    assert checked["checked_in_at"] is not None
