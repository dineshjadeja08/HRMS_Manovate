"""Attendance Management API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, date as date_type, timedelta

from app.database import get_db
from app.schemas import (
    AttendanceClockIn, AttendanceClockOut, AttendanceRecordResponse,
    AttendanceAdjustment, ShiftResponse
)
from app.models import (
    AttendanceRecord, Shift, Employee, User, RoleType, AttendanceStatus
)
from app.auth.dependencies import get_current_user, require_hr_admin

router = APIRouter()


@router.post("/clock-in", response_model=AttendanceRecordResponse)
async def clock_in(
    clock_in_data: AttendanceClockIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record employee clock-in
    
    - Employees can only clock in for themselves
    """
    # Verify employee
    if not current_user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not linked to an employee profile"
        )
    
    # Verify employee ID matches
    if clock_in_data.employee_id != current_user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot clock in for another employee"
        )
    
    today = date_type.today()
    
    # Check if already clocked in today
    existing_record = db.query(AttendanceRecord).filter(
        and_(
            AttendanceRecord.employee_id == clock_in_data.employee_id,
            AttendanceRecord.date == today,
            AttendanceRecord.clock_out == None
        )
    ).first()
    
    if existing_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already clocked in today. Please clock out first."
        )
    
    # Create attendance record
    attendance_record = AttendanceRecord(
        employee_id=clock_in_data.employee_id,
        date=today,
        clock_in=datetime.now(),
        status=AttendanceStatus.PRESENT,
        geo_location=clock_in_data.geo_location
    )
    
    db.add(attendance_record)
    db.commit()
    db.refresh(attendance_record)
    
    return attendance_record


@router.post("/clock-out", response_model=AttendanceRecordResponse)
async def clock_out(
    clock_out_data: AttendanceClockOut,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record employee clock-out
    
    - Employees can only clock out for themselves
    """
    # Verify employee
    if not current_user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not linked to an employee profile"
        )
    
    # Verify employee ID matches
    if clock_out_data.employee_id != current_user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot clock out for another employee"
        )
    
    today = date_type.today()
    
    # Find today's clock-in record
    attendance_record = db.query(AttendanceRecord).filter(
        and_(
            AttendanceRecord.employee_id == clock_out_data.employee_id,
            AttendanceRecord.date == today,
            AttendanceRecord.clock_out == None
        )
    ).first()
    
    if not attendance_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No clock-in record found for today"
        )
    
    # Update with clock-out time
    clock_out_time = datetime.now()
    attendance_record.clock_out = clock_out_time
    
    # Calculate hours worked
    if attendance_record.clock_in:
        time_diff = clock_out_time - attendance_record.clock_in
        hours_worked = time_diff.total_seconds() / 3600
        attendance_record.hours_worked = round(hours_worked, 2)
    
    db.commit()
    db.refresh(attendance_record)
    
    return attendance_record


@router.get("/records/{employee_id}", response_model=List[AttendanceRecordResponse])
async def get_attendance_records(
    employee_id: int,
    start_date: Optional[date_type] = None,
    end_date: Optional[date_type] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get employee attendance records for a period
    
    - Employees can view their own records
    - Managers can view their team's records
    - HR_ADMIN can view all records
    """
    # Authorization check
    if current_user.role not in [RoleType.HR_ADMIN, RoleType.EXECUTIVE]:
        if current_user.employee_id != employee_id:
            # Check if user is the employee's manager
            employee = db.query(Employee).filter(Employee.id == employee_id).first()
            if not employee or employee.manager_id != current_user.employee_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view these records"
                )
    
    # Default date range (last 30 days)
    if not start_date:
        start_date = date_type.today() - timedelta(days=30)
    if not end_date:
        end_date = date_type.today()
    
    records = db.query(AttendanceRecord).filter(
        and_(
            AttendanceRecord.employee_id == employee_id,
            AttendanceRecord.date >= start_date,
            AttendanceRecord.date <= end_date
        )
    ).order_by(AttendanceRecord.date.desc()).offset(skip).limit(limit).all()
    
    return records


@router.get("/shifts", response_model=List[ShiftResponse])
async def list_shifts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all defined shifts"""
    shifts = db.query(Shift).filter(Shift.is_active == True).all()
    return shifts


@router.get("/records/review", response_model=List[AttendanceRecordResponse])
async def list_attendance_for_review(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List unreviewed attendance records for manager approval
    
    - Accessible by MANAGER and HR_ADMIN
    """
    if current_user.role not in [RoleType.MANAGER, RoleType.HR_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    query = db.query(AttendanceRecord).filter(AttendanceRecord.is_reviewed == False)
    
    # Managers see records from their direct reports
    if current_user.role == RoleType.MANAGER:
        # Get direct reports
        direct_reports = db.query(Employee).filter(
            Employee.manager_id == current_user.employee_id
        ).all()
        
        employee_ids = [emp.id for emp in direct_reports]
        query = query.filter(AttendanceRecord.employee_id.in_(employee_ids))
    
    records = query.order_by(AttendanceRecord.date.desc()).offset(skip).limit(limit).all()
    return records


@router.post("/records/{record_id}/adjustment", response_model=AttendanceRecordResponse)
async def request_attendance_adjustment(
    record_id: int,
    adjustment_data: AttendanceAdjustment,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request adjustment to an attendance record
    
    - Employees can request adjustments to their own records
    - Managers can directly adjust their team's records
    """
    # Get attendance record
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    # Authorization check
    if current_user.role == RoleType.MANAGER:
        # Managers can adjust records for their direct reports
        employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
        if not employee or employee.manager_id != current_user.employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to adjust this record"
            )
        
        # Managers can directly adjust
        record.clock_in = adjustment_data.proposed_time
        record.notes = adjustment_data.adjustment_reason
        record.is_reviewed = True
        record.reviewed_by = current_user.id
        
        # Recalculate hours if both clock in and out exist
        if record.clock_out:
            time_diff = record.clock_out - record.clock_in
            hours_worked = time_diff.total_seconds() / 3600
            record.hours_worked = round(hours_worked, 2)
        
    elif current_user.employee_id == record.employee_id:
        # Employees can request adjustments (stored in notes for manager review)
        record.notes = f"Adjustment requested: {adjustment_data.adjustment_reason}. Proposed time: {adjustment_data.proposed_time}"
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to adjust this record"
        )
    
    db.commit()
    db.refresh(record)
    
    return record


@router.put("/records/{record_id}/review", response_model=AttendanceRecordResponse)
async def review_attendance_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark attendance record as reviewed
    
    - Accessible by MANAGER and HR_ADMIN
    """
    if current_user.role not in [RoleType.MANAGER, RoleType.HR_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    # Managers can only review records from their direct reports
    if current_user.role == RoleType.MANAGER:
        employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
        if not employee or employee.manager_id != current_user.employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to review this record"
            )
    
    record.is_reviewed = True
    record.reviewed_by = current_user.id
    
    db.commit()
    db.refresh(record)
    
    return record
