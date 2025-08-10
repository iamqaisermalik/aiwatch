// Vercel Serverless Function for Chat API
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({
          error: 'Message is required',
        });
      }

      // For now, return a simple response
      // Later, this would integrate with the AI service
      const response = {
        response: `I received your message: "${message}". I'm processing the context from ${context?.url || 'this page'}.`,
        timestamp: new Date().toISOString(),
        suggestions: [
          'This is a demo response - full AI integration coming soon!',
          'Try the browser extension for better context awareness',
        ],
      };

      // Log the interaction to Supabase
      try {
        await supabase.from('conversations').insert({
          user_message: message,
          ai_response: response.response,
          context: context,
          created_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.warn('Database logging failed:', dbError.message);
        // Don't fail the request if logging fails
      }

      return res.json(response);

    } catch (error) {
      console.error('Chat API error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process chat request',
      });
    }
  }

  if (req.method === 'GET') {
    return res.json({
      message: 'AIWatch Chat API',
      version: '1.0.0',
      status: 'active',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}