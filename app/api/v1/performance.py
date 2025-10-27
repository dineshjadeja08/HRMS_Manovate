"""Performance and Training API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date as date_type

from app.database import get_db
from app.schemas import (
    PerformanceReviewCreate, PerformanceReviewResponse, FeedbackCreate,
    TrainingCourseResponse, EnrollmentCreate, EnrollmentResponse
)
from app.models import (
    PerformanceReview, TrainingCourse, TrainingEnrollment,
    Employee, User, RoleType
)
from app.auth.dependencies import get_current_user, require_hr_admin

router = APIRouter()


# Performance Review endpoints
@router.post("/performance/reviews", response_model=PerformanceReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_performance_review(
    review_data: PerformanceReviewCreate,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new performance review cycle
    
    - Only accessible by HR_ADMIN
    """
    # Validate employees exist
    employee = db.query(Employee).filter(Employee.id == review_data.employee_id).first()
    reviewer = db.query(Employee).filter(Employee.id == review_data.reviewer_id).first()
    
    if not employee or not reviewer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or reviewer not found"
        )
    
    # Create review
    review = PerformanceReview(**review_data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review


@router.post("/performance/reviews/{review_id}/feedback", response_model=PerformanceReviewResponse)
async def submit_review_feedback(
    review_id: int,
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit feedback for a performance review
    
    - Employees can submit self-assessment
    - Managers can submit manager feedback
    """
    review = db.query(PerformanceReview).filter(PerformanceReview.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance review not found"
        )
    
    # Authorization check
    if current_user.role == RoleType.MANAGER:
        # Managers can provide feedback for their direct reports
        employee = db.query(Employee).filter(Employee.id == review.employee_id).first()
        if not employee or employee.manager_id != current_user.employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to provide feedback for this review"
            )
    elif current_user.employee_id != review.employee_id:
        # Employees can only provide feedback for their own review
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to provide feedback for this review"
        )
    
    # Update review with feedback
    if feedback_data.overall_rating is not None:
        review.overall_rating = feedback_data.overall_rating
    if feedback_data.comments:
        review.comments = feedback_data.comments
    
    review.status = "COMPLETED"
    
    db.commit()
    db.refresh(review)
    
    return review


@router.get("/performance/reviews/manager/{manager_id}", response_model=List[PerformanceReviewResponse])
async def list_manager_reviews(
    manager_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List performance reviews requiring manager action
    
    - Managers can view reviews for their direct reports
    """
    # Authorization check
    if current_user.role not in [RoleType.MANAGER, RoleType.HR_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Verify manager
    if current_user.role == RoleType.MANAGER and current_user.employee_id != manager_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these reviews"
        )
    
    reviews = db.query(PerformanceReview).filter(
        PerformanceReview.reviewer_id == manager_id,
        PerformanceReview.status == "PENDING"
    ).offset(skip).limit(limit).all()
    
    return reviews


# Training Course endpoints
@router.get("/training/courses", response_model=List[TrainingCourseResponse])
async def list_training_courses(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List available training courses"""
    courses = db.query(TrainingCourse).filter(
        TrainingCourse.is_active == True
    ).offset(skip).limit(limit).all()
    
    return courses


@router.post("/training/courses", response_model=TrainingCourseResponse, status_code=status.HTTP_201_CREATED)
async def create_training_course(
    course_data: dict,
    current_user: User = Depends(require_hr_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new training course
    
    - Only accessible by HR_ADMIN
    """
    course = TrainingCourse(**course_data)
    db.add(course)
    db.commit()
    db.refresh(course)
    
    return course


@router.post("/training/enrollments", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def enroll_in_course(
    enrollment_data: EnrollmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enroll an employee in a training course
    
    - Employees can enroll themselves
    - HR_ADMIN can enroll any employee
    """
    # Verify course exists
    course = db.query(TrainingCourse).filter(
        TrainingCourse.id == enrollment_data.course_id,
        TrainingCourse.is_active == True
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training course not found"
        )
    
    # Authorization check
    if current_user.role != RoleType.HR_ADMIN:
        if current_user.employee_id != enrollment_data.employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to enroll this employee"
            )
    
    # Check if already enrolled
    existing = db.query(TrainingEnrollment).filter(
        TrainingEnrollment.employee_id == enrollment_data.employee_id,
        TrainingEnrollment.course_id == enrollment_data.course_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    # Create enrollment
    enrollment = TrainingEnrollment(**enrollment_data.model_dump())
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    
    return enrollment


@router.get("/training/enrollments/{employee_id}", response_model=List[EnrollmentResponse])
async def list_employee_enrollments(
    employee_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List employee training enrollments
    
    - Employees can view their own enrollments
    - HR_ADMIN can view all enrollments
    """
    # Authorization check
    if current_user.role != RoleType.HR_ADMIN:
        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view these enrollments"
            )
    
    enrollments = db.query(TrainingEnrollment).filter(
        TrainingEnrollment.employee_id == employee_id
    ).offset(skip).limit(limit).all()
    
    return enrollments
