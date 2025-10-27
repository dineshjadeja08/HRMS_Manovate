"""Webhook endpoints for external integrations"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.schemas import PayrollStatusWebhook, CalendarSyncWebhook
from app.models import PayrollRun, LeaveRequest, PayrollStatus, LeaveRequestStatus
from app.config import get_settings

settings = get_settings()
router = APIRouter()


def verify_webhook_key(x_api_key: str = Header(...)):
    """Verify webhook API key"""
    if x_api_key != settings.WEBHOOK_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return True


@router.post("/payroll-status")
async def receive_payroll_status(
    webhook_data: PayrollStatusWebhook,
    verified: bool = Depends(verify_webhook_key),
    db: Session = Depends(get_db)
):
    """
    Receive payroll status update from external payroll system
    
    - Secured via API Key (X-API-Key header)
    - Updates payroll run status based on external processing result
    """
    # Find payroll run
    payroll_run = db.query(PayrollRun).filter(PayrollRun.id == webhook_data.run_id).first()
    
    if not payroll_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll run not found"
        )
    
    # Update status
    if webhook_data.status == "success":
        payroll_run.status = PayrollStatus.COMPLETED
    elif webhook_data.status == "failure":
        payroll_run.status = PayrollStatus.FAILED
    
    db.commit()
    
    return {
        "message": "Payroll status updated successfully",
        "run_id": webhook_data.run_id,
        "status": webhook_data.status
    }


@router.post("/calendar-sync")
async def receive_calendar_sync(
    webhook_data: CalendarSyncWebhook,
    verified: bool = Depends(verify_webhook_key),
    db: Session = Depends(get_db)
):
    """
    Receive calendar sync confirmation from external calendar service
    
    - Secured via API Key (X-API-Key header)
    - Confirms that leave has been synced to external calendar
    """
    # Find leave request
    leave_request = db.query(LeaveRequest).filter(
        LeaveRequest.id == webhook_data.leave_request_id
    ).first()
    
    if not leave_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )
    
    # Verify employee ID matches
    if leave_request.employee_id != webhook_data.employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID mismatch"
        )
    
    # Log the sync (could be stored in a separate sync tracking table)
    # For now, just return success
    
    return {
        "message": "Calendar sync confirmed",
        "employee_id": webhook_data.employee_id,
        "leave_request_id": webhook_data.leave_request_id,
        "status": webhook_data.status
    }


@router.post("/external-event")
async def receive_external_event(
    event_data: dict,
    verified: bool = Depends(verify_webhook_key),
    db: Session = Depends(get_db)
):
    """
    Generic webhook endpoint for receiving external events
    
    - Secured via API Key (X-API-Key header)
    - Can be used for various external system integrations
    """
    # Log the event
    # Process based on event type
    event_type = event_data.get("type", "unknown")
    
    return {
        "message": f"External event received: {event_type}",
        "event_data": event_data
    }
