// Available TTS voices
const VOICES = [
  'anthony', 'trump', 'spongebob', 'drphil', 'tate', 'petergriffin', 'biden', 'arnold', 
  'train', 'joerogan', 'alexjones', 'samueljackson', 'kermit', 'eddie', 'goku', 'ice', 
  'herbert', 'unc', 'icespice', 'snoop', 'rock', 'morgan', 'sketch', 'kevinhart', 
  '50cent', 'kanye', 'mcgregor', 'willsmith', 'elon', 'kamala', 'jordan', 'shapiro', 
  'djkhaled', 'jayz', 'princeharry', 'robertdowneyjr', 'billgates', 'lex', 'duke', 
  'ebz', 'ariana', 'kim', 'cardi', 'rainbow', 'swift', 'watson', 'hillary', 'thrall', 'steve'
];

// Theme configurations with default voices
const THEMES = {
  kick: {
    name: 'Kick Theme', 
    image: 'assets/logo.png',
    title: 'Kick AutoSend',
    emoji: '⚡',
    defaultVoices: ['morgan', 'watson', 'joerogan', 'rock', 'arnold', 'samueljackson', 'kevinhart', 'snoop', 'jordan', 'willsmith', 'elon', 'billgates', 'lex', 'eddie', 'sketch'],
    defaultCommands: ['!commands', '!voices', '!followage']
  },
  fnv: {
    name: 'FNV Theme',
    image: 'assets/fnv.jpg',
    title: 'FNV Sender 🌋',
    emoji: '🎮',
    defaultVoices: ['drphil', 'spongebob', '50cent', 'steve', 'duke'],
    defaultCommands: ['!hit', '!stier', '!btier', '!ctier', '!dtier', '!voices', '!commands', '!hitormiss', '!grownman']
  }
};

// DOM elements
const elements = {
  // Tabs
  tabs: document.querySelectorAll('.tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // Theme controls
  themeToggle: document.getElementById('themeToggle'),
  headerImage: document.getElementById('headerImage'),
  headerText: document.getElementById('headerText'),
  masterEnabled: document.getElementById('masterEnabled'),
  
  // Basic tab
  enabled: document.getElementById('enabled'),
  whitelist: document.getElementById('whitelist'),
  customMessage: document.getElementById('customMessage'),
  includeSubscribers: document.getElementById('includeSubscribers'),
  responderAllowCommands: document.getElementById('responderAllowCommands'),
  whitelistCounter: document.getElementById('whitelist-counter'),
  messageCounter: document.getElementById('message-counter'),
  
  // Repeater tab
  repeaterEnabled: document.getElementById('repeaterEnabled'),
  repeaterMessage: document.getElementById('repeaterMessage'),
  interval: document.getElementById('interval'),
  maxCount: document.getElementById('maxCount'),
  startRepeater: document.getElementById('startRepeater'),
  stopRepeater: document.getElementById('stopRepeater'),
  repeaterCounter: document.getElementById('repeater-counter'),
  repeaterStats: document.getElementById('repeaterStats'),
  nextMessage: document.getElementById('nextMessage'),
  messagesLeft: document.getElementById('messagesLeft'),
  
  // Preset controls
  presetName: document.getElementById('presetName'),
  savePreset: document.getElementById('savePreset'),
  presetList: document.getElementById('presetList'),
  
  // Voices tab
  voiceRotationEnabled: document.getElementById('voiceRotationEnabled'), // Legacy
  voiceRotationRepeater: document.getElementById('voiceRotationRepeater'),
  voiceRotationResponder: document.getElementById('voiceRotationResponder'),
  voiceMode: document.getElementById('voiceMode'),
  voiceGrid: document.getElementById('voiceGrid'),
  selectAllVoices: document.getElementById('selectAllVoices'),
  clearAllVoices: document.getElementById('clearAllVoices'),
  customVoiceName: document.getElementById('customVoiceName'),
  addCustomVoice: document.getElementById('addCustomVoice'),
  
  // Queue tab elements removed (queue tab replaced with commandflage)
  
  // Advanced tab
  minDelay: document.getElementById('minDelay'),
  maxCharLimit: document.getElementById('maxCharLimit'),
  blacklistedWords: document.getElementById('blacklistedWords'),
  blacklistCounter: document.getElementById('blacklist-counter'),
  useAdvancedLimits: document.getElementById('useAdvancedLimits'),
  currentMinDelay: document.getElementById('currentMinDelay'),
  currentMaxChars: document.getElementById('currentMaxChars'),
  currentBlacklistCount: document.getElementById('currentBlacklistCount'),
  
  // Stats tab
  totalReplies: document.getElementById('totalReplies'),
  totalProcessed: document.getElementById('totalProcessed'),
  totalRepeater: document.getElementById('totalRepeater'),
  totalTimeouts: document.getElementById('totalTimeouts'),
  totalBans: document.getElementById('totalBans'),
  successRate: document.getElementById('successRate'),
  topPresets: document.getElementById('topPresets'),
  resetStats: document.getElementById('resetStats'),
  resetPresetStats: document.getElementById('resetPresetStats'),
  exportSettings: document.getElementById('exportSettings'),
  importSettings: document.getElementById('importSettings'),
  importFile: document.getElementById('importFile'),
  
  // Commandflage tab
  commandflageEnabled: document.getElementById('commandflageEnabled'),
  commandflageCommands: document.getElementById('commandflageCommands'),
  commandsCounter: document.getElementById('commands-counter'),
  commandRounds: document.getElementById('commandRounds'),
  commandCount: document.getElementById('commandCount'),
  randomizeCommands: document.getElementById('randomizeCommands'),
  startCommandflage: document.getElementById('startCommandflage'),
  stopCommandflage: document.getElementById('stopCommandflage'),
  commandflageStats: document.getElementById('commandflageStats'),
  commandsSent: document.getElementById('commandsSent'),
  currentRound: document.getElementById('currentRound'),
  nextCommand: document.getElementById('nextCommand'),

  // Advanced tab additions
  channelRestriction: document.getElementById('channelRestriction'),
  messagesLeft: document.getElementById('messagesLeft'),

  // Tab indicators
  repeaterIndicator: document.getElementById('repeater-indicator'),
  responderIndicator: document.getElementById('responder-indicator'),
  voicesIndicator: document.getElementById('voices-indicator'),
  commandflageIndicator: document.getElementById('commandflage-indicator'),

  // Common
  save: document.getElementById('save'),
  status: document.getElementById('status')
};

// Default settings
const DEFAULT_SETTINGS = {
  masterEnabled: true,
  enabled: false,
  whitelist: [],
  customMessage: '',
  includeSubscribers: false,
  responderAllowCommands: false,
  repeaterEnabled: false,
  repeaterMessage: '!obama hello everyone!',
  interval: 90,
  maxCount: 0,
  voiceRotationEnabled: false, // Legacy setting, will be migrated
  voiceRotationRepeater: false,
  voiceRotationResponder: false,
  voiceMode: 'random',
  selectedVoices: ['duke', 'trump', 'spongebob'],
  minDelay: 90,
  maxCharLimit: 150,
  blacklistedWords: [],
  useAdvancedLimits: false,
  currentTheme: 'kick',
  customVoices: [], // User-added custom voices
  messagePresets: [], // New setting for saved presets
  presetStats: {}, // Track usage count for each preset
  channelRestriction: '', // Restrict to specific channel
  commandflageEnabled: false,
  commandflageCommands: [],
  randomizeCommands: true,
  commandRounds: 1,
  commandCount: 0,
  stats: {
    totalReplies: 0,
    totalProcessed: 0,
    totalRepeater: 0,
    totalCommandflage: 0,
    timeouts: 0,
    bans: 0,
    successCount: 0
  }
};

let currentSettings = { ...DEFAULT_SETTINGS };
let repeaterInterval = null;
let pendingRepeaterTimeouts = new Set(); // Track all pending timeouts
let commandflageInterval = null;
let commandflageStats = { sent: 0, round: 1 };
let commandflageCountdown = null;
let messageQueue = []; // Track all message attempts
let queueIdCounter = 0; // Unique ID for each queue item

// Theme functionality
function initThemes() {
  // Load saved theme
  const savedTheme = currentSettings.currentTheme || 'kick';
  applyTheme(savedTheme);
  
  // Theme toggle event
  elements.themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'kick';
    const newTheme = currentTheme === 'kick' ? 'fnv' : 'kick';
    applyTheme(newTheme);
    currentSettings.currentTheme = newTheme;
    saveSettings();
  });
}

