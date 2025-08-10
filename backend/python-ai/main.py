from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime

from app.core.config import settings
from app.core.logging_config import setup_logging
from app.api.routes import chat, context, health
from app.services.claude_service import ClaudeService

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize services
claude_service = ClaudeService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting AIWatch Python AI Service")
    logger.info(f"🌍 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🤖 Claude API configured: {bool(settings.ANTHROPIC_API_KEY)}")
    
    # Initialize services
    await claude_service.initialize()
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down AIWatch Python AI Service")

# Create FastAPI app
app = FastAPI(
    title="AIWatch AI Service",
    description="AI-powered contextual web assistant using Claude",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(context.router, prefix="/context", tags=["context"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AIWatch AI Service",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "claude_available": claude_service.is_available(),
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return {"error": "Internal server error", "detail": str(exc)}

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.ENVIRONMENT == "development",
        log_level="info",
    )