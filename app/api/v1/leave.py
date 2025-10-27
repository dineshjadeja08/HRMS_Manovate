"""Leave Management API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, date as date_type
from decimal import Decimal

from app.database import get_db
from app.schemas import (
    LeaveTypeResponse, LeaveBalanceResponse, LeaveRequestCreate,
    LeaveRequestResponse, LeaveRequestAction
)
from app.models import (
    LeaveType, LeaveBalance, LeaveRequest, Employee, User, 
    RoleType, LeaveRequestStatus
)
from app.auth.dependencies import get_current_user, require_hr_admin
from app.tasks import sync_calendar_async

router = APIRouter()


@router.get("/types", response_model=List[LeaveTypeResponse])
async def list_leave_types(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all available leave types"""
    leave_types = db.query(LeaveType).filter(LeaveType.is_active == True).all()
    return leave_types


@router.get("/balances/{employee_id}", response_model=List[LeaveBalanceResponse])
async def get_leave_balances(
    employee_id: int,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get leave balances for an employee
    
    - Employees can view their own balances
    - Managers can view their team's balances
    - HR_ADMIN can view all balances
    """
    # Authorization check
    if current_user.role not in [RoleType.HR_ADMIN, RoleType.EXECUTIVE]:
        if current_user.employee_id != employee_id:
            # Check if user is the employee's manager
            employee = db.query(Employee).filter(Employee.id == employee_id).first()
            if not employee or employee.manager_id != current_user.employee_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view these balances"
                )
    
    # Default to current year if not specified
    if not year:
        year = datetime.now().year
    
    balances = db.query(LeaveBalance).filter(
        and_(
            LeaveBalance.employee_id == employee_id,
            LeaveBalance.year == year
        )
    ).all()
    
    return balances


@router.post("/requests", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_request(
    request_data: LeaveRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a new leave request
    
    - Employees can only create requests for themselves
    """
    # Ensure user has an employee profile
    if not current_user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not linked to an employee profile"
        )
    
    # Validate leave type exists
    leave_type = db.query(LeaveType).filter(LeaveType.id == request_data.leave_type_id).first()
    if not leave_type or not leave_type.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid leave type"
        )
    
    # Calculate number of days
    delta = request_data.end_date - request_data.start_date
    total_days = delta.days + 1
    
    if total_days <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date range"
        )
    
    # Check leave balance
    current_year = datetime.now().year
    balance = db.query(LeaveBalance).filter(
        and_(
            LeaveBalance.employee_id == current_user.employee_id,
            LeaveBalance.leave_type_id == request_data.leave_type_id,
            LeaveBalance.year == current_year
        )
    ).first()
    
    if balance and balance.available_days < total_days:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient leave balance. Available: {balance.available_days} days"
        )
    
    # Create leave request
    leave_request = LeaveRequest(
        employee_id=current_user.employee_id,
        leave_type_id=request_data.leave_type_id,
        start_date=request_data.start_date,
        end_date=request_data.end_date,
        total_days=total_days,
        reason=request_data.reason,
        status=LeaveRequestStatus.PENDING
    )
    
    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)
    
    return leave_request


@router.get("/requests", response_model=List[LeaveRequestResponse])
async def list_my_leave_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List logged-in user's leave requests
    """
    if not current_user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not linked to an employee profile"
        )
    
    query = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == current_user.employee_id
    )
    
    if status:
        query = query.filter(LeaveRequest.status == status)
    
    requests = query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()
    return requests


@router.get("/requests/team", response_model=List[LeaveRequestResponse])
async def list_team_leave_requests(
    skip: int = 0,
    limit: int = 100,
    status: str = "PENDING",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List pending leave requests for manager's team
    
    - Accessible by MANAGER and HR_ADMIN
    """
    if current_user.role not in [RoleType.MANAGER, RoleType.HR_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    query = db.query(LeaveRequest)
    
    # Managers see requests from their direct reports
    if current_user.role == RoleType.MANAGER:
        # Get direct reports
        direct_reports = db.query(Employee).filter(
            Employee.manager_id == current_user.employee_id
        ).all()
        
        employee_ids = [emp.id for emp in direct_reports]
        query = query.filter(LeaveRequest.employee_id.in_(employee_ids))
    
    # Filter by status
    if status:
        query = query.filter(LeaveRequest.status == status)
    
    requests = query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()
    return requests


@router.put("/requests/{request_id}/action", response_model=LeaveRequestResponse)
async def approve_or_reject_leave_request(
    request_id: int,
    action_data: LeaveRequestAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Approve or reject a leave request
    
    - Accessible by MANAGER and HR_ADMIN
    """
    if current_user.role not in [RoleType.MANAGER, RoleType.HR_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get leave request
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    
    if not leave_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )
    
    # Check if request is in pending status
    if leave_request.status != LeaveRequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot action request with status: {leave_request.status}"
        )
    
    # Managers can only approve requests from their direct reports
    if current_user.role == RoleType.MANAGER:
        employee = db.query(Employee).filter(Employee.id == leave_request.employee_id).first()
        if not employee or employee.manager_id != current_user.employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to action this request"
            )
    
    # Update leave request status
    if action_data.action == "Approve":
        leave_request.status = LeaveRequestStatus.APPROVED
        
        # Update leave balance
        current_year = datetime.now().year
        balance = db.query(LeaveBalance).filter(
            and_(
                LeaveBalance.employee_id == leave_request.employee_id,
                LeaveBalance.leave_type_id == leave_request.leave_type_id,
                LeaveBalance.year == current_year
            )
        ).first()
        
        if balance:
            balance.used_days += leave_request.total_days
            balance.available_days = balance.total_days - balance.used_days
        
        # Trigger calendar sync (async task)
        try:
            sync_calendar_async.delay(
                employee_id=leave_request.employee_id,
                leave_request_id=leave_request.id,
                status="approved",
                start_date=str(leave_request.start_date),
                end_date=str(leave_request.end_date)
            )
        except:
            pass  # Don't fail the request if async task fails
        
    elif action_data.action == "Reject":
        leave_request.status = LeaveRequestStatus.REJECTED
    
    leave_request.approved_by = current_user.id
    leave_request.approval_comment = action_data.comment
    leave_request.approved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(leave_request)
    
    return leave_request
