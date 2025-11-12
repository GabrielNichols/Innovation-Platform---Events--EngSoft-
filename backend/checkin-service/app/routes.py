
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from .schemas import TicketCreate, TicketRead, CheckinRequest, BulkIssueRequest, QRPayload
from .service import CheckinService
from .storage import JsonStorage
from .config import settings
from datetime import datetime

router = APIRouter(prefix="/api/checkin", tags=["checkin"])

def get_service() -> CheckinService:
    storage = JsonStorage(settings.storage_path)
    return CheckinService(storage)

def verify_gateway(secret: Optional[str] = Header(default=None, alias="X-Shared-Secret")):
    if settings.gateway_shared_secret and secret != settings.gateway_shared_secret:
        raise HTTPException(status_code=401, detail="unauthorized")
    return True

@router.post("/tickets", response_model=TicketRead)
def issue_ticket(body: TicketCreate, _: bool = Depends(verify_gateway), svc: CheckinService = Depends(get_service)):
    t = svc.issue_ticket(body.event_id, body.participant_id)
    return TicketRead(**t.__dict__)

@router.post("/tickets/bulk", response_model=list[TicketRead])
def issue_bulk(body: BulkIssueRequest, _: bool = Depends(verify_gateway), svc: CheckinService = Depends(get_service)):
    tickets = svc.bulk_issue(body.event_id, body.participant_ids)
    return [TicketRead(**t.__dict__) for t in tickets]

@router.get("/tickets/{ticket_id}", response_model=TicketRead)
def get_ticket(ticket_id: str, svc: CheckinService = Depends(get_service)):
    t = svc.get_ticket(ticket_id)
    if not t:
        raise HTTPException(status_code=404, detail="not_found")
    return TicketRead(**t.__dict__)

@router.get("/events/{event_id}/tickets", response_model=list[TicketRead])
def list_event_tickets(event_id: str, svc: CheckinService = Depends(get_service)):
    tickets = svc.list_event_tickets(event_id)
    return [TicketRead(**t.__dict__) for t in tickets]

@router.post("/tickets/{ticket_id}/checkin", response_model=TicketRead)
async def perform_checkin(ticket_id: str, body: CheckinRequest | None = None, svc: CheckinService = Depends(get_service)):
    t = await svc.check_in(ticket_id, now=body.now if body else None)
    return TicketRead(**t.__dict__)

@router.get("/tickets/{ticket_id}/qr", response_model=QRPayload)
def get_qr_payload(ticket_id: str, svc: CheckinService = Depends(get_service)):
    t = svc.get_ticket(ticket_id)
    if not t:
        raise HTTPException(status_code=404, detail="not_found")
    return QRPayload(
        ticket_id=t.id,
        event_id=t.event_id,
        participant_id=t.participant_id,
        ts=datetime.utcnow(),
    )
