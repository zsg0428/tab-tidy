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

### Current Features (v1.0 MVP)
- 🔍 **Smart Search** - Quickly find tabs by title or URL
- 📋 **Tab List View** - See all your open tabs in one place
- 🗂️ **Domain Grouping** - Group tabs by website
- 💾 **Save Groups** - Save all tabs as a named collection
- ↩️ **Restore Anytime** - Bring back saved tab groups instantly
- 🧹 **Remove Duplicates** - Clean up duplicate tabs with one click
- ⚡ **Quick Switch** - Click to jump to any tab

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

1. **Open TabTidy** - Click the icon in your Chrome toolbar
2. **Search Tabs** - Use the search bar to find specific tabs
3. **Save Groups** - Click "💾 Save All" to create a tab group
4. **Restore Groups** - Click the restore button on any saved group
5. **Clean Up** - Use "Close Duplicates" to remove duplicate tabs
6. **Group View** - Toggle 📂 to see tabs organized by domain

## Project Structure

```
tabtidy/
├── manifest.json       # Extension configuration
├── popup.html         # Main UI
├── popup.css          # Styles
├── popup.js           # UI logic
├── background.js      # Background service worker
├── icons/             # Extension icons
└── README.md          # This file
```

## Technologies

- Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks)
- CSS3 with modern layouts

## 🗺️ Roadmap

### Coming Soon
- [ ] Auto-suspend inactive tabs (save memory)
- [ ] Keyboard shortcuts
- [ ] Advanced search & filters
- [ ] Session management & workspaces
- [ ] Cloud sync across devices
- [ ] Export to Markdown/JSON
- [ ] Statistics dashboard

See the [full implementation plan](https://github.com/zsg0428/tab-tidy/issues) for details.

## 🛠️ Technologies

- Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks)
- CSS3 with modern gradient design
- Chrome APIs: `tabs`, `storage`, `tabGroups`

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
