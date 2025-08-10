// Kick AutoSend - State Manager
// Copyright (c) 2025 Kick AutoSend

class StateManager {
    constructor() {
        this.state = {
            // Extension state
            isEnabled: false,
            currentTheme: 'kick',
            whitelist: [],
            blacklist: [],
            autoReplyEnabled: false,
            repeaterEnabled: false,
            voiceRotationEnabled: false,
            
            // Settings
            settings: {
                rateLimit: 60,
                maxMessageLength: 200,
                includeSubscribers: false,
                delayBetweenMessages: 1000
            },
            
            // Statistics
            stats: {
                totalMessages: 0,
                totalReplies: 0,
                totalRepeats: 0,
                lastUsed: null
            }
        };
        
        this.init();
    }

    async init() {
        try {
            // Load saved state
            const savedState = await chrome.storage.local.get(['kickAutoSendState']);
            if (savedState.kickAutoSendState) {
                this.state = { ...this.state, ...savedState.kickAutoSendState };
            }
            
            // Save initial state
            await this.saveState();
            
        } catch (error) {
            console.error('Kick AutoSend: Error initializing state manager:', error);
        }
    }

    async saveState() {
        try {
            await chrome.storage.local.set({
                kickAutoSendState: this.state
            });
        } catch (error) {
            console.error('Kick AutoSend: Error saving state:', error);
        }
    }

    getState() {
        return { ...this.state };
    }

    updateState(updates) {
        this.state = { ...this.state, ...updates };
        this.saveState();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}
