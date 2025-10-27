"""Reports and Analytics API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional
from datetime import datetime, date as date_type, timedelta
from io import BytesIO
import csv
import openpyxl

from app.database import get_db
from app.schemas import (
    HeadcountReportResponse, TurnoverReportResponse,
    LeaveUtilizationReportResponse, AbsenteeismReportResponse
)
from app.models import (
    Employee, LeaveRequest, AttendanceRecord, Department, Position,
    User, RoleType, EmploymentStatus, AttendanceStatus
)
from app.auth.dependencies import get_current_user, require_hr_admin, require_executive

router = APIRouter()


@router.get("/headcount", response_model=HeadcountReportResponse)
async def generate_headcount_report(
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Generate employee headcount report
    
    - Only accessible by HR_ADMIN and EXECUTIVE
    """
    # Total employees
    total_employees = db.query(Employee).count()
    
    # Active employees
    active_employees = db.query(Employee).filter(
        Employee.employment_status == EmploymentStatus.ACTIVE
    ).count()
    
    # Inactive employees
    inactive_employees = db.query(Employee).filter(
        Employee.employment_status != EmploymentStatus.ACTIVE
    ).count()
    
    # By department
    by_department = {}
    dept_counts = db.query(
        Department.name,
        func.count(Employee.id)
    ).join(Employee, Department.id == Employee.department_id).group_by(Department.name).all()
    
    for dept_name, count in dept_counts:
        by_department[dept_name] = count
    
    # By position
    by_position = {}
    pos_counts = db.query(
        Position.title,
        func.count(Employee.id)
    ).join(Employee, Position.id == Employee.position_id).group_by(Position.title).all()
    
    for pos_title, count in pos_counts:
        by_position[pos_title] = count
    
    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "inactive_employees": inactive_employees,
        "by_department": by_department,
        "by_position": by_position
    }


@router.get("/turnover", response_model=TurnoverReportResponse)
async def generate_turnover_report(
    period_start: date_type = Query(...),
    period_end: date_type = Query(...),
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Calculate employee turnover rate for a period
    
    - Only accessible by HR_ADMIN and EXECUTIVE
    """
    # Beginning headcount (active at period start)
    beginning_headcount = db.query(Employee).filter(
        and_(
            Employee.hire_date < period_start,
            Employee.employment_status == EmploymentStatus.ACTIVE
        )
    ).count()
    
    # Ending headcount (active at period end)
    ending_headcount = db.query(Employee).filter(
        Employee.employment_status == EmploymentStatus.ACTIVE
    ).count()
    
    # Terminations during period
    terminations = db.query(Employee).filter(
        and_(
            Employee.employment_status == EmploymentStatus.TERMINATED,
            Employee.updated_at >= period_start,
            Employee.updated_at <= period_end
        )
    ).count()
    
    # Calculate turnover rate
    avg_headcount = (beginning_headcount + ending_headcount) / 2 if beginning_headcount + ending_headcount > 0 else 1
    turnover_rate = (terminations / avg_headcount * 100) if avg_headcount > 0 else 0
    
    return {
        "period_start": period_start,
        "period_end": period_end,
        "beginning_headcount": beginning_headcount,
        "ending_headcount": ending_headcount,
        "terminations": terminations,
        "turnover_rate": round(turnover_rate, 2)
    }


@router.get("/leave-utilization", response_model=LeaveUtilizationReportResponse)
async def generate_leave_utilization_report(
    year: Optional[int] = None,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Summarize leave utilization
    
    - Only accessible by HR_ADMIN
    """
    if not year:
        year = datetime.now().year
    
    # Total active employees
    total_employees = db.query(Employee).filter(
        Employee.employment_status == EmploymentStatus.ACTIVE
    ).count()
    
    # Total leave days taken
    total_leave_days = db.query(func.sum(LeaveRequest.total_days)).filter(
        and_(
            LeaveRequest.status == "APPROVED",
            func.extract('year', LeaveRequest.start_date) == year
        )
    ).scalar() or 0
    
    # Average per employee
    average_per_employee = float(total_leave_days) / total_employees if total_employees > 0 else 0
    
    # By leave type
    by_leave_type = {}
    leave_type_data = db.query(
        LeaveRequest.leave_type_id,
        func.sum(LeaveRequest.total_days)
    ).filter(
        and_(
            LeaveRequest.status == "APPROVED",
            func.extract('year', LeaveRequest.start_date) == year
        )
    ).group_by(LeaveRequest.leave_type_id).all()
    
    for leave_type_id, days in leave_type_data:
        by_leave_type[f"leave_type_{leave_type_id}"] = float(days)
    
    return {
        "total_employees": total_employees,
        "total_leave_days": float(total_leave_days),
        "average_per_employee": round(average_per_employee, 2),
        "by_leave_type": by_leave_type
    }


@router.get("/absenteeism", response_model=AbsenteeismReportResponse)
async def generate_absenteeism_report(
    period_start: date_type = Query(...),
    period_end: date_type = Query(...),
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Calculate absenteeism rate
    
    - Only accessible by HR_ADMIN
    """
    # Calculate total workdays in period
    delta = period_end - period_start
    total_days = delta.days + 1
    
    # Exclude weekends (rough estimate)
    total_workdays = total_days * 5 // 7
    
    # Count absences
    total_absences = db.query(AttendanceRecord).filter(
        and_(
            AttendanceRecord.date >= period_start,
            AttendanceRecord.date <= period_end,
            AttendanceRecord.status == AttendanceStatus.ABSENT
        )
    ).count()
    
    # Calculate absenteeism rate
    active_employees = db.query(Employee).filter(
        Employee.employment_status == EmploymentStatus.ACTIVE
    ).count()
    
    total_possible_workdays = total_workdays * active_employees
    absenteeism_rate = (total_absences / total_possible_workdays * 100) if total_possible_workdays > 0 else 0
    
    return {
        "period_start": period_start,
        "period_end": period_end,
        "total_workdays": total_workdays,
        "total_absences": total_absences,
        "absenteeism_rate": round(absenteeism_rate, 2)
    }


@router.get("/export/{report_type}")
async def export_report(
    report_type: str,
    format: str = Query("csv", pattern="^(csv|excel)$"),
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Export report data in CSV or Excel format
    
    - Only accessible by HR_ADMIN
    """
    if report_type not in ["headcount", "employees", "leave", "attendance"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid report type"
        )
    
    # Generate data based on report type
    if report_type == "employees":
        employees = db.query(Employee).all()
        data = [
            {
                "Employee Number": emp.employee_number,
                "Name": f"{emp.first_name} {emp.last_name}",
                "Email": emp.email,
                "Department": emp.department.name if emp.department else "",
                "Position": emp.position.title if emp.position else "",
                "Status": emp.employment_status.value
            }
            for emp in employees
        ]
    else:
        data = [{"message": "Report type not implemented yet"}]
    
    # Export as CSV
    if format == "csv":
        output = BytesIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={report_type}_report.csv"}
        )
    
    # Export as Excel
    elif format == "excel":
        workbook = openpyxl.Workbook()
        sheet = workbook.active
        sheet.title = report_type.capitalize()
        
        if data:
            # Write headers
            headers = list(data[0].keys())
            sheet.append(headers)
            
            # Write data
            for row in data:
                sheet.append(list(row.values()))
        
        output = BytesIO()
        workbook.save(output)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={report_type}_report.xlsx"}
        )
