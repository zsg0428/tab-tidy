// Default settings
const DEFAULT_SETTINGS = {
  general: {
    defaultView: 'list',
    showTabCount: true
  },
  tabManagement: {
    closeAfterSave: 'prompt',
    duplicateDetection: true
  }
};

let currentSettings = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
  updateStorageInfo();
  loadVersionInfo();
});

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    currentSettings = result.settings || DEFAULT_SETTINGS;

    // Apply settings to UI
    applySettingsToUI(currentSettings);
  } catch (error) {
    console.error('Error loading settings:', error);
    currentSettings = DEFAULT_SETTINGS;
    applySettingsToUI(currentSettings);
  }
}

// Apply settings to UI elements
function applySettingsToUI(settings) {
  // General
  document.getElementById('defaultView').value = settings.general.defaultView;
  document.getElementById('showTabCount').checked = settings.general.showTabCount;

  // Tab Management
  document.getElementById('closeAfterSave').value = settings.tabManagement.closeAfterSave;
  document.getElementById('duplicateDetection').checked = settings.tabManagement.duplicateDetection;
}

// Get current settings from UI
function getSettingsFromUI() {
  return {
    general: {
      defaultView: document.getElementById('defaultView').value,
      showTabCount: document.getElementById('showTabCount').checked
    },
    tabManagement: {
      closeAfterSave: document.getElementById('closeAfterSave').value,
      duplicateDetection: document.getElementById('duplicateDetection').checked
    }
  };
}

// Save settings
async function saveSettings() {
  try {
    const settings = getSettingsFromUI();
    await chrome.storage.local.set({ settings: settings });
    currentSettings = settings;
    showNotification('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Error saving settings', 'error');
  }
}

// Reset to defaults
async function resetSettings() {
  if (!confirm('Reset all settings to defaults?')) return;

  try {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    currentSettings = DEFAULT_SETTINGS;
    applySettingsToUI(DEFAULT_SETTINGS);
    showNotification('Settings reset to defaults', 'info');
  } catch (error) {
    console.error('Error resetting settings:', error);
    showNotification('Error resetting settings', 'error');
  }
}

// Update storage info
async function updateStorageInfo() {
  try {
    const result = await chrome.storage.local.get(null);
    const jsonString = JSON.stringify(result);
    const bytes = new Blob([jsonString]).size;
    const kb = (bytes / 1024).toFixed(2);

    document.getElementById('storageBadge').textContent = `${kb} KB`;

    const savedGroups = result.savedGroups || [];
    const totalTabs = savedGroups.reduce((sum, group) => sum + group.tabs.length, 0);

    document.getElementById('storageInfo').textContent =
      `${savedGroups.length} groups, ${totalTabs} tabs saved`;
  } catch (error) {
    console.error('Error calculating storage:', error);
    document.getElementById('storageInfo').textContent = 'Unable to calculate';
  }
}

// Export data
async function exportData() {
  try {
    const result = await chrome.storage.local.get(null);
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tabtidy-backup-${Date.now()}.json`;

    // Add event listener to show success only after download starts
    link.addEventListener('click', () => {
      setTimeout(() => {
        showNotification('Data exported successfully!', 'success');
      }, 100);
    });

    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    showNotification('Error exporting data', 'error');
  }
}

// Import data
function importData() {
  const fileInput = document.getElementById('fileInput');
  fileInput.click();
}

// Handle file import
async function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate data structure
    if (!data.savedGroups || !Array.isArray(data.savedGroups)) {
      showNotification('Invalid backup file format', 'error');
      return;
    }

    // Confirm import
    const groupCount = data.savedGroups.length;
    if (!confirm(`Import ${groupCount} groups? This will replace your current data.`)) {
      return;
    }

    // Import data
    await chrome.storage.local.set(data);
    showNotification('Data imported successfully!', 'success');
    updateStorageInfo();
  } catch (error) {
    console.error('Error importing data:', error);
    showNotification('Error importing data: Invalid file', 'error');
  }

  // Reset file input
  event.target.value = '';
}

// Clear all data
async function clearAllData() {
  const confirmed = confirm(
    'Are you sure you want to delete ALL saved groups?\n\n' +
    'This action cannot be undone!'
  );

  if (!confirmed) return;

  // Double confirmation
  const doubleConfirm = confirm(
    'This is your last chance!\n\n' +
    'Click OK to permanently delete all your saved groups.'
  );

  if (!doubleConfirm) return;

  try {
    await chrome.storage.local.set({ savedGroups: [] });
    showNotification('All data cleared', 'info');
    updateStorageInfo();
  } catch (error) {
    console.error('Error clearing data:', error);
    showNotification('Error clearing data', 'error');
  }
}

// Load version info
function loadVersionInfo() {
  const manifest = chrome.runtime.getManifest();
  document.getElementById('versionInfo').textContent = `Version ${manifest.version}`;
}

// Setup event listeners
function setupEventListeners() {
  // Header close button
  document.getElementById('closeBtn').addEventListener('click', () => {
    window.close();
  });

  // Footer buttons
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);
  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.close();
  });

  // Storage & Data buttons
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importBtn').addEventListener('click', importData);
  document.getElementById('clearDataBtn').addEventListener('click', clearAllData);

  // File input change
  document.getElementById('fileInput').addEventListener('change', handleFileImport);
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