function applyTheme(themeName) {
  const theme = THEMES[themeName];
  if (!theme) return;
  
  document.body.setAttribute('data-theme', themeName);
  elements.headerImage.src = theme.image;
  elements.headerText.textContent = theme.title;
  
  // Update theme button to show the OTHER theme name
  if (themeName === 'kick') {
    elements.themeToggle.textContent = '🔄 FNV';
  } else {
    elements.themeToggle.textContent = '🔄 Standard';
  }
  
  // Update emoji fallback
  const emoji = document.querySelector('.header-emoji');
  if (emoji) {
    emoji.textContent = theme.emoji;
  }
  
  // Handle image load error
  elements.headerImage.onerror = function() {
    this.style.display = 'none';
    emoji.style.display = 'inline';
  };
  
  // Reset image display when theme changes
  elements.headerImage.style.display = '';
  emoji.style.display = 'none';
  
  // Ensure logo state is properly applied after theme change
  if (!elements.masterEnabled.checked) {
    elements.headerImage.style.filter = 'brightness(30%)';
  } else {
    elements.headerImage.style.filter = '';
  }
  
  // Update default selected voices if user hasn't customized them
  const hasCustomSelection = currentSettings.selectedVoices && 
    currentSettings.selectedVoices.length > 0 && 
    currentSettings.selectedVoices.some(voice => !theme.defaultVoices.includes(voice));
  
  if (!hasCustomSelection) {
    currentSettings.selectedVoices = [...theme.defaultVoices.slice(0, 5)]; // Use first 5 default voices
    updateVoiceSelection();
    console.log(`Applied theme ${theme.name} with default voices:`, currentSettings.selectedVoices);
  }

  // Always update commandflage commands when switching themes
  currentSettings.commandflageCommands = [...theme.defaultCommands];
  elements.commandflageCommands.value = theme.defaultCommands.join(', ');
  
  // Always update placeholder to show theme-appropriate defaults
  elements.commandflageCommands.placeholder = theme.defaultCommands.join(', ');
  
  console.log(`Applied theme ${theme.name} with default commands:`, currentSettings.commandflageCommands);
  
  console.log(`Applied ${theme.name}`);
}

// Tab switching functionality
function initTabs() {
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update tab appearance
      elements.tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show/hide content
      elements.tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTab) {
          content.classList.add('active');
        }
      });
      
      // Hide global save button only on tabs that have their own save mechanisms
      const saveContainer = document.getElementById('global-save-container');
      if (saveContainer) {
        const hideOnTabs = ['repeater', 'commandflage'];
        saveContainer.style.display = hideOnTabs.includes(targetTab) ? 'none' : 'block';
      }
    });
  });
}

// Character counter functionality
function updateCharCounter(input, counter, maxChars = 500) {
  const length = input.value.length;
  
  if (input === elements.whitelist) {
    const users = input.value.split('\n').filter(line => line.trim()).length;
    counter.textContent = `${users} users`;
  } else if (input === elements.blacklistedWords) {
    const words = input.value.split(',').filter(word => word.trim()).length;
    counter.textContent = `${words} words`;
  } else {
    counter.textContent = `${length}/${maxChars} characters`;
    counter.classList.remove('warning', 'error');
    
    if (length > maxChars * 0.8) {
      counter.classList.add('warning');
    }
    if (length > maxChars) {
      counter.classList.add('error');
    }
  }
}

// Voice grid functionality
function initVoiceGrid() {
  elements.voiceGrid.innerHTML = '';
  
  // Combine default voices with custom voices
  const allVoices = [...VOICES, ...currentSettings.customVoices];
  
  allVoices.forEach(voice => {
    const voiceItem = document.createElement('div');
    voiceItem.className = 'voice-item';
    
    const isCustom = currentSettings.customVoices.includes(voice);
    
    voiceItem.innerHTML = `
      <input type="checkbox" id="voice-${voice}" value="${voice}">
      <label for="voice-${voice}">!${voice}${isCustom ? ' ✨' : ''}</label>
      ${isCustom ? `<button class="preset-btn delete voice-delete-btn" data-voice="${voice}" style="padding: 1px 3px; font-size: 8px; margin-left: 2px;">×</button>` : ''}
    `;
    
    elements.voiceGrid.appendChild(voiceItem);
  });
  
  // Add event listeners to delete buttons
  document.querySelectorAll('.voice-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const voiceName = btn.getAttribute('data-voice');
      removeCustomVoice(voiceName);
    });
  });
  
  // Add event listeners to voice checkboxes for indicator updates
  document.querySelectorAll('#voiceGrid input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      setTimeout(updateAllTabIndicators, 50);
    });
  });
}

// Voice selection functionality
function updateVoiceSelection() {
  const allVoices = [...VOICES, ...currentSettings.customVoices];
  allVoices.forEach(voice => {
    const checkbox = document.getElementById(`voice-${voice}`);
    if (checkbox) {
      checkbox.checked = currentSettings.selectedVoices.includes(voice);
    }
  });
}

function getSelectedVoices() {
  const allVoices = [...VOICES, ...currentSettings.customVoices];
  return allVoices.filter(voice => {
    const checkbox = document.getElementById(`voice-${voice}`);
    return checkbox && checkbox.checked;
  });
}

// Input sanitization functions
function sanitizeInput(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

function sanitizeVoiceName(input) {
  if (typeof input !== 'string') return '';
  return input.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
}

function sanitizeUsername(input) {
  if (typeof input !== 'string') return '';
  return input.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 50);
}

// Custom voice management
function addCustomVoice() {
  const rawInput = elements.customVoiceName.value;
  const voiceName = sanitizeVoiceName(rawInput);
  
  if (!voiceName) {
    showStatus('Please enter a valid voice name (letters and numbers only)', 'error');
    return;
  }
  
  if (voiceName.length < 2) {
    showStatus('Voice name must be at least 2 characters', 'error');
    return;
  }
  
  if (VOICES.includes(voiceName)) {
    showStatus('This voice already exists in the default list', 'error');
    return;
  }
  
  if (currentSettings.customVoices.includes(voiceName)) {
    showStatus('This custom voice already exists', 'error');
    return;
  }
  
  if (currentSettings.customVoices.length >= 20) {
    showStatus('Maximum 20 custom voices allowed', 'error');
    return;
  }
  
  currentSettings.customVoices.push(voiceName);
  elements.customVoiceName.value = '';
  
  initVoiceGrid();
  updateVoiceSelection();
  saveSettings();
  showStatus(`Custom voice "${voiceName}" added!`, 'success');
}

function removeCustomVoice(voiceName) {
  if (confirm(`Remove custom voice "${voiceName}"?`)) {
    currentSettings.customVoices = currentSettings.customVoices.filter(v => v !== voiceName);
    currentSettings.selectedVoices = currentSettings.selectedVoices.filter(v => v !== voiceName);
    
    initVoiceGrid();
    updateVoiceSelection();
    saveSettings();
    showStatus(`Custom voice "${voiceName}" removed`, 'success');
  }
}

