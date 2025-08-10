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
You are AIWatch, an intelligent web assistant that can understand and interact with web pages. 

CURRENT PAGE CONTEXT:
- URL: ${context.url || 'unknown'}
- Title: ${context.title || 'unknown'}
- Page Type: ${context.pageType || 'general'}
- Page Content: ${context.content || 'unavailable'}

USER MESSAGE: "${message}"

CAPABILITIES:
You can help users interact with the current webpage through these actions:
1. CLICK elements (buttons, links) - Use: [ACTION:CLICK:selector]
2. FILL forms and inputs - Use: [ACTION:FILL:selector:value]
3. SCROLL to elements - Use: [ACTION:SCROLL:selector]
4. HIGHLIGHT elements - Use: [ACTION:HIGHLIGHT:selector]

IMPORTANT INSTRUCTIONS:
- If the user wants to click something, respond with [ACTION:CLICK:selector] where selector is the element identifier
- If the user wants to fill a form, respond with [ACTION:FILL:selector:value]
- If the user wants to scroll to something, respond with [ACTION:SCROLL:selector]
- You can use text content, IDs, classes, or descriptions as selectors
- Always provide a conversational response ALONG with any actions
- Keep responses helpful and contextual to the page content

Examples:
- "Click the login button" → [ACTION:CLICK:login] Click the login button for you!
- "Fill the email field with test@email.com" → [ACTION:FILL:email:test@email.com] I've filled the email field with test@email.com
- "Scroll to the footer" → [ACTION:SCROLL:footer] Scrolling to the footer now!

Respond conversationally while including action commands when needed.
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