# HRMS Backend API - Human Resources Management System

A comprehensive RESTful API for Human Resources Management System built with Python FastAPI, PostgreSQL, Redis, and Celery.

## 🚀 Features

### Core Modules

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-Based Access Control (RBAC)
  - User roles: Employee, Manager, HR Admin, Executive

- **Employee Management**
  - Employee CRUD operations
  - Document management (upload/download)
  - Department and position management
  - Comprehensive employee profiles

- **Leave Management**
  - Leave type definitions
  - Leave balance tracking
  - Leave request workflow (submit, approve, reject)
  - Manager approval system
  - Calendar sync integration

- **Time & Attendance**
  - Clock-in/Clock-out functionality
  - Geo-location tracking
  - Attendance record management
  - Shift management
  - Attendance adjustments and reviews

- **Payroll & Compensation**
  - Payroll run processing
  - Payslip generation
  - Compensation management
  - Compensation history tracking

- **Performance & Training**
  - Performance review cycles
  - Feedback submission
  - Training course catalog
  - Course enrollment management

- **Reports & Analytics**
  - Headcount reports
  - Turnover analysis
  - Leave utilization
  - Absenteeism tracking
  - CSV/Excel export

- **Webhooks & Integrations**
  - External payroll service integration
  - Calendar sync webhooks
  - Extensible webhook system

## 🛠️ Tech Stack

- **Framework**: FastAPI 0.109.0
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (PyJWT, python-jose)
- **Caching**: Redis 7
- **Task Queue**: Celery
- **Containerization**: Docker & Docker Compose
- **Testing**: pytest

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional but recommended)

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   cd HRMS-MFM
   ```

2. **Create environment file**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` with your configuration.

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the API**
   - API: http://localhost:8000
   - Swagger Documentation: http://localhost:8000/api/docs
   - ReDoc: http://localhost:8000/api/redoc

### Manual Installation

1. **Create virtual environment**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```powershell
   copy .env.example .env
   ```

4. **Start PostgreSQL and Redis**
   Ensure PostgreSQL and Redis are running locally.

5. **Run database migrations**
   ```powershell
   alembic upgrade head
   ```

6. **Start the application**
   ```powershell
   uvicorn app.main:app --reload
   ```

7. **Start Celery worker (separate terminal)**
   ```powershell
   celery -A app.celery_app worker --loglevel=info --pool=solo
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication

All endpoints (except `/auth/login` and `/auth/refresh`) require JWT authentication.

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

**Using the token**
```http
GET /api/v1/employees
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Key Endpoints

#### Employee Management
- `GET /api/v1/employees` - List employees
- `POST /api/v1/employees` - Create employee (HR_ADMIN)
- `GET /api/v1/employees/{id}` - Get employee details
- `PUT /api/v1/employees/{id}` - Update employee
- `POST /api/v1/employees/{id}/documents` - Upload document
- `GET /api/v1/departments` - List departments
- `GET /api/v1/positions` - List positions

#### Leave Management
- `GET /api/v1/leave/types` - List leave types
- `GET /api/v1/leave/balances/{id}` - Get leave balances
- `POST /api/v1/leave/requests` - Submit leave request
- `GET /api/v1/leave/requests` - List my leave requests
- `GET /api/v1/leave/requests/team` - List team requests (Manager)
- `PUT /api/v1/leave/requests/{id}/action` - Approve/Reject (Manager)

#### Attendance
- `POST /api/v1/attendance/clock-in` - Clock in
- `POST /api/v1/attendance/clock-out` - Clock out
- `GET /api/v1/attendance/records/{id}` - Get attendance records
- `GET /api/v1/attendance/shifts` - List shifts

#### Payroll
- `POST /api/v1/payroll/runs` - Create payroll run (HR_ADMIN)
- `GET /api/v1/payroll/payslips/{id}` - List payslips
- `GET /api/v1/payroll/payslips/{id}/{payslip_id}` - Download payslip
- `PUT /api/v1/payroll/compensation/{id}` - Update compensation

