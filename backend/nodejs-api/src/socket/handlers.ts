import { Socket, Server } from 'socket.io';
import axios from 'axios';
import { logger } from '../utils/logger';

interface MessageData {
  content: string;
  context: {
    url: string;
    title: string;
    timestamp: string;
    pageContent?: string;
    userIntent?: string;
  };
}

export function setupSocketHandlers(socket: Socket, io: Server) {
  // Handle incoming messages
  socket.on('message', async (data: MessageData) => {
    try {
      logger.info(`Message received from ${socket.id}: ${data.content}`);

      // Send typing indicator
      socket.emit('typing', true);

      // Prepare context for AI
      const aiContext = {
        userMessage: data.content,
        pageContext: {
          url: data.context.url,
          title: data.context.title,
          timestamp: data.context.timestamp,
          pageContent: data.context.pageContent || '',
        },
        userProfile: {
          // This would come from authenticated user data
          preferences: {},
          history: [],
        },
      };

      // Send to Python AI service
      const aiResponse = await sendToAI(aiContext);

      // Stop typing indicator
      socket.emit('typing', false);

      // Send response back to client
      socket.emit('message', {
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        confidence: aiResponse.confidence || 0.9,
      });

      // Log the interaction
      logger.info(`Response sent to ${socket.id}`);

    } catch (error) {
      logger.error('Error handling message:', error);
      
      socket.emit('typing', false);
      socket.emit('message', {
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true,
      });
    }
  });

  // Handle context updates (page changes, interactions)
  socket.on('context-update', async (contextData) => {
    try {
      logger.info(`Context update from ${socket.id}:`, contextData);

      // Store context in database (implement later)
      // await storeContext(socket.userId, contextData);

      // Analyze context for proactive insights
      const insights = await analyzeContext(contextData);

      if (insights.suggestions.length > 0) {
        socket.emit('proactive-suggestion', {
          suggestions: insights.suggestions,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error) {
      logger.error('Error handling context update:', error);
    }
  });

  // Handle user preferences
  socket.on('update-preferences', async (preferences) => {
    try {
      logger.info(`Preferences update from ${socket.id}:`, preferences);
      
      // Store preferences in database
      // await updateUserPreferences(socket.userId, preferences);

      socket.emit('preferences-updated', {
        success: true,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error('Error updating preferences:', error);
      socket.emit('preferences-updated', {
        success: false,
        error: 'Failed to update preferences',
      });
    }
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });
}

// Send message to Python AI service
async function sendToAI(context: any) {
  try {
    const aiServiceUrl = process.env.PYTHON_AI_URL || 'http://localhost:8001';
    
    const response = await axios.post(`${aiServiceUrl}/chat`, {
      message: context.userMessage,
      context: context.pageContext,
      userProfile: context.userProfile,
    }, {
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      content: response.data.response || 'I understand your question, but I need more information to help you effectively.',
      confidence: response.data.confidence || 0.8,
      suggestions: response.data.suggestions || [],
    };

  } catch (error) {
    logger.error('AI service error:', error);

    // Fallback response
    return {
      content: `I understand you're asking about "${context.userMessage}". While I'm currently setting up my connection to the AI service, I can see you're on ${context.pageContext.title}. How can I help you with this page?`,
      confidence: 0.6,
      suggestions: [
        'Tell me what you\'re trying to accomplish',
        'Ask about specific elements on this page',
        'Get help navigating this website',
      ],
    };
  }
}

// Analyze context for proactive insights
async function analyzeContext(contextData: any) {
  try {
    // This would use AI to analyze page context and user behavior
    // For now, return basic insights based on URL patterns

    const insights = {
      suggestions: [] as string[],
    };

    const url = contextData.url?.toLowerCase() || '';

    // Form detection
    if (contextData.pageContent?.includes('<form') || contextData.pageContent?.includes('input')) {
      insights.suggestions.push('I notice there are forms on this page. I can help you fill them out efficiently.');
    }

    // E-commerce patterns
    if (url.includes('checkout') || url.includes('cart') || url.includes('payment')) {
      insights.suggestions.push('I can help you review your purchase and ensure you\'re getting the best deal.');
    }

    // Article/blog patterns
    if (url.includes('blog') || url.includes('article') || contextData.title?.includes('How to')) {
      insights.suggestions.push('I can summarize this article or answer questions about the content.');
    }

    // GitHub patterns
    if (url.includes('github.com')) {
      insights.suggestions.push('I can help you understand this code repository or explain specific files.');
    }

    return insights;

  } catch (error) {
    logger.error('Error analyzing context:', error);
    return { suggestions: [] };
  }
}