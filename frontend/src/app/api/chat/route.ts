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

    // Enhanced agentic context processing
    const isAgenticMode = context?.isAgenticMode;
    const pageKnowledge = context?.pageKnowledge;
    
    // Prepare comprehensive context for Claude
    const contextInfo = context ? `
You are AIWatch, an AGENTIC AI web assistant with deep intelligence and real-time page analysis capabilities.

${isAgenticMode ? '🤖 AGENTIC MODE ACTIVE - You have comprehensive page knowledge and can make intelligent decisions.' : ''}

CURRENT PAGE ANALYSIS:
- URL: ${context.url || 'unknown'}
- Title: ${context.title || 'unknown'}
- Page Type: ${context.pageType || 'general'}

${pageKnowledge ? `
COMPREHENSIVE PAGE KNOWLEDGE:
- Interactive Buttons: ${JSON.stringify(pageKnowledge.allButtons?.slice(0, 10) || [])}
- Navigation Links: ${JSON.stringify(pageKnowledge.allLinks?.slice(0, 10) || [])}
- Form Inputs: ${JSON.stringify(pageKnowledge.allInputs?.slice(0, 10) || [])}
- Page Headings: ${JSON.stringify(pageKnowledge.headings?.slice(0, 5) || [])}
- Navigation Elements: ${JSON.stringify(pageKnowledge.navigation?.slice(0, 10) || [])}
- Forms Available: ${JSON.stringify(pageKnowledge.forms || [])}
- Page Metadata: ${JSON.stringify(pageKnowledge.metadata || {})}
- Viewport Info: ${JSON.stringify(pageKnowledge.viewport || {})}
` : `- Page Content: ${context.content || 'unavailable'}`}

USER COMMAND: "${message}"

CAPABILITIES:
You can help users interact with the current webpage through these actions:
1. CLICK elements (buttons, links) - Use: [ACTION:CLICK:selector]
2. FILL forms and inputs - Use: [ACTION:FILL:selector:value]
3. SCROLL to elements - Use: [ACTION:SCROLL:selector]
4. HIGHLIGHT elements - Use: [ACTION:HIGHLIGHT:selector]

${isAgenticMode ? `
AGENTIC INTELLIGENCE INSTRUCTIONS:
- You have COMPLETE knowledge of all page elements, their positions, text content, and interactions
- ANALYZE the page knowledge before responding - you can see ALL buttons, links, forms, inputs
- When user requests an action, INTELLIGENTLY match their request to the EXACT elements available
- Use the comprehensive page data to find the BEST matching element
- If user says "click API", look through ALL links and buttons to find one containing "API" text
- Be PROACTIVE and suggest related actions based on page content
- Always explain what you found and why you chose that specific element

INTELLIGENT ELEMENT MATCHING:
- Match user requests to actual page elements using the comprehensive knowledge provided
- For "click API" - search through allLinks and allButtons for any containing "api" or "API"
- For "fill email" - search through allInputs for email fields, email placeholders, or email types
- Be smart about partial matches - "login" can match "Sign In", "Log In", "Login", etc.
- Explain your reasoning: "I found an 'API' link in the navigation" or "I located the email input field"

RESPONSE FORMAT:
- Always respond conversationally first
- Include action commands when you find matching elements
- Explain what you found and why you're taking that action
- If no exact match, suggest alternatives from available elements

` : `
BASIC INSTRUCTIONS:
- If the user wants to click something, respond with [ACTION:CLICK:selector] where selector is the element identifier
- If the user wants to fill a form, respond with [ACTION:FILL:selector:value]
- If the user wants to scroll to something, respond with [ACTION:SCROLL:selector]
- Always provide a conversational response ALONG with any actions
`}

Examples:
- "Click the login button" → I found the login button! [ACTION:CLICK:login] Clicking it now.
- "Fill the email field with test@email.com" → I see the email input field. [ACTION:FILL:email:test@email.com] Filling it with your email.
- "Click API" → I found an "API" link in the navigation menu! [ACTION:CLICK:api] Taking you there now.

${isAgenticMode ? 'Use your comprehensive page knowledge to make intelligent decisions about which elements to interact with.' : 'Respond conversationally while including action commands when needed.'}
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