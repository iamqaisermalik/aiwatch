import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Chat endpoint (for REST API fallback)
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
      });
    }

    logger.info('REST chat request:', { message, context });

    // For now, return a simple response
    // Later, this would integrate with the AI service
    res.json({
      response: `I received your message: "${message}". The WebSocket connection provides better real-time experience!`,
      timestamp: new Date().toISOString(),
      suggestions: [
        'Try using the WebSocket connection for real-time chat',
        'Install the browser extension for better context',
      ],
    });

  } catch (error) {
    logger.error('Chat API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process chat request',
    });
  }
});

// Context analysis endpoint
router.post('/analyze-context', async (req, res) => {
  try {
    const { url, content, userIntent } = req.body;

    logger.info('Context analysis request:', { url });

    // Basic context analysis
    const analysis = {
      pageType: detectPageType(url, content),
      suggestions: generateSuggestions(url, content),
      timestamp: new Date().toISOString(),
    };

    res.json(analysis);

  } catch (error) {
    logger.error('Context analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to analyze context',
    });
  }
});

// Helper functions
function detectPageType(url: string, content: string): string {
  if (url.includes('github.com')) return 'code-repository';
  if (url.includes('stackoverflow.com')) return 'q-and-a';
  if (url.includes('checkout') || url.includes('cart')) return 'e-commerce';
  if (content?.includes('<form')) return 'form-page';
  if (url.includes('blog') || url.includes('article')) return 'article';
  return 'general';
}

function generateSuggestions(url: string, content: string): string[] {
  const suggestions = [];

  if (content?.includes('<form')) {
    suggestions.push('I can help you fill out forms efficiently');
  }

  if (url.includes('github.com')) {
    suggestions.push('I can explain code and repository structure');
  }

  if (url.includes('checkout')) {
    suggestions.push('I can help review your purchase');
  }

  return suggestions;
}

export default router;