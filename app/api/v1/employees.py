"""Employee Management API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import os
import shutil
from datetime import datetime

from app.database import get_db
from app.schemas import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeDetailResponse,
    DepartmentCreate, DepartmentResponse, PositionCreate, PositionResponse,
    DocumentUpload, DocumentResponse
)
from app.models import Employee, Department, Position, EmployeeDocument, User, RoleType
from app.auth.dependencies import get_current_user, require_hr_admin
from app.config import get_settings

settings = get_settings()
router = APIRouter()


@router.get("/employees", response_model=List[EmployeeResponse])
async def list_employees(
    skip: int = 0,
    limit: int = 100,
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all employees with pagination and filters
    
    - Accessible by HR_ADMIN and MANAGER
    - Filters: department_id, status
    """
    # Role check
    if current_user.role not in [RoleType.HR_ADMIN, RoleType.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    query = db.query(Employee)
    
    # Apply filters
    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if status:
        query = query.filter(Employee.employment_status == status)
    
    # Managers only see their direct reports
    if current_user.role == RoleType.MANAGER and current_user.employee_id:
        query = query.filter(Employee.manager_id == current_user.employee_id)
    
    employees = query.offset(skip).limit(limit).all()
    return employees


@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_data: EmployeeCreate,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Create new employee profile (onboarding)
    
    - Only accessible by HR_ADMIN
    """
    # Check if employee number already exists
    existing = db.query(Employee).filter(Employee.employee_number == employee_data.employee_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee number already exists"
        )
    
    # Check if email already exists
    existing_email = db.query(Employee).filter(Employee.email == employee_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Create employee
    employee = Employee(**employee_data.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    
    return employee


@router.get("/employees/{employee_id}", response_model=EmployeeDetailResponse)
async def get_employee(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed employee information
    
    - Accessible by all authenticated users
    - Users can view their own profile or their manager can view
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Authorization check
    if current_user.role not in [RoleType.HR_ADMIN, RoleType.EXECUTIVE]:
        # Allow user to view own profile
        if current_user.employee_id != employee_id:
            # Allow manager to view direct reports
            if current_user.role == RoleType.MANAGER:
                if employee.manager_id != current_user.employee_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Not authorized to view this employee"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this employee"
                )
    
    return employee


@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update employee information
    
    - HR_ADMIN can update any employee
    - Employees can update their own basic information
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Authorization check
    if current_user.role != RoleType.HR_ADMIN:
        # Employees can only update their own profile and limited fields
        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this employee"
            )
        
        # Restrict fields employees can update
        allowed_fields = ['phone', 'address', 'email']
        update_data = employee_data.model_dump(exclude_unset=True)
        for field in update_data:
            if field not in allowed_fields:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Not authorized to update field: {field}"
                )
    
    # Update employee
    update_data = employee_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
    
    db.commit()
    db.refresh(employee)
    
    return employee


@router.post("/employees/{employee_id}/documents", response_model=DocumentResponse)
async def upload_employee_document(
    employee_id: int,
    document: UploadFile = File(...),
    document_type: str = Form(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload employee document
    
    - HR_ADMIN can upload for any employee
    - Employees can upload their own documents
    """
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Authorization check
    if current_user.role != RoleType.HR_ADMIN:
        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to upload documents for this employee"
            )
    
    # Validate file extension
    file_extension = document.filename.split(".")[-1].lower()
    if file_extension not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Validate file size
    document.file.seek(0, 2)
    file_size = document.file.tell()
    document.file.seek(0)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE} bytes"
        )
    
    # Create upload directory if not exists
    upload_dir = os.path.join(settings.UPLOAD_DIR, "employees", str(employee_id))
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"{timestamp}_{document.filename}"
    file_path = os.path.join(upload_dir, file_name)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    # Create database record
    doc_record = EmployeeDocument(
        employee_id=employee_id,
        document_type=document_type,
        file_name=document.filename,
        file_path=file_path,
        file_size=file_size,
        description=description,
        uploaded_by=current_user.id
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)
    
    return doc_record


@router.get("/employees/{employee_id}/documents/{doc_id}")
async def download_employee_document(
    employee_id: int,
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download employee document
    
    - HR_ADMIN can download any document
    - Employees can download their own documents
    """
    # Get document record
    document = db.query(EmployeeDocument).filter(
        EmployeeDocument.id == doc_id,
        EmployeeDocument.employee_id == employee_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Authorization check
    if current_user.role != RoleType.HR_ADMIN:
        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this document"
            )
    
    # Check if file exists
    if not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type='application/octet-stream'
    )


# Department endpoints
@router.get("/departments", response_model=List[DepartmentResponse])
async def list_departments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all departments"""
    departments = db.query(Department).all()
    return departments


@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    department_data: DepartmentCreate,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """Create new department (HR_ADMIN only)"""
    department = Department(**department_data.model_dump())
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


# Position endpoints
@router.get("/positions", response_model=List[PositionResponse])
async def list_positions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all positions"""
    positions = db.query(Position).all()
    return positions


@router.post("/positions", response_model=PositionResponse, status_code=status.HTTP_201_CREATED)
async def create_position(
    position_data: PositionCreate,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """Create new position (HR_ADMIN only)"""
    position = Position(**position_data.model_dump())
    db.add(position)
    db.commit()
    db.refresh(position)
    return position
