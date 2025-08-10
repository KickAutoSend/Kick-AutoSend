# Kick AutoSend

![Kick AutoSend Promotional Image](screenshots/Large%20tile%20-%20Promo%20-%20920x680.png)

A Chrome extension for automating Kick.com chat interactions with advanced voice rotation and message management features.

## Features

### 🤖 **Auto-Reply System**
- Auto-responds to whitelisted non-subscribers using "!" commands
- Custom reply messages or echo original messages
- Blacklisted word filtering
- Rate limiting (60 messages/minute) for safety

### 🔄 **Message Repeater**
- Send messages at customizable intervals (10-3600 seconds)
- Queue management with status tracking
- Character limits and advanced controls

### 🎤 **Voice Rotation**
- TTS voice rotation for both auto-replies and repeater messages
- Two modes: Random or Sequential voice selection
- Add custom voices beyond the default list

### 🎨 **Dual Themes**
- **Kick Theme**: Professional streaming voices with green accent
- **FNV Theme**: Volcano red/purple gradient
- Theme-specific default voice sets

### ⚙️ **Advanced Settings**
- Configurable delays and character limits
- Subscriber inclusion options
- Preset saving system
- Statistics tracking

## Installation

### From Chrome Web Store (Recommended)
1. Visit the Chrome Web Store listing
2. Click "Add to Chrome"
3. Confirm the installation
4. Navigate to any Kick.com stream to use

### From Source (Developers)
1. Clone this repository: `git clone https://github.com/KickAutoSend/KickAutoSend.git`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. Navigate to any Kick.com stream to use

## Usage

### Quick Start
1. Click the extension icon while on Kick.com
2. Add usernames to the whitelist (one per line)
3. Enable the extension and start chatting!

### Voice Setup
1. Go to the "Voices" tab
2. Select your preferred TTS voices
3. Choose Random or Sequential rotation mode

### Themes
- Click the 🎨 Theme button to switch between Kick and FNV themes
- Each theme has different default voices and colors

## Screenshots

### Main Interface
![AutoSend Tab](screenshots/AutoSend%20(1).png)
*Main automation interface with whitelist and auto-reply settings*

### Message Repeater
![Responder Tab](screenshots/Responder%20(2).png)
*Message repeater with interval controls and queue management*

### Voice Selection
![Voices Tab](screenshots/Voices%20(3).png)
*TTS voice selection with rotation modes and custom voice options*

### Theme Switching
![Commaflage Tab](screenshots/Commaflage%20(4).png)

### Advanced Settings
![Settings Tab](screenshots/Settings%20(5).png)
*Advanced configuration options and statistics*

## Security & Privacy

- ✅ Minimal permissions (only Kick.com access)
- ✅ All data stored locally in browser
- ✅ No external data transmission
- ✅ Input validation and rate limiting
- ✅ Content Security Policy protection

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `storage`, `scripting`, `activeTab`
- **Host Access**: Limited to `kick.com` and subdomains only
- **Framework**: Vanilla JavaScript (no external dependencies)

## License

MIT License

Copyright (c) 2025 Kick AutoSend

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing

Issues and pull requests are welcome. Please ensure any contributions maintain the security and privacy standards of the extension.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/KickAutoSend/KickAutoSend/issues)
- **Repository**: [View source code](https://github.com/KickAutoSend/KickAutoSend)

---

**Disclaimer**: This extension is for educational and entertainment purposes. Use responsibly and in accordance with Kick.com's terms of service.
