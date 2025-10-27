"""Pydantic schemas for request/response validation"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from app.models import (
    RoleType, EmploymentStatus, LeaveRequestStatus, 
    AttendanceStatus, PayrollStatus
)


# Base schemas
class TimestampMixin(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Authentication schemas
class Token(BaseModel):
    access: str
    refresh: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh: str


class TokenAccess(BaseModel):
    access: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    role: RoleType


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    employee_id: Optional[int] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[RoleType] = None
    is_active: Optional[bool] = None
    employee_id: Optional[int] = None


class UserResponse(UserBase, TimestampMixin):
    id: int
    is_active: bool
    employee_id: Optional[int] = None
    
    class Config:
        from_attributes = True


# Role schemas
class RoleResponse(BaseModel):
    name: str
    description: str
    permissions: List[str]


# Department schemas
class DepartmentBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    head_id: Optional[int] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Position schemas
class PositionBase(BaseModel):
    title: str
    code: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None


class PositionCreate(PositionBase):
    pass


class PositionResponse(PositionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Employee schemas
class EmployeeBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    employee_number: str
    hire_date: date
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    manager_id: Optional[int] = None
    salary: Optional[Decimal] = None
    currency: str = "USD"


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    employment_status: Optional[EmploymentStatus] = None
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    manager_id: Optional[int] = None
    salary: Optional[Decimal] = None


class EmployeeResponse(EmployeeBase, TimestampMixin):
    id: int
    employee_number: str
    hire_date: date
    employment_status: EmploymentStatus
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    manager_id: Optional[int] = None
    salary: Optional[Decimal] = None
    currency: str
    
    class Config:
        from_attributes = True


class EmployeeDetailResponse(EmployeeResponse):
    department: Optional[DepartmentResponse] = None
    position: Optional[PositionResponse] = None
    
    class Config:
        from_attributes = True


# Employee Document schemas
class DocumentUpload(BaseModel):
    document_type: str
    description: Optional[str] = None


class DocumentResponse(BaseModel):
    id: int
    employee_id: int
    document_type: str
    file_name: str
    file_size: Optional[int] = None
    description: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


# Leave Type schemas
class LeaveTypeBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    max_days_per_year: int = 0
    is_paid: bool = True
    requires_approval: bool = True
    is_active: bool = True


class LeaveTypeResponse(LeaveTypeBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Leave Balance schemas
class LeaveBalanceResponse(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    leave_type: Optional[LeaveTypeResponse] = None
    year: int
    total_days: float
    used_days: float
    available_days: float
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Leave Request schemas
class LeaveRequestCreate(BaseModel):
    leave_type_id: int
    start_date: date
    end_date: date
    reason: Optional[str] = None
    
    @validator('end_date')
    def end_date_must_be_after_start(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class LeaveRequestUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reason: Optional[str] = None


class LeaveRequestAction(BaseModel):
    action: str = Field(..., pattern="^(Approve|Reject)$")
    comment: Optional[str] = None


class LeaveRequestResponse(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    leave_type: Optional[LeaveTypeResponse] = None
    start_date: date
    end_date: date
    total_days: float
    reason: Optional[str] = None
    status: LeaveRequestStatus
    approved_by: Optional[int] = None
    approval_comment: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Shift schemas
class ShiftBase(BaseModel):
    name: str
    start_time: str = Field(..., pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    is_active: bool = True


class ShiftResponse(ShiftBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Attendance schemas
class AttendanceClockIn(BaseModel):
    employee_id: int
    geo_location: Optional[dict] = None


class AttendanceClockOut(BaseModel):
    employee_id: int


class AttendanceAdjustment(BaseModel):
    adjustment_reason: str
    proposed_time: datetime


class AttendanceRecordResponse(BaseModel):
    id: int
    employee_id: int
    shift_id: Optional[int] = None
    date: date
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    status: AttendanceStatus
    hours_worked: float
    geo_location: Optional[dict] = None
    notes: Optional[str] = None
    is_reviewed: bool
    reviewed_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Payroll schemas
class PayrollRunCreate(BaseModel):
    period_start: date
    period_end: date


class PayrollRunResponse(BaseModel):
    id: int
    period_start: date
    period_end: date
    status: PayrollStatus
    total_amount: Decimal
    processed_by: Optional[int] = None
    processed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class PayslipResponse(BaseModel):
    id: int
    employee_id: int
    payroll_run_id: int
    basic_salary: Decimal
    allowances: Decimal
    deductions: Decimal
    tax: Decimal
    net_salary: Decimal
    currency: str
    file_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Compensation schemas
class CompensationUpdate(BaseModel):
    new_salary: Decimal
    effective_date: date
    change_reason: Optional[str] = None


class CompensationHistoryResponse(BaseModel):
    id: int
    employee_id: int
    effective_date: date
    old_salary: Optional[Decimal] = None
    new_salary: Decimal
    change_reason: Optional[str] = None
    changed_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Performance schemas
class PerformanceReviewCreate(BaseModel):
    employee_id: int
    reviewer_id: int
    review_period_start: date
    review_period_end: date


class FeedbackCreate(BaseModel):
    overall_rating: Optional[float] = Field(None, ge=0, le=5)
    comments: Optional[str] = None


class PerformanceReviewResponse(BaseModel):
    id: int
    employee_id: int
    reviewer_id: int
    review_period_start: date
    review_period_end: date
    overall_rating: Optional[float] = None
    comments: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Training schemas
class TrainingCourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_hours: Optional[int] = None
    instructor: Optional[str] = None
    is_active: bool = True


class TrainingCourseResponse(TrainingCourseBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class EnrollmentCreate(BaseModel):
    employee_id: int
    course_id: int
    enrollment_date: date = Field(default_factory=date.today)


class EnrollmentResponse(BaseModel):
    id: int
    employee_id: int
    course_id: int
    enrollment_date: date
    completion_date: Optional[date] = None
    status: str
    score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Report schemas
class HeadcountReportResponse(BaseModel):
    total_employees: int
    active_employees: int
    inactive_employees: int
    by_department: dict
    by_position: dict


class TurnoverReportResponse(BaseModel):
    period_start: date
    period_end: date
    beginning_headcount: int
    ending_headcount: int
    terminations: int
    turnover_rate: float


class LeaveUtilizationReportResponse(BaseModel):
    total_employees: int
    total_leave_days: float
    average_per_employee: float
    by_leave_type: dict


class AbsenteeismReportResponse(BaseModel):
    period_start: date
    period_end: date
    total_workdays: int
    total_absences: int
    absenteeism_rate: float


# Webhook schemas
class PayrollStatusWebhook(BaseModel):
    run_id: int
    status: str = Field(..., pattern="^(success|failure)$")
    details: Optional[str] = None


class CalendarSyncWebhook(BaseModel):
    employee_id: int
    leave_request_id: int
    status: str = Field(..., pattern="^(approved|rejected)$")
    date_range: dict  # {start: date, end: date}


# Pagination
class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    data: List
