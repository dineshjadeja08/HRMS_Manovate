# HRMS API Usage Examples

This document provides practical examples for using the HRMS Backend API.

## Authentication

### 1. Login

```bash
# Request
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@hrms.com",
  "password": "admin123"
}

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "token_type": "bearer"
}
```

### 2. Refresh Token

```bash
POST http://localhost:8000/api/v1/auth/refresh
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci..."
}
```

## Employee Management

### 3. Create Employee (HR Admin Only)

```bash
POST http://localhost:8000/api/v1/employees
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "employee_number": "EMP004",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@company.com",
  "phone": "+1234567893",
  "hire_date": "2024-01-15",
  "department_id": 1,
  "position_id": 2,
  "manager_id": 2,
  "salary": 90000,
  "currency": "USD"
}
```

### 4. List Employees

```bash
GET http://localhost:8000/api/v1/employees?skip=0&limit=10
Authorization: Bearer <access_token>
```

### 5. Get Employee Details

```bash
GET http://localhost:8000/api/v1/employees/3
Authorization: Bearer <access_token>
```

### 6. Update Employee

```bash
PUT http://localhost:8000/api/v1/employees/3
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone": "+1234567899",
  "address": "123 New Street, City, State 12345"
}
```

### 7. Upload Employee Document

```bash
POST http://localhost:8000/api/v1/employees/3/documents
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

document: <file>
document_type: "resume"
description: "Updated resume 2024"
```

## Leave Management

### 8. Get Leave Types

```bash
GET http://localhost:8000/api/v1/leave/types
Authorization: Bearer <access_token>
```

### 9. Get Leave Balance

```bash
GET http://localhost:8000/api/v1/leave/balances/3?year=2024
Authorization: Bearer <access_token>
```

### 10. Submit Leave Request

```bash
POST http://localhost:8000/api/v1/leave/requests
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "leave_type_id": 1,
  "start_date": "2024-11-15",
  "end_date": "2024-11-20",
  "reason": "Family vacation"
}
```

### 11. View My Leave Requests

```bash
GET http://localhost:8000/api/v1/leave/requests
Authorization: Bearer <access_token>
```

### 12. Manager: View Team Leave Requests

```bash
GET http://localhost:8000/api/v1/leave/requests/team?status=PENDING
Authorization: Bearer <manager_token>
```

### 13. Manager: Approve Leave Request

```bash
PUT http://localhost:8000/api/v1/leave/requests/5/action
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "action": "Approve",
  "comment": "Approved. Enjoy your vacation!"
}
```

### 14. Manager: Reject Leave Request

```bash
PUT http://localhost:8000/api/v1/leave/requests/6/action
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "action": "Reject",
  "comment": "Please reschedule, we have a project deadline."
}
```

## Attendance Management

### 15. Clock In

```bash
POST http://localhost:8000/api/v1/attendance/clock-in
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "employee_id": 3,
  "geo_location": {
    "lat": 40.7128,
    "long": -74.0060
  }
}
```

### 16. Clock Out

```bash
POST http://localhost:8000/api/v1/attendance/clock-out
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "employee_id": 3
}
```

### 17. Get Attendance Records

```bash
GET http://localhost:8000/api/v1/attendance/records/3?start_date=2024-10-01&end_date=2024-10-31
Authorization: Bearer <access_token>
```

### 18. Request Attendance Adjustment

```bash
POST http://localhost:8000/api/v1/attendance/records/10/adjustment
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "adjustment_reason": "Forgot to clock in",
  "proposed_time": "2024-10-27T09:00:00"
}
```

## Payroll Management

### 19. Create Payroll Run (HR Admin)

```bash
POST http://localhost:8000/api/v1/payroll/runs
Authorization: Bearer <hr_admin_token>
Content-Type: application/json

{
  "period_start": "2024-10-01",
  "period_end": "2024-10-31"
}
```

### 20. View My Payslips

```bash
GET http://localhost:8000/api/v1/payroll/payslips/3
Authorization: Bearer <access_token>
```

### 21. Download Payslip

```bash
GET http://localhost:8000/api/v1/payroll/payslips/3/15
Authorization: Bearer <access_token>
```

### 22. Update Employee Compensation (HR Admin)

```bash
PUT http://localhost:8000/api/v1/payroll/compensation/3
Authorization: Bearer <hr_admin_token>
Content-Type: application/json

{
  "new_salary": 95000,
  "effective_date": "2024-11-01",
  "change_reason": "Annual salary review - performance increase"
}
```

## Performance & Training

### 23. Create Performance Review (HR Admin)

