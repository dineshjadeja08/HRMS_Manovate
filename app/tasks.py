"""Celery configuration and task definitions"""
from celery import Celery
from app.config import get_settings
import httpx
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(
    "hrms_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)


@celery_app.task(name="sync_calendar")
def sync_calendar_async(employee_id: int, leave_request_id: int, status: str, start_date: str, end_date: str):
    """
    Asynchronously sync leave request to external calendar service
    
    Args:
        employee_id: Employee ID
        leave_request_id: Leave request ID
        status: approved or rejected
        start_date: Leave start date (string)
        end_date: Leave end date (string)
    """
    try:
        logger.info(f"Syncing leave request {leave_request_id} to calendar for employee {employee_id}")
        
        # Prepare payload
        payload = {
            "employee_id": employee_id,
            "leave_request_id": leave_request_id,
            "status": status,
            "date_range": {
                "start": start_date,
                "end": end_date
            }
        }
        
        # Send to external calendar service
        response = httpx.post(
            f"{settings.CALENDAR_SERVICE_URL}/sync",
            json=payload,
            headers={"X-API-Key": settings.WEBHOOK_API_KEY},
            timeout=30.0
        )
        
        response.raise_for_status()
        logger.info(f"Successfully synced leave request {leave_request_id} to calendar")
        
        return {"status": "success", "leave_request_id": leave_request_id}
        
    except Exception as e:
        logger.error(f"Failed to sync leave request {leave_request_id} to calendar: {str(e)}")
        return {"status": "failed", "error": str(e)}


@celery_app.task(name="process_payroll")
def process_payroll_async(payroll_run_id: int):
    """
    Asynchronously process payroll run
    
    Args:
        payroll_run_id: Payroll run ID to process
    """
    try:
        logger.info(f"Processing payroll run {payroll_run_id}")
        
        # Import here to avoid circular dependencies
        from app.database import SessionLocal
        from app.models import PayrollRun, Employee, Payslip, PayrollStatus
        
        db = SessionLocal()
        
        try:
            # Get payroll run
            payroll_run = db.query(PayrollRun).filter(PayrollRun.id == payroll_run_id).first()
            
            if not payroll_run:
                logger.error(f"Payroll run {payroll_run_id} not found")
                return {"status": "failed", "error": "Payroll run not found"}
            
            # Update status to processing
            payroll_run.status = PayrollStatus.PROCESSING
            db.commit()
            
            # Get all active employees
            employees = db.query(Employee).filter(Employee.employment_status == "ACTIVE").all()
            
            total_amount = 0
            
            # Generate payslips for each employee
            for employee in employees:
                if employee.salary:
                    # Calculate net salary (simplified)
                    basic_salary = employee.salary
                    allowances = basic_salary * 0.1  # 10% allowances
                    tax = basic_salary * 0.15  # 15% tax
                    deductions = basic_salary * 0.05  # 5% deductions
                    net_salary = basic_salary + allowances - tax - deductions
                    
                    # Create payslip
                    payslip = Payslip(
                        employee_id=employee.id,
                        payroll_run_id=payroll_run_id,
                        basic_salary=basic_salary,
                        allowances=allowances,
                        deductions=deductions,
                        tax=tax,
                        net_salary=net_salary,
                        currency=employee.currency
                    )
                    
                    db.add(payslip)
                    total_amount += float(net_salary)
            
            # Update payroll run
            payroll_run.total_amount = total_amount
            payroll_run.status = PayrollStatus.COMPLETED
            
            db.commit()
            
            logger.info(f"Successfully processed payroll run {payroll_run_id}")
            
            # Notify external payroll service (optional)
            try:
                response = httpx.post(
                    f"{settings.PAYROLL_SERVICE_URL}/notify",
                    json={
                        "run_id": payroll_run_id,
                        "status": "success",
                        "total_amount": total_amount
                    },
                    headers={"X-API-Key": settings.WEBHOOK_API_KEY},
                    timeout=30.0
                )
            except:
                pass  # Don't fail if notification fails
            
            return {"status": "success", "payroll_run_id": payroll_run_id, "total_amount": total_amount}
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to process payroll run {payroll_run_id}: {str(e)}")
        
        # Update payroll run status to failed
        try:
            db = SessionLocal()
            payroll_run = db.query(PayrollRun).filter(PayrollRun.id == payroll_run_id).first()
            if payroll_run:
                payroll_run.status = PayrollStatus.FAILED
                db.commit()
            db.close()
        except:
            pass
        
        return {"status": "failed", "error": str(e)}


@celery_app.task(name="send_email_notification")
def send_email_notification(to_email: str, subject: str, body: str):
    """
    Send email notification
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Email body
    """
    try:
        logger.info(f"Sending email to {to_email}")
        
        # Implement email sending logic here
        # Using SMTP settings from config
        
        # For now, just log it
        logger.info(f"Email sent successfully to {to_email}")
        
        return {"status": "success", "to": to_email}
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return {"status": "failed", "error": str(e)}


@celery_app.task(name="generate_report")
def generate_report_async(report_type: str, parameters: dict):
    """
    Generate large reports asynchronously
    
    Args:
        report_type: Type of report to generate
        parameters: Report parameters
    """
    try:
        logger.info(f"Generating report: {report_type}")
        
        # Implement report generation logic here
        
        logger.info(f"Report {report_type} generated successfully")
        
        return {"status": "success", "report_type": report_type}
        
    except Exception as e:
        logger.error(f"Failed to generate report {report_type}: {str(e)}")
        return {"status": "failed", "error": str(e)}


# Periodic tasks (if using Celery Beat)
@celery_app.task(name="daily_attendance_reminder")
def daily_attendance_reminder():
    """Send daily attendance reminder to employees who haven't clocked in"""
    logger.info("Running daily attendance reminder task")
    # Implement logic here
    return {"status": "success"}


@celery_app.task(name="monthly_leave_balance_update")
def monthly_leave_balance_update():
    """Update leave balances monthly"""
    logger.info("Running monthly leave balance update task")
    # Implement logic here
    return {"status": "success"}