// removeCustomVoice is now handled by event listeners, no need for global access

// Voice rotation functionality
function getRandomVoice() {
  const voices = currentSettings.selectedVoices;
  if (voices.length === 0) return 'duke';
  return voices[Math.floor(Math.random() * voices.length)];
}

let voiceIndex = 0;
function getSequentialVoice() {
  const voices = currentSettings.selectedVoices;
  if (voices.length === 0) return 'duke';
  const voice = voices[voiceIndex % voices.length];
  voiceIndex++;
  return voice;
}

function getNextVoice(context = 'responder') {
  const isEnabled = context === 'repeater' ? 
    currentSettings.voiceRotationRepeater : 
    currentSettings.voiceRotationResponder;
    
  if (!isEnabled) return null;
  return currentSettings.voiceMode === 'random' ? getRandomVoice() : getSequentialVoice();
}

// Message processing with voice replacement
function processMessage(template, context = 'responder') {
  const isEnabled = context === 'repeater' ? 
    currentSettings.voiceRotationRepeater : 
    currentSettings.voiceRotationResponder;
    
  if (!isEnabled) return template;
  
  // Special handling for responder: if message contains only !command (no additional text), 
  // check if user wants to allow command responding
  if (context === 'responder') {
    const trimmedMessage = template.trim();
    // Check if message is only a command (starts with ! and has no spaces or additional text)
    if (/^!\w+$/.test(trimmedMessage)) {
      // If user disabled command responding, return unchanged
      if (!currentSettings.responderAllowCommands) {
        return template; // Return unchanged - it's a command, not a TTS message
      }
      // If commands are allowed, continue with normal processing
    }
  }
  
  // Replace !voice commands with selected voice, but only if followed by text
  return template.replace(/!\w+(?=\s)/g, (match) => {
    // Only replace if it's a known TTS voice and followed by a space (indicating more text)
    if (VOICES.some(voice => match === `!${voice}`) || 
        currentSettings.customVoices.some(voice => match === `!${voice}`)) {
      const nextVoice = getNextVoice(context);
      return `!${nextVoice}`;
    }
    return match;
  });
}



// Statistics functionality
function updateStats(key, increment = 1) {
  currentSettings.stats[key] += increment;
  loadStats();
  saveSettings();
}

function loadStats() {
  elements.totalReplies.textContent = currentSettings.stats.totalReplies;
  elements.totalProcessed.textContent = currentSettings.stats.totalProcessed;
  elements.totalRepeater.textContent = currentSettings.stats.totalRepeater;
  
  const totalAttempts = currentSettings.stats.totalReplies + currentSettings.stats.totalRepeater;
  const successfulSends = currentSettings.stats.successCount;
  
  let successRate = 100; // Default to 100% if no attempts
  if (totalAttempts > 0) {
    successRate = Math.round((successfulSends / totalAttempts) * 100);
  }
  
  elements.successRate.textContent = `${successRate}% (${successfulSends}/${totalAttempts})`;
}

function resetStats() {
  if (confirm('Are you sure you want to reset all statistics?')) {
    currentSettings.stats = {
      totalReplies: 0,
      totalProcessed: 0,
      totalRepeater: 0,
      successCount: 0
    };
    loadStats();
    saveSettings();
    showStatus('Statistics reset', 'success');
  }
}

function resetPresetStats() {
  if (confirm('Are you sure you want to reset preset usage statistics?')) {
    currentSettings.presetStats = {};
    updateStatsDisplay();
    saveSettings();
    showStatus('Preset usage statistics reset', 'success');
  }
}

// Settings management
function loadSettings() {
  chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS), (result) => {
    currentSettings = { ...DEFAULT_SETTINGS, ...result };
    
    // Ensure stats object exists
    if (!currentSettings.stats) {
      currentSettings.stats = DEFAULT_SETTINGS.stats;
    }
    
    // Ensure blacklistedWords exists
    if (!currentSettings.blacklistedWords) {
      currentSettings.blacklistedWords = [];
    }
    
    // Ensure customVoices exists
    if (!currentSettings.customVoices) {
      currentSettings.customVoices = [];
    }
    
    // Ensure presetStats exists
    if (!currentSettings.presetStats) {
      currentSettings.presetStats = {};
    }
    
    // Set initial commandflage commands based on current theme if empty
    if (!currentSettings.commandflageCommands || currentSettings.commandflageCommands.length === 0) {
      const currentTheme = THEMES[currentSettings.currentTheme || 'kick'];
      if (currentTheme && currentTheme.defaultCommands) {
        currentSettings.commandflageCommands = [...currentTheme.defaultCommands];
      }
    }
    
    // Update UI
    elements.masterEnabled.checked = currentSettings.masterEnabled !== false; // Default to true
    elements.enabled.checked = currentSettings.enabled;
    elements.whitelist.value = Array.isArray(currentSettings.whitelist) 
      ? currentSettings.whitelist.join('\n') : '';
    elements.customMessage.value = currentSettings.customMessage || '';
    elements.includeSubscribers.checked = currentSettings.includeSubscribers;
    elements.responderAllowCommands.checked = currentSettings.responderAllowCommands || false;
    elements.repeaterEnabled.checked = currentSettings.repeaterEnabled;
    elements.repeaterMessage.value = currentSettings.repeaterMessage;
    elements.interval.value = currentSettings.interval;
    elements.maxCount.value = currentSettings.maxCount;
    
    // Handle voice rotation migration
    if (currentSettings.voiceRotationEnabled && 
        currentSettings.voiceRotationRepeater === undefined && 
        currentSettings.voiceRotationResponder === undefined) {
      // Migrate legacy setting - apply to responder by default
      currentSettings.voiceRotationResponder = true;
      currentSettings.voiceRotationRepeater = false;
      currentSettings.voiceRotationEnabled = false; // Clear legacy setting
    }
    
    elements.voiceRotationRepeater.checked = currentSettings.voiceRotationRepeater || false;
    elements.voiceRotationResponder.checked = currentSettings.voiceRotationResponder || false;
    elements.voiceMode.value = currentSettings.voiceMode;
    elements.minDelay.value = currentSettings.minDelay;
    elements.maxCharLimit.value = currentSettings.maxCharLimit;
    elements.blacklistedWords.value = Array.isArray(currentSettings.blacklistedWords) 
      ? currentSettings.blacklistedWords.join(', ') : '';
    elements.useAdvancedLimits.checked = currentSettings.useAdvancedLimits;
    elements.channelRestriction.value = currentSettings.channelRestriction || '';
    elements.commandflageEnabled.checked = currentSettings.commandflageEnabled;
    elements.commandflageCommands.value = Array.isArray(currentSettings.commandflageCommands) 
      ? currentSettings.commandflageCommands.join(', ') : '';
    elements.randomizeCommands.checked = currentSettings.randomizeCommands;
    elements.commandRounds.value = currentSettings.commandRounds || 1;
    elements.commandCount.value = currentSettings.commandCount || 0;
    
    updateVoiceSelection();
    loadStats();
    updateAdvancedDisplay();
    updateAllCounters();
    updatePresetDisplay(); // Load presets
    updateStatsDisplay();
    applyTheme(currentSettings.currentTheme || 'kick');
    updateMasterState(); // Update master toggle state
    updateAllTabIndicators(); // Update tab status indicators
    
    // Initialize repeater UI state
    if (elements.stopRepeater) elements.stopRepeater.disabled = true;
    if (elements.startRepeater) elements.startRepeater.textContent = 'Save and Start';
    if (elements.nextMessage) elements.nextMessage.textContent = '--';
    if (elements.messagesLeft) elements.messagesLeft.textContent = '--';
  });
}

