from fastapi import APIRouter, Depends
from datetime import datetime
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AIWatch Python AI Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT,
        "claude_configured": bool(settings.ANTHROPIC_API_KEY),
    }

@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    # Check if all required services are available
    checks = {
        "claude_api": bool(settings.ANTHROPIC_API_KEY),
        "supabase": bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY),
    }
    
    all_ready = all(checks.values())
    
    return {
        "ready": all_ready,
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat(),
    }