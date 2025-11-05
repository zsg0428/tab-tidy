# Changelog

All notable changes to TabTidy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
### Changed
### Fixed
### Removed

---

## [1.0.0] - 2025-11-05

### Added
- **Tab Management**
  - View all open tabs with favicon and title
  - Quick switch to any tab with one click
  - Pin/unpin tabs directly from the extension
  - Mute/unmute audio tabs
  - Close individual tabs

- **Search & Filtering**
  - Real-time search by title or URL
  - Filter tabs by status: All, Pinned, Unpinned, Playing Audio, Muted
  - Instant results as you type

- **View Modes**
  - List view for flat tab display
  - Grouped view to organize tabs by domain
  - Toggle between views with one click

- **Tab Organization**
  - Create Chrome native tab groups by domain
  - Automatic color assignment (9 colors)
  - One-click organize/unorganize all tabs
  - Support for ungrouping all tabs

- **Save & Restore**
  - Save all current tabs as named collections
  - Save selected tabs only
  - Save tab group structure (preserves Chrome groups)
  - Restore groups with original tab groups intact
  - Custom group naming
  - Export/Import functionality

- **Batch Operations**
  - Select multiple tabs for bulk actions
  - Select multiple saved groups
  - Batch save, restore, or delete
  - Select all functionality
  - Visual selection mode with checkboxes

- **History Panel**
  - View recently closed tabs (up to 25)
  - Display timestamps (e.g., "5m ago", "2h ago")
  - Click to restore individual tabs
  - Remove individual history items
  - Clear all history
  - Persistent history management across sessions

- **Quick Actions**
  - Close duplicate tabs instantly
  - Undo close - restore last closed tab
  - Organize/unorganize tabs by domain

- **Settings Page**
  - Choose default view (list or grouped)
  - Configure close behavior after saving
  - Settings persist across sessions

- **UI/UX Features**
  - Modern gradient design with blue theme
  - Toast notifications for user feedback
  - Loading indicators for operations
  - Smooth animations and transitions
  - Favicon display for all tabs
  - Empty state messages
  - Responsive layout

### Technical
- Built with Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks)
- Local-only data storage (chrome.storage.local)
- Required permissions: tabs, storage, tabGroups, sessions
- Privacy-focused: no tracking, no external servers

---

## Version History

[1.0.0] - Initial release - 2025-11-05