```bash
POST http://localhost:8000/api/v1/performance/reviews
Authorization: Bearer <hr_admin_token>
Content-Type: application/json

{
  "employee_id": 3,
  "reviewer_id": 2,
  "review_period_start": "2024-01-01",
  "review_period_end": "2024-06-30"
}
```

### 24. Submit Review Feedback

```bash
POST http://localhost:8000/api/v1/performance/reviews/1/feedback
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "overall_rating": 4.5,
  "comments": "Excellent performance throughout the review period."
}
```

### 25. List Training Courses

```bash
GET http://localhost:8000/api/v1/training/courses
Authorization: Bearer <access_token>
```

### 26. Enroll in Training Course

```bash
POST http://localhost:8000/api/v1/training/enrollments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "employee_id": 3,
  "course_id": 1,
  "enrollment_date": "2024-10-27"
}
```

## Reports & Analytics

### 27. Headcount Report (HR Admin)

```bash
GET http://localhost:8000/api/v1/reports/headcount
Authorization: Bearer <hr_admin_token>
```

### 28. Turnover Report (HR Admin)

```bash
GET http://localhost:8000/api/v1/reports/turnover?period_start=2024-01-01&period_end=2024-10-31
Authorization: Bearer <hr_admin_token>
```

### 29. Leave Utilization Report (HR Admin)

```bash
GET http://localhost:8000/api/v1/reports/leave-utilization?year=2024
Authorization: Bearer <hr_admin_token>
```

### 30. Absenteeism Report (HR Admin)

```bash
GET http://localhost:8000/api/v1/reports/absenteeism?period_start=2024-10-01&period_end=2024-10-31
Authorization: Bearer <hr_admin_token>
```

### 31. Export Report to CSV

```bash
GET http://localhost:8000/api/v1/reports/export/employees?format=csv
Authorization: Bearer <hr_admin_token>
```

### 32. Export Report to Excel

```bash
GET http://localhost:8000/api/v1/reports/export/employees?format=excel
Authorization: Bearer <hr_admin_token>
```

## Webhooks (External Systems)

### 33. Payroll Status Webhook

```bash
POST http://localhost:8000/api/v1/webhooks/payroll-status
X-API-Key: your-webhook-api-key
Content-Type: application/json

{
  "run_id": 1,
  "status": "success",
  "details": "Payroll processed successfully"
}
```

### 34. Calendar Sync Webhook

```bash
POST http://localhost:8000/api/v1/webhooks/calendar-sync
X-API-Key: your-webhook-api-key
Content-Type: application/json

{
  "employee_id": 3,
  "leave_request_id": 5,
  "status": "approved",
  "date_range": {
    "start": "2024-11-15",
    "end": "2024-11-20"
  }
}
```

## PowerShell Examples

### Complete Workflow Example

```powershell
# 1. Login as Manager
$loginResponse = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"email":"manager@hrms.com","password":"manager123"}'

$managerToken = $loginResponse.access

# 2. View pending team leave requests
$pendingLeaves = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/v1/leave/requests/team?status=PENDING" `
    -Method Get `
    -Headers @{"Authorization"="Bearer $managerToken"}

Write-Host "Pending leave requests: $($pendingLeaves.Count)"

# 3. Approve a leave request
$approvalResponse = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/v1/leave/requests/1/action" `
    -Method Put `
    -Headers @{"Authorization"="Bearer $managerToken"} `
    -ContentType "application/json" `
    -Body '{"action":"Approve","comment":"Approved"}'

Write-Host "Leave request approved: $($approvalResponse.id)"

# 4. View team attendance
$attendance = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/v1/attendance/records/3?start_date=2024-10-01" `
    -Method Get `
    -Headers @{"Authorization"="Bearer $managerToken"}

Write-Host "Attendance records retrieved: $($attendance.Count)"
```

## cURL Examples (for Linux/Mac)

```bash
# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.com","password":"admin123"}'

# Get employees (replace TOKEN with actual token)
curl -X GET "http://localhost:8000/api/v1/employees" \
  -H "Authorization: Bearer TOKEN"

# Submit leave request
curl -X POST "http://localhost:8000/api/v1/leave/requests" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"leave_type_id":1,"start_date":"2024-11-15","end_date":"2024-11-20","reason":"Vacation"}'
```

## Common Error Responses

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

## Rate Limiting (To Be Implemented)

Future versions will include rate limiting:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints

## Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (never in plain text)
3. **Refresh tokens before expiry**
4. **Handle errors gracefully**
5. **Use appropriate HTTP methods**
6. **Include proper error handling**
7. **Validate input on client side**
8. **Log all API calls for audit**

## Support

For more examples or API questions:
- Check Swagger UI: http://localhost:8000/api/docs
- Review API documentation
- Contact development team
