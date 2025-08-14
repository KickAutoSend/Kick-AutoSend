// Sets defaults on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(null, (res) => {
    const init = {};
    if (typeof res.masterEnabled !== "boolean") init.masterEnabled = true;
    if (typeof res.enabled !== "boolean") init.enabled = false;
    if (!Array.isArray(res.whitelist)) init.whitelist = [];
    if (typeof res.customMessage !== "string") init.customMessage = '';
    if (typeof res.includeSubscribers !== "boolean") init.includeSubscribers = false;
    if (typeof res.repeaterEnabled !== "boolean") init.repeaterEnabled = false;
    if (typeof res.repeaterMessage !== "string") init.repeaterMessage = '!duke hello everyone!';
    if (typeof res.interval !== "number") init.interval = 90;
    if (typeof res.maxCount !== "number") init.maxCount = 0;
    if (typeof res.voiceRotationRepeater !== "boolean") init.voiceRotationRepeater = false;
    if (typeof res.voiceMode !== "string") init.voiceMode = 'random';
    if (!Array.isArray(res.selectedVoices)) init.selectedVoices = ['duke', 'trump', 'spongebob'];
    if (typeof res.minDelay !== "number") init.minDelay = 90;
    if (typeof res.maxCharLimit !== "number") init.maxCharLimit = 150;
    if (!Array.isArray(res.blacklistedWords)) init.blacklistedWords = [];
    if (typeof res.useAdvancedLimits !== "boolean") init.useAdvancedLimits = false;
    if (typeof res.currentTheme !== "string") init.currentTheme = 'kick';
    if (!Array.isArray(res.customVoices)) init.customVoices = [];
    if (!Array.isArray(res.messagePresets)) init.messagePresets = [];
    if (typeof res.presetStats !== "object") init.presetStats = {};
    if (typeof res.channelRestriction !== "string") init.channelRestriction = '';
    if (typeof res.commandflageEnabled !== "boolean") init.commandflageEnabled = false;
    if (!Array.isArray(res.commandflageCommands)) init.commandflageCommands = [];
    if (typeof res.randomizeCommands !== "boolean") init.randomizeCommands = true;
    if (typeof res.commandRounds !== "number") init.commandRounds = 1;
    if (typeof res.commandCount !== "number") init.commandCount = 0;
    if (typeof res.stats !== "object") init.stats = {
      totalReplies: 0,
      totalProcessed: 0,
      totalRepeater: 0,
      totalCommandflage: 0,
      timeouts: 0,
      bans: 0,
      successCount: 0
    };
    if (Object.keys(init).length) chrome.storage.local.set(init);
  });
});

// Broadcast state updates to all kick.com tabs
function notifyAllKickTabs() {
  chrome.tabs.query({ url: ["https://kick.com/*", "https://*.kick.com/*"] }, (tabs) => {
    chrome.storage.local.get(null, (cfg) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: "STATE", payload: cfg }, () => {
            // Ignore errors for tabs that might not be ready
            void chrome.runtime.lastError;
          });
        }
      });
    });
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  notifyAllKickTabs();
});

// Repeater functionality in service worker
let repeaterInterval = null;
let repeaterState = {
  active: false,
  message: '',
  interval: 90,
  maxCount: 0,
  messagesSent: 0,
  tabId: null
};

