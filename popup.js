// State
let allTabs = [];
let filteredTabs = [];
let groupByDomain = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadTabs();
  await loadSavedGroups();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('closeDuplicatesBtn').addEventListener('click', closeDuplicateTabs);
  document.getElementById('saveAllBtn').addEventListener('click', saveAllTabs);
  document.getElementById('toggleGroupView').addEventListener('click', toggleGroupView);
  document.getElementById('helpBtn').addEventListener('click', showHelpDialog);
  document.getElementById('settingsBtn').addEventListener('click', () => {
    showNotification('Settings coming in Phase 2!', 'info');
  });

  // Tab navigation
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
}

// Switch between tabs
function switchTab(tabName) {
  // Update buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    if ((tabName === 'current' && panel.id === 'currentTabsPanel') ||
        (tabName === 'saved' && panel.id === 'savedGroupsPanel')) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}

// Load all tabs
async function loadTabs() {
  try {
    allTabs = await chrome.tabs.query({ currentWindow: true });
    filteredTabs = [...allTabs];
    updateStats();
    renderTabs();
  } catch (error) {
    console.error('Error loading tabs:', error);
  }
}

// Update stats
function updateStats() {
  const tabCount = allTabs.length;
  document.getElementById('tabCount').textContent = `${tabCount} tab${tabCount !== 1 ? 's' : ''}`;

  // Update tab count badges
  document.getElementById('currentTabCount').textContent = tabCount;
}

