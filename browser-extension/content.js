// AIWatch Content Script - Injects the floating chat interface into any webpage

class AIWatchInterface {
  constructor() {
    this.isExpanded = false;
    this.messages = [];
    this.isTyping = false;
    this.socket = null;
    this.currentContext = {};
    
    this.init();
  }

  async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createInterface());
    } else {
      this.createInterface();
    }
    
    // Monitor page changes for context
    this.startContextMonitoring();
    
    // Connect to WebSocket
    this.connectWebSocket();
  }

  createInterface() {
    // Remove existing interface if present
    const existing = document.getElementById('aiwatch-interface');
    if (existing) existing.remove();

    // Create container
    const container = document.createElement('div');
    container.id = 'aiwatch-interface';
    container.className = 'aiwatch-container';

    // Create chat box
    const chatBox = document.createElement('div');
    chatBox.className = 'aiwatch-chat-box aiwatch-chat-collapsed';
    
    this.renderCollapsedView(chatBox);
    
    container.appendChild(chatBox);
    document.body.appendChild(container);

    this.container = container;
    this.chatBox = chatBox;
  }

  renderCollapsedView(chatBox) {
    chatBox.innerHTML = `
      <div class="aiwatch-input-container">
        <div class="aiwatch-sparkle-icon">✨</div>
        <input 
          class="aiwatch-input" 
          type="text" 
          placeholder="Ask me anything about this page..."
          id="aiwatch-input"
        />
        <button class="aiwatch-send-button" id="aiwatch-send">Send</button>
      </div>
    `;

    // Add event listeners
    const input = chatBox.querySelector('#aiwatch-input');
    const sendButton = chatBox.querySelector('#aiwatch-send');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.sendMessage(input.value.trim());
      }
    });

    sendButton.addEventListener('click', () => {
      if (input.value.trim()) {
        this.sendMessage(input.value.trim());
      }
    });

    // Focus on input when clicking anywhere on the collapsed box
    chatBox.addEventListener('click', () => {
      input.focus();
    });
  }

  renderExpandedView(chatBox) {
    let conversationHTML = '';
    
    if (this.messages.length > 0) {
      conversationHTML = '<div class="aiwatch-conversation">';
      
      for (const message of this.messages) {
        if (message.type === 'question') {
          conversationHTML += `
            <div class="aiwatch-question">
              <div class="aiwatch-sparkle-icon">✨</div>
              <div class="aiwatch-question-text">Question: "${message.content}"</div>
            </div>
          `;
        } else if (message.type === 'answer') {
          conversationHTML += `
            <div class="aiwatch-answer">
              <p class="aiwatch-answer-text">${message.content}</p>
            </div>
          `;
          
          if (message.suggestion) {
            conversationHTML += `
              <div class="aiwatch-suggestion">
                <div class="aiwatch-suggestion-label">Suggestion:</div>
                <p class="aiwatch-suggestion-text">${message.suggestion}</p>
              </div>
            `;
          }
        }
      }
      
      conversationHTML += '</div>';
    }

    // Add typing indicator if needed
    if (this.isTyping) {
      conversationHTML += `
        <div class="aiwatch-typing">
          <div class="aiwatch-sparkle-icon">✨</div>
          <div class="aiwatch-typing-dots">
            <div class="aiwatch-typing-dot"></div>
            <div class="aiwatch-typing-dot"></div>
            <div class="aiwatch-typing-dot"></div>
          </div>
        </div>
      `;
    }

    chatBox.innerHTML = `
      ${conversationHTML}
      <div class="aiwatch-input-container">
        <div class="aiwatch-sparkle-icon">✨</div>
        <input 
          class="aiwatch-input" 
          type="text" 
          placeholder="Ask me anything else..."
          id="aiwatch-input"
        />
        <button class="aiwatch-send-button" id="aiwatch-send">Send</button>
      </div>
    `;

    // Add event listeners
    const input = chatBox.querySelector('#aiwatch-input');
    const sendButton = chatBox.querySelector('#aiwatch-send');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.sendMessage(input.value.trim());
      }
    });

    sendButton.addEventListener('click', () => {
      if (input.value.trim()) {
        this.sendMessage(input.value.trim());
      }
    });

    // Auto-focus input
    setTimeout(() => input.focus(), 100);
  }

  async sendMessage(message) {
    // Add question to messages
    this.messages.push({
      type: 'question',
      content: message,
      timestamp: new Date()
    });

    // Expand interface and show typing
    this.isExpanded = true;
    this.isTyping = true;
    this.chatBox.className = 'aiwatch-chat-box aiwatch-chat-expanded';
    this.renderExpandedView(this.chatBox);

    try {
      // Send via WebSocket if connected, otherwise use REST API
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'message',
          content: message,
          context: this.currentContext
        }));
      } else {
        // Fallback to REST API
        const response = await this.sendViaRestAPI(message);
        this.handleResponse(response);
      }
    } catch (error) {
      console.error('AIWatch: Error sending message:', error);
      this.handleError('Sorry, I encountered an error. Please try again.');
    }
  }

  async sendViaRestAPI(message) {
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        context: this.currentContext
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  handleResponse(data) {
    this.isTyping = false;
    
    const response = {
      type: 'answer',
      content: data.response || data.content || 'I received your message!',
      timestamp: new Date()
    };

    // Add suggestion if available
    if (data.suggestions && data.suggestions.length > 0) {
      response.suggestion = data.suggestions[0];
    }

    this.messages.push(response);
    this.renderExpandedView(this.chatBox);
  }

  handleError(errorMessage) {
    this.isTyping = false;
    
    this.messages.push({
      type: 'answer',
      content: errorMessage,
      timestamp: new Date()
    });
    
    this.renderExpandedView(this.chatBox);
  }

  connectWebSocket() {
    try {
      this.socket = new WebSocket('ws://localhost:8000');
      
      this.socket.onopen = () => {
        console.log('AIWatch: WebSocket connected');
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          this.handleResponse(data);
        } else if (data.type === 'typing') {
          this.isTyping = data.isTyping;
          if (this.isExpanded) {
            this.renderExpandedView(this.chatBox);
          }
        }
      };

      this.socket.onclose = () => {
        console.log('AIWatch: WebSocket disconnected, will use REST API fallback');
        this.socket = null;
      };

      this.socket.onerror = (error) => {
        console.warn('AIWatch: WebSocket error, falling back to REST API');
        this.socket = null;
      };
    } catch (error) {
      console.warn('AIWatch: Could not establish WebSocket connection, using REST API');
      this.socket = null;
    }
  }

  startContextMonitoring() {
    // Initial context capture
    this.updateContext();

    // Monitor scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => this.updateContext(), 500);
    });

    // Monitor page changes (for SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => this.updateContext(), 1000); // Wait for content to load
      }
    }).observe(document, { subtree: true, childList: true });

    // Update context periodically
    setInterval(() => this.updateContext(), 30000); // Every 30 seconds
  }

  updateContext() {
    this.currentContext = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      scrollDepth: this.getScrollDepth(),
      pageType: this.detectPageType(),
      content: this.extractPageContent()
    };
  }

  getScrollDepth() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
  }

  detectPageType() {
    const url = window.location.href.toLowerCase();
    
    if (url.includes('github')) return 'code-repository';
    if (url.includes('stackoverflow')) return 'q-and-a';
    if (url.includes('shop') || url.includes('cart') || url.includes('checkout')) return 'e-commerce';
    if (document.querySelector('form')) return 'form-page';
    if (url.includes('blog') || url.includes('article')) return 'article';
    
    return 'general';
  }

  extractPageContent() {
    // Get main text content, excluding navigation and footer
    const main = document.querySelector('main') || 
                  document.querySelector('article') || 
                  document.querySelector('[role="main"]') || 
                  document.body;

    const content = main.textContent || '';
    
    // Return first 1000 characters to avoid token limits
    return content.slice(0, 1000).trim();
  }
}

// Initialize AIWatch only if not already initialized
if (!window.aiwatchInitialized) {
  window.aiwatchInitialized = true;
  
  // Small delay to ensure page is fully loaded
  setTimeout(() => {
    window.aiwatch = new AIWatchInterface();
  }, 1000);
}