function saveSettings() {
  // Show loading state
  const saveButton = elements.save;
  const originalText = saveButton.textContent;
  saveButton.textContent = 'Saving...';
  saveButton.disabled = true;
  
  // Collect and sanitize current values
  currentSettings.enabled = Boolean(elements.enabled.checked);
  
  // Sanitize whitelist
  currentSettings.whitelist = elements.whitelist.value
    .split('\n')
    .map(s => sanitizeUsername(s))
    .filter(Boolean)
    .slice(0, 100); // Max 100 users
  
  // Master toggle
  currentSettings.masterEnabled = elements.masterEnabled.checked;
  
  // Sanitize messages
  currentSettings.customMessage = sanitizeInput(elements.customMessage.value, 500);
  currentSettings.includeSubscribers = elements.includeSubscribers.checked;
  currentSettings.responderAllowCommands = elements.responderAllowCommands.checked;
  currentSettings.repeaterEnabled = elements.repeaterEnabled.checked;
  currentSettings.repeaterMessage = sanitizeInput(elements.repeaterMessage.value, 500);
  
  // Validate numeric inputs
  const interval = parseInt(elements.interval.value);
  currentSettings.interval = (interval >= 10 && interval <= 3600) ? interval : 90;
  
  const maxCount = parseInt(elements.maxCount.value);
  currentSettings.maxCount = (maxCount >= 0 && maxCount <= 1000) ? maxCount : 0;
  currentSettings.voiceRotationRepeater = elements.voiceRotationRepeater.checked;
  currentSettings.voiceRotationResponder = elements.voiceRotationResponder.checked;
  currentSettings.voiceMode = ['random', 'sequential'].includes(elements.voiceMode.value) ? elements.voiceMode.value : 'random';
  currentSettings.selectedVoices = getSelectedVoices();
  
  const minDelay = parseInt(elements.minDelay.value);
  currentSettings.minDelay = (minDelay >= 30 && minDelay <= 300) ? minDelay : 90;
  
  const maxCharLimit = parseInt(elements.maxCharLimit.value);
  currentSettings.maxCharLimit = (maxCharLimit >= 50 && maxCharLimit <= 500) ? maxCharLimit : 150;
  
  // Sanitize blacklisted words
  currentSettings.blacklistedWords = elements.blacklistedWords.value
    .split(',')
    .map(s => sanitizeInput(s, 50))
    .filter(Boolean)
    .slice(0, 50); // Max 50 blacklisted words
  currentSettings.useAdvancedLimits = elements.useAdvancedLimits.checked;
  
  // Channel restriction
  currentSettings.channelRestriction = sanitizeInput(elements.channelRestriction.value, 100);
  
  // Commandflage settings
  currentSettings.commandflageEnabled = elements.commandflageEnabled.checked;
  currentSettings.commandflageCommands = elements.commandflageCommands.value
    .split(',')
    .map(s => sanitizeInput(s, 50))
    .filter(Boolean)
    .slice(0, 20); // Max 20 commands
  currentSettings.randomizeCommands = elements.randomizeCommands.checked;
  
  const commandRounds = parseInt(elements.commandRounds.value);
  currentSettings.commandRounds = (commandRounds >= 0 && commandRounds <= 100) ? commandRounds : 1;
  
  const commandCount = parseInt(elements.commandCount.value);
  currentSettings.commandCount = (commandCount >= 0 && commandCount <= 1000) ? commandCount : 0;
  
  // Save to storage
  chrome.storage.local.set(currentSettings, () => {
    // Reset button state
    saveButton.textContent = originalText;
    saveButton.disabled = false;
    
    showStatus('Settings saved!', 'success');
    updateAllTabIndicators(); // Update indicators after saving
    
    // Notify content scripts
    chrome.tabs.query({ url: ["https://kick.com/*", "https://*.kick.com/*"] }, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { 
            type: "STATE", 
            payload: currentSettings 
          }, () => {
            void chrome.runtime.lastError;
          });
        }
      });
    });
  });
}

