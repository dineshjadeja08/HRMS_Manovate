"""Payroll and Compensation API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, date as date_type
from decimal import Decimal

from app.database import get_db
from app.schemas import (
    PayrollRunCreate, PayrollRunResponse, PayslipResponse,
    CompensationUpdate, CompensationHistoryResponse
)
from app.models import (
    PayrollRun, Payslip, Employee, User, RoleType, 
    PayrollStatus, CompensationHistory
)
from app.auth.dependencies import get_current_user, require_hr_admin
from app.tasks import process_payroll_async

router = APIRouter()


@router.post("/runs", response_model=PayrollRunResponse, status_code=status.HTTP_201_CREATED)
async def create_payroll_run(
    payroll_data: PayrollRunCreate,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Initiate a new payroll calculation cycle
    
    - Only accessible by HR_ADMIN
    """
    # Validate date range
    if payroll_data.period_end <= payroll_data.period_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )
    
    # Check for overlapping payroll runs
    overlapping = db.query(PayrollRun).filter(
        and_(
            PayrollRun.period_start <= payroll_data.period_end,
            PayrollRun.period_end >= payroll_data.period_start
        )
    ).first()
    
    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payroll run overlaps with existing run"
        )
    
    # Create payroll run
    payroll_run = PayrollRun(
        period_start=payroll_data.period_start,
        period_end=payroll_data.period_end,
        status=PayrollStatus.PENDING,
        processed_by=current_user.id
    )
    
    db.add(payroll_run)
    db.commit()
    db.refresh(payroll_run)
    
    # Trigger async processing
    try:
        process_payroll_async.delay(payroll_run.id)
    except:
        pass  # Continue even if async task fails
    
    return payroll_run


@router.get("/runs", response_model=List[PayrollRunResponse])
async def list_payroll_runs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    List all payroll runs
    
    - Only accessible by HR_ADMIN
    """
    runs = db.query(PayrollRun).order_by(
        PayrollRun.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return runs


@router.get("/runs/{run_id}", response_model=PayrollRunResponse)
async def get_payroll_run(
    run_id: int,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Get payroll run details
    
    - Only accessible by HR_ADMIN
    """
    run = db.query(PayrollRun).filter(PayrollRun.id == run_id).first()
    
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll run not found"
        )
    
    return run


@router.get("/payslips/{employee_id}", response_model=List[PayslipResponse])
async def list_payslips(
    employee_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List payslips for an employee
    
    - Employees can view their own payslips
    - HR_ADMIN can view all payslips
    """
    # Authorization check
    if current_user.role != RoleType.HR_ADMIN:
        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view these payslips"
            )
    
    payslips = db.query(Payslip).filter(
        Payslip.employee_id == employee_id
    ).order_by(Payslip.created_at.desc()).offset(skip).limit(limit).all()
    
    return payslips


@router.get("/payslips/{employee_id}/{payslip_id}")
async def download_payslip(
    employee_id: int,
    payslip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download a specific payslip PDF
    
    - Employees can download their own payslips
    - HR_ADMIN can download all payslips
    """
    # Authorization check
    if current_user.role != RoleType.HR_ADMIN:
        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to download this payslip"
            )
    
    payslip = db.query(Payslip).filter(
        and_(
            Payslip.id == payslip_id,
            Payslip.employee_id == employee_id
        )
    ).first()
    
    if not payslip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payslip not found"
        )
    
    if not payslip.file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payslip file not available"
        )
    
    return FileResponse(
        path=payslip.file_path,
        filename=f"payslip_{payslip.id}.pdf",
        media_type='application/pdf'
    )


@router.put("/compensation/{employee_id}", response_model=CompensationHistoryResponse)
async def update_compensation(
    employee_id: int,
    compensation_data: CompensationUpdate,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Update employee compensation
    
    - Only accessible by HR_ADMIN
    """
    # Get employee
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Create compensation history record
    compensation_history = CompensationHistory(
        employee_id=employee_id,
        effective_date=compensation_data.effective_date,
        old_salary=employee.salary,
        new_salary=compensation_data.new_salary,
        change_reason=compensation_data.change_reason,
        changed_by=current_user.id
    )
    
    db.add(compensation_history)
    
    # Update employee salary
    employee.salary = compensation_data.new_salary
    
    db.commit()
    db.refresh(compensation_history)
    
    return compensation_history


@router.get("/compensation/history/{employee_id}", response_model=List[CompensationHistoryResponse])
async def get_compensation_history(
    employee_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Get compensation change history for an employee
    
    - Only accessible by HR_ADMIN
    """
    history = db.query(CompensationHistory).filter(
        CompensationHistory.employee_id == employee_id
    ).order_by(CompensationHistory.effective_date.desc()).offset(skip).limit(limit).all()
    
    return history
