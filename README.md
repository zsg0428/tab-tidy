# 🧹 TabTidy

A smart Chrome extension to organize, save, and restore your browser tabs.

## Features

### Current Features (MVP)
- ✅ View all open tabs in a clean interface
- ✅ Search tabs by title or URL
- ✅ Close duplicate tabs with one click
- ✅ Save all tabs as a named group
- ✅ Restore saved tab groups
- ✅ Group tabs by domain
- ✅ Quick tab switching

## Installation

### Development Mode

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `tabtidy` folder

### Usage

1. Click the TabTidy icon in your Chrome toolbar
2. Browse your open tabs or search for specific ones
3. Click "Save All" to save your current tabs as a group
4. Click "Close Duplicates" to remove duplicate tabs
5. Toggle between flat and grouped view with the folder icon
6. Restore saved groups by clicking the restore button

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

## Future Features

See [implementation plan](claude-implementation-plans/tabtidy-implementation-plan.md) for roadmap.

## License

MIT