// Commaflage functionality in service worker
let commaflageInterval = null;
let commaflageState = {
  active: false,
  commands: [],
  randomize: true,
  rounds: 1,
  maxCommands: 0,
  currentRound: 1,
  commandsSent: 0,
  tabId: null,
  commandQueue: [],
  currentCommandIndex: 0
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "PING") {
    // Send current state to the requesting tab
    chrome.storage.local.get(null, (cfg) => {
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { type: "STATE", payload: cfg }, () => {
          void chrome.runtime.lastError;
        });
      }
    });
    sendResponse({ ok: true });
    return true;
  }
  
  if (msg && msg.type === "UPDATE_STATS") {
    // Forward stats updates to popup
    chrome.runtime.sendMessage(msg, () => {
      void chrome.runtime.lastError;
    });
    return true;
  }
  
  if (msg && msg.type === "START_REPEATER") {
    startServiceWorkerRepeater(msg.config, msg.tabId);
    sendResponse({ success: true });
    return true;
  }
  
  if (msg && msg.type === "STOP_REPEATER") {
    stopServiceWorkerRepeater();
    sendResponse({ success: true });
    return true;
  }
  
  if (msg && msg.type === "GET_REPEATER_STATUS") {
    sendResponse(repeaterState);
    return true;
  }
  
  if (msg && msg.type === "START_COMMAFLAGE") {
    startServiceWorkerCommaflage(msg.config, msg.tabId);
    sendResponse({ success: true });
    return true;
  }
  
  if (msg && msg.type === "STOP_COMMAFLAGE") {
    stopServiceWorkerCommaflage('manually stopped');
    sendResponse({ success: true });
    return true;
  }
  
  if (msg && msg.type === "GET_COMMAFLAGE_STATUS") {
    sendResponse(commaflageState);
    return true;
  }
  
  if (msg && msg.type === "CLEAR_COMMAFLAGE_COMPLETION") {
    // Clear completion state
    delete commaflageState.completionReason;
    delete commaflageState.completionCommandsSent;
    delete commaflageState.completionRoundsCompleted;
    delete commaflageState.completionTime;
    sendResponse({ success: true });
    return true;
  }
});

function startServiceWorkerRepeater(config, tabId) {
  // Check if extension is globally enabled
  chrome.storage.local.get(['masterEnabled'], (settings) => {
    if (!settings.masterEnabled) {
      return;
    }
  });
  
  // Check channel restriction
  chrome.storage.local.get(['channelRestriction'], (settings) => {
    if (settings.channelRestriction && settings.channelRestriction.trim() !== '') {
      // We'll check this in the content script when sending messages
    }
  });
  
  // Stop any existing repeater
  stopServiceWorkerRepeater();
  
  repeaterState = {
    active: true,
    message: config.message,
    interval: config.interval,
    maxCount: config.maxCount,
    messagesSent: 0,
    tabId: tabId
  };
  
  // Send first message immediately
  sendRepeaterMessageFromServiceWorker();
  
  // Set up interval for subsequent messages
  repeaterInterval = setInterval(() => {
    // Check if we've reached max count
    if (repeaterState.maxCount > 0 && repeaterState.messagesSent >= repeaterState.maxCount) {
      stopServiceWorkerRepeater();
      
      // Notify popup that max count was reached
      chrome.runtime.sendMessage({
        type: 'REPEATER_MAX_COUNT_REACHED',
        messagesSent: repeaterState.messagesSent,
        maxCount: repeaterState.maxCount
      });
      return;
    }
    
    // Check if tab still exists before sending
    chrome.tabs.get(repeaterState.tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        stopServiceWorkerRepeater();
        return;
      }
      
      // Send the message
      sendRepeaterMessageFromServiceWorker();
    });
  }, repeaterState.interval * 1000);
}

function stopServiceWorkerRepeater() {
  if (repeaterInterval) {
    clearInterval(repeaterInterval);
    repeaterInterval = null;
  }
  
  repeaterState.active = false;
}

function sendRepeaterMessageFromServiceWorker() {
  if (!repeaterState.tabId) return;
  
  // Get current settings to apply voice rotation
  chrome.storage.local.get(['voiceRotationRepeater', 'selectedVoices', 'customVoices', 'voiceMode'], (settings) => {
    let processedMessage = repeaterState.message;
    
    // Apply voice rotation if enabled
    if (settings.voiceRotationRepeater && settings.selectedVoices && settings.selectedVoices.length > 0) {
      processedMessage = applyVoiceRotation(processedMessage, settings);
    }
    
    chrome.tabs.sendMessage(repeaterState.tabId, {
      type: 'SEND_REPEATER_MESSAGE',
      message: processedMessage
    }, (response) => {
      if (chrome.runtime.lastError) {
        // Check if it's a connection error
        if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
          // Don't stop the repeater, just skip this message and try again next time
          return;
        }
        
        // For other errors, stop repeater
        stopServiceWorkerRepeater();
      } else {
        repeaterState.messagesSent++;
        
        // Send message count update to popup
        chrome.runtime.sendMessage({
          type: 'REPEATER_MESSAGE_SENT',
          messagesSent: repeaterState.messagesSent,
          maxCount: repeaterState.maxCount
        });
      }
    });
  });
}

// Voice rotation functionality
let voiceIndex = 0;

function applyVoiceRotation(message, settings) {
  // Get all available voices (selected + custom)
  const allVoices = [...(settings.selectedVoices || ['duke']), ...(settings.customVoices || [])];
  
  if (allVoices.length === 0) return message;
  
  // Find voice commands in the message (e.g., !duke, !trump)
  const voicePattern = /![a-zA-Z0-9]+/g;
  const matches = message.match(voicePattern);
  
  if (!matches || matches.length === 0) return message;
  
  // Replace the first voice command found
  const currentVoice = matches[0];
  
  // Get next voice based on mode
  let nextVoice;
  if (settings.voiceMode === 'sequential') {
    nextVoice = allVoices[voiceIndex % allVoices.length];
    voiceIndex++;
  } else {
    // Random mode
    nextVoice = allVoices[Math.floor(Math.random() * allVoices.length)];
  }
  
  // Replace the voice command
  const processedMessage = message.replace(currentVoice, `!${nextVoice}`);
  
  return processedMessage;
}

// Commaflage functions
function startServiceWorkerCommaflage(config, tabId) {
  // Stop any existing commaflage
  stopServiceWorkerCommaflage();
  
  // Parse messages from comma-separated string (can be commands or regular text)
  const commands = config.commands
    .split(',')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);
  
  if (commands.length === 0) {
    console.error('No valid messages provided for commaflage');
    return;
  }
  
  commaflageState = {
    active: true,
    commands: commands,
    randomize: config.randomize,
    rounds: config.rounds,
    maxCommands: config.maxCommands,
    interval: config.interval || 3, // Default to 3 seconds
    currentRound: 1,
    commandsSent: 0,
    tabId: tabId,
    commandQueue: [],
    currentCommandIndex: 0
  };
  
  // Prepare command queue for first round
  prepareCommandQueue();
  
  // Send first command immediately
  sendNextCommaflageCommand();
  
  // Set up interval for subsequent commands (configurable)
  const intervalMs = (commaflageState.interval || 3) * 1000;
  commaflageInterval = setInterval(() => {
    sendNextCommaflageCommand();
  }, intervalMs);
}

function stopServiceWorkerCommaflage(reason = 'stopped') {
  if (commaflageInterval) {
    clearInterval(commaflageInterval);
    commaflageInterval = null;
  }
  
  // Store completion state for popup to check
  commaflageState.completionReason = reason;
  commaflageState.completionCommandsSent = commaflageState.commandsSent;
  commaflageState.completionRoundsCompleted = commaflageState.currentRound - 1;
  commaflageState.completionTime = Date.now();
  
  commaflageState.active = false;
}

function prepareCommandQueue() {
  // Create a copy of commands for this round
  let roundCommands = [...commaflageState.commands];
  
  // Randomize if enabled
  if (commaflageState.randomize) {
    for (let i = roundCommands.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roundCommands[i], roundCommands[j]] = [roundCommands[j], roundCommands[i]];
    }
  }
  
  commaflageState.commandQueue = roundCommands;
  commaflageState.currentCommandIndex = 0;
}

function sendNextCommaflageCommand() {
  if (!commaflageState.tabId || !commaflageState.active) return;
  
  // Check if we've exceeded max commands
  if (commaflageState.maxCommands > 0 && commaflageState.commandsSent >= commaflageState.maxCommands) {
    stopServiceWorkerCommaflage('max commands reached');
    return;
  }
  
  // Check if current round is complete
  if (commaflageState.currentCommandIndex >= commaflageState.commandQueue.length) {
    // Round complete
    if (commaflageState.rounds > 0 && commaflageState.currentRound >= commaflageState.rounds) {
      stopServiceWorkerCommaflage('all rounds completed');
      return;
    }
    
    // Start next round
    commaflageState.currentRound++;
    prepareCommandQueue();
  }
  
  // Get next message
  const message = commaflageState.commandQueue[commaflageState.currentCommandIndex];
  commaflageState.currentCommandIndex++;
  
  // Send message
  chrome.tabs.sendMessage(commaflageState.tabId, {
    type: 'SEND_REPEATER_MESSAGE', // Reuse the same message sending system
    message: message
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending commaflage command:', chrome.runtime.lastError.message);
      if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
        stopServiceWorkerCommaflage('connection lost');
      }
    } else {
      commaflageState.commandsSent++;
    }
  });
}