function exportSettings() {
  const exportData = {
    ...currentSettings,
    exportDate: new Date().toISOString(),
    version: '2.0'
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `kick-auto-sender-settings-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showStatus('Settings exported!', 'success');
}

function importSettings() {
  elements.importFile.click();
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    showStatus('Please select a valid JSON file', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importData = JSON.parse(e.target.result);
      
      // Validate the import data
      if (!importData || typeof importData !== 'object') {
        throw new Error('Invalid settings file format');
      }
      
      // Check version compatibility (optional warning)
      if (importData.version && importData.version !== '2.0') {
        console.warn('Importing settings from different version:', importData.version);
      }
      
      // Merge imported settings with defaults to ensure all fields exist
      const validatedSettings = { ...DEFAULT_SETTINGS };
      
      // Copy over valid settings
      Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (key in importData && key !== 'stats') { // Don't import stats
          // Type validation
          if (typeof importData[key] === typeof DEFAULT_SETTINGS[key]) {
            validatedSettings[key] = importData[key];
          }
        }
      });
      
      // Special handling for arrays
      if (Array.isArray(importData.whitelist)) validatedSettings.whitelist = importData.whitelist;
      if (Array.isArray(importData.blacklistedWords)) validatedSettings.blacklistedWords = importData.blacklistedWords;
      if (Array.isArray(importData.selectedVoices)) validatedSettings.selectedVoices = importData.selectedVoices;
      if (Array.isArray(importData.customVoices)) validatedSettings.customVoices = importData.customVoices;
      if (Array.isArray(importData.messagePresets)) validatedSettings.messagePresets = importData.messagePresets;
      if (Array.isArray(importData.commandflageCommands)) validatedSettings.commandflageCommands = importData.commandflageCommands;
      
      // Special handling for objects
      if (importData.presetStats && typeof importData.presetStats === 'object') {
        validatedSettings.presetStats = importData.presetStats;
      }
      
      // Update current settings and save
      currentSettings = validatedSettings;
      chrome.storage.local.set(currentSettings);
      
      // Reload the UI
      loadSettings();
      
      showStatus('Settings imported successfully!', 'success');
      
    } catch (error) {
      console.error('Import error:', error);
      showStatus('Error importing settings: ' + error.message, 'error');
    }
  };
  
  reader.onerror = function() {
    showStatus('Error reading file', 'error');
  };
  
  reader.readAsText(file);
  
  // Clear the input so the same file can be imported again
  event.target.value = '';
}

// UI helpers
function showStatus(message, type = '') {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  
  setTimeout(() => {
    elements.status.textContent = '';
    elements.status.className = 'status';
  }, 3000);
}

// Tab indicator management
function updateTabIndicator(indicatorElement, status) {
  if (!indicatorElement) return;
  
  // Remove all status classes
  indicatorElement.classList.remove('inactive', 'active', 'partial', 'error');
  
  // Add the new status class
  indicatorElement.classList.add(status);
  
  // Set tooltip based on status
  const tooltips = {
    'inactive': 'Disabled',
    'partial': 'Needs config', 
    'active': 'Running',
    'error': 'Error'
  };
  
  indicatorElement.setAttribute('data-tooltip', tooltips[status] || 'Unknown');
}

function updateExtensionBadge(isEnabled) {
  try {
    if (isEnabled) {
      // Active state - default icon, no badge
      chrome.action.setIcon({
        path: {
          "16": "assets/logo.png",
          "32": "assets/logo.png", 
          "48": "assets/logo.png",
          "128": "assets/logo.png"
        }
      });
      chrome.action.setBadgeText({text: ''});
      chrome.action.setTitle({title: 'Kick AutoSend - Active'});
    } else {
      // Disabled state - use greyed-out icon with small red circle indicator
      chrome.action.setIcon({
        path: {
          "16": "assets/logo-disabled.png",
          "32": "assets/logo-disabled.png",
          "48": "assets/logo-disabled.png", 
          "128": "assets/logo-disabled.png"
        }
      });
      chrome.action.setBadgeText({text: ''});  // No badge - greyed icon is enough
      chrome.action.setTitle({title: 'Kick AutoSend - Disabled'});
    }
  } catch (error) {
    console.log('Badge update failed:', error);
  }
}

function updateMasterState() {
  const isEnabled = elements.masterEnabled.checked;
  
  // Update header logo to match state - use brightness filter for both themes
  if (isEnabled) {
    elements.headerImage.style.filter = '';
  } else {
    // Use brightness filter for both themes (consistent behavior)
    elements.headerImage.style.filter = 'brightness(30%)';
  }
  
  // Update main container to show disabled state
  const popup = document.querySelector('.container') || document.body;
  if (isEnabled) {
    popup.classList.remove('extension-disabled');
  } else {
    popup.classList.add('extension-disabled');
    
    // Stop all running processes when disabled
    stopRepeater();
    stopCommandflage();
  }
  
  // Disable/enable all tabs except settings
  elements.tabs.forEach(tab => {
    const tabId = tab.getAttribute('data-tab');
    if (tabId !== 'settings') {
      if (isEnabled) {
        tab.classList.remove('disabled-tab');
        tab.removeAttribute('disabled');
      } else {
        tab.classList.add('disabled-tab');
        tab.setAttribute('disabled', 'true');
      }
    }
  });
  
  // Update all form elements
  const formElements = document.querySelectorAll('input, textarea, button, select');
  formElements.forEach(element => {
    if (element.id === 'masterEnabled' || element.closest('.master-toggle')) {
      return; // Don't disable the master toggle itself
    }
    
    element.disabled = !isEnabled;
  });
  
  // Update badge status
  updateExtensionBadge(isEnabled);
  
  // Send master state to content script
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs && tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'MASTER_STATE_CHANGE',
        enabled: isEnabled
      }, () => {
        // Ignore errors if content script not ready
        if (chrome.runtime.lastError) {
          console.log('Content script not ready for master state update');
        }
      });
    }
  });
}

function updateAllTabIndicators() {
  // Skip if extension is disabled
  if (!currentSettings.masterEnabled) {
    // Set all indicators to inactive when master disabled
    updateTabIndicator(elements.repeaterIndicator, 'inactive');
    updateTabIndicator(elements.responderIndicator, 'inactive');
    updateTabIndicator(elements.voicesIndicator, 'inactive');
    updateTabIndicator(elements.commandflageIndicator, 'inactive');
    return;
  }
  
  // Repeater status
  if (elements.startRepeater && elements.startRepeater.disabled) {
    updateTabIndicator(elements.repeaterIndicator, 'active');
  } else if (currentSettings.repeaterEnabled && elements.repeaterMessage.value.trim()) {
    updateTabIndicator(elements.repeaterIndicator, 'partial');
  } else {
    updateTabIndicator(elements.repeaterIndicator, 'inactive');
  }
  
  // Responder status
  if (currentSettings.enabled && currentSettings.whitelist && currentSettings.whitelist.length > 0) {
    updateTabIndicator(elements.responderIndicator, 'active');
  } else if (currentSettings.enabled) {
    updateTabIndicator(elements.responderIndicator, 'partial');
  } else {
    updateTabIndicator(elements.responderIndicator, 'inactive');
  }
  
  // Voices status
  const hasVoiceRotation = currentSettings.voiceRotationRepeater || currentSettings.voiceRotationResponder;
  if (hasVoiceRotation && currentSettings.selectedVoices && currentSettings.selectedVoices.length > 0) {
    updateTabIndicator(elements.voicesIndicator, 'active');
  } else if (hasVoiceRotation) {
    updateTabIndicator(elements.voicesIndicator, 'partial');
  } else {
    updateTabIndicator(elements.voicesIndicator, 'inactive');
  }
  
  // Commandflage status
  if (elements.startCommandflage && elements.startCommandflage.disabled) {
    updateTabIndicator(elements.commandflageIndicator, 'active');
  } else if (currentSettings.commandflageEnabled && currentSettings.commandflageCommands && currentSettings.commandflageCommands.length > 0) {
    updateTabIndicator(elements.commandflageIndicator, 'partial');
  } else {
    updateTabIndicator(elements.commandflageIndicator, 'inactive');
  }
}

function updateAdvancedDisplay() {
  // Use current input values if advanced limits are enabled, otherwise use defaults
  const minDelay = currentSettings.useAdvancedLimits ? 
    (parseInt(elements.minDelay.value) || 90) : 90;
  const maxChars = currentSettings.useAdvancedLimits ? 
    (parseInt(elements.maxCharLimit.value) || 150) : 150;
  const blacklistCount = currentSettings.blacklistedWords ? currentSettings.blacklistedWords.length : 0;
  
  elements.currentMinDelay.textContent = `${minDelay}s`;
  elements.currentMaxChars.textContent = `${maxChars}`;
  elements.currentBlacklistCount.textContent = `${blacklistCount}`;
}

function updateAllCounters() {
  const maxChars = currentSettings.useAdvancedLimits ? currentSettings.maxCharLimit : 150;
  
  updateCharCounter(elements.whitelist, elements.whitelistCounter);
  updateCharCounter(elements.customMessage, elements.messageCounter, 500);
  updateCharCounter(elements.repeaterMessage, elements.repeaterCounter, maxChars);
  updateCharCounter(elements.blacklistedWords, elements.blacklistCounter);
  
  // Update commandflage commands counter
  if (elements.commandflageCommands && elements.commandsCounter) {
    const commands = elements.commandflageCommands.value.split(',').filter(s => s.trim()).length;
    elements.commandsCounter.textContent = `${commands} commands`;
  }
}

// Queue management functions
function addToQueue(message, type = 'auto', status = 'pending') {
  const queueItem = {
    id: ++queueIdCounter,
    timestamp: new Date(),
    message: message,
    type: type, // 'auto' or 'repeater'
    status: status, // 'pending', 'sent', 'failed', 'queued'
    attempts: 0
  };
  
  messageQueue.unshift(queueItem); // Add to beginning
  
  // Keep only last 50 items
  if (messageQueue.length > 50) {
    messageQueue = messageQueue.slice(0, 50);
  }
  
  updateQueueDisplay();
  return queueItem.id;
}

function updateQueueStatus(id, status, error = null) {
  const item = messageQueue.find(item => item.id === id);
  if (item) {
    item.status = status;
    item.lastUpdated = new Date();
    if (error) item.error = error;
    updateQueueDisplay();
  }
}

function updateQueueDisplay() {
  // Queue display removed - this function is kept for compatibility
  console.log('Queue display updated:', messageQueue.length, 'items');
}

function clearQueue() {
  // Queue functionality removed - keeping for compatibility
  messageQueue = [];
  console.log('Queue cleared');
}

function retryFailedMessages() {
  // Queue functionality removed - keeping for compatibility
  console.log('Retry failed messages called');
}

// Preset management functions
function savePreset() {
  const name = elements.presetName.value.trim();
  const message = elements.repeaterMessage.value.trim();
  
  if (!name) {
    showStatus('Please enter a preset name', 'error');
    return;
  }
  
  if (!message) {
    showStatus('Please enter a message to save', 'error');
    return;
  }
  
  // Check for duplicate names
  const existingIndex = currentSettings.messagePresets.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
  
  if (existingIndex !== -1) {
    if (!confirm(`Preset "${name}" already exists. Overwrite?`)) {
      return;
    }
    // Update existing preset
    currentSettings.messagePresets[existingIndex] = { name, message, created: new Date().toISOString() };
  } else {
    // Add new preset
    currentSettings.messagePresets.push({
      name,
      message,
      created: new Date().toISOString()
    });
  }
  
  // Clear the name input
  elements.presetName.value = '';
  
  saveSettings();
  updatePresetDisplay();
  showStatus(`Preset "${name}" saved!`, 'success');
}

function loadPreset(presetName) {
  console.log('Loading preset:', presetName);
  console.log('Available presets:', currentSettings.messagePresets);
  
  const preset = currentSettings.messagePresets.find(p => p.name === presetName);
  if (preset) {
    console.log('Found preset:', preset);
    elements.repeaterMessage.value = preset.message;
    
    // Trigger input event to update character counter
    elements.repeaterMessage.dispatchEvent(new Event('input'));
    
    updateCharCounter(elements.repeaterMessage, elements.repeaterCounter, 
      currentSettings.useAdvancedLimits ? currentSettings.maxCharLimit : 150);
    
    // Track preset usage
    trackPresetUsage(preset.name);
    
    showStatus(`Loaded preset: ${preset.name}`, 'success');
    console.log('Preset loaded successfully');
  } else {
    console.error('Preset not found:', presetName);
    showStatus(`Preset "${presetName}" not found`, 'error');
  }
}

// Track preset usage statistics
function trackPresetUsage(presetName) {
  if (!currentSettings.presetStats) {
    currentSettings.presetStats = {};
  }
  
  currentSettings.presetStats[presetName] = (currentSettings.presetStats[presetName] || 0) + 1;
  saveSettings();
  updateStatsDisplay();
}

function deletePreset(presetName) {
  if (!confirm(`Delete preset "${presetName}"?`)) {
    return;
  }
  
  currentSettings.messagePresets = currentSettings.messagePresets.filter(p => p.name !== presetName);
  
  // Also remove from stats when preset is deleted
  if (currentSettings.presetStats && currentSettings.presetStats[presetName]) {
    delete currentSettings.presetStats[presetName];
  }
  
  saveSettings();
  updatePresetDisplay();
  updateStatsDisplay();
  showStatus(`Preset "${presetName}" deleted`, 'success');
}

function updatePresetDisplay() {
  if (currentSettings.messagePresets.length === 0) {
    elements.presetList.innerHTML = '<div class="preset-empty">No presets saved</div>';
    return;
  }
  
  const presetsHTML = currentSettings.messagePresets.map((preset, index) => {
    const truncatedMessage = preset.message.length > 50 ? 
      preset.message.substring(0, 50) + '...' : preset.message;
    
    const usageCount = currentSettings.presetStats[preset.name] || 0;
    const presetTitle = usageCount > 0 ? `${preset.name} (used: ${usageCount})` : preset.name;
    
    return `
      <div class="preset-item">
        <div class="preset-content" data-preset-name="${preset.name}">
          <div class="preset-name">${presetTitle}</div>
          <div class="preset-message">${truncatedMessage}</div>
        </div>
        <div class="preset-actions">
          <button class="preset-btn delete" data-preset-delete="${preset.name}">Delete</button>
        </div>
      </div>
    `;
  }).join('');
  
  elements.presetList.innerHTML = presetsHTML;
  
  // Add event listeners for the newly created elements
  setupPresetEventListeners();
}

function setupPresetEventListeners() {
  // Add click listeners for loading presets
  const presetContents = elements.presetList.querySelectorAll('.preset-content');
  presetContents.forEach(content => {
    content.addEventListener('click', () => {
      const presetName = content.getAttribute('data-preset-name');
      loadPreset(presetName);
    });
  });
  
  // Add click listeners for deleting presets
  const deleteButtons = elements.presetList.querySelectorAll('.preset-btn.delete');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the preset load
      const presetName = button.getAttribute('data-preset-delete');
      deletePreset(presetName);
    });
  });
}

// Functions are now handled by event listeners in setupPresetEventListeners()

// Update stats display including top presets
function updateStatsDisplay() {
  // Update basic stats
  if (currentSettings.stats) {
    elements.totalReplies.textContent = currentSettings.stats.totalReplies || 0;
    elements.totalProcessed.textContent = currentSettings.stats.totalProcessed || 0;
    elements.totalRepeater.textContent = currentSettings.stats.totalRepeater || 0;
    elements.totalTimeouts.textContent = currentSettings.stats.timeouts || 0;
    elements.totalBans.textContent = currentSettings.stats.bans || 0;
    
    const total = (currentSettings.stats.totalReplies || 0) + (currentSettings.stats.totalRepeater || 0) + (currentSettings.stats.totalCommandflage || 0);
    const success = currentSettings.stats.successCount || 0;
    const rate = total > 0 ? Math.round((success / total) * 100) : 100;
    elements.successRate.textContent = `${rate}%`;
  }
  
  // Update top presets
  updateTopPresetsDisplay();
}

// Display top 5 presets by usage
function updateTopPresetsDisplay() {
  if (!currentSettings.presetStats || Object.keys(currentSettings.presetStats).length === 0) {
    elements.topPresets.innerHTML = '<div class="preset-empty">No preset usage data</div>';
    return;
  }
  
  // Sort presets by usage count (descending) and take top 5
  const sortedPresets = Object.entries(currentSettings.presetStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  let html = '';
  sortedPresets.forEach(([presetName, usageCount], index) => {
    // Find preset details
    const presetData = currentSettings.messagePresets.find(p => p.name === presetName);
    const message = presetData ? presetData.message : 'Deleted preset';
    
    html += `
      <div class="preset-item">
        <div class="preset-content">
          <div class="preset-name">#${index + 1} ${presetName}</div>
          <div class="preset-message">${message} (Used: ${usageCount}x)</div>
        </div>
      </div>
    `;
  });
  
  elements.topPresets.innerHTML = html;
}

// Repeater functionality
let repeaterTimeoutId = null;
let countdownInterval = null;
let repeaterCountdown = 0;
let messagesSent = 0;

function startRepeater() {
  // Show loading state
  const startButton = elements.startRepeater;
  startButton.textContent = 'Starting...';
  startButton.disabled = true;
  
  // Save settings first
  saveSettings();
  
  const message = elements.repeaterMessage.value.trim();
  const interval = parseInt(elements.interval.value) || 90;
  const maxCount = parseInt(elements.maxCount.value) || 0;
  
  if (!message) {
    startButton.textContent = 'Save & Start';
    startButton.disabled = false;
    showStatus('Please enter a repeater message', 'error');
    return;
  }
  
  // Test connection before starting repeater
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs && tabs[0]) {
      const tab = tabs[0];
      
      if (!tab.url || !tab.url.includes('kick.com')) {
        showStatus('Please navigate to a Kick.com channel to use the repeater', 'error');
        return;
      }
      
      ensureContentScriptReady(tab.id, (isReady, result) => {
        if (!isReady) {
          startButton.textContent = 'Save & Start';
          startButton.disabled = false;
          showStatus('Content script error: ' + result, 'error');
          return;
        }
        
        // Connection is ready, start the repeater
        startRepeaterWithConnection(message, interval, maxCount);
      });
    } else {
      showStatus('No active tab found - make sure you\'re on a Kick.com page', 'error');
    }
  });
}

function startRepeaterWithConnection(message, interval, maxCount) {
  // Reset counters
  messagesSent = 0;
  repeaterCountdown = 0;
  
  // Get current tab ID
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs && tabs[0]) {
      const tabId = tabs[0].id;
      
      // Send configuration to service worker to start background repeater
      chrome.runtime.sendMessage({
        type: 'START_REPEATER',
        config: {
          message: message,
          interval: interval,
          maxCount: maxCount
        },
        tabId: tabId
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error starting service worker repeater:', chrome.runtime.lastError.message);
          showStatus('Error starting repeater: ' + chrome.runtime.lastError.message, 'error');
        } else {
          console.log('Service worker repeater started successfully');
          
          // Start countdown display
          startCountdown(interval);
          
          // Update UI
          if (elements.startRepeater) {
            elements.startRepeater.disabled = true;
            elements.startRepeater.textContent = 'Running...';
          }
          if (elements.stopRepeater) elements.stopRepeater.disabled = false;
          updateAllTabIndicators(); // Update status indicators
          
          showStatus(`AutoSend started! Running in background, next message in ${interval}s`, 'success');
        }
      });
    }
  });
}

function stopRepeater() {
  console.log('🛑 stopRepeater() called in popup');
  
  // Stop service worker repeater
  chrome.runtime.sendMessage({
    type: 'STOP_REPEATER'
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Error stopping service worker repeater:', chrome.runtime.lastError.message);
    } else {
      console.log('✅ Service worker repeater stopped successfully:', response);
    }
  });
  
  // Stop local intervals
  if (repeaterInterval) {
    clearInterval(repeaterInterval);
    repeaterInterval = null;
  }
  
  if (repeaterTimeoutId) {
    clearTimeout(repeaterTimeoutId);
    repeaterTimeoutId = null;
  }
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  // Reset UI
  if (elements.startRepeater) {
    elements.startRepeater.disabled = false;
    elements.startRepeater.textContent = 'Save and Start';
  }
  if (elements.stopRepeater) elements.stopRepeater.disabled = true;
  updateAllTabIndicators(); // Update status indicators
  
  // Clear countdown display
  if (elements.nextMessage) elements.nextMessage.textContent = '--';
  if (elements.messagesLeft) elements.messagesLeft.textContent = '--';
  
  showStatus('AutoSend stopped', 'success');
  console.log('AutoSend stopped. Total messages sent:', messagesSent);
}

// Test if content script is ready with retry logic
function testContentScriptConnection(tabId, callback, retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  
  chrome.tabs.sendMessage(tabId, { type: 'PING' }, (response) => {
    if (chrome.runtime.lastError) {
      if (retryCount < maxRetries) {
        console.log(`Content script not ready, retrying in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          testContentScriptConnection(tabId, callback, retryCount + 1);
        }, retryDelay);
      } else {
        callback(false, `Content script not ready after ${maxRetries} attempts. Try refreshing the page.`);
      }
    } else {
      callback(true, response);
    }
  });
}

