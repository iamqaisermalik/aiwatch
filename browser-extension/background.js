// AIWatch Background Service Worker

// Installation and update handling
chrome.runtime.onInstalled.addListener((details) => {
  console.log('AIWatch extension installed/updated');
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      apiUrl: 'http://localhost:8000',
      pythonAiUrl: 'http://localhost:8001'
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getSettings':
      chrome.storage.sync.get(['enabled', 'apiUrl', 'pythonAiUrl'], (result) => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
      
    case 'updateSettings':
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'analyzeContext':
      handleContextAnalysis(request.data, sendResponse);
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Context analysis handler
async function handleContextAnalysis(contextData, sendResponse) {
  try {
    const settings = await new Promise(resolve => {
      chrome.storage.sync.get(['pythonAiUrl'], resolve);
    });
    
    const response = await fetch(`${settings.pythonAiUrl}/context/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: contextData.url,
        page_content: contextData.content,
        user_intent: contextData.userIntent
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      sendResponse({ success: true, data: result });
    } else {
      sendResponse({ success: false, error: 'Failed to analyze context' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Tab update listener - for context monitoring
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Inject content script if needed (for dynamic pages)
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        if (!window.aiwatchInitialized) {
          console.log('Re-initializing AIWatch on page update');
        }
      }
    }).catch(() => {
      // Ignore errors (e.g., on chrome:// pages)
    });
  }
});

// Badge management
function updateBadge(tabId, status = 'active') {
  chrome.action.setBadgeText({
    text: status === 'active' ? '●' : '',
    tabId: tabId
  });
  
  chrome.action.setBadgeBackgroundColor({
    color: status === 'active' ? '#10B981' : '#EF4444'
  });
}

// Monitor connection status
let connectionStatus = 'checking';

async function checkBackendStatus() {
  try {
    const settings = await new Promise(resolve => {
      chrome.storage.sync.get(['apiUrl', 'pythonAiUrl'], resolve);
    });
    
    // Check Node.js API
    const nodeResponse = await fetch(`${settings.apiUrl}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    // Check Python AI service
    const pythonResponse = await fetch(`${settings.pythonAiUrl}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (nodeResponse.ok && pythonResponse.ok) {
      connectionStatus = 'active';
    } else {
      connectionStatus = 'error';
    }
  } catch (error) {
    connectionStatus = 'error';
    console.warn('AIWatch: Backend services not available');
  }
  
  // Update badge for all tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => updateBadge(tab.id, connectionStatus));
  });
}

// Check backend status periodically
checkBackendStatus();
setInterval(checkBackendStatus, 30000); // Every 30 seconds

// Context menu integration (optional enhancement)
chrome.contextMenus.create({
  id: 'aiwatch-analyze',
  title: 'Ask AIWatch about this',
  contexts: ['selection', 'page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'aiwatch-analyze') {
    // Send message to content script to focus on input with selected text
    chrome.tabs.sendMessage(tab.id, {
      action: 'focusWithText',
      text: info.selectionText || 'Tell me about this page'
    });
  }
});