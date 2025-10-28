"""
Add New Employee with Login Credentials
This script creates a new employee and their user account with login credentials.
"""
from datetime import date
from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db
from app.models import Employee, User, RoleType, EmploymentStatus
from app.auth.jwt import get_password_hash


def add_new_employee(
    # Employee Information
    first_name: str,
    last_name: str,
    email: str,
    employee_number: str,
    phone: str,
    hire_date: date,
    department_id: int,
    position_id: int,
    salary: float,
    
    # User Login Information
    password: str,
    role: RoleType,
    
    # Optional
    manager_id: int = None,
    currency: str = "USD",
):
    """
    Add a new employee with login credentials to the database.
    
    Args:
        first_name: Employee's first name
        last_name: Employee's last name
        email: Employee's email (used for login)
        employee_number: Unique employee number (e.g., "EMP004")
        phone: Contact phone number
        hire_date: Date of hire (date object)
        department_id: Department ID (1=Engineering, 2=HR, 3=Finance, etc.)
        position_id: Position ID (1=Software Engineer, 2=Senior, 3=HR Manager, etc.)
        salary: Annual salary amount
        password: Login password (will be hashed)
        role: User role (EMPLOYEE, MANAGER, HR_ADMIN, EXECUTIVE)
        manager_id: ID of the manager (optional)
        currency: Salary currency (default: USD)
    
    Returns:
        Tuple of (employee, user) objects
    """
    
    # Initialize database
    init_db()
    db = SessionLocal()
    
    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ Error: Email {email} already exists!")
            return None, None
        
        # Check if employee number already exists
        existing_emp = db.query(Employee).filter(Employee.employee_number == employee_number).first()
        if existing_emp:
            print(f"❌ Error: Employee number {employee_number} already exists!")
            return None, None
        
        print(f"Creating employee: {first_name} {last_name}...")
        
        # Create Employee
        employee = Employee(
            employee_number=employee_number,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            hire_date=hire_date,
            employment_status=EmploymentStatus.ACTIVE,
            department_id=department_id,
            position_id=position_id,
            manager_id=manager_id,
            salary=salary,
            currency=currency
        )
        db.add(employee)
        db.commit()
        db.refresh(employee)
        
        print(f"✓ Employee created with ID: {employee.id}")
        
        # Create User Account
        print(f"Creating user account for {email}...")
        
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            role=role,
            is_active=True,
            employee_id=employee.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✓ User account created with ID: {user.id}")
        print(f"\n✅ SUCCESS! New employee added:")
        print(f"   Name: {first_name} {last_name}")
        print(f"   Email: {email}")
        print(f"   Employee #: {employee_number}")
        print(f"   Role: {role.value}")
        print(f"   Password: {password}")
        print(f"\n🔑 Login Credentials:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        
        return employee, user
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return None, None
    finally:
        db.close()


def list_departments_and_positions():
    """List available departments and positions to help with selection."""
    db = SessionLocal()
    try:
        from app.models import Department, Position
        
        print("\n📋 Available Departments:")
        departments = db.query(Department).all()
        for dept in departments:
            print(f"   ID {dept.id}: {dept.name} ({dept.code})")
        
        print("\n💼 Available Positions:")
        positions = db.query(Position).all()
        for pos in positions:
            print(f"   ID {pos.id}: {pos.title} ({pos.level})")
        
        print("\n👥 Role Types:")
        print("   - EMPLOYEE: Regular employee access")
        print("   - MANAGER: Can manage team members")
        print("   - HR_ADMIN: Full HR administrative access")
        print("   - EXECUTIVE: Executive-level access")
        
    finally:
        db.close()


# ============================================================================
# EXAMPLES: Uncomment and modify as needed
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("🏢 HRMS - Add New Employee with Login Credentials")
    print("=" * 70)
    
    # First, list available departments and positions
    list_departments_and_positions()
    
    print("\n" + "=" * 70)
    print("Adding new employees...")
    print("=" * 70 + "\n")
    
    # Example 1: Add a new regular employee
    add_new_employee(
        first_name="Sarah",
        last_name="Johnson",
        email="sarah.johnson@hrms.com",
        employee_number="EMP004",
        phone="+1234567893",
        hire_date=date(2024, 10, 1),
        department_id=1,  # Engineering (check list above)
        position_id=1,    # Software Engineer
        salary=75000,
        password="sarah123",  # Change this!
        role=RoleType.EMPLOYEE,
        manager_id=2,  # Reports to manager (EMP002)
    )
    
    print("\n" + "-" * 70 + "\n")
    
    # Example 2: Add a new HR admin
    add_new_employee(
        first_name="Michael",
        last_name="Chen",
        email="michael.chen@hrms.com",
        employee_number="EMP005",
        phone="+1234567894",
        hire_date=date(2024, 9, 15),
        department_id=2,  # HR
        position_id=3,    # HR Manager
        salary=95000,
        password="michael123",  # Change this!
        role=RoleType.HR_ADMIN,
    )
    
    print("\n" + "-" * 70 + "\n")
    
    # Example 3: Add a new manager
    add_new_employee(
        first_name="Emily",
        last_name="Davis",
        email="emily.davis@hrms.com",
        employee_number="EMP006",
        phone="+1234567895",
        hire_date=date(2024, 8, 1),
        department_id=4,  # Sales
        position_id=7,    # Marketing Manager
        salary=110000,
        password="emily123",  # Change this!
        role=RoleType.MANAGER,
    )
    
    print("\n" + "=" * 70)
    print("✅ All employees added successfully!")
    print("=" * 70)
    
    # To add your own employee, copy one of the examples above and modify:
    # add_new_employee(
    #     first_name="Your",
    #     last_name="Name",
    #     email="your.email@hrms.com",
    #     employee_number="EMP007",
    #     phone="+1234567896",
    #     hire_date=date(2024, 10, 28),
    #     department_id=1,
    #     position_id=1,
    #     salary=80000,
    #     password="yourpassword123",
    #     role=RoleType.EMPLOYEE,
    # )
