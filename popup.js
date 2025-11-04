// State
let allTabs = [];
let filteredTabs = [];
let groupByDomain = false;
let selectMode = false;
let selectedGroups = new Set();
let tabSelectMode = false;
let selectedTabs = new Set();

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

  // Bulk actions for saved groups
  document.getElementById('toggleSelectMode').addEventListener('click', toggleSelectMode);
  document.getElementById('selectAllGroupsBtn').addEventListener('click', selectAllGroups);
  document.getElementById('restoreSelectedBtn').addEventListener('click', restoreSelectedGroups);
  document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelectedGroups);

  // Bulk actions for current tabs
  document.getElementById('toggleTabSelectMode').addEventListener('click', toggleTabSelectMode);
  document.getElementById('selectAllTabsBtn').addEventListener('click', selectAllTabs);
  document.getElementById('saveSelectedTabsBtn').addEventListener('click', saveSelectedTabs);
  document.getElementById('closeSelectedTabsBtn').addEventListener('click', closeSelectedTabs);
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
  item.dataset.tabId = tab.id;

  // Add select mode class if active
  if (tabSelectMode) {
    item.classList.add('select-mode');
  }

  // Check if selected
  if (selectedTabs.has(tab.id)) {
    item.classList.add('selected');
  }

  // Create checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'tab-checkbox';
  checkbox.checked = selectedTabs.has(tab.id);

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

  item.appendChild(checkbox);
  item.appendChild(img);
  item.appendChild(title);
  item.appendChild(closeBtn);

  // Click item to toggle selection in select mode or switch tab
  item.addEventListener('click', async (e) => {
    if (tabSelectMode) {
      // Don't toggle if clicking close button
      if (!e.target.closest('.close-btn')) {
        toggleTabSelection(tab.id);
      }
    } else {
      // Normal mode - switch to tab (only if clicking title or image)
      if (e.target === title || e.target === img) {
        await chrome.tabs.update(tab.id, { active: true });
        window.close();
      }
    }
  });

  // Click to close tab (only in non-select mode)
  closeBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!tabSelectMode) {
      await chrome.tabs.remove(tab.id);
      await loadTabs();
    }
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

  showLoading('Saving tabs...');

  try {
    // Check for duplicate name
    const result = await chrome.storage.local.get('savedGroups');
    const savedGroups = result.savedGroups || [];
    const existingGroup = savedGroups.find(g => g.name.toLowerCase() === groupName.toLowerCase());

    if (existingGroup) {
      hideLoading();
      const overwrite = confirm(`A group named "${groupName}" already exists. Do you want to overwrite it?`);
      if (!overwrite) {
        // Ask for new name
        saveAllTabs();
        return;
      }
      showLoading('Saving tabs...');
      // Remove existing group
      const filteredGroups = savedGroups.filter(g => g.id !== existingGroup.id);
      await chrome.storage.local.set({ savedGroups: filteredGroups });
    }

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
    const updatedGroups = await chrome.storage.local.get('savedGroups');
    const groups = updatedGroups.savedGroups || [];
    groups.unshift(tabGroup);

    await chrome.storage.local.set({ savedGroups: groups });

    hideLoading();

    // Show custom dialog for closing tabs
    showCloseTabsDialog(tabGroup.tabs);

    await loadSavedGroups();
    showNotification(`Saved ${allTabs.length} tabs`, 'success');
  } catch (error) {
    hideLoading();
    showNotification('Error saving tabs', 'error');
    console.error('Error saving tabs:', error);
  }
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
    groupItem.dataset.groupId = group.id;

    // Add select mode class if active
    if (selectMode) {
      groupItem.classList.add('select-mode');
    }

    // Check if selected
    if (selectedGroups.has(group.id)) {
      groupItem.classList.add('selected');
    }

    // Format date as YYYY/MM/DD
    const dateObj = new Date(group.timestamp);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const date = `${year}/${month}/${day}`;

    groupItem.innerHTML = `
      <input type="checkbox" class="group-checkbox" ${selectedGroups.has(group.id) ? 'checked' : ''}>
      <div class="group-header">
        <div class="group-info-wrapper">
          <div class="group-name">${escapeHtml(group.name)}</div>
          <div class="group-info">
            <span class="group-date">${date}</span>
            <span>${group.tabs.length} tabs</span>
          </div>
        </div>
        <div class="group-actions">
          <button class="icon-btn expand-btn" title="Show tabs">▼</button>
          <button class="icon-btn restore-btn" title="Restore tabs">↩️</button>
          <button class="icon-btn delete-btn" title="Delete group">🗑️</button>
        </div>
      </div>
      <div class="group-tabs-preview" style="display: none;"></div>
    `;

    // Create tabs preview list
    const tabsPreview = groupItem.querySelector('.group-tabs-preview');
    group.tabs.forEach((tab, index) => {
      const tabPreviewItem = document.createElement('div');
      tabPreviewItem.className = 'tab-preview-item';

      const favicon = document.createElement('img');
      favicon.width = 14;
      favicon.height = 14;
      favicon.className = 'tab-preview-favicon';
      if (tab.favIconUrl && tab.favIconUrl.startsWith('http')) {
        favicon.src = tab.favIconUrl;
        favicon.onerror = () => {
          favicon.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ctext y="14" font-size="14"%3E📄%3C/text%3E%3C/svg%3E';
        };
      } else {
        favicon.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ctext y="14" font-size="14"%3E📄%3C/text%3E%3C/svg%3E';
      }

      const tabTitle = document.createElement('span');
      tabTitle.className = 'tab-preview-title';
      tabTitle.textContent = tab.title;
      tabTitle.title = tab.url;

      // Add delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'tab-preview-delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.title = 'Remove from group';

      tabPreviewItem.appendChild(favicon);
      tabPreviewItem.appendChild(tabTitle);
      tabPreviewItem.appendChild(deleteBtn);

      // Add click handler to restore individual tab
      tabPreviewItem.addEventListener('click', async (e) => {
        // Don't trigger if clicking delete button
        if (e.target === deleteBtn) return;

        e.stopPropagation();
        try {
          // Create and switch to the tab
          const newTab = await chrome.tabs.create({ url: tab.url, active: true });
          showNotification(`Opened: ${tab.title}`, 'success');
          // Close popup after opening tab
          window.close();
        } catch (error) {
          showNotification('Error opening tab', 'error');
          console.error('Error opening tab:', error);
        }
      });

      // Delete button handler
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          // Remove this tab from the group
          const result = await chrome.storage.local.get('savedGroups');
          const savedGroups = result.savedGroups || [];
          const groupToUpdate = savedGroups.find(g => g.id === group.id);

          if (groupToUpdate) {
            // Remove the tab at this index
            groupToUpdate.tabs.splice(index, 1);

            // If no tabs left, delete the entire group
            if (groupToUpdate.tabs.length === 0) {
              const filtered = savedGroups.filter(g => g.id !== group.id);
              await chrome.storage.local.set({ savedGroups: filtered });
              showNotification('Group deleted (no tabs remaining)', 'info');
            } else {
              // Update the group
              await chrome.storage.local.set({ savedGroups: savedGroups });
              showNotification('Tab removed from group', 'success');
            }

            // Reload the saved groups
            await loadSavedGroups();
          }
        } catch (error) {
          showNotification('Error removing tab', 'error');
          console.error('Error removing tab:', error);
        }
      });

      tabsPreview.appendChild(tabPreviewItem);
    });

    // Checkbox toggle - don't stop propagation so click bubbles up
    const checkbox = groupItem.querySelector('.group-checkbox');
    checkbox.addEventListener('click', (e) => {
      // Let it bubble to groupItem click handler
    });

    // Expand/collapse tabs preview
    const expandBtn = groupItem.querySelector('.expand-btn');
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = tabsPreview.style.display === 'block';
      tabsPreview.style.display = isExpanded ? 'none' : 'block';
      expandBtn.textContent = isExpanded ? '▼' : '▲';
      expandBtn.title = isExpanded ? 'Show tabs' : 'Hide tabs';
    });

    // Click group header to expand/collapse
    const groupHeader = groupItem.querySelector('.group-header');
    groupHeader.addEventListener('click', (e) => {
      if (selectMode) {
        // In select mode, toggle selection (except when clicking action buttons)
        if (!e.target.closest('.group-actions')) {
          toggleGroupSelection(group.id);
        }
      } else {
        // In normal mode, toggle expand/collapse (except when clicking action buttons)
        if (!e.target.closest('.group-actions')) {
          const isExpanded = tabsPreview.style.display === 'block';
          tabsPreview.style.display = isExpanded ? 'none' : 'block';
          expandBtn.textContent = isExpanded ? '▼' : '▲';
          expandBtn.title = isExpanded ? 'Show tabs' : 'Hide tabs';
        }
      }
    });

    // Restore group (only in non-select mode)
    groupItem.querySelector('.restore-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!selectMode) {
        await restoreGroup(group);
      }
    });

    // Delete group (only in non-select mode)
    groupItem.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!selectMode) {
        await deleteGroup(group.id);
      }
    });

    container.appendChild(groupItem);
  });
}

