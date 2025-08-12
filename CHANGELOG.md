# Changelog

All notable changes to Kick AutoSend will be documented in this file.

## [1.0.3] - 2025-08-12

### Added
- UI improvements making windows more compact
- Added tooltips and ability to turn them off in Settings tab
- Responder: Added Responder Cooldown
- Voices: Added indicator of a Custom Voice (✨)
- Commaflage: Added Message Interval (default: 8 seconds)
- Commaflage: Added ability to send non-commands

### Fixed
- Commaflage: Resolved message saving after closing popup
- Removed unused `scripting` permission to comply with Chrome Web Store policies

### Changed
- Updated permission structure to use only necessary permissions (`storage`, `activeTab`)
- Improved Commaflage command persistence - commands now save automatically as you type
- Default Commaflage commands moved to placeholder instead of input field

## [1.0.2] - Previous version

Initial release with core features:
- Auto-send functionality
- Voice rotation
- Message repeater
- Smart reply features
- Basic Commaflage functionality