#### Reports
- `GET /api/v1/reports/headcount` - Headcount report
- `GET /api/v1/reports/turnover` - Turnover report
- `GET /api/v1/reports/leave-utilization` - Leave utilization
- `GET /api/v1/reports/absenteeism` - Absenteeism report
- `GET /api/v1/reports/export/{type}?format=csv` - Export reports

## 🔐 Role-Based Access Control

### Roles

1. **EMPLOYEE**
   - View own profile
   - Submit leave requests
   - Clock in/out
   - View own payslips
   - Enroll in training

2. **MANAGER**
   - All Employee permissions
   - View team profiles
   - Approve/reject team leave requests
   - Review team attendance
   - Provide performance feedback

3. **HR_ADMIN**
   - All Manager permissions
   - Full employee management
   - Payroll processing
   - System configuration
   - Access all reports

4. **EXECUTIVE**
   - View reports and analytics
   - High-level oversight

## 🏗️ Project Structure

```
HRMS-MFM/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration settings
│   ├── database.py             # Database connection
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── tasks.py                # Celery tasks
│   ├── celery_app.py           # Celery worker entry
│   ├── auth/
│   │   ├── jwt.py              # JWT utilities
│   │   └── dependencies.py     # Auth dependencies
│   └── api/
│       └── v1/
│           ├── auth.py         # Authentication endpoints
│           ├── employees.py    # Employee endpoints
│           ├── leave.py        # Leave endpoints
│           ├── attendance.py   # Attendance endpoints
│           ├── payroll.py      # Payroll endpoints
│           ├── performance.py  # Performance endpoints
│           ├── reports.py      # Reports endpoints
│           └── webhooks.py     # Webhook endpoints
├── uploads/                    # File uploads directory
├── logs/                       # Application logs
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose setup
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🧪 Testing

Run tests with pytest:

```powershell
pytest
```

Run with coverage:

```powershell
pytest --cov=app tests/
```

## 🔧 Configuration

Key environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://hrms_user:hrms_password@localhost:5432/hrms_db

# JWT
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0

# External APIs
WEBHOOK_API_KEY=your-webhook-api-key
PAYROLL_SERVICE_URL=https://external-payroll-service.com/api
CALENDAR_SERVICE_URL=https://external-calendar-service.com/api
```

## 📊 Database Schema

The system uses the following main entities:

- Users (authentication)
- Employees (core HR data)
- Departments & Positions
- Leave Types, Balances & Requests
- Attendance Records & Shifts
- Payroll Runs & Payslips
- Performance Reviews
- Training Courses & Enrollments

## 🔄 Workflow Examples

### Leave Request Workflow

1. **Employee** submits leave request
   ```
   POST /api/v1/leave/requests
   ```

2. **Manager** views pending requests
   ```
   GET /api/v1/leave/requests/team
   ```

3. **Manager** approves request
   ```
   PUT /api/v1/leave/requests/{id}/action
   Body: { "action": "Approve", "comment": "Approved" }
   ```

4. **System** updates leave balance
5. **System** triggers calendar sync (async)
6. **Employee** checks updated balance
   ```
   GET /api/v1/leave/balances/{id}
   ```

## 🚀 Deployment

### Docker Production Build

```bash
docker build -t hrms-api:latest .
docker run -p 8000:8000 --env-file .env hrms-api:latest
```

### Using Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

## 📝 API Response Standards

### Success Response
```json
{
  "id": 1,
  "data": {...},
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api/docs`

## 🔮 Future Enhancements

- [ ] Two-factor authentication
- [ ] Advanced reporting dashboard
- [ ] Mobile app integration
- [ ] Biometric attendance
- [ ] AI-powered analytics
- [ ] Multi-language support
- [ ] Audit logging
- [ ] Advanced workflow automation

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Built with ❤️ using Python FastAPI**
