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

  const favicon = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">📄</text></svg>';

  item.innerHTML = `
    <img src="${favicon}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 16 16&quot;><text y=&quot;14&quot; font-size=&quot;14&quot;>📄</text></svg>'">
    <span class="tab-title" title="${escapeHtml(tab.title)}">${escapeHtml(tab.title)}</span>
    <button class="close-btn" title="Close tab">❌</button>
  `;

  // Click to switch to tab
  item.querySelector('.tab-title').addEventListener('click', async () => {
    await chrome.tabs.update(tab.id, { active: true });
    window.close();
  });

  // Click to close tab
  item.querySelector('.close-btn').addEventListener('click', async (e) => {
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

  // Close tabs (optional - ask user)
  const shouldClose = confirm(`Group saved! Close ${allTabs.length} tabs?`);
  if (shouldClose) {
    await chrome.tabs.remove(allTabs.map(t => t.id));
  }

  await loadSavedGroups();
  showNotification(`Saved ${allTabs.length} tabs`);
}

// Load saved groups
async function loadSavedGroups() {
  const result = await chrome.storage.local.get('savedGroups');
  const savedGroups = result.savedGroups || [];

  const groupCount = savedGroups.length;
  document.getElementById('groupCount').textContent = `${groupCount} saved group${groupCount !== 1 ? 's' : ''}`;

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

    const date = new Date(group.timestamp).toLocaleDateString();

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
  btn.textContent = groupByDomain ? '📋' : '📂';
}

// Show notification
function showNotification(message) {
  // Simple alert for now - can be improved with a custom notification
  console.log(message);
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}