// Render tabs
function renderTabs() {
  const tabList = document.getElementById('tabList');
  tabList.innerHTML = '';

  if (filteredTabs.length === 0) {
    tabList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">No tabs found</div>
      </div>
    `;
    return;
  }

  if (groupByDomain) {
    renderGroupedTabs(tabList);
  } else {
    renderFlatTabs(tabList);
  }
}

// Render flat tab list
function renderFlatTabs(container) {
  filteredTabs.forEach(tab => {
    const tabItem = createTabItem(tab);
    container.appendChild(tabItem);
  });
}

// Render grouped by domain
function renderGroupedTabs(container) {
  const grouped = groupTabsByDomain(filteredTabs);

  Object.entries(grouped).forEach(([domain, tabs]) => {
    const domainGroup = document.createElement('div');
    domainGroup.className = 'domain-group';

    const domainHeader = document.createElement('div');
    domainHeader.className = 'domain-header';
    domainHeader.innerHTML = `
      <span>📂 ${domain}</span>
      <span class="domain-count">${tabs.length}</span>
    `;

    const domainTabs = document.createElement('div');
    domainTabs.className = 'domain-tabs';

    tabs.forEach(tab => {
      const tabItem = createTabItem(tab);
      domainTabs.appendChild(tabItem);
    });

    domainHeader.addEventListener('click', () => {
      domainTabs.style.display = domainTabs.style.display === 'none' ? 'block' : 'none';
    });

    domainGroup.appendChild(domainHeader);
    domainGroup.appendChild(domainTabs);
    container.appendChild(domainGroup);
  });
}

// Create tab item element
function createTabItem(tab) {
  const item = document.createElement('div');
  item.className = 'tab-item';

  // Create favicon image
  const img = document.createElement('img');
  img.width = 16;
  img.height = 16;

  if (tab.favIconUrl && tab.favIconUrl.startsWith('http')) {
    img.src = tab.favIconUrl;
    img.onerror = () => {
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ctext y="14" font-size="14"%3E📄%3C/text%3E%3C/svg%3E';
    };
  } else {
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ctext y="14" font-size="14"%3E📄%3C/text%3E%3C/svg%3E';
  }

  const title = document.createElement('span');
  title.className = 'tab-title';
  title.textContent = tab.title;
  title.title = tab.title;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.title = 'Close tab';
  closeBtn.textContent = '❌';

  item.appendChild(img);
  item.appendChild(title);
  item.appendChild(closeBtn);

  // Click to switch to tab
  title.addEventListener('click', async () => {
    await chrome.tabs.update(tab.id, { active: true });
    window.close();
  });

  // Click to close tab
  closeBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await chrome.tabs.remove(tab.id);
    await loadTabs();
  });

  return item;
}

// Group tabs by domain
function groupTabsByDomain(tabs) {
  const grouped = {};

  tabs.forEach(tab => {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname || 'Other';

      if (!grouped[domain]) {
        grouped[domain] = [];
      }
      grouped[domain].push(tab);
    } catch (error) {
      if (!grouped['Other']) {
        grouped['Other'] = [];
      }
      grouped['Other'].push(tab);
    }
  });

  return grouped;
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();

  if (!query) {
    filteredTabs = [...allTabs];
  } else {
    filteredTabs = allTabs.filter(tab =>
      tab.title.toLowerCase().includes(query) ||
      tab.url.toLowerCase().includes(query)
    );
  }

  renderTabs();
}

// Close duplicate tabs
async function closeDuplicateTabs() {
  const urlMap = new Map();
  const duplicates = [];

  allTabs.forEach(tab => {
    if (urlMap.has(tab.url)) {
      duplicates.push(tab.id);
    } else {
      urlMap.set(tab.url, tab.id);
    }
  });

  if (duplicates.length > 0) {
    await chrome.tabs.remove(duplicates);
    await loadTabs();
    showNotification(`Closed ${duplicates.length} duplicate tab${duplicates.length !== 1 ? 's' : ''}`);
  } else {
    showNotification('No duplicate tabs found');
  }
}

// Save all tabs
async function saveAllTabs() {
  const groupName = prompt('Enter a name for this tab group:');

  if (!groupName) return;

  const tabGroup = {
    id: Date.now().toString(),
    name: groupName,
    timestamp: Date.now(),
    tabs: allTabs.map(tab => ({
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl
    }))
  };

  // Save to storage
  const result = await chrome.storage.local.get('savedGroups');
  const savedGroups = result.savedGroups || [];
  savedGroups.unshift(tabGroup);

  await chrome.storage.local.set({ savedGroups });

  // Show custom dialog for closing tabs
  showCloseTabsDialog(tabGroup.tabs);

  await loadSavedGroups();
  showNotification(`Saved ${allTabs.length} tabs`, 'success');
}

// Show custom dialog for closing tabs
function showCloseTabsDialog(savedTabs) {
  const tabCount = savedTabs.length;
  const dialog = document.createElement('div');
  dialog.className = 'custom-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay"></div>
    <div class="dialog-content">
      <h3>Group Saved!</h3>
      <p>What would you like to do with the ${tabCount} tab${tabCount !== 1 ? 's' : ''}?</p>
      <div class="dialog-actions">
        <button class="dialog-btn secondary" id="keepTabsBtn">
          <span>Keep Open</span>
          <span class="btn-hint">Continue browsing</span>
        </button>
        <button class="dialog-btn primary" id="closeTabsBtn">
          <span>Close Tabs</span>
          <span class="btn-hint">Free up memory</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // Keep tabs open
  document.getElementById('keepTabsBtn').addEventListener('click', () => {
    document.body.removeChild(dialog);
  });

  // Close tabs
  document.getElementById('closeTabsBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Disable buttons to prevent double clicks
    const closeBtn = document.getElementById('closeTabsBtn');
    const keepBtn = document.getElementById('keepTabsBtn');
    closeBtn.disabled = true;
    keepBtn.disabled = true;

    const closeBtnContent = closeBtn.innerHTML;
    closeBtn.innerHTML = '<span>Closing...</span>';

    try {
      // Get all info we need
      const savedUrls = new Set(savedTabs.map(t => t.url));
      const currentTabs = await chrome.tabs.query({ currentWindow: true });
      const tabsToClose = currentTabs.filter(tab => !tab.pinned && savedUrls.has(tab.url));
      const tabIdsToClose = tabsToClose.map(t => t.id);
      const currentNonPinnedTabs = currentTabs.filter(tab => !tab.pinned);

      // If we're about to close all tabs, create a new one first
      if (tabIdsToClose.length >= currentNonPinnedTabs.length) {
        await chrome.tabs.create({ url: 'chrome://newtab', active: false });
        // Wait for new tab to be fully created
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Close the tabs
      if (tabIdsToClose.length > 0) {
        await chrome.tabs.remove(tabIdsToClose);
      }

      // Success! Now close dialog
      document.body.removeChild(dialog);
      showNotification(`Closed ${tabIdsToClose.length} tabs`, 'info');

    } catch (error) {
      console.error('Error closing tabs:', error);
      showNotification('Error: ' + error.message, 'error');
      closeBtn.disabled = false;
      keepBtn.disabled = false;
      closeBtn.innerHTML = '<span>Close Tabs</span><span class="btn-hint">Free up memory</span>';
    }
  });

  // Click overlay to dismiss (keep tabs)
  dialog.querySelector('.dialog-overlay').addEventListener('click', () => {
    document.body.removeChild(dialog);
  });
}

// Load saved groups
async function loadSavedGroups() {
  const result = await chrome.storage.local.get('savedGroups');
  const savedGroups = result.savedGroups || [];

  const groupCount = savedGroups.length;
  document.getElementById('groupCount').textContent = `${groupCount} saved group${groupCount !== 1 ? 's' : ''}`;

  // Update saved groups count badge
  document.getElementById('savedGroupCount').textContent = groupCount;

  renderSavedGroups(savedGroups);
}

// Render saved groups
function renderSavedGroups(groups) {
  const container = document.getElementById('savedGroups');
  container.innerHTML = '';

  if (groups.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💾</div>
        <div class="empty-state-text">No saved groups yet</div>
      </div>
    `;
    return;
  }

  groups.forEach(group => {
    const groupItem = document.createElement('div');
    groupItem.className = 'group-item';

    // Format date as YYYY/MM/DD
    const dateObj = new Date(group.timestamp);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const date = `${year}/${month}/${day}`;

    groupItem.innerHTML = `
      <div class="group-header">
        <div class="group-name">${escapeHtml(group.name)}</div>
        <div class="group-actions">
          <button class="icon-btn restore-btn" title="Restore tabs">↩️</button>
          <button class="icon-btn delete-btn" title="Delete group">🗑️</button>
        </div>
      </div>
      <div class="group-info">
        <span class="group-date">${date}</span>
        <span>${group.tabs.length} tabs</span>
      </div>
    `;

    // Restore group
    groupItem.querySelector('.restore-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      await restoreGroup(group);
    });

    // Delete group
    groupItem.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteGroup(group.id);
    });

    container.appendChild(groupItem);
  });
}

