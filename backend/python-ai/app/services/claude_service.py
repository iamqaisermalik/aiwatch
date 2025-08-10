import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import anthropic
from anthropic import Anthropic
from app.core.config import settings

logger = logging.getLogger(__name__)

class ClaudeService:
    """Service for interacting with Claude API"""
    
    def __init__(self):
        self.client: Optional[Anthropic] = None
        self._initialized = False
        self._available = False
    
    async def initialize(self):
        """Initialize the Claude client"""
        try:
            if not settings.ANTHROPIC_API_KEY:
                logger.error("ANTHROPIC_API_KEY not provided")
                self._available = False
                return
            
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            
            # Test the connection
            await self._test_connection()
            self._initialized = True
            self._available = True
            logger.info("✅ Claude service initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Claude service: {str(e)}")
            self._available = False
    
    async def _test_connection(self):
        """Test the Claude API connection"""
        try:
            # Make a simple test call
            response = self.client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=10,
                messages=[{"role": "user", "content": "Hello"}]
            )
            logger.info("Claude API connection test successful")
        except Exception as e:
            logger.error(f"Claude API connection test failed: {str(e)}")
            raise
    
    def is_available(self) -> bool:
        """Check if Claude service is available"""
        return self._available and self._initialized
    
    async def generate_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a response using Claude"""
        
        if not self.is_available():
            raise Exception("Claude service is not available")
        
        try:
            # Build the conversation messages
            messages = []
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-10:]:  # Limit to last 10 messages
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            # Add current message with context
            current_content = message
            if context:
                context_str = self._format_context(context)
                current_content = f"{context_str}\n\nUser message: {message}"
            
            messages.append({
                "role": "user",
                "content": current_content
            })
            
            # Prepare system prompt
            default_system_prompt = """You are AIWatch, an AI assistant that helps users navigate and understand web content. 
            You have access to the current page context and can provide contextual guidance.
            
            Guidelines:
            - Be helpful and concise
            - Focus on the current page context when relevant
            - Provide actionable suggestions
            - Be proactive in offering assistance based on the page content
            """
            
            final_system_prompt = system_prompt or default_system_prompt
            
            # Make the API call
            response = self.client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=settings.CLAUDE_MAX_TOKENS,
                temperature=settings.CLAUDE_TEMPERATURE,
                system=final_system_prompt,
                messages=messages
            )
            
            # Extract response content
            response_content = ""
            if response.content and len(response.content) > 0:
                response_content = response.content[0].text if hasattr(response.content[0], 'text') else str(response.content[0])
            
            return {
                "content": response_content,
                "model": settings.CLAUDE_MODEL,
                "timestamp": datetime.utcnow().isoformat(),
                "usage": {
                    "input_tokens": response.usage.input_tokens if response.usage else 0,
                    "output_tokens": response.usage.output_tokens if response.usage else 0,
                },
                "context_used": bool(context)
            }
            
        except anthropic.APIError as e:
            logger.error(f"Claude API error: {str(e)}")
            raise Exception(f"Claude API error: {str(e)}")
        except Exception as e:
            logger.error(f"Claude service error: {str(e)}")
            raise Exception(f"Failed to generate response: {str(e)}")
    
    async def analyze_context(
        self,
        url: str,
        page_content: str,
        user_intent: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze page context and provide insights"""
        
        if not self.is_available():
            raise Exception("Claude service is not available")
        
        try:
            # Build context analysis prompt
            analysis_prompt = f"""Analyze this web page and provide insights:

URL: {url}
Page Content: {page_content[:2000]}...  # Truncate for token limits

Please provide:
1. Page type and purpose
2. Key information or actions available
3. Contextual suggestions for user assistance
4. Potential user intents on this page

{"User indicated intent: " + user_intent if user_intent else ""}

Respond in JSON format with keys: page_type, purpose, key_actions, suggestions, insights"""

            response = self.client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=1000,
                temperature=0.3,
                messages=[{"role": "user", "content": analysis_prompt}]
            )
            
            response_content = ""
            if response.content and len(response.content) > 0:
                response_content = response.content[0].text if hasattr(response.content[0], 'text') else str(response.content[0])
            
            return {
                "analysis": response_content,
                "url": url,
                "timestamp": datetime.utcnow().isoformat(),
                "model": settings.CLAUDE_MODEL
            }
            
        except Exception as e:
            logger.error(f"Context analysis error: {str(e)}")
            raise Exception(f"Failed to analyze context: {str(e)}")
    
    async def generate_proactive_suggestions(
        self,
        context: Dict[str, Any]
    ) -> List[str]:
        """Generate proactive suggestions based on context"""
        
        if not self.is_available():
            return ["Claude service is currently unavailable"]
        
        try:
            context_str = self._format_context(context)
            
            prompt = f"""Based on this page context, suggest 3-5 proactive ways I can help the user:

{context_str}

Provide specific, actionable suggestions as a simple list. Focus on what would be most helpful for someone viewing this page."""

            response = self.client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=500,
                temperature=0.5,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_content = ""
            if response.content and len(response.content) > 0:
                response_content = response.content[0].text if hasattr(response.content[0], 'text') else str(response.content[0])
            
            # Extract suggestions from response
            suggestions = []
            lines = response_content.split('\n')
            for line in lines:
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                    suggestion = line[1:].strip()
                    if suggestion:
                        suggestions.append(suggestion)
            
            return suggestions[:5]  # Limit to 5 suggestions
            
        except Exception as e:
            logger.error(f"Proactive suggestions error: {str(e)}")
            return ["I'm here to help! Ask me anything about this page."]
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context information for Claude"""
        formatted = []
        
        if context.get('url'):
            formatted.append(f"Current page: {context['url']}")
        
        if context.get('title'):
            formatted.append(f"Page title: {context['title']}")
        
        if context.get('pageType'):
            formatted.append(f"Page type: {context['pageType']}")
        
        if context.get('content'):
            # Truncate content to avoid token limits
            content = str(context['content'])[:1000]
            formatted.append(f"Page content: {content}...")
        
        if context.get('userActivity'):
            formatted.append(f"User activity: {context['userActivity']}")
        
        if context.get('timestamp'):
            formatted.append(f"Context timestamp: {context['timestamp']}")
        
        return "\n".join(formatted)