// Restore group
async function restoreGroup(group) {
  showLoading('Restoring tabs...');

  for (const tab of group.tabs) {
    await chrome.tabs.create({ url: tab.url, active: false });
  }

  hideLoading();
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

// Show loading spinner
function showLoading(text = 'Loading...') {
  const spinner = document.getElementById('loadingSpinner');
  const loadingText = spinner.querySelector('.loading-text');
  loadingText.textContent = text;
  spinner.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'none';
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

// Toggle select mode for saved groups
function toggleSelectMode() {
  selectMode = !selectMode;

  const btn = document.getElementById('toggleSelectMode');
  const icon = btn.querySelector('.toggle-icon');
  const text = btn.querySelector('.toggle-text');
  const bulkActions = document.getElementById('bulkActions');
  const selectAllBtn = document.getElementById('selectAllGroupsBtn');

  if (selectMode) {
    icon.textContent = '✖️';
    text.textContent = 'Cancel';
    btn.classList.add('grouped');
    btn.title = 'Exit selection mode';
    bulkActions.style.display = 'flex';
  } else {
    icon.textContent = '☑️';
    text.textContent = 'Select';
    btn.classList.remove('grouped');
    btn.title = 'Select multiple groups';
    bulkActions.style.display = 'none';
    // Clear selections when exiting
    selectedGroups.clear();
    selectAllBtn.textContent = 'Select All';
  }

  // Re-render groups to show/hide checkboxes
  loadSavedGroups();
}

// Toggle group selection
function toggleGroupSelection(groupId) {
  if (selectedGroups.has(groupId)) {
    selectedGroups.delete(groupId);
  } else {
    selectedGroups.add(groupId);
  }

  // Update UI
  updateSelectedCount();

  const groupItem = document.querySelector(`[data-group-id="${groupId}"]`);
  if (groupItem) {
    const checkbox = groupItem.querySelector('.group-checkbox');
    if (selectedGroups.has(groupId)) {
      groupItem.classList.add('selected');
      checkbox.checked = true;
    } else {
      groupItem.classList.remove('selected');
      checkbox.checked = false;
    }
  }
}

// Update selected count display
function updateSelectedCount() {
  const count = selectedGroups.size;
  document.getElementById('selectedCount').textContent =
    `${count} selected`;
}

// Select all groups
async function selectAllGroups() {
  const result = await chrome.storage.local.get('savedGroups');
  const savedGroups = result.savedGroups || [];

  // If all are already selected, deselect all
  if (selectedGroups.size === savedGroups.length) {
    selectedGroups.clear();
    document.getElementById('selectAllGroupsBtn').textContent = 'Select All';
  } else {
    // Select all
    savedGroups.forEach(group => selectedGroups.add(group.id));
    document.getElementById('selectAllGroupsBtn').textContent = 'Deselect All';
  }

  // Update count
  updateSelectedCount();

  // Re-render to update UI
  await loadSavedGroups();
}

// Restore selected groups
async function restoreSelectedGroups() {
  if (selectedGroups.size === 0) {
    showNotification('No groups selected', 'info');
    return;
  }

  const result = await chrome.storage.local.get('savedGroups');
  const savedGroups = result.savedGroups || [];

  const groupsToRestore = savedGroups.filter(g => selectedGroups.has(g.id));

  if (groupsToRestore.length === 0) return;

  // Show loading
  showLoading('Restoring tabs...');

  // Restore all selected groups
  for (const group of groupsToRestore) {
    for (const tab of group.tabs) {
      await chrome.tabs.create({ url: tab.url, active: false });
    }
  }

  hideLoading();
  showNotification(`Restored ${groupsToRestore.length} group${groupsToRestore.length !== 1 ? 's' : ''}`, 'success');

  // Exit select mode
  selectedGroups.clear();
  toggleSelectMode();
  window.close();
}

// Delete selected groups
async function deleteSelectedGroups() {
  if (selectedGroups.size === 0) {
    showNotification('No groups selected', 'info');
    return;
  }

  if (!confirm(`Delete ${selectedGroups.size} selected group${selectedGroups.size !== 1 ? 's' : ''}?`)) {
    return;
  }

  showLoading('Deleting groups...');

  try {
    const result = await chrome.storage.local.get('savedGroups');
    const savedGroups = result.savedGroups || [];
    const filtered = savedGroups.filter(g => !selectedGroups.has(g.id));

    await chrome.storage.local.set({ savedGroups: filtered });

    hideLoading();

    showNotification(`Deleted ${selectedGroups.size} group${selectedGroups.size !== 1 ? 's' : ''}`, 'info');

    // Clear selections and exit select mode
    selectedGroups.clear();
    toggleSelectMode();
    await loadSavedGroups();
  } catch (error) {
    hideLoading();
    showNotification('Error deleting groups', 'error');
    console.error('Error deleting groups:', error);
  }
}

// ===== Current Tabs Batch Operations =====

// Toggle tab select mode
function toggleTabSelectMode() {
  tabSelectMode = !tabSelectMode;

  const btn = document.getElementById('toggleTabSelectMode');
  const icon = btn.querySelector('.toggle-icon');
  const text = btn.querySelector('.toggle-text');
  const bulkActions = document.getElementById('tabBulkActions');
  const selectAllBtn = document.getElementById('selectAllTabsBtn');

  if (tabSelectMode) {
    icon.textContent = '✖️';
    text.textContent = 'Cancel';
    btn.classList.add('grouped');
    btn.title = 'Exit selection mode';
    bulkActions.style.display = 'flex';
  } else {
    icon.textContent = '☑️';
    text.textContent = 'Select';
    btn.classList.remove('grouped');
    btn.title = 'Select multiple tabs';
    bulkActions.style.display = 'none';
    // Clear selections when exiting
    selectedTabs.clear();
    selectAllBtn.textContent = 'Select All';
  }

  // Re-render tabs to show/hide checkboxes
  renderTabs();
}

// Toggle tab selection
function toggleTabSelection(tabId) {
  if (selectedTabs.has(tabId)) {
    selectedTabs.delete(tabId);
  } else {
    selectedTabs.add(tabId);
  }

  // Update UI
  updateSelectedTabCount();

  const tabItem = document.querySelector(`[data-tab-id="${tabId}"]`);
  if (tabItem) {
    const checkbox = tabItem.querySelector('.tab-checkbox');
    if (selectedTabs.has(tabId)) {
      tabItem.classList.add('selected');
      checkbox.checked = true;
    } else {
      tabItem.classList.remove('selected');
      checkbox.checked = false;
    }
  }
}

// Update selected tab count display
function updateSelectedTabCount() {
  const count = selectedTabs.size;
  document.getElementById('selectedTabCount').textContent = `${count} selected`;
}

// Select all tabs
function selectAllTabs() {
  // If all are already selected, deselect all
  if (selectedTabs.size === filteredTabs.length) {
    selectedTabs.clear();
    document.getElementById('selectAllTabsBtn').textContent = 'Select All';
  } else {
    // Select all
    filteredTabs.forEach(tab => selectedTabs.add(tab.id));
    document.getElementById('selectAllTabsBtn').textContent = 'Deselect All';
  }

  // Update count
  updateSelectedTabCount();

  // Re-render to update UI
  renderTabs();
}

// Save selected tabs
async function saveSelectedTabs() {
  if (selectedTabs.size === 0) {
    showNotification('No tabs selected', 'info');
    return;
  }

  const groupName = prompt('Enter a name for this tab group:');
  if (!groupName) return;

  showLoading('Saving selected tabs...');

  try {
    // Check for duplicate name
    const result = await chrome.storage.local.get('savedGroups');
    const savedGroups = result.savedGroups || [];
    const existingGroup = savedGroups.find(g => g.name.toLowerCase() === groupName.toLowerCase());

    if (existingGroup) {
      hideLoading();
      const overwrite = confirm(`A group named "${groupName}" already exists. Do you want to overwrite it?`);
      if (!overwrite) {
        // Ask for new name
        await saveSelectedTabs();
        return;
      }
      showLoading('Saving selected tabs...');
      // Remove existing group
      const filteredGroups = savedGroups.filter(g => g.id !== existingGroup.id);
      await chrome.storage.local.set({ savedGroups: filteredGroups });
    }

    const tabsToSave = allTabs.filter(tab => selectedTabs.has(tab.id));

    const tabGroup = {
      id: Date.now().toString(),
      name: groupName,
      timestamp: Date.now(),
      tabs: tabsToSave.map(tab => ({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
      }))
    };

    // Save to storage
    const updatedResult = await chrome.storage.local.get('savedGroups');
    const groups = updatedResult.savedGroups || [];
    groups.unshift(tabGroup);

    await chrome.storage.local.set({ savedGroups: groups });

    hideLoading();

    showNotification(`Saved ${selectedTabs.size} tab${selectedTabs.size !== 1 ? 's' : ''}`, 'success');

    // Clear selections and exit select mode
    selectedTabs.clear();
    toggleTabSelectMode();
    await loadSavedGroups();
  } catch (error) {
    hideLoading();
    showNotification('Error saving selected tabs', 'error');
    console.error('Error saving selected tabs:', error);
  }
}

// Close selected tabs
async function closeSelectedTabs() {
  if (selectedTabs.size === 0) {
    showNotification('No tabs selected', 'info');
    return;
  }

  showLoading('Closing tabs...');

  try {
    const tabIdsToClose = Array.from(selectedTabs);

    // Check if we're closing all tabs
    const currentTabs = await chrome.tabs.query({ currentWindow: true });
    const currentNonPinnedTabs = currentTabs.filter(tab => !tab.pinned);

    if (tabIdsToClose.length >= currentNonPinnedTabs.length) {
      // Create new tab first to prevent window from closing
      await chrome.tabs.create({ url: 'chrome://newtab', active: false });
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Close the tabs
    await chrome.tabs.remove(tabIdsToClose);

    hideLoading();

    showNotification(`Closed ${tabIdsToClose.length} tab${tabIdsToClose.length !== 1 ? 's' : ''}`, 'info');

    // Clear selections and exit select mode
    selectedTabs.clear();
    toggleTabSelectMode();
    await loadTabs();
  } catch (error) {
    hideLoading();
    showNotification('Error closing tabs', 'error');
    console.error('Error closing tabs:', error);
  }
}