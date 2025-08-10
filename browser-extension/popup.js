// AIWatch Popup Script

class AIWatchPopup {
  constructor() {
    this.init();
  }

  async init() {
    // Load settings and update UI
    await this.loadSettings();
    
    // Check backend status
    this.checkBackendStatus();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Periodic status check
    setInterval(() => this.checkBackendStatus(), 10000);
  }

  async loadSettings() {
    const settings = await new Promise(resolve => {
      chrome.storage.sync.get(['enabled', 'globalEnabled'], (result) => {
        resolve({
          enabled: result.enabled !== false, // Default to true
          globalEnabled: result.globalEnabled !== false // Default to true
        });
      });
    });

    document.getElementById('enabledToggle').checked = settings.enabled;
    document.getElementById('globalToggle').checked = settings.globalEnabled;
  }

  setupEventListeners() {
    // Settings toggles
    document.getElementById('enabledToggle').addEventListener('change', (e) => {
      this.updateSetting('enabled', e.target.checked);
    });

    document.getElementById('globalToggle').addEventListener('change', (e) => {
      this.updateSetting('globalEnabled', e.target.checked);
    });

    // Quick actions
    document.getElementById('focusChat').addEventListener('click', () => {
      this.focusChat();
    });

    document.getElementById('analyzePage').addEventListener('click', () => {
      this.analyzePage();
    });

    document.getElementById('getSuggestions').addEventListener('click', () => {
      this.getSuggestions();
    });

    document.getElementById('helpLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });
  }

  async updateSetting(key, value) {
    const settings = {};
    settings[key] = value;
    
    await new Promise(resolve => {
      chrome.storage.sync.set(settings, resolve);
    });

    // Notify content scripts of setting change
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'settingsUpdated',
          settings: settings
        }).catch(() => {
          // Ignore errors if content script not loaded
        });
      }
    });
  }

  async checkBackendStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    try {
      // Check Node.js API
      const nodeResponse = await fetch('http://localhost:8000/health', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });

      // Check Python AI service
      const pythonResponse = await fetch('http://localhost:8001/health', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });

      if (nodeResponse.ok && pythonResponse.ok) {
        statusDot.className = 'status-dot';
        statusText.textContent = 'Services online';
      } else {
        statusDot.className = 'status-dot error';
        statusText.textContent = 'Services partially offline';
      }
    } catch (error) {
      statusDot.className = 'status-dot error';
      statusText.textContent = 'Services offline';
    }
  }

  async focusChat() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'focusChat'
    }).catch(() => {
      // If content script not loaded, inject it
      this.injectContentScript(tab.id);
    });

    window.close();
  }

  async analyzePage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyzePage'
    }).catch(() => {
      // If content script not loaded, inject it
      this.injectContentScript(tab.id);
    });

    window.close();
  }

  async getSuggestions() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'getSuggestions'
    }).catch(() => {
      // If content script not loaded, inject it
      this.injectContentScript(tab.id);
    });

    window.close();
  }

  async injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });

      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      });

      // Wait a moment then try the action again
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: 'focusChat' });
      }, 1000);
    } catch (error) {
      console.error('Failed to inject content script:', error);
    }
  }

  openHelp() {
    chrome.tabs.create({
      url: 'https://github.com/iamqaisermalik/aiwatch#readme'
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AIWatchPopup();
});