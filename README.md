# 🧹 TabTidy

<div align="center">
  <img src="icons/icon128.png" alt="TabTidy Logo" width="128" height="128">
  <p><strong>A smart Chrome extension to organize, save, and restore your browser tabs</strong></p>

  ![Version](https://img.shields.io/badge/version-1.0.0-blue)
  ![Chrome](https://img.shields.io/badge/chrome-extension-orange)
  ![License](https://img.shields.io/badge/license-MIT-green)
</div>

---

## ✨ Features

### Current Features (v1.0)
- 🔍 **Smart Search & Filters** - Find tabs by title/URL, filter by pinned, audio, muted status
- 📋 **Multiple Views** - List view or grouped by domain
- 🎨 **Tab Organization** - Create Chrome native tab groups by domain with auto-colors
- 💾 **Save & Restore Groups** - Save tab collections with their group structure
- 📌 **Tab Management** - Pin, unpin, mute, unmute tabs directly
- 🧹 **Remove Duplicates** - Clean up duplicate tabs with one click
- ⏮️ **Undo Close** - Restore recently closed tabs
- 📜 **History Panel** - View and restore recently closed tabs with timestamps
- ☑️ **Batch Operations** - Select multiple tabs or groups for bulk actions
- ⚙️ **Settings Page** - Customize default view and behavior
- ⚡ **Quick Switch** - Click to jump to any tab instantly

## 🚀 Installation

### For Users (Coming Soon)
Will be available on Chrome Web Store

### For Developers

```bash
# Clone the repository
git clone https://github.com/zsg0428/tab-tidy.git
cd tab-tidy

# Load in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the tabtidy folder
```

## 📖 Usage

### Basic Operations
1. **Open TabTidy** - Click the 🧹 icon in your Chrome toolbar
2. **Search & Filter** - Use search bar and filter dropdown to find tabs
3. **Manage Tabs** - Click icons to pin 📌, mute 🔇, or close ✖ tabs
4. **Organize** - Click "🎨 Organize Tabs" to group by domain with Chrome native groups
5. **Save Groups** - Click "💾 Save All" to preserve current tabs (with group structure)
6. **Undo Close** - Click "⏮️ Undo Close" to restore recently closed tabs

### Advanced Features
- **Batch Operations** - Click "Select" to enable multi-select mode for tabs or groups
- **History Panel** - Switch to "History" tab to view and restore recently closed tabs
- **Settings** - Click ⚙️ to customize default view and close behavior
- **List/Grouped View** - Toggle between flat list and domain-grouped display

## 📁 Project Structure

```
tabtidy/
├── manifest.json       # Extension configuration
├── popup.html         # Main popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── settings.html      # Settings page UI
├── settings.css       # Settings styles
├── settings.js        # Settings logic
├── background.js      # Background service worker
├── icons/             # Extension icons
└── README.md          # This file
```

## 🛠️ Technologies

- Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks)
- CSS3 with modern gradient design
- Chrome APIs: `tabs`, `storage`, `tabGroups`, `sessions`

## 🗺️ Roadmap

### Completed ✅
- ✅ Smart search & filters
- ✅ Tab organization with Chrome groups
- ✅ Save/restore groups with structure
- ✅ Batch operations
- ✅ History panel
- ✅ Settings page
- ✅ Pin/mute/unpin/unmute tabs
- ✅ Undo close tab

### Coming Soon
- [ ] Auto-suspend inactive tabs (save memory)
- [ ] Keyboard shortcuts
- [ ] Session management & workspaces
- [ ] Cloud sync across devices
- [ ] Export groups to Markdown/JSON
- [ ] Tab statistics dashboard
- [ ] Custom themes

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 💡 Why TabTidy?

Ever have 50+ tabs open and can't find what you need? TabTidy helps you:
- **Organize** - Group related tabs together
- **Save** - Preserve tab sessions for later
- **Clean** - Remove clutter and duplicates
- **Focus** - Find tabs faster with search

Built with simplicity and performance in mind. No bloat, just the features you need.

---

<div align="center">
  Made with ❤️ by the TabTidy team

  [Report Bug](https://github.com/zsg0428/tab-tidy/issues) ·
  [Request Feature](https://github.com/zsg0428/tab-tidy/issues)
</div>
