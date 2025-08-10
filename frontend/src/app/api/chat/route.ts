import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY environment variable');
}

export async function POST(request: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { 
        status: 400,
        headers 
      });
    }

    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json({ 
        error: 'AI service not configured',
        response: 'Sorry, the AI service is not properly configured. Please check the server settings.'
      }, { status: 500, headers });
    }

    // Prepare context information for Claude
    const contextInfo = context ? `
Context about the current webpage:
- URL: ${context.url || 'unknown'}
- Title: ${context.title || 'unknown'}
- Page Type: ${context.pageType || 'general'}
- Content Preview: ${context.content ? context.content.substring(0, 500) : 'unavailable'}

User is browsing this page and asking: "${message}"

Please provide a helpful, contextual response based on the page content and their question. Keep responses concise but informative.
    ` : message;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: contextInfo
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return NextResponse.json({ 
        error: 'AI service error',
        response: 'Sorry, I encountered an error processing your request. Please try again in a moment.'
      }, { status: 500, headers });
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text || 'I received your message but had trouble generating a response.';

    return NextResponse.json({ 
      response: aiResponse,
      suggestions: [] // Can add suggestions later
    }, { headers });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      response: 'Sorry, I encountered an error. Please try again.'
    }, { status: 500, headers });
  }
}

export async function GET() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  return NextResponse.json({ 
    status: 'AIWatch Chat API is running',
    timestamp: new Date().toISOString()
  }, { headers });
}

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  return new NextResponse(null, { status: 200, headers });
}