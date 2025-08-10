from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime

from app.services.claude_service import ClaudeService
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize Claude service
claude_service = ClaudeService()

# Pydantic models
class ContextAnalysisRequest(BaseModel):
    url: str
    page_content: str
    user_intent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ContextAnalysisResponse(BaseModel):
    analysis: str
    url: str
    timestamp: str
    model: str
    suggestions: Optional[List[str]] = None

class PageInsight(BaseModel):
    type: str
    confidence: float
    description: str
    actionable: bool

class EnhancedContextRequest(BaseModel):
    url: str
    title: Optional[str] = None
    content: str
    user_activity: Optional[Dict[str, Any]] = None
    dom_elements: Optional[List[Dict[str, str]]] = None

@router.post("/analyze", response_model=ContextAnalysisResponse)
async def analyze_context(request: ContextAnalysisRequest):
    """Analyze page context and provide insights"""
    
    try:
        if not request.url or not request.page_content:
            raise HTTPException(status_code=400, detail="URL and page content are required")
        
        # Analyze context using Claude
        analysis = await claude_service.analyze_context(
            url=request.url,
            page_content=request.page_content,
            user_intent=request.user_intent
        )
        
        # Generate contextual suggestions
        context_for_suggestions = {
            "url": request.url,
            "content": request.page_content[:1000],  # Truncate for efficiency
            "userIntent": request.user_intent,
            "metadata": request.metadata
        }
        
        suggestions = await claude_service.generate_proactive_suggestions(context_for_suggestions)
        
        return ContextAnalysisResponse(
            analysis=analysis["analysis"],
            url=analysis["url"],
            timestamp=analysis["timestamp"],
            model=analysis["model"],
            suggestions=suggestions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Context analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to analyze context: {str(e)}")

@router.post("/insights")
async def get_page_insights(request: EnhancedContextRequest):
    """Get detailed page insights and recommendations"""
    
    try:
        insights = []
        
        # Determine page type
        page_type = _determine_page_type(request.url, request.content)
        insights.append(PageInsight(
            type="page_classification",
            confidence=0.9,
            description=f"This appears to be a {page_type} page",
            actionable=False
        ))
        
        # Check for common elements
        if request.dom_elements:
            form_elements = [el for el in request.dom_elements if el.get("tag") == "form"]
            if form_elements:
                insights.append(PageInsight(
                    type="form_detected",
                    confidence=0.95,
                    description="Forms detected on this page - I can help you fill them out",
                    actionable=True
                ))
        
        # Analyze user activity if provided
        if request.user_activity:
            if request.user_activity.get("scrollDepth", 0) > 0.8:
                insights.append(PageInsight(
                    type="content_engagement",
                    confidence=0.8,
                    description="You've read most of this content - would you like a summary?",
                    actionable=True
                ))
        
        # Generate AI-powered insights
        context = {
            "url": request.url,
            "title": request.title,
            "content": request.content[:1000],
            "userActivity": request.user_activity,
            "pageType": page_type
        }
        
        ai_suggestions = await claude_service.generate_proactive_suggestions(context)
        
        # Convert AI suggestions to insights
        for i, suggestion in enumerate(ai_suggestions):
            insights.append(PageInsight(
                type="ai_suggestion",
                confidence=0.7,
                description=suggestion,
                actionable=True
            ))
        
        return {
            "insights": [insight.dict() for insight in insights],
            "page_type": page_type,
            "url": request.url,
            "timestamp": datetime.utcnow().isoformat(),
            "total_insights": len(insights)
        }
        
    except Exception as e:
        logger.error(f"Page insights error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

@router.post("/monitor")
async def monitor_context():
    """Endpoint for real-time context monitoring"""
    
    return {
        "message": "Context monitoring endpoint - WebSocket implementation needed for real-time features",
        "status": "placeholder",
        "timestamp": datetime.utcnow().isoformat()
    }

def _determine_page_type(url: str, content: str) -> str:
    """Determine the type of page based on URL and content"""
    
    url_lower = url.lower()
    content_lower = content.lower()
    
    # E-commerce
    if any(keyword in url_lower for keyword in ['shop', 'store', 'cart', 'checkout', 'product']):
        return "e-commerce"
    
    # Social media
    if any(keyword in url_lower for keyword in ['facebook', 'twitter', 'instagram', 'linkedin']):
        return "social-media"
    
    # Developer/code
    if any(keyword in url_lower for keyword in ['github', 'gitlab', 'stackoverflow', 'dev']):
        return "developer-tools"
    
    # Documentation
    if any(keyword in url_lower for keyword in ['docs', 'documentation', 'api', 'guide']):
        return "documentation"
    
    # News/blog
    if any(keyword in url_lower for keyword in ['news', 'blog', 'article']):
        return "content"
    
    # Forms
    if '<form' in content_lower or 'input' in content_lower:
        return "form-page"
    
    # Default
    return "general"