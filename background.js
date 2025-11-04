// Background service worker for TabTidy

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('TabTidy installed');

  // Initialize storage
  chrome.storage.local.get('savedGroups', (result) => {
    if (!result.savedGroups) {
      chrome.storage.local.set({ savedGroups: [] });
    }
  });
});

// Listen for messages from popup (for future features)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Future message handlers can be added here
});

// Track tab activity for future features (inactive tab detection)
const tabActivity = new Map();

chrome.tabs.onActivated.addListener(({ tabId }) => {
  tabActivity.set(tabId, Date.now());
});

chrome.tabs.onUpdated.addListener((tabId) => {
  tabActivity.set(tabId, Date.now());
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabActivity.delete(tabId);
});

// Optional: Add keyboard shortcut support
chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-all-tabs') {
    // This would require implementing a way to trigger saveAllTabs from background
    console.log('Save all tabs shortcut triggered');
  }
});