// Enhanced function to test and possibly inject content script
function ensureContentScriptReady(tabId, callback) {
  // First, test if content script is already ready
  testContentScriptConnection(tabId, (isReady, result) => {
    if (isReady) {
      callback(true, result);
    } else {
      // If not ready, try to inject/reinject the content script
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          callback(false, 'Cannot access tab information');
          return;
        }
        
        if (!tab.url || !tab.url.includes('kick.com')) {
          callback(false, 'Not on a Kick.com page');
          return;
        }
        
        // Attempt to execute content script
        chrome.tabs.executeScript(tabId, {
          file: 'content.js'
        }, () => {
          if (chrome.runtime.lastError) {
            // Script might already be injected, test again
            setTimeout(() => {
              testContentScriptConnection(tabId, callback);
            }, 500);
          } else {
            // Wait a moment for script to initialize, then test
            setTimeout(() => {
              testContentScriptConnection(tabId, callback);
            }, 1000);
          }
        });
      });
    }
  });
}

function sendRepeaterMessage(message) {
  // Process message for voice rotation
  const processedMessage = processMessage(message, 'repeater');
  
  console.log('🔄 Attempting to send repeater message:', processedMessage);
  
  // Send to content script
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs && tabs[0]) {
      const tab = tabs[0];
      
      // Check if tab is on Kick.com
      if (!tab.url || !tab.url.includes('kick.com')) {
        console.error('❌ Not on Kick.com page:', tab.url);
        showStatus('Please navigate to a Kick.com channel to use the repeater', 'error');
        return;
      }
      
      console.log('📤 Testing connection to tab:', tab.id, 'URL:', tab.url);
      
      // Test connection first
      ensureContentScriptReady(tab.id, (isReady, result) => {
        if (!isReady) {
          console.error('❌ Content script not ready:', result);
          showStatus('Content script error: ' + result, 'error');
          return;
        }
        
        console.log('✅ Content script ready, sending message');
        
        try {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SEND_REPEATER_MESSAGE',
            message: processedMessage
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('❌ Error sending repeater message:', chrome.runtime.lastError.message);
              showStatus('Error sending repeater message: ' + chrome.runtime.lastError.message, 'error');
            } else {
              console.log('✅ AutoSend message sent successfully:', response);
              // Update stats only on successful send
              updateStats('totalRepeater');
            }
          });
        } catch (error) {
          console.error('❌ Exception sending message:', error);
          showStatus('Error sending message: ' + error.message, 'error');
        }
      });
    } else {
      console.error('❌ No active tab found for sending repeater message');
      showStatus('No active tab found - make sure you\'re on a Kick.com page', 'error');
    }
  });
}

