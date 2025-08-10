// AIWatch Background Service Worker

// Installation and update handling
chrome.runtime.onInstalled.addListener((details) => {
  console.log('AIWatch extension installed/updated');
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      apiUrl: 'https://aiwatch-nmtyvwy63-qaisers-projects-e9dbc08b.vercel.app/api'
    });
    
    console.log('AIWatch: Extension installed successfully');
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getSettings':
      chrome.storage.sync.get(['enabled', 'apiUrl'], (result) => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
      
    case 'updateSettings':
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ success: true });
      });
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Simple badge management
chrome.action.setBadgeText({
  text: '●'
});

chrome.action.setBadgeBackgroundColor({
  color: '#10B981'
});

console.log('AIWatch: Background service worker loaded');