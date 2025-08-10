from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

from app.services.claude_service import ClaudeService
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize Claude service (will be properly injected in production)
claude_service = ClaudeService()

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[ChatMessage]] = None
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    content: str
    model: str
    timestamp: str
    usage: Dict[str, int]
    context_used: bool
    suggestions: Optional[List[str]] = None

class ProactiveSuggestionsRequest(BaseModel):
    context: Dict[str, Any]

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Send a message to Claude and get a response"""
    
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Convert conversation history to dict format
        history = None
        if request.conversation_history:
            history = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp or datetime.utcnow().isoformat()
                }
                for msg in request.conversation_history
            ]
        
        # Generate response using Claude
        response = await claude_service.generate_response(
            message=request.message,
            context=request.context,
            conversation_history=history,
            system_prompt=request.system_prompt
        )
        
        # Generate proactive suggestions if context is available
        suggestions = []
        if request.context:
            try:
                suggestions = await claude_service.generate_proactive_suggestions(request.context)
            except Exception as e:
                logger.warning(f"Failed to generate suggestions: {str(e)}")
        
        return ChatResponse(
            content=response["content"],
            model=response["model"],
            timestamp=response["timestamp"],
            usage=response["usage"],
            context_used=response["context_used"],
            suggestions=suggestions if suggestions else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat message error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")

@router.post("/suggestions")
async def get_proactive_suggestions(request: ProactiveSuggestionsRequest):
    """Get proactive suggestions based on context"""
    
    try:
        suggestions = await claude_service.generate_proactive_suggestions(request.context)
        
        return {
            "suggestions": suggestions,
            "timestamp": datetime.utcnow().isoformat(),
            "context_url": request.context.get("url", "unknown")
        }
        
    except Exception as e:
        logger.error(f"Proactive suggestions error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

@router.get("/models")
async def get_available_models():
    """Get information about available AI models"""
    
    return {
        "models": [
            {
                "id": settings.CLAUDE_MODEL,
                "name": "Claude 3.5 Sonnet",
                "provider": "Anthropic",
                "max_tokens": settings.CLAUDE_MAX_TOKENS,
                "temperature": settings.CLAUDE_TEMPERATURE,
                "available": claude_service.is_available()
            }
        ],
        "default_model": settings.CLAUDE_MODEL,
        "timestamp": datetime.utcnow().isoformat()
    }