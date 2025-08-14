# Changelog

All notable changes to Kick AutoSend will be documented in this file.

## [1.0.4] - 2025-08-14

### Fixed
- **Content Script Ready Issue**: Resolved "Content script not ready" error on initial AutoSend run
- **AutoSend Counter**: Fixed "Next message in" and "Messages left" counters showing incorrect values
- **AutoSend Completion**: Properly displays "Complete" state when message queue is finished
- **Character Counter**: Fixed maximum character limit not updating correctly in real-time
- **Channel Restriction**: Fixed responder not respecting channel restrictions (AutoSend was working)
- **Duplicate Messages**: Prevented duplicate message sending after page refresh
- **Responder Behavior**: Fixed responder continuing to work when extension is disabled
- **Message Processing**: Improved handling of new vs. old messages to prevent bot-like behavior
- **Service Worker Resilience**: Enhanced error handling for inter-script communication
- **UI Improvements**: Fixed "1 remaining" display logic and removed unnecessary force stop button

### Changed
- **Content Script Initialization**: Immediate readiness flag to prevent timing issues
- **Message Tracking**: Improved duplicate prevention with better message ID handling
- **Observer Management**: Proper cleanup of MutationObserver to prevent memory leaks
- **Error Handling**: Removed debugging code and improved production error handling
- **Build System**: Added automated build scripts for Chrome Web Store packaging

### Removed
- **Debug Code**: Removed all console.log statements and debugging functions
- **Force Stop**: Removed redundant force stop functionality (master toggle handles all stopping)
- **Development Files**: Cleaned up build artifacts and development-only files

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
