"""Celery worker entry point"""
from app.tasks import celery_app

# This file is used to start the Celery worker
# Run with: celery -A app.celery_app worker --loglevel=info
