// AIWatch Content Script - Injects the floating chat interface into any webpage

class AIWatchInterface {
  constructor() {
    this.isExpanded = false;
    this.messages = [];
    this.isTyping = false;
    this.socket = null;
    this.currentContext = {};
    this.isListening = true; // Always listening
    this.isSpeaking = false;
    this.recognition = null;
    this.synth = null;
    this.apiUrl = 'https://aiwatch-nine.vercel.app/api';
    
    // Agentic intelligence properties
    this.pageKnowledge = {};
    this.isAnalyzing = false;
    this.continuousMonitoring = true;
    this.lastPageAnalysis = null;
    this.actionConfidence = 0;
    
    this.init();
  }

  async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createInterface());
    } else {
      this.createInterface();
    }
    
    // Initialize agentic voice recognition (always on)
    this.initAgenticVoiceRecognition();
    
    // Start intelligent page monitoring
    this.startIntelligentPageMonitoring();
    
    // Connect to WebSocket
    this.connectWebSocket();
    
    // Begin continuous page analysis
    this.startContinuousAnalysis();
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
        <div class="aiwatch-sparkle-icon">🤖</div>
        <div class="aiwatch-status">
          <div class="aiwatch-status-text">AIWatch Active • Always Listening</div>
          <div class="aiwatch-status-indicator ${this.isAnalyzing ? 'analyzing' : 'ready'}"></div>
        </div>
        <input 
          class="aiwatch-input" 
          type="text" 
          placeholder="I'm always listening or type here..."
          id="aiwatch-input"
        />
        <button class="aiwatch-voice-button listening" id="aiwatch-voice" title="Always listening">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>
        <button class="aiwatch-send-button" id="aiwatch-send">Send</button>
      </div>
    `;

    // Add event listeners
    const input = chatBox.querySelector('#aiwatch-input');
    const sendButton = chatBox.querySelector('#aiwatch-send');
    const voiceButton = chatBox.querySelector('#aiwatch-voice');

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

    voiceButton.addEventListener('click', () => {
      this.toggleVoiceRecognition();
    });

    // Focus on input when clicking anywhere on the collapsed box (except buttons)
    chatBox.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        input.focus();
      }
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
        <button class="aiwatch-voice-button ${this.isListening ? 'listening' : ''}" id="aiwatch-voice" title="Voice input">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>
        <button class="aiwatch-send-button" id="aiwatch-send">Send</button>
      </div>
    `;

    // Add event listeners
    const input = chatBox.querySelector('#aiwatch-input');
    const sendButton = chatBox.querySelector('#aiwatch-send');
    const voiceButton = chatBox.querySelector('#aiwatch-voice');

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

    voiceButton.addEventListener('click', () => {
      this.toggleVoiceRecognition();
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
    const response = await fetch(`${this.apiUrl}/chat`, {
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
    
    const responseText = data.response || data.content || 'I received your message!';
    
    // Check for action commands in the response
    const actionCommands = this.extractActionCommands(responseText);
    
    // Execute actions if found
    if (actionCommands.length > 0) {
      actionCommands.forEach(action => {
        setTimeout(() => this.executePageAction(action.type, action.target, action.value), 500);
      });
    }
    
    // Clean response text by removing action commands for display
    const cleanedResponse = this.removeActionCommands(responseText);
    
    const response = {
      type: 'answer',
      content: cleanedResponse,
      timestamp: new Date(),
      actions: actionCommands.length > 0 ? actionCommands : undefined
    };

    // Add suggestion if available
    if (data.suggestions && data.suggestions.length > 0) {
      response.suggestion = data.suggestions[0];
    }

    this.messages.push(response);
    this.renderExpandedView(this.chatBox);
  }

  extractActionCommands(text) {
    const actionRegex = /\[ACTION:(\w+):([^:\]]+)(?::([^\]]+))?\]/g;
    const actions = [];
    let match;

    while ((match = actionRegex.exec(text)) !== null) {
      actions.push({
        type: match[1].toLowerCase(),
        target: match[2],
        value: match[3] || ''
      });
    }

    return actions;
  }

  removeActionCommands(text) {
    return text.replace(/\[ACTION:(\w+):([^:\]]+)(?::([^\]]+))?\]/g, '').trim();
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
    // Skip WebSocket for now, use REST API only
    console.log('AIWatch: Using REST API for communication');
    this.socket = null;
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
    // Get comprehensive page information
    const pageInfo = {
      // Basic content
      text: this.getMainTextContent(),
      
      // Interactive elements
      forms: this.getPageForms(),
      buttons: this.getPageButtons(),
      links: this.getPageLinks(),
      inputs: this.getPageInputs(),
      
      // Structure
      headings: this.getPageHeadings(),
      images: this.getPageImages(),
      
      // Meta info
      meta: {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        url: window.location.href
      }
    };

    return JSON.stringify(pageInfo).slice(0, 3000); // Increased limit for richer context
  }

  getMainTextContent() {
    const main = document.querySelector('main') || 
                  document.querySelector('article') || 
                  document.querySelector('[role="main"]') || 
                  document.body;
    return main.textContent?.slice(0, 1000).trim() || '';
  }

  getPageForms() {
    return Array.from(document.querySelectorAll('form')).map((form, index) => ({
      index,
      id: form.id || `form-${index}`,
      action: form.action,
      method: form.method,
      inputs: Array.from(form.querySelectorAll('input, textarea, select')).length
    }));
  }

  getPageButtons() {
    return Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'))
      .slice(0, 10)
      .map((btn, index) => ({
        index,
        text: btn.textContent?.trim() || btn.value || btn.getAttribute('aria-label') || `button-${index}`,
        type: btn.type,
        id: btn.id,
        class: btn.className
      }));
  }

  getPageLinks() {
    return Array.from(document.querySelectorAll('a[href]'))
      .slice(0, 10)
      .map((link, index) => ({
        index,
        text: link.textContent?.trim() || link.getAttribute('aria-label') || `link-${index}`,
        href: link.href,
        id: link.id
      }));
  }

  getPageInputs() {
    return Array.from(document.querySelectorAll('input, textarea, select'))
      .slice(0, 10)
      .map((input, index) => ({
        index,
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        label: this.findLabelForInput(input),
        required: input.required
      }));
  }

  getPageHeadings() {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .slice(0, 10)
      .map((heading, index) => ({
        level: heading.tagName.toLowerCase(),
        text: heading.textContent?.trim() || `heading-${index}`,
        id: heading.id
      }));
  }

  getPageImages() {
    return Array.from(document.querySelectorAll('img'))
      .slice(0, 5)
      .map((img, index) => ({
        alt: img.alt || `image-${index}`,
        src: img.src,
        id: img.id
      }));
  }

  findLabelForInput(input) {
    // Try to find associated label
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent?.trim();
    }
    
    // Try parent label
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent?.trim();
    
    return '';
  }

  initAgenticVoiceRecognition() {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition for always-on listening
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true; // Always on
        this.recognition.interimResults = true; // Get partial results
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          console.log('🎤 AIWatch: Always-on listening activated');
          this.isListening = true;
          this.updateStatusIndicator();
        };

        this.recognition.onresult = (event) => {
          const lastResultIndex = event.results.length - 1;
          const lastResult = event.results[lastResultIndex];
          
          if (lastResult.isFinal) {
            const transcript = lastResult[0].transcript.trim();
            console.log('🎙️ Voice command received:', transcript);
            
            // Only process if it seems like a command (not random speech)
            if (this.isValidCommand(transcript)) {
              this.processAgenticCommand(transcript);
            }
          }
        };

        this.recognition.onend = () => {
          console.log('🔄 AIWatch: Restarting continuous listening');
          // Auto-restart for continuous listening
          setTimeout(() => {
            if (this.continuousMonitoring) {
              this.startContinuousListening();
            }
          }, 100);
        };

        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          // Restart after error
          setTimeout(() => {
            if (this.continuousMonitoring && event.error !== 'not-allowed') {
              this.startContinuousListening();
            }
          }, 1000);
        };

        // Start listening immediately
        this.startContinuousListening();
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  startContinuousListening() {
    try {
      if (this.recognition && !this.isListening) {
        this.recognition.start();
      }
    } catch (error) {
      console.log('Recognition already started or not available');
    }
  }

  isValidCommand(transcript) {
    const commandKeywords = [
      'click', 'fill', 'type', 'scroll', 'find', 'go to', 'open', 'search',
      'what is', 'tell me', 'show me', 'help', 'explain', 'navigate',
      'aiwatch', 'hey', 'please', 'can you'
    ];
    
    const lowerTranscript = transcript.toLowerCase();
    
    // Check if transcript contains command keywords or is a question
    return commandKeywords.some(keyword => lowerTranscript.includes(keyword)) || 
           lowerTranscript.includes('?') ||
           lowerTranscript.length > 3; // Process any meaningful speech
  }

  async processAgenticCommand(transcript) {
    console.log('🧠 Processing agentic command:', transcript);
    
    // Show that we're processing
    this.isAnalyzing = true;
    this.updateStatusIndicator();
    
    // Perform deep page analysis before action
    await this.performDeepPageAnalysis();
    
    // Send command with enhanced context to AI
    await this.sendAgenticMessage(transcript);
    
    this.isAnalyzing = false;
    this.updateStatusIndicator();
  }

  async performDeepPageAnalysis() {
    console.log('🔍 Performing deep page analysis...');
    
    this.pageKnowledge = {
      // Get all interactive elements with detailed info
      allButtons: this.getAllInteractiveElements('button, input[type="submit"], input[type="button"], [role="button"]'),
      allLinks: this.getAllInteractiveElements('a[href]'),
      allInputs: this.getAllInteractiveElements('input, textarea, select'),
      allClickable: this.getAllInteractiveElements('[onclick], .clickable, button, a'),
      
      // Navigation and structure
      navigation: this.getNavigationElements(),
      headings: this.getStructuralElements('h1, h2, h3, h4, h5, h6'),
      sections: this.getStructuralElements('section, article, main, aside, nav, header, footer'),
      
      // Forms and interactions
      forms: this.getFormAnalysis(),
      
      // Visual elements
      images: this.getVisualElements(),
      
      // Page metadata
      metadata: this.getPageMetadata(),
      
      // Current viewport
      viewport: this.getViewportAnalysis()
    };
    
    console.log('📊 Deep analysis complete:', this.pageKnowledge);
  }

  getAllInteractiveElements(selector) {
    return Array.from(document.querySelectorAll(selector)).map((el, index) => {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0;
      
      return {
        index,
        element: el,
        tag: el.tagName.toLowerCase(),
        id: el.id,
        classes: el.className,
        text: (el.textContent || el.value || el.getAttribute('aria-label') || '').trim(),
        href: el.href,
        type: el.type,
        name: el.name,
        placeholder: el.placeholder,
        ariaLabel: el.getAttribute('aria-label'),
        title: el.title,
        visible: isVisible,
        position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        // Generate smart selectors
        selectors: this.generateSmartSelectors(el)
      };
    }).filter(item => item.visible && item.text.length > 0);
  }

  generateSmartSelectors(element) {
    const selectors = [];
    
    // ID selector
    if (element.id) {
      selectors.push(`#${element.id}`);
    }
    
    // Text-based selectors
    const text = element.textContent?.trim();
    if (text) {
      selectors.push(`text:"${text}"`);
      selectors.push(`contains:"${text.toLowerCase()}"`);
    }
    
    // Attribute selectors
    if (element.getAttribute('aria-label')) {
      selectors.push(`aria:"${element.getAttribute('aria-label')}"`);
    }
    
    if (element.placeholder) {
      selectors.push(`placeholder:"${element.placeholder}"`);
    }
    
    // Class-based selector
    if (element.className) {
      selectors.push(`.${element.className.split(' ')[0]}`);
    }
    
    return selectors;
  }

  getNavigationElements() {
    const navElements = Array.from(document.querySelectorAll('nav, .nav, .navigation, .menu, header a'));
    return navElements.map(nav => ({
      text: nav.textContent?.trim(),
      href: nav.href,
      element: nav
    })).filter(item => item.text);
  }

  startIntelligentPageMonitoring() {
    // Monitor for dynamic page changes
    const observer = new MutationObserver((mutations) => {
      let significantChange = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          significantChange = true;
        }
      });
      
      if (significantChange) {
        console.log('📄 Page structure changed, updating analysis...');
        setTimeout(() => this.performDeepPageAnalysis(), 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Monitor URL changes
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        console.log('🔗 URL changed, updating analysis...');
        lastUrl = location.href;
        setTimeout(() => this.performDeepPageAnalysis(), 1000);
      }
    }, 1000);
  }

  startContinuousAnalysis() {
    // Perform initial analysis
    setTimeout(() => this.performDeepPageAnalysis(), 2000);
    
    // Refresh analysis periodically
    setInterval(() => {
      if (!this.isAnalyzing) {
        this.performDeepPageAnalysis();
      }
    }, 30000); // Every 30 seconds
  }

  updateStatusIndicator() {
    const indicators = document.querySelectorAll('.aiwatch-status-indicator');
    indicators.forEach(indicator => {
      if (this.isAnalyzing) {
        indicator.className = 'aiwatch-status-indicator analyzing';
      } else {
        indicator.className = 'aiwatch-status-indicator ready';
      }
    });
  }

  async sendAgenticMessage(message) {
    // Add user message with enhanced display
    const userMessage = {
      type: 'question',
      content: message,
      timestamp: new Date()
    };
    this.messages.push(userMessage);

    // Expand interface and show processing
    this.isExpanded = true;
    this.isTyping = true;
    this.chatBox.className = 'aiwatch-chat-box aiwatch-chat-expanded';
    this.renderExpandedView(this.chatBox);

    try {
      // Send with comprehensive page knowledge
      const response = await this.sendViaRestAPI(message, {
        ...this.currentContext,
        pageKnowledge: this.pageKnowledge,
        isAgenticMode: true
      });
      
      this.handleAgenticResponse(response);
    } catch (error) {
      console.error('AIWatch: Error in agentic communication:', error);
      this.handleError('I encountered an issue analyzing the page. Let me try again.');
    }
  }

  async sendViaRestAPI(message, context = null) {
    const response = await fetch(`${this.apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        context: context || this.currentContext
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  handleAgenticResponse(data) {
    this.isTyping = false;
    
    const responseText = data.response || data.content || 'I received your message!';
    
    // Extract and execute action commands with intelligence
    const actionCommands = this.extractActionCommands(responseText);
    
    if (actionCommands.length > 0) {
      // Execute actions with agentic intelligence
      this.executeAgenticActions(actionCommands);
    }
    
    // Clean response and add to messages
    const cleanedResponse = this.removeActionCommands(responseText);
    
    const response = {
      type: 'answer',
      content: cleanedResponse,
      timestamp: new Date(),
      actions: actionCommands.length > 0 ? actionCommands : undefined
    };

    this.messages.push(response);
    this.renderExpandedView(this.chatBox);
  }

  async executeAgenticActions(actionCommands) {
    for (const action of actionCommands) {
      console.log('🎯 Executing agentic action:', action);
      
      // Use intelligent element finding with page knowledge
      const targetElement = await this.findElementWithIntelligence(action.target);
      
      if (targetElement) {
        switch (action.type.toLowerCase()) {
          case 'click':
            this.agenticClick(targetElement);
            break;
          case 'fill':
          case 'type':
            this.agenticFill(targetElement, action.value);
            break;
          case 'scroll':
            this.agenticScroll(targetElement);
            break;
          case 'highlight':
            this.agenticHighlight(targetElement);
            break;
        }
      } else {
        this.showActionFeedback(`🤖 Could not intelligently locate: "${action.target}"`, 'error');
      }
      
      // Wait between actions
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  async findElementWithIntelligence(target) {
    console.log('🧠 Using AI to find element:', target);
    
    // Search through our comprehensive page knowledge
    const allElements = [
      ...this.pageKnowledge.allButtons || [],
      ...this.pageKnowledge.allLinks || [],
      ...this.pageKnowledge.allInputs || [],
      ...this.pageKnowledge.allClickable || []
    ];
    
    // Smart matching algorithm
    for (const elementInfo of allElements) {
      const matchScore = this.calculateMatchScore(target, elementInfo);
      if (matchScore > 0.7) { // High confidence threshold
        console.log('🎯 Found intelligent match:', elementInfo);
        return elementInfo.element;
      }
    }
    
    // Fallback to traditional search
    return this.findElements(target)[0];
  }

  calculateMatchScore(target, elementInfo) {
    let score = 0;
    const targetLower = target.toLowerCase();
    
    // Exact text match
    if (elementInfo.text && elementInfo.text.toLowerCase() === targetLower) {
      score += 1.0;
    }
    
    // Partial text match
    if (elementInfo.text && elementInfo.text.toLowerCase().includes(targetLower)) {
      score += 0.8;
    }
    
    // ID match
    if (elementInfo.id && elementInfo.id.toLowerCase().includes(targetLower)) {
      score += 0.9;
    }
    
    // Aria label match
    if (elementInfo.ariaLabel && elementInfo.ariaLabel.toLowerCase().includes(targetLower)) {
      score += 0.8;
    }
    
    // Placeholder match
    if (elementInfo.placeholder && elementInfo.placeholder.toLowerCase().includes(targetLower)) {
      score += 0.7;
    }
    
    return Math.min(score, 1.0);
  }

  agenticClick(element) {
    console.log('🖱️ Agentic click on:', element);
    
    // Scroll element into view smoothly
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      // Multiple click strategies
      try {
        element.click();
      } catch (e) {
        element.dispatchEvent(new MouseEvent('click', {
          view: window, bubbles: true, cancelable: true
        }));
      }
      
      this.showActionFeedback(`🤖 Intelligently clicked: "${element.textContent?.trim() || element.id || 'element'}"`);
    }, 400);
  }

  agenticFill(element, value) {
    console.log('✍️ Agentic fill:', element, 'with:', value);
    
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      element.focus();
      element.value = '';
      element.value = value;
      
      // Trigger comprehensive events for modern frameworks
      ['input', 'change', 'keyup', 'blur'].forEach(eventType => {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
      
      this.showActionFeedback(`🤖 Intelligently filled: "${element.placeholder || element.name || 'field'}" with "${value}"`);
    }, 400);
  }

  getStructuralElements(selector) {
    return Array.from(document.querySelectorAll(selector)).map(el => ({
      tag: el.tagName.toLowerCase(),
      text: el.textContent?.trim(),
      id: el.id,
      level: el.tagName.match(/h(\d)/)?.[1] || null
    }));
  }

  getFormAnalysis() {
    return Array.from(document.querySelectorAll('form')).map(form => ({
      action: form.action,
      method: form.method,
      inputs: Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        required: input.required
      }))
    }));
  }

  getVisualElements() {
    return Array.from(document.querySelectorAll('img')).slice(0, 5).map(img => ({
      alt: img.alt,
      src: img.src,
      title: img.title
    }));
  }

  getPageMetadata() {
    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      keywords: document.querySelector('meta[name="keywords"]')?.content,
      url: window.location.href,
      domain: window.location.hostname
    };
  }

  getViewportAnalysis() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: window.scrollY,
      scrollX: window.scrollX
    };
  }

  agenticScroll(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.showActionFeedback(`🤖 Scrolled to: "${element.textContent?.trim() || 'element'}"`);
  }

  agenticHighlight(element) {
    element.style.outline = '3px solid #667eea';
    element.style.outlineOffset = '2px';
    element.style.transition = 'outline 0.3s ease';
    
    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }, 3000);
    
    this.showActionFeedback(`🤖 Highlighted: "${element.textContent?.trim() || 'element'}"`);
  }

  // Page interaction capabilities
  executePageAction(action, target, value = '') {
    try {
      switch (action.toLowerCase()) {
        case 'click':
          this.clickElement(target);
          break;
        case 'fill':
        case 'type':
          this.fillElement(target, value);
          break;
        case 'scroll':
          this.scrollToElement(target);
          break;
        case 'highlight':
          this.highlightElement(target);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error executing page action:', error);
    }
  }

  clickElement(selector) {
    const elements = this.findElements(selector);
    if (elements.length > 0) {
      const element = elements[0];
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Wait a moment then click
      setTimeout(() => {
        // Try multiple click methods
        try {
          // Method 1: Regular click
          element.click();
        } catch (e) {
          // Method 2: Dispatch click event
          try {
            element.dispatchEvent(new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
              buttons: 1
            }));
          } catch (e2) {
            // Method 3: Focus and Enter for form elements
            if (element.tagName === 'BUTTON' || element.type === 'submit') {
              element.focus();
              element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            }
          }
        }
        
        this.showActionFeedback(`✅ Clicked: ${element.tagName.toLowerCase()}${element.textContent ? ` "${element.textContent.trim().substring(0, 20)}"` : ''}`);
      }, 300);
      
      return true;
    }
    this.showActionFeedback(`❌ Could not find element to click: "${selector}"`, 'error');
    return false;
  }

  fillElement(selector, value) {
    const elements = this.findElements(selector);
    if (elements.length > 0) {
      const element = elements[0];
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
          // Focus first
          element.focus();
          
          // Clear existing content
          element.value = '';
          
          // Set new value
          element.value = value;
          
          // Trigger events that frameworks expect
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          element.dispatchEvent(new Event('keyup', { bubbles: true }));
          
          // For React/Vue compatibility
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(element, value);
            element.dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          this.showActionFeedback(`✅ Filled ${element.tagName.toLowerCase()}${element.placeholder ? ` "${element.placeholder}"` : ''} with: "${value}"`);
        }, 300);
        
        return true;
      } else {
        this.showActionFeedback(`❌ Element is not fillable: ${element.tagName}`, 'error');
        return false;
      }
    }
    this.showActionFeedback(`❌ Could not find form element: "${selector}"`, 'error');
    return false;
  }

  scrollToElement(selector) {
    const elements = this.findElements(selector);
    if (elements.length > 0) {
      elements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.showActionFeedback(`Scrolled to: ${selector}`);
      return true;
    }
    return false;
  }

  highlightElement(selector) {
    const elements = this.findElements(selector);
    if (elements.length > 0) {
      const element = elements[0];
      element.style.outline = '3px solid #667eea';
      element.style.outlineOffset = '2px';
      setTimeout(() => {
        element.style.outline = '';
        element.style.outlineOffset = '';
      }, 3000);
      this.showActionFeedback(`Highlighted: ${selector}`);
      return true;
    }
    return false;
  }

  findElements(selector) {
    console.log('Looking for elements with selector:', selector);
    
    try {
      let elements = [];
      
      // 1. Try direct CSS selector first
      try {
        elements = Array.from(document.querySelectorAll(selector));
        if (elements.length > 0) {
          console.log('Found by CSS selector:', elements);
          return elements;
        }
      } catch (e) {
        // Invalid CSS selector, continue to other methods
      }

      // 2. Try finding by ID (case-insensitive)
      const byId = document.querySelector(`#${selector}`);
      if (byId) {
        console.log('Found by ID:', byId);
        return [byId];
      }

      // 3. Try finding by name attribute
      elements = Array.from(document.querySelectorAll(`[name="${selector}"]`));
      if (elements.length > 0) {
        console.log('Found by name attribute:', elements);
        return elements;
      }

      // 4. Try finding by placeholder (case-insensitive)
      elements = Array.from(document.querySelectorAll('input, textarea')).filter(el => {
        return el.placeholder && el.placeholder.toLowerCase().includes(selector.toLowerCase());
      });
      if (elements.length > 0) {
        console.log('Found by placeholder:', elements);
        return elements;
      }

      // 5. Try finding by aria-label
      elements = Array.from(document.querySelectorAll('[aria-label]')).filter(el => {
        return el.getAttribute('aria-label') && el.getAttribute('aria-label').toLowerCase().includes(selector.toLowerCase());
      });
      if (elements.length > 0) {
        console.log('Found by aria-label:', elements);
        return elements;
      }

      // 6. Try finding buttons/links by text content (more specific)
      elements = Array.from(document.querySelectorAll('button, a, input[type="submit"], input[type="button"]')).filter(el => {
        const text = (el.textContent || el.value || '').toLowerCase();
        return text.includes(selector.toLowerCase());
      });
      if (elements.length > 0) {
        console.log('Found buttons by text:', elements);
        return elements;
      }

      // 7. Try finding form inputs by associated labels
      const labels = Array.from(document.querySelectorAll('label')).filter(label => {
        return label.textContent && label.textContent.toLowerCase().includes(selector.toLowerCase());
      });
      for (const label of labels) {
        if (label.getAttribute('for')) {
          const input = document.getElementById(label.getAttribute('for'));
          if (input) {
            console.log('Found by label association:', input);
            return [input];
          }
        }
        // Check if input is inside label
        const innerInput = label.querySelector('input, textarea, select');
        if (innerInput) {
          console.log('Found input inside label:', innerInput);
          return [innerInput];
        }
      }

      // 8. Last resort: find by partial text content (limited scope)
      elements = Array.from(document.querySelectorAll('button, a, span, div')).filter(el => {
        return el.textContent && 
               el.textContent.trim().length > 0 && 
               el.textContent.toLowerCase().includes(selector.toLowerCase()) &&
               el.offsetParent !== null; // Only visible elements
      });
      if (elements.length > 0) {
        console.log('Found by text content:', elements.slice(0, 3));
        return elements.slice(0, 3); // Limit results
      }

    } catch (error) {
      console.error('Error finding elements:', error);
    }
    
    console.log('No elements found for selector:', selector);
    return [];
  }

  showActionFeedback(message, type = 'success') {
    // Create temporary feedback message
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: ${type === 'error' ? 'rgba(255, 59, 48, 0.9)' : 'rgba(52, 199, 89, 0.9)'} !important;
      color: white !important;
      padding: 12px 20px !important;
      border-radius: 12px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      backdrop-filter: blur(20px) !important;
      z-index: 2147483647 !important;
      transition: all 0.3s ease !important;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateY(-20px)';
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
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