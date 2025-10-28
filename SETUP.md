
# HRMS Backend API - Setup Guide

## Prerequisites Installation

### 1. Install Python 3.11+

Download and install from [python.org](https://www.python.org/downloads/)

Verify installation:
```powershell
python --version
```

### 2. Install PostgreSQL 15+

Download from [postgresql.org](https://www.postgresql.org/download/)

After installation, create database:
```powershell
# Login to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE hrms_db;
CREATE USER hrms_user WITH PASSWORD 'hrms_password';
GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;
\q
```

### 3. Install Redis 7+

**For Windows**, download from [github.com/microsoftarchive/redis](https://github.com/microsoftarchive/redis/releases)

Or use Docker:
```powershell
docker run -d -p 6379:6379 redis:7-alpine
```

Verify Redis is running:
```powershell
redis-cli ping
# Should return PONG
```

## Project Setup

### Step 1: Create Virtual Environment

```powershell
cd HRMS-MFM
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

### Step 3: Configure Environment

```powershell
copy .env.example .env
```

Edit `.env` file with your settings:
- Update DATABASE_URL if using different credentials
- Change SECRET_KEY to a random string
- Update other settings as needed

### Step 4: Initialize Database

```powershell
# Create tables
python -c "from app.database import init_db; init_db()"

# Seed with sample data
python seed_db.py
```

### Step 5: Start the Application

**Terminal 1 - API Server:**
```powershell
uvicorn app.main:app --reload
```

**Terminal 2 - Celery Worker:**
```powershell
celery -A app.celery_app worker --loglevel=info --pool=solo
```

### Step 6: Verify Installation

Open browser and navigate to:
- API Docs: http://localhost:8000/api/docs
- Health Check: http://localhost:8000/health

## Docker Setup (Alternative)

### Prerequisites
- Docker Desktop for Windows
- Docker Compose

### Steps

1. **Start all services**
```powershell
docker-compose up -d
```

2. **Initialize database**
```powershell
docker-compose exec app python seed_db.py
```

3. **Access the application**
- API: http://localhost:8000
- Docs: http://localhost:8000/api/docs

4. **View logs**
```powershell
docker-compose logs -f app
```

5. **Stop services**
```powershell
docker-compose down
```

## Testing the API

### Using Swagger UI

1. Go to http://localhost:8000/api/docs
2. Click "Authorize" button
3. Login with default credentials:
   - Email: `admin@hrms.com`
   - Password: `admin123`
4. Copy the access token
5. Paste in Authorization field as: `Bearer <token>`
6. Test any endpoint

### Using cURL

```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"email":"admin@hrms.com","password":"admin123"}'

$token = $response.access

# Get employees
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/employees" `
    -Method Get `
    -Headers @{"Authorization"="Bearer $token"}
```

## Troubleshooting

### Database Connection Error

**Error:** `could not connect to server`

**Solution:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify firewall settings

### Redis Connection Error

**Error:** `Error connecting to Redis`

**Solution:**
- Ensure Redis is running
- Check REDIS_HOST and REDIS_PORT in .env

### Import Errors

**Error:** `ModuleNotFoundError`

**Solution:**
```powershell
pip install -r requirements.txt --upgrade
```

### Port Already in Use

**Error:** `Address already in use`

**Solution:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <PID> /F
```

### Celery Worker Not Starting (Windows)

**Issue:** Celery doesn't support Windows eventlet/gevent

**Solution:**
Use `--pool=solo` flag:
```powershell
celery -A app.celery_app worker --loglevel=info --pool=solo
```

## Development Tips

### Code Formatting

```powershell
# Format code
black app/

# Check linting
flake8 app/
```

### Database Migrations (Alembic)

```powershell
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Running Tests

```powershell
# Run all tests
pytest

# With coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_auth.py
```

### Viewing Logs

Application logs are stored in `logs/app.log`

```powershell
Get-Content logs\app.log -Tail 50 -Wait
```

## Production Deployment

### Environment Variables

Ensure you change these in production:
- SECRET_KEY (use a strong random key)
- WEBHOOK_API_KEY
- Database passwords
- DEBUG=False
- ENVIRONMENT=production

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Use environment-specific .env files
- [ ] Disable DEBUG mode
- [ ] Review all API keys

### Recommended Production Setup

1. Use managed PostgreSQL (AWS RDS, Azure Database, etc.)
2. Use managed Redis (AWS ElastiCache, Azure Cache, etc.)
3. Deploy with Docker/Kubernetes
4. Use NGINX as reverse proxy
5. Set up SSL/TLS certificates
6. Configure monitoring (Prometheus, Grafana)
7. Set up CI/CD pipeline
8. Implement rate limiting
9. Add request logging and audit trails

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [Celery Guide](https://docs.celeryproject.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## Support

For issues or questions:
1. Check this guide first
2. Review API documentation at `/api/docs`
3. Check application logs
4. Create an issue in the repository

---

**Happy Coding! 🚀**