// Restore group
async function restoreGroup(group) {
  for (const tab of group.tabs) {
    await chrome.tabs.create({ url: tab.url, active: false });
  }
  showNotification(`Restored ${group.tabs.length} tabs`);
  window.close();
}

// Delete group
async function deleteGroup(groupId) {
  if (!confirm('Delete this group?')) return;

  const result = await chrome.storage.local.get('savedGroups');
  const savedGroups = result.savedGroups || [];
  const filtered = savedGroups.filter(g => g.id !== groupId);

  await chrome.storage.local.set({ savedGroups: filtered });
  await loadSavedGroups();
  showNotification('Group deleted');
}

// Toggle group view
function toggleGroupView() {
  groupByDomain = !groupByDomain;
  renderTabs();

  const btn = document.getElementById('toggleGroupView');
  const icon = btn.querySelector('.toggle-icon');
  const text = btn.querySelector('.toggle-text');

  if (groupByDomain) {
    icon.textContent = '📂';
    text.textContent = 'Grouped';
    btn.classList.add('grouped');
    btn.title = 'Switch to list view';
  } else {
    icon.textContent = '📋';
    text.textContent = 'List View';
    btn.classList.remove('grouped');
    btn.title = 'Switch to grouped view';
  }
}

// Show notification
function showNotification(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Show help dialog
function showHelpDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'custom-dialog help-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay"></div>
    <div class="dialog-content help-content">
      <h3>✨ TabTidy Features</h3>

      <div class="help-section">
        <h4>📋 Current Tabs</h4>
        <ul>
          <li><strong>Search:</strong> Quickly find tabs by title or URL</li>
          <li><strong>Click tab:</strong> Switch to that tab</li>
          <li><strong>❌ button:</strong> Close individual tab</li>
          <li><strong>List/Grouped View:</strong> Toggle between flat and domain-grouped view</li>
        </ul>
      </div>

      <div class="help-section">
        <h4>💾 Saved Groups</h4>
        <ul>
          <li><strong>Save All:</strong> Save all current tabs as a named group</li>
          <li><strong>Restore:</strong> Click ↩️ to bring back saved tabs</li>
          <li><strong>Delete:</strong> Click 🗑️ to remove a group</li>
          <li><strong>Choose:</strong> Keep tabs open or close them after saving</li>
        </ul>
      </div>

      <div class="help-section">
        <h4>🧹 Quick Actions</h4>
        <ul>
          <li><strong>Close Duplicates:</strong> Remove tabs with same URL</li>
          <li><strong>Tab Count:</strong> See number badges on each tab</li>
        </ul>
      </div>

      <div class="help-footer">
        <p>💡 <strong>Tip:</strong> TabTidy stores all data locally - your tabs never leave your device!</p>
      </div>

      <button class="dialog-btn primary full-width" id="closeHelpBtn">
        Got it!
      </button>
    </div>
  `;

  document.body.appendChild(dialog);

  // Close dialog
  const closeDialog = () => document.body.removeChild(dialog);
  document.getElementById('closeHelpBtn').addEventListener('click', closeDialog);
  dialog.querySelector('.dialog-overlay').addEventListener('click', closeDialog);
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}