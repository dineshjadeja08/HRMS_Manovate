"""Database seeding script for initial data"""
from app.database import SessionLocal, init_db
from app.models import (
    User, Employee, Department, Position, LeaveType, Shift,
    RoleType, EmploymentStatus
)
from app.auth.jwt import get_password_hash
from datetime import date, datetime
import sys


def seed_database():
    """Seed the database with initial data"""
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    
    try:
        print("Checking for existing data...")
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already contains data. Skipping seed.")
            return
        
        print("Creating departments...")
        departments = [
            Department(name="Engineering", code="ENG", location="Building A"),
            Department(name="Human Resources", code="HR", location="Building B"),
            Department(name="Finance", code="FIN", location="Building C"),
            Department(name="Sales", code="SAL", location="Building D"),
            Department(name="Marketing", code="MKT", location="Building E"),
        ]
        db.add_all(departments)
        db.commit()
        
        print("Creating positions...")
        positions = [
            Position(title="Software Engineer", code="SE", level="Mid"),
            Position(title="Senior Software Engineer", code="SSE", level="Senior"),
            Position(title="HR Manager", code="HRM", level="Manager"),
            Position(title="HR Administrator", code="HRA", level="Staff"),
            Position(title="Financial Analyst", code="FA", level="Mid"),
            Position(title="Sales Representative", code="SR", level="Staff"),
            Position(title="Marketing Manager", code="MM", level="Manager"),
        ]
        db.add_all(positions)
        db.commit()
        
        print("Creating leave types...")
        leave_types = [
            LeaveType(
                name="Annual Leave",
                code="AL",
                description="Annual vacation leave",
                max_days_per_year=20,
                is_paid=True,
                requires_approval=True
            ),
            LeaveType(
                name="Sick Leave",
                code="SL",
                description="Medical sick leave",
                max_days_per_year=10,
                is_paid=True,
                requires_approval=False
            ),
            LeaveType(
                name="Personal Leave",
                code="PL",
                description="Personal time off",
                max_days_per_year=5,
                is_paid=False,
                requires_approval=True
            ),
            LeaveType(
                name="Maternity Leave",
                code="ML",
                description="Maternity leave",
                max_days_per_year=90,
                is_paid=True,
                requires_approval=True
            ),
        ]
        db.add_all(leave_types)
        db.commit()
        
        print("Creating shifts...")
        shifts = [
            Shift(name="Day Shift", start_time="09:00", end_time="17:00"),
            Shift(name="Evening Shift", start_time="14:00", end_time="22:00"),
            Shift(name="Night Shift", start_time="22:00", end_time="06:00"),
        ]
        db.add_all(shifts)
        db.commit()
        
        print("Creating sample employees...")
        
        # HR Admin Employee
        hr_admin_emp = Employee(
            employee_number="EMP001",
            first_name="Admin",
            last_name="User",
            email="admin@hrms.com",
            phone="+1234567890",
            hire_date=date(2020, 1, 1),
            employment_status=EmploymentStatus.ACTIVE,
            department_id=departments[1].id,  # HR
            position_id=positions[2].id,  # HR Manager
            salary=100000,
            currency="USD"
        )
        db.add(hr_admin_emp)
        db.commit()
        
        # Manager Employee
        manager_emp = Employee(
            employee_number="EMP002",
            first_name="Manager",
            last_name="User",
            email="manager@hrms.com",
            phone="+1234567891",
            hire_date=date(2020, 6, 1),
            employment_status=EmploymentStatus.ACTIVE,
            department_id=departments[0].id,  # Engineering
            position_id=positions[1].id,  # Senior Software Engineer
            salary=120000,
            currency="USD"
        )
        db.add(manager_emp)
        db.commit()
        
        # Regular Employee
        employee = Employee(
            employee_number="EMP003",
            first_name="John",
            last_name="Doe",
            email="employee@hrms.com",
            phone="+1234567892",
            hire_date=date(2021, 3, 15),
            employment_status=EmploymentStatus.ACTIVE,
            department_id=departments[0].id,  # Engineering
            position_id=positions[0].id,  # Software Engineer
            manager_id=manager_emp.id,
            salary=80000,
            currency="USD"
        )
        db.add(employee)
        db.commit()
        
        print("Creating user accounts...")
        
        # Admin User
        admin_user = User(
            email="admin@hrms.com",
            hashed_password=get_password_hash("admin123"),
            role=RoleType.HR_ADMIN,
            is_active=True,
            employee_id=hr_admin_emp.id
        )
        db.add(admin_user)
        
        # Manager User
        manager_user = User(
            email="manager@hrms.com",
            hashed_password=get_password_hash("manager123"),
            role=RoleType.MANAGER,
            is_active=True,
            employee_id=manager_emp.id
        )
        db.add(manager_user)
        
        # Employee User
        employee_user = User(
            email="employee@hrms.com",
            hashed_password=get_password_hash("employee123"),
            role=RoleType.EMPLOYEE,
            is_active=True,
            employee_id=employee.id
        )
        db.add(employee_user)
        
        db.commit()
        
        print("\n" + "="*60)
        print("Database seeded successfully!")
        print("="*60)
        print("\nDefault accounts created:")
        print("\n1. HR Admin:")
        print("   Email: admin@hrms.com")
        print("   Password: admin123")
        print("\n2. Manager:")
        print("   Email: manager@hrms.com")
        print("   Password: manager123")
        print("\n3. Employee:")
        print("   Email: employee@hrms.com")
        print("   Password: employee123")
        print("\n" + "="*60)
        print("\nYou can now login with these credentials.")
        print("API Documentation: http://localhost:8000/api/docs")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"Error seeding database: {str(e)}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
