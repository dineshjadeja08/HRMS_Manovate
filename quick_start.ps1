# HRMS Backend API - Quick Start Script
# This script helps you quickly set up and run the HRMS API

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "HRMS Backend API - Quick Start" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "[1/6] Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created. Please review and update settings if needed." -ForegroundColor Green
} else {
    Write-Host "[1/6] .env file already exists" -ForegroundColor Green
}

# Check if virtual environment exists
if (-Not (Test-Path "venv")) {
    Write-Host "[2/6] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "[2/6] Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "[3/6] Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host "[4/6] Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "[5/6] Checking database connection..." -ForegroundColor Yellow
Write-Host "Make sure PostgreSQL and Redis are running!" -ForegroundColor Yellow
Write-Host "PostgreSQL: localhost:5432" -ForegroundColor Cyan
Write-Host "Redis: localhost:6379" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Do you want to seed the database with sample data? (y/n)"
if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host "[6/6] Seeding database..." -ForegroundColor Yellow
    python seed_db.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to seed database. Make sure PostgreSQL is running." -ForegroundColor Red
    }
} else {
    Write-Host "[6/6] Skipping database seeding" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default accounts (after seeding):" -ForegroundColor Yellow
Write-Host "  Admin:    admin@hrms.com / admin123" -ForegroundColor Cyan
Write-Host "  Manager:  manager@hrms.com / manager123" -ForegroundColor Cyan
Write-Host "  Employee: employee@hrms.com / employee123" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host "  uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start Celery worker (separate terminal):" -ForegroundColor Yellow
Write-Host "  celery -A app.celery_app worker --loglevel=info --pool=solo" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Documentation:" -ForegroundColor Yellow
Write-Host "  http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
