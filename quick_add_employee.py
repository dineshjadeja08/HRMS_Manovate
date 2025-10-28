"""
Quick Add Employee - Interactive Script
Simple command-line tool to add employees with login credentials
"""
from datetime import date, datetime
from add_employee import add_new_employee, list_departments_and_positions
from app.models import RoleType


def quick_add_employee():
    """Interactive command-line interface to add a new employee."""
    
    print("=" * 70)
    print("🏢 HRMS - Quick Add Employee")
    print("=" * 70 + "\n")
    
    # Show available options first
    list_departments_and_positions()
    
    print("\n" + "=" * 70)
    print("Enter Employee Details:")
    print("=" * 70 + "\n")
    
    try:
        # Collect employee information
        first_name = input("First Name: ").strip()
        last_name = input("Last Name: ").strip()
        email = input("Email (for login): ").strip()
        employee_number = input("Employee Number (e.g., EMP007): ").strip()
        phone = input("Phone Number: ").strip()
        
        # Date input
        hire_date_str = input("Hire Date (YYYY-MM-DD) [press Enter for today]: ").strip()
        if hire_date_str:
            hire_date = datetime.strptime(hire_date_str, "%Y-%m-%d").date()
        else:
            hire_date = date.today()
        
        # Department and position
        department_id = int(input("Department ID: ").strip())
        position_id = int(input("Position ID: ").strip())
        
        # Salary
        salary = float(input("Annual Salary: ").strip())
        currency = input("Currency [USD]: ").strip() or "USD"
        
        # Manager (optional)
        manager_input = input("Manager Employee ID (optional, press Enter to skip): ").strip()
        manager_id = int(manager_input) if manager_input else None
        
        # User credentials
        print("\n" + "-" * 70)
        print("Login Credentials:")
        print("-" * 70)
        
        password = input("Password: ").strip()
        
        print("\nSelect Role:")
        print("  1 - EMPLOYEE (Regular employee)")
        print("  2 - MANAGER (Team manager)")
        print("  3 - HR_ADMIN (HR administrator)")
        print("  4 - EXECUTIVE (Executive level)")
        role_choice = input("Role (1-4): ").strip()
        
        role_map = {
            "1": RoleType.EMPLOYEE,
            "2": RoleType.MANAGER,
            "3": RoleType.HR_ADMIN,
            "4": RoleType.EXECUTIVE,
        }
        role = role_map.get(role_choice, RoleType.EMPLOYEE)
        
        # Confirmation
        print("\n" + "=" * 70)
        print("Please confirm the following details:")
        print("=" * 70)
        print(f"Name: {first_name} {last_name}")
        print(f"Email: {email}")
        print(f"Employee #: {employee_number}")
        print(f"Department ID: {department_id}")
        print(f"Position ID: {position_id}")
        print(f"Salary: {currency} {salary:,.2f}")
        print(f"Hire Date: {hire_date}")
        print(f"Role: {role.value}")
        print(f"Manager ID: {manager_id or 'None'}")
        print("=" * 70)
        
        confirm = input("\nAdd this employee? (yes/no): ").strip().lower()
        
        if confirm in ['yes', 'y']:
            # Add the employee
            employee, user = add_new_employee(
                first_name=first_name,
                last_name=last_name,
                email=email,
                employee_number=employee_number,
                phone=phone,
                hire_date=hire_date,
                department_id=department_id,
                position_id=position_id,
                salary=salary,
                password=password,
                role=role,
                manager_id=manager_id,
                currency=currency
            )
            
            if employee and user:
                print("\n✅ Employee added successfully!")
                print(f"🔑 They can now login with:")
                print(f"   Email: {email}")
                print(f"   Password: {password}")
        else:
            print("\n❌ Operation cancelled.")
            
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user.")
    except ValueError as e:
        print(f"\n❌ Invalid input: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    quick_add_employee()