function startCountdown(interval) {
  repeaterCountdown = interval;
  updateCountdownDisplay();
  
  countdownInterval = setInterval(() => {
    repeaterCountdown--;
    updateCountdownDisplay();
    
    if (repeaterCountdown <= 0) {
      repeaterCountdown = interval; // Reset for next cycle
    }
  }, 1000);
}

function updateCountdownDisplay() {
  if (elements.nextMessage) {
    elements.nextMessage.textContent = repeaterCountdown > 0 ? `${repeaterCountdown}s` : 'Sending...';
  }
  
  const maxCount = parseInt(elements.maxCount.value) || 0;
  if (elements.messagesLeft && maxCount > 0) {
    const remaining = Math.max(0, maxCount - messagesSent);
    elements.messagesLeft.textContent = remaining > 0 ? `${remaining} left` : 'Complete';
  }
}

// Commaflage functions
function startCommandflage() {
  // Save settings first
  saveSettings();
  
  const commands = elements.commandflageCommands.value.trim();
  const randomize = elements.randomizeCommands.checked;
  const rounds = parseInt(elements.commandRounds.value) || 1;
  const maxCommands = parseInt(elements.commandCount.value) || 0;
  
  if (!commands) {
    showStatus('Please enter commands for commaflage', 'error');
    return;
  }
  
  // Test connection before starting commaflage
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs && tabs[0]) {
      const tab = tabs[0];
      
      if (!tab.url || !tab.url.includes('kick.com')) {
        showStatus('Please navigate to a Kick.com channel to use commaflage', 'error');
        return;
      }
      
      ensureContentScriptReady(tab.id, (isReady, result) => {
        if (!isReady) {
          showStatus('Content script error: ' + result, 'error');
          return;
        }
        
        // Connection is ready, start the commaflage
        startCommaflageWithConnection(commands, randomize, rounds, maxCommands, tab.id);
      });
    } else {
      showStatus('No active tab found - make sure you\'re on a Kick.com page', 'error');
    }
  });
}

function startCommaflageWithConnection(commands, randomize, rounds, maxCommands, tabId) {
  // Send configuration to service worker to start background commaflage
  chrome.runtime.sendMessage({
    type: 'START_COMMAFLAGE',
    config: {
      commands: commands,
      randomize: randomize,
      rounds: rounds,
      maxCommands: maxCommands
    },
    tabId: tabId
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error starting service worker commaflage:', chrome.runtime.lastError.message);
      showStatus('Error starting commaflage: ' + chrome.runtime.lastError.message, 'error');
    } else {
      console.log('Service worker commaflage started successfully');
      
      // Update UI
      if (elements.startCommandflage) {
        elements.startCommandflage.disabled = true;
        elements.startCommandflage.textContent = 'Running...';
      }
      if (elements.stopCommandflage) elements.stopCommandflage.disabled = false;
      updateAllTabIndicators(); // Update status indicators
      
      showStatus(`Commaflage started! Running in background with ${commands.split(',').length} commands`, 'success');
    }
  });
}

