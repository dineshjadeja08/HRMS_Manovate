# 🔐 How to Add New Employee Login Credentials

This guide shows you **3 different methods** to add new employees with login credentials to the HRMS system.

---

## 📋 Table of Contents
1. [Method 1: Using the Add Employee Script (Easiest)](#method-1-using-the-add-employee-script)
2. [Method 2: Interactive Quick Add (Beginner-Friendly)](#method-2-interactive-quick-add)
3. [Method 3: Using the API (For Integration)](#method-3-using-the-api)
4. [Default Login Credentials](#default-login-credentials)
5. [Troubleshooting](#troubleshooting)

---

## Method 1: Using the Add Employee Script (Easiest)

### Step 1: Open PowerShell in your project directory
```powershell
cd C:\Users\RDJ\Desktop\HRMS_Manovate
```

### Step 2: Activate virtual environment
```powershell
.\.venv\Scripts\Activate.ps1
```

### Step 3: Edit the script
Open `add_employee.py` and scroll to the bottom. Modify the example:

```python
add_new_employee(
    first_name="Sarah",           # Change this
    last_name="Johnson",          # Change this
    email="sarah.johnson@hrms.com",  # Change this (used for login)
    employee_number="EMP004",     # Change this (must be unique)
    phone="+1234567893",          # Change this
    hire_date=date(2024, 10, 1),  # Change this
    department_id=1,              # 1=Engineering, 2=HR, 3=Finance, 4=Sales, 5=Marketing
    position_id=1,                # See list below
    salary=75000,                 # Annual salary
    password="sarah123",          # Change this! (login password)
    role=RoleType.EMPLOYEE,       # EMPLOYEE, MANAGER, HR_ADMIN, EXECUTIVE
    manager_id=2,                 # Optional: Employee ID of their manager
)
```

### Step 4: Run the script
```powershell
python add_employee.py
```

### Output Example:
```
✅ SUCCESS! New employee added:
   Name: Sarah Johnson
   Email: sarah.johnson@hrms.com
   Employee #: EMP004
   Role: EMPLOYEE

🔑 Login Credentials:
   Email: sarah.johnson@hrms.com
   Password: sarah123
```

---

## Method 2: Interactive Quick Add (Beginner-Friendly)

### Step 1: Run the interactive script
```powershell
cd C:\Users\RDJ\Desktop\HRMS_Manovate
.\.venv\Scripts\Activate.ps1
python quick_add_employee.py
```

### Step 2: Follow the prompts
The script will ask you for:
- First Name
- Last Name
- Email (for login)
- Employee Number
- Phone Number
- Hire Date
- Department ID
- Position ID
- Salary
- Password
- Role (1=Employee, 2=Manager, 3=HR Admin, 4=Executive)

### Step 3: Confirm and done!
The script will show a summary and ask for confirmation.

---

## Method 3: Using the API (For Integration)

You can also add employees through the API endpoints.

### Step 1: Create Employee
```bash
POST http://localhost:8000/api/v1/employees
Authorization: Bearer {hr_admin_token}
Content-Type: application/json

{
  "employee_number": "EMP007",
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@hrms.com",
  "phone": "+1234567896",
  "hire_date": "2024-10-28",
  "employment_status": "ACTIVE",
  "department_id": 1,
  "position_id": 1,
  "salary": 80000,
  "currency": "USD"
}
```

### Step 2: Create User Account
After getting the employee ID from the response, create a user account:

```bash
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "email": "john.smith@hrms.com",
  "password": "john123",
  "role": "EMPLOYEE",
  "employee_id": 7
}
```

**Note**: User registration endpoint may need to be added to your API if not already present.

---

## 📊 Reference Tables

### Department IDs
Based on your seed data:
| ID | Department | Code |
|----|------------|------|
| 1  | Engineering | ENG |
| 2  | Human Resources | HR |
| 3  | Finance | FIN |
| 4  | Sales | SAL |
| 5  | Marketing | MKT |

### Position IDs
| ID | Position | Level |
|----|----------|-------|
| 1  | Software Engineer | Mid |
| 2  | Senior Software Engineer | Senior |
| 3  | HR Manager | Manager |
| 4  | HR Administrator | Staff |
| 5  | Financial Analyst | Mid |
| 6  | Sales Representative | Staff |
| 7  | Marketing Manager | Manager |

### Role Types
| Role | Description | Access Level |
|------|-------------|--------------|
| EMPLOYEE | Regular employee | Basic access - own data |
| MANAGER | Team manager | Can view/manage team members |
| HR_ADMIN | HR administrator | Full HR access |
| EXECUTIVE | Executive | Executive-level access |

---

## 🔑 Default Login Credentials

These accounts are created by `seed_db.py`:

### HR Admin
- **Email**: admin@hrms.com
- **Password**: admin123
- **Role**: HR_ADMIN

### Manager
- **Email**: manager@hrms.com
- **Password**: manager123
- **Role**: MANAGER

### Employee
- **Email**: employee@hrms.com
- **Password**: employee123
- **Role**: EMPLOYEE

---

## 💡 Quick Examples

### Add a Regular Employee
```python
add_new_employee(
    first_name="Jane",
    last_name="Doe",
    email="jane.doe@hrms.com",
    employee_number="EMP010",
    phone="+1234567900",
    hire_date=date(2024, 10, 28),
    department_id=1,  # Engineering
    position_id=1,    # Software Engineer
    salary=75000,
    password="jane123",
    role=RoleType.EMPLOYEE,
    manager_id=2,     # Reports to manager EMP002
)
```

### Add a Manager
```python
add_new_employee(
    first_name="Tom",
    last_name="Wilson",
    email="tom.wilson@hrms.com",
    employee_number="EMP011",
    phone="+1234567901",
    hire_date=date(2024, 9, 1),
    department_id=1,  # Engineering
    position_id=2,    # Senior Software Engineer
    salary=110000,
    password="tom123",
    role=RoleType.MANAGER,
)
```

### Add an HR Admin
```python
add_new_employee(
    first_name="Lisa",
    last_name="Brown",
    email="lisa.brown@hrms.com",
    employee_number="EMP012",
    phone="+1234567902",
    hire_date=date(2024, 8, 15),
    department_id=2,  # HR
    position_id=3,    # HR Manager
    salary=95000,
    password="lisa123",
    role=RoleType.HR_ADMIN,
)
```

---

## 🐛 Troubleshooting

### Error: "Email already exists"
- Each email must be unique
- Check if the email is already in the database
- Use a different email address

### Error: "Employee number already exists"
- Each employee number must be unique
- Use the next available number (EMP007, EMP008, etc.)

### Error: "Department/Position not found"
- Run `list_departments_and_positions()` to see available IDs
- Make sure the IDs exist in your database

### Error: "Database connection failed"
- Make sure your database is running
- Check your `.env` file for correct DATABASE_URL
- Verify the connection string

### Password Requirements
- No minimum length enforced by default
- For production, implement password strength requirements
- Consider using strong passwords (8+ characters, mixed case, numbers)

---

## 🔒 Security Best Practices

1. **Never commit passwords to Git**
   - Use environment variables for production
   - Change default passwords immediately

2. **Use strong passwords**
   - Minimum 8 characters
   - Mix uppercase, lowercase, numbers, symbols

3. **Role-Based Access**
   - Give users minimum required permissions
   - Regular employees → EMPLOYEE role
   - Team leads → MANAGER role
   - HR staff → HR_ADMIN role

4. **Audit Trail**
   - Keep track of who creates accounts
   - Log all login attempts
   - Monitor for suspicious activity

---

## 📞 Need Help?

- Check the main documentation: `README.md`
- Review API examples: `API_EXAMPLES.md`
- Setup guide: `SETUP.md`
- Enhancement docs: `ENHANCEMENTS.md`

---

## ✅ Checklist

When adding a new employee, make sure:
- [ ] Email is unique and valid
- [ ] Employee number is unique (e.g., EMP007)
- [ ] Department ID exists
- [ ] Position ID exists
- [ ] Password is set (will be hashed automatically)
- [ ] Role is appropriate for their position
- [ ] Manager ID is set (if they have a manager)
- [ ] Hire date is correct
- [ ] Salary and currency are set

---

**Last Updated**: October 28, 2025  
**Version**: 1.0.0