function stopCommandflage() {
  // Stop service worker commaflage
  chrome.runtime.sendMessage({
    type: 'STOP_COMMAFLAGE'
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error stopping service worker commaflage:', chrome.runtime.lastError.message);
    } else {
      console.log('Service worker commaflage stopped successfully');
    }
  });
  
  // Reset UI
  if (elements.startCommandflage) {
    elements.startCommandflage.disabled = false;
    elements.startCommandflage.textContent = 'Save and Start';
  }
  if (elements.stopCommandflage) elements.stopCommandflage.disabled = true;
  updateAllTabIndicators(); // Update status indicators
  
  showStatus('Commaflage stopped', 'success');
  console.log('Commaflage stopped');
}

// Event listeners
function initEventListeners() {
  // Character counters
  elements.whitelist.addEventListener('input', () => updateCharCounter(elements.whitelist, elements.whitelistCounter));
  elements.customMessage.addEventListener('input', () => updateCharCounter(elements.customMessage, elements.messageCounter, 500));
  elements.repeaterMessage.addEventListener('input', () => {
    const maxChars = currentSettings.useAdvancedLimits ? currentSettings.maxCharLimit : 150;
    updateCharCounter(elements.repeaterMessage, elements.repeaterCounter, maxChars);
  });
  elements.blacklistedWords.addEventListener('input', () => {
    updateCharCounter(elements.blacklistedWords, elements.blacklistCounter);
    updateAdvancedDisplay();
  });
  elements.commandflageCommands.addEventListener('input', () => {
    const commands = elements.commandflageCommands.value.split(',').filter(s => s.trim()).length;
    elements.commandsCounter.textContent = `${commands} commands`;
  });
  
  // Advanced settings
  elements.minDelay.addEventListener('input', updateAdvancedDisplay);
  elements.maxCharLimit.addEventListener('input', () => {
    updateAdvancedDisplay();
    updateAllCounters();
  });
  elements.useAdvancedLimits.addEventListener('change', () => {
    updateAdvancedDisplay();
    updateAllCounters();
  });
  
  // Repeater controls
  elements.startRepeater.addEventListener('click', startRepeater);
  elements.stopRepeater.addEventListener('click', stopRepeater);
  
  // Voice controls
  elements.selectAllVoices.addEventListener('click', () => {
    const allVoices = [...VOICES, ...currentSettings.customVoices];
    allVoices.forEach(voice => {
      const checkbox = document.getElementById(`voice-${voice}`);
      if (checkbox) checkbox.checked = true;
    });
    setTimeout(updateAllTabIndicators, 100);
  });
  
  elements.clearAllVoices.addEventListener('click', () => {
    const allVoices = [...VOICES, ...currentSettings.customVoices];
    allVoices.forEach(voice => {
      const checkbox = document.getElementById(`voice-${voice}`);
      if (checkbox) checkbox.checked = false;
    });
    setTimeout(updateAllTabIndicators, 100);
  });
  
  // Custom voice controls
  elements.addCustomVoice.addEventListener('click', addCustomVoice);
  elements.customVoiceName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCustomVoice();
    }
  });
  
  // Repeater controls
  elements.startRepeater.addEventListener('click', startRepeater);
  elements.stopRepeater.addEventListener('click', stopRepeater);
  
  // Commaflage controls
  elements.startCommandflage.addEventListener('click', startCommandflage);
  elements.stopCommandflage.addEventListener('click', stopCommandflage);
  
  // Preset controls
  elements.savePreset.addEventListener('click', savePreset);
  
  // Allow Enter key to save preset
  elements.presetName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      savePreset();
    }
  });
  
  // Stats controls
  elements.resetStats.addEventListener('click', resetStats);
  elements.resetPresetStats.addEventListener('click', resetPresetStats);
  elements.exportSettings.addEventListener('click', exportSettings);
  elements.importSettings.addEventListener('click', importSettings);
  elements.importFile.addEventListener('change', handleImportFile);
  
  // Save button
  elements.save.addEventListener('click', saveSettings);
  
  // Auto-save on toggle changes
  [elements.enabled, elements.includeSubscribers, elements.responderAllowCommands, elements.voiceRotationRepeater, elements.voiceRotationResponder, elements.useAdvancedLimits, elements.commandflageEnabled].forEach(toggle => {
    toggle.addEventListener('change', () => {
      saveSettings();
      updateAllTabIndicators(); // Update indicators on toggle changes
    });
  });
  
  // Special handling for AutoSend toggle - stop AutoSend when disabled
  elements.repeaterEnabled.addEventListener('change', () => {
    if (!elements.repeaterEnabled.checked) {
      console.log('🛑 AutoSend Mode toggled OFF - stopping AutoSend');
      stopRepeater();
    }
    saveSettings();
    updateAllTabIndicators();
  });
  
  // Master toggle event listener
  elements.masterEnabled.addEventListener('change', () => {
    console.log('🔄 Master extension toggle changed:', elements.masterEnabled.checked);
    saveSettings();
    updateMasterState();
    updateAllTabIndicators();
  });
  
  // Update indicators when text inputs change
  elements.whitelist.addEventListener('input', () => {
    setTimeout(updateAllTabIndicators, 100); // Small delay to ensure processing
  });
  
  elements.repeaterMessage.addEventListener('input', () => {
    setTimeout(updateAllTabIndicators, 100);
  });
  
  elements.commandflageCommands.addEventListener('input', () => {
    setTimeout(updateAllTabIndicators, 100);
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_STATS') {
    updateStats(message.stat, message.value || 1);
  }
  
  if (message.type === 'QUEUE_UPDATE') {
    updateQueueStatus(message.queueId, message.status, message.error);
  }
  
  if (message.type === 'ADD_TO_QUEUE') {
    addToQueue(message.message, message.messageType, 'pending');
  }
});

// Debug function for checking repeater status
window.checkRepeaterStatus = function() {
  console.log('🔍 REPEATER STATUS CHECK');
  console.log('Interval active:', !!repeaterInterval);
  console.log('Pending timeouts:', pendingRepeaterTimeouts.size);
  console.log('Pending timeout IDs:', Array.from(pendingRepeaterTimeouts));
  console.log('Start button disabled:', elements.startRepeater.disabled);
  console.log('Stop button disabled:', elements.stopRepeater.disabled);
  return {
    intervalActive: !!repeaterInterval,
    pendingTimeouts: pendingRepeaterTimeouts.size,
    startDisabled: elements.startRepeater.disabled,
    stopDisabled: elements.stopRepeater.disabled
  };
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initThemes();
  initVoiceGrid();
  initEventListeners();
  loadSettings();
  updatePresetDisplay(); // Initialize preset display
  
  // Initialize badge on popup load
  chrome.storage.local.get(['masterEnabled'], (settings) => {
    updateExtensionBadge(settings.masterEnabled !== false);
  });
});

// Clean up when popup closes
window.addEventListener('beforeunload', () => {
  // Use interval manager for cleanup if available
  if (typeof window !== 'undefined' && window.intervalManager) {
    window.intervalManager.clearAll();
  } else {
    // Fallback cleanup
    pendingRepeaterTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    pendingRepeaterTimeouts.clear();
    
    if (repeaterInterval) {
      clearInterval(repeaterInterval);
    }
  }
});