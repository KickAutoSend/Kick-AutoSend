/**
 * Kick AutoSend - Content Script
 * Copyright (c) 2025 Kick AutoSend
 * 
 * This script provides chat automation features for Kick.com
 * Including auto-reply, message repeater, and voice rotation
 */

// Current state cached in the page
let STATE = { 
    isEnabled: false,
    whitelist: [],
    blacklist: [],
    autoReplyEnabled: false,
    repeaterEnabled: false,
    voiceRotationEnabled: false,
    currentTheme: 'kick',
    settings: {
        rateLimit: 60,
        maxMessageLength: 200,
        includeSubscribers: false,
        delayBetweenMessages: 1000
    },
    stats: {
        totalMessages: 0,
        totalReplies: 0,
        totalRepeats: 0,
        lastUsed: null
    }
};

// Tracks processed messages by a stable id (persistent across refreshes)
let seen = new Set();
let seenLoaded = false;

// Load persistent message IDs on script load
chrome.storage.local.get(['processedMessageIds'], (result) => {
  try {
    if (result.processedMessageIds && Array.isArray(result.processedMessageIds)) {
      seen = new Set(result.processedMessageIds);
      debugLog('✅ Loaded', seen.size, 'processed message IDs from storage');
    } else {
      debugLog('✅ No previous message IDs found, starting fresh');
    }
    seenLoaded = true;
  } catch (error) {
    debugLog('❌ Error loading message IDs:', error);
    seen = new Set();
    seenLoaded = true;
  }
});

// Save processed message IDs to storage (with cleanup)
function saveProcessedIds() {
  try {
    const idsArray = Array.from(seen);
    // Keep only the last 500 IDs to prevent unbounded growth (reduced for better performance)
    if (idsArray.length > 500) {
      const keepIds = idsArray.slice(-500);
      seen = new Set(keepIds);
      debugLog('🧹 Cleaned processed IDs, kept latest 500');
    }
    chrome.storage.local.set({ processedMessageIds: Array.from(seen) });
    debugLog('💾 Saved', seen.size, 'processed IDs to storage');
  } catch (error) {
    debugLog('❌ Error saving processed IDs:', error);
  }
}

// Cleanup old processed IDs periodically (every 10 minutes) - using managed interval
if (typeof window !== 'undefined' && window.intervalManager) {
  window.intervalManager.setInterval('seen-cleanup', () => {
    if (seen.size > 300) {
      const idsArray = Array.from(seen);
      const keepIds = idsArray.slice(-300);
      seen = new Set(keepIds);
      saveProcessedIds();
      debugLog('🧹 Managed cleanup: kept latest 300 processed message IDs');
    }
  }, 10 * 60 * 1000);
} else {
  // Fallback
  setInterval(() => {
    if (seen.size > 300) {
      const idsArray = Array.from(seen);
      const keepIds = idsArray.slice(-300);
      seen = new Set(keepIds);
      saveProcessedIds();
      debugLog('Periodic cleanup: kept latest 300 processed message IDs');
    }
  }, 10 * 60 * 1000);
}

// Rate limiting
let lastMessageTime = 0;
let messageCount = 0;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 60;

// Timeout and ban tracking
let timeoutCount = 0;
let banCount = 0;

// Debug logging (enhanced for troubleshooting)
function debugLog(message, data = null) {
  // Log important events and debugging info
  if (message.includes('🎉') || message.includes('🎯') || message.includes('ERROR') || 
      message.includes('State updated') || message.includes('🔍') || message.includes('❌')) {
    console.log(`[Kick Auto Reply] ${message}`, data || '');
  }
}

// Check if user is timed out
function isUserTimedOut() {
  const timeoutIndicator = document.querySelector('[data-testid="chat-input"]');
  if (timeoutIndicator && timeoutIndicator.getAttribute('contenteditable') === 'false') {
    const parentDiv = timeoutIndicator.closest('.relative');
    if (parentDiv) {
      const timeoutText = parentDiv.querySelector('div[class*="pointer-events-none"]');
      if (timeoutText && timeoutText.textContent.includes('timed out')) {
        return true;
      }
    }
  }
  return false;
}

// Check if user is banned
function isUserBanned() {
  const chatInput = document.querySelector('[data-testid="chat-input"]');
  if (chatInput && chatInput.getAttribute('contenteditable') === 'false') {
    const parentContainer = chatInput.closest('.flex.grow.flex-col.gap-2');
    if (parentContainer) {
      const banText = parentContainer.querySelector('div[class*="pointer-events-none"]');
      if (banText && banText.textContent.includes('banned from chat')) {
        return true;
      }
    }
  }
  return false;
}

// Channel detection - persistent across navigation
let currentChannel = '';
let lastUrl = '';

// Get current channel name from URL
function getCurrentChannel() {
  try {
    const path = window.location.pathname;
    const match = path.match(/^\/([^\/]+)/);
    const channel = match ? match[1].toLowerCase() : '';
    debugLog('🔍 Current channel extracted:', channel, 'from path:', path);
    return channel;
  } catch (error) {
    debugLog('❌ Error getting current channel:', error);
    return '';
  }
}

// Check if URL has changed and update channel if needed
function checkChannelChange() {
  const newUrl = window.location.href;
  if (newUrl !== lastUrl) {
    lastUrl = newUrl;
    const newChannel = getCurrentChannel();
    if (newChannel !== currentChannel) {
      currentChannel = newChannel;
      debugLog('🔄 Channel changed to:', currentChannel);
      
      // Reset processed messages when channel changes
      seen.clear();
      saveProcessedIds();
      debugLog('🧹 Cleared processed messages due to channel change');
    }
  }
}

// Check if extension should work in current channel (uses cached channel)
function isChannelAllowed() {
  try {
    if (!STATE || !STATE.channelRestriction || STATE.channelRestriction.trim() === '') {
      return true; // No restriction means work everywhere
    }
    
    const allowedChannel = STATE.channelRestriction.toLowerCase().trim();
    
    debugLog('Channel check - Current:', currentChannel, 'Allowed:', allowedChannel);
    return currentChannel === allowedChannel;
  } catch (error) {
    debugLog('❌ Error in isChannelAllowed:', error);
    return true; // Default to allowing if there's an error
  }
}

// Enhanced debug function to log current state
function debugState() {
  debugLog('=== CURRENT STATE ===');
  debugLog('Extension enabled:', STATE.enabled);
  debugLog('Whitelist:', STATE.whitelist);
  debugLog('Blacklisted words:', STATE.blacklistedWords);
  debugLog('Whitelist length:', STATE.whitelist.length);
  debugLog('=================');
}

// Available TTS voices
const VOICES = [
  'anthony', 'trump', 'spongebob', 'drphil', 'tate', 'petergriffin', 'biden', 'arnold', 
  'train', 'joerogan', 'alexjones', 'samueljackson', 'kermit', 'eddie', 'goku', 'ice', 
  'herbert', 'unc', 'icespice', 'snoop', 'rock', 'morgan', 'sketch', 'kevinhart', 
  '50cent', 'kanye', 'mcgregor', 'willsmith', 'elon', 'kamala', 'jordan', 'shapiro', 
  'djkhaled', 'jayz', 'princeharry', 'robertdowneyjr', 'billgates', 'lex', 'duke', 
  'ebz', 'ariana', 'kim', 'cardi', 'rainbow', 'swift', 'watson', 'hillary', 'thrall', 'steve'
];

let voiceIndex = 0;

// Voice rotation functionality
function getRandomVoice() {
  // Combine selected voices and custom voices
  const allVoices = [...(STATE.selectedVoices || ['duke']), ...(STATE.customVoices || [])];
  return allVoices[Math.floor(Math.random() * allVoices.length)];
}

function getSequentialVoice() {
  // Combine selected voices and custom voices
  const allVoices = [...(STATE.selectedVoices || ['duke']), ...(STATE.customVoices || [])];
  const voice = allVoices[voiceIndex % allVoices.length];
  voiceIndex++;
  return voice;
}

function getNextVoice() {
  if (!STATE.voiceRotationEnabled) return null;
  return STATE.voiceMode === 'random' ? getRandomVoice() : getSequentialVoice();
}

// Message processing with voice replacement
function processMessage(template) {
  if (!STATE.voiceRotationEnabled) return template;
  
  // Find voice commands in the message (e.g., !duke, !trump)
  const voicePattern = /![a-zA-Z0-9]+/g;
  const matches = template.match(voicePattern);
  
  if (!matches || matches.length === 0) return template;
  
  // Replace the first voice command found with a rotated voice
  const currentVoice = matches[0];
  const nextVoice = getNextVoice();
  
  if (nextVoice) {
    const processedMessage = template.replace(currentVoice, `!${nextVoice}`);
    debugLog(`🎵 Voice rotation: ${currentVoice} → !${nextVoice}`);
    return processedMessage;
  }
  
  return template;
}

// Blacklist check function
function containsBlacklistedWords(text) {
  if (!STATE.blacklistedWords || STATE.blacklistedWords.length === 0) {
    return false;
  }
  
  const lowerText = text.toLowerCase();
  return STATE.blacklistedWords.some(word => {
    if (word.trim()) {
      return lowerText.includes(word.toLowerCase());
    }
    return false;
  });
}

// Statistics tracking
function updateStats(stat, value = 1) {
  chrome.runtime.sendMessage({
    type: 'UPDATE_STATS',
    stat: stat,
    value: value
  });
}

// Enhanced security validation functions
function validateSettings(payload) {
  // Use enhanced security validator if available
  if (typeof window !== 'undefined' && window.securityValidator) {
    const result = window.securityValidator.validateSettings(payload);
    if (!result.valid) {
      debugLog('❌ Enhanced security validation failed:', result.errors);
      return false;
    }
    return true;
  }
  
  // Fallback to basic validation
  if (!payload || typeof payload !== 'object') return false;
  
  // Validate arrays
  if (payload.whitelist && (!Array.isArray(payload.whitelist) || payload.whitelist.length > 100)) return false;
  if (payload.blacklistedWords && (!Array.isArray(payload.blacklistedWords) || payload.blacklistedWords.length > 50)) return false;
  if (payload.selectedVoices && (!Array.isArray(payload.selectedVoices) || payload.selectedVoices.length > 60)) return false;
  
  // Validate numeric values
  if (payload.minDelay && (typeof payload.minDelay !== 'number' || payload.minDelay < 30 || payload.minDelay > 300)) return false;
  if (payload.interval && (typeof payload.interval !== 'number' || payload.interval < 10 || payload.interval > 3600)) return false;
  if (payload.maxCharLimit && (typeof payload.maxCharLimit !== 'number' || payload.maxCharLimit < 50 || payload.maxCharLimit > 500)) return false;
  
  // Validate strings
  if (payload.customMessage && (typeof payload.customMessage !== 'string' || payload.customMessage.length > 500)) return false;
  if (payload.repeaterMessage && (typeof payload.repeaterMessage !== 'string' || payload.repeaterMessage.length > 500)) return false;
  
  return true;
}

// Listen for state updates from background or popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Handle ping requests to test connection
  if (msg && msg.type === "PING") {
    debugLog('🏓 Ping received, responding...');
    sendResponse({ status: 'ready', timestamp: Date.now() });
    return true;
  }
  
  // Handle master state changes
  if (msg && msg.type === "MASTER_STATE_CHANGE") {
    debugLog('🔄 Master state changed:', msg.enabled);
    // Stop observer when extension is disabled
    if (!msg.enabled && typeof intervalManager !== 'undefined') {
      intervalManager.clearAll();
      debugLog('🛑 Extension disabled - stopping all monitoring');
    } else if (msg.enabled) {
      // Restart observer when re-enabled
      startObserver();
      debugLog('✅ Extension enabled - starting monitoring');
    }
    sendResponse({status: 'master_state_updated'});
    return true;
  }
  
  if (msg && msg.type === "STATE" && msg.payload) {
    // Validate incoming settings
    if (!validateSettings(msg.payload)) {
      debugLog('❌ Invalid settings received, ignoring update');
      return;
    }
    
    STATE = {
      ...STATE,
      ...msg.payload,
      whitelist: (msg.payload.whitelist || []).map(s => String(s).toLowerCase().slice(0, 50)),
      blacklistedWords: (msg.payload.blacklistedWords || []).map(s => String(s).toLowerCase().slice(0, 50)),
      channelRestriction: String(msg.payload.channelRestriction || '').slice(0, 100),
    };
    debugLog('State updated:', STATE);
    debugState();
  }
  
  if (msg && msg.type === "SEND_REPEATER_MESSAGE") {
    debugLog('🎯 Sending repeater message:', msg.message);
    
    sendMessage(msg.message).then(success => {
      if (success) {
        updateStats('totalRepeater');
        updateStats('successCount');
        debugLog('🎯 Repeater message sent successfully');
        
        // Send response back to popup
        if (sendResponse) {
          sendResponse({ success: true, message: 'Message sent successfully' });
        }
        
        // Update queue status
        if (msg.queueId) {
          chrome.runtime.sendMessage({
            type: 'QUEUE_UPDATE',
            queueId: msg.queueId,
            status: 'sent'
          });
        }
      } else {
        debugLog('ERROR: Repeater message failed to send');
        
        // Send error response back to popup
        if (sendResponse) {
          sendResponse({ success: false, error: 'Message send failed' });
        }
        
        // Update queue status
        if (msg.queueId) {
          chrome.runtime.sendMessage({
            type: 'QUEUE_UPDATE',
            queueId: msg.queueId,
            status: 'failed',
            error: 'Send message failed'
          });
        }
      }
    }).catch(error => {
      debugLog('❌ Error in repeater message sending:', error);
      if (sendResponse) {
        sendResponse({ success: false, error: error.toString() });
      }
    });
    return true; // Important: indicate we're handling the message
  }
});

// Load initial state and request fresh state from background
chrome.storage.local.get(["enabled", "whitelist", "blacklistedWords"], (cfg) => {
  STATE.enabled = Boolean(cfg.enabled);
  STATE.whitelist = Array.isArray(cfg.whitelist)
    ? cfg.whitelist.map(s => String(s).toLowerCase())
    : [];
  STATE.blacklistedWords = Array.isArray(cfg.blacklistedWords)
    ? cfg.blacklistedWords.map(s => String(s).toLowerCase())
    : [];
  debugLog('Initial state loaded:', STATE);
  debugState();
});

// Initialize channel detection
currentChannel = getCurrentChannel();
lastUrl = window.location.href;
debugLog('🔄 Initial channel detected:', currentChannel);

// Load utility modules
if (typeof window !== 'undefined') {
  // Initialize managers if available
  const script1 = document.createElement('script');
  script1.src = chrome.runtime.getURL('utils/IntervalManager.js');
  document.head.appendChild(script1);
  
  const script2 = document.createElement('script');
  script2.src = chrome.runtime.getURL('utils/DOMCache.js');
  document.head.appendChild(script2);
  
  const script3 = document.createElement('script');
  script3.src = chrome.runtime.getURL('core/SecurityValidator.js');
  document.head.appendChild(script3);
}

// Monitor URL changes for navigation detection (using managed interval)
if (typeof window !== 'undefined' && window.intervalManager) {
  window.intervalManager.setInterval('channel-change-monitor', checkChannelChange, 1000);
} else {
  // Fallback for immediate use
  const channelMonitorId = setInterval(checkChannelChange, 1000);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(channelMonitorId);
  });
}

// Request fresh state from background on load
setTimeout(() => {
  debugLog('Requesting fresh state from background...');
  chrome.runtime.sendMessage({ type: "PING" }, () => {
    // This will trigger the background script to send current state
  });
}, 100);

// Query helpers with caching optimization
// Helper functions to find chat elements
function getChatInput() {
  // Use DOM cache if available for better performance
  if (typeof window !== 'undefined' && window.domCache) {
    const cached = window.domCache.getChatElements();
    if (cached.input) return cached.input;
  }
  
  // Fallback to direct queries
  return document.querySelector('[data-testid="chat-input"]') ||
         document.querySelector('div[data-input="true"] .editor-input[contenteditable="true"]') ||
         document.querySelector('[contenteditable="true"][role="textbox"]') ||
         document.querySelector('.editor-input[contenteditable="true"]') ||
         document.querySelector('div[contenteditable="true"]') ||
         document.querySelector('.chat-input') ||
         document.querySelector('input[placeholder*="message"]');
}

function getSendButton() {
  // Use DOM cache if available for better performance
  if (typeof window !== 'undefined' && window.domCache) {
    const cached = window.domCache.getChatElements();
    if (cached.sendButton) return cached.sendButton;
  }
  
  // Fallback to direct queries
  return document.querySelector('#send-message-button') || 
         document.querySelector('button[aria-label*="Send"]') ||
         document.querySelector('button[type="submit"]') ||
         document.querySelector('[data-testid="send-button"]');
}

// Insert text into Lexical editor using beforeinput, then click send
async function sendMessage(text) {
  debugLog('🚀 Attempting to send message:', text);
  const input = getChatInput();
  if (!input) {
    debugLog('❌ ERROR: Chat input not found');
    debugLog('🔍 Available inputs:', document.querySelectorAll('input, textarea, [contenteditable]'));
    return false;
  }
  debugLog('✅ Chat input found:', input);

  input.focus();

  // Clear content
  document.execCommand('selectAll', false, null);
  document.execCommand('delete', false, null);

  // Ask the editor to insert text through its normal input pipeline
  const ev = new InputEvent('beforeinput', {
    inputType: 'insertText',
    data: text,
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  input.dispatchEvent(ev);

  // Wait a bit for the event to process
  await new Promise(r => setTimeout(r, 100));

  // Safety net if text did not appear (only use fallback if needed)
  if (!input.textContent || input.textContent.trim() === '') {
    debugLog('beforeinput failed, using fallback insertText');
    document.execCommand('insertText', false, text);
  } else {
    debugLog('beforeinput succeeded, text content:', input.textContent.trim());
  }

  await new Promise(r => setTimeout(r, 50));

  const btn = getSendButton();
  if (btn) {
    debugLog('✅ Send button found, clicking:', btn);
    btn.click();
    return true;
  }

  // Fallback to Enter key if no button
  debugLog('⚠️ Send button not found, trying Enter key');
  debugLog('🔍 Available buttons:', document.querySelectorAll('button'));
  const kd = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
  const ku = new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
  input.dispatchEvent(kd);
  input.dispatchEvent(ku);
  return true;
}

// Badge check - look for subscriber badge images
function hasSubscriberBadge(msgEl) {
  const badgeImg = msgEl.querySelector('img[src*="channel_subscriber_badges"]');
  const hasBadge = !!badgeImg;
  debugLog('Subscriber badge check:', hasBadge);
  if (badgeImg) {
    debugLog('Badge image found:', badgeImg.src);
  }
  return hasBadge;
}

// Extract username and text
function parseMessage(msgEl) {
  const userBtn = msgEl.querySelector('button[title]');
  const username = userBtn ? userBtn.textContent.trim() : null;

  let text = '';
  const contentSpan = msgEl.querySelector('span.font-normal');
  if (contentSpan) text = contentSpan.textContent || '';
  else text = msgEl.textContent || '';

  const result = { username, text: text.trim() };
  debugLog('Parsed message:', result);
  return result;
}

function parseMessageWithEmotes(element) {
  // Create a deep clone to avoid modifying the original
  const clone = element.cloneNode(true);
  
  // Find all emote spans and replace them with their emote names
  const emoteSpans = clone.querySelectorAll('span[data-emote-name]');
  emoteSpans.forEach(emoteSpan => {
    const emoteName = emoteSpan.getAttribute('data-emote-name');
    if (emoteName) {
      // Replace the entire emote span with just the emote name
      const textNode = document.createTextNode(emoteName);
      emoteSpan.parentNode.replaceChild(textNode, emoteSpan);
    }
  });
  
  // Now get the text content which will include emote names
  return clone.textContent || '';
}

function getMessageId(node) {
  // Try multiple approaches for stable message ID
  const holder = node.closest('div[data-index]');
  if (holder && holder.getAttribute('data-index')) {
    const dataIndex = holder.getAttribute('data-index');
    debugLog('🔍 Using data-index for ID:', dataIndex);
    return 'idx:' + String(dataIndex);
  }
  
  // Fallback: Create stable ID based on message content
  const userBtn = node.querySelector('button[title]');
  const username = userBtn ? userBtn.textContent.trim() : 'unknown';
  const contentSpan = node.querySelector('span.font-normal');
  const text = contentSpan ? (contentSpan.textContent || '').trim() : '';
  
  // Create a highly stable content-based ID
  const content = `${username}:${text}`;
  const hash = content.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a; // Convert to 32-bit integer
  }, 0);
  
  const finalId = `msg:${username}:${Math.abs(hash)}`;
  debugLog('🔍 Generated fallback ID:', finalId, 'from content:', content.slice(0, 50));
  return finalId;
}

function handleMessageNode(node) {
  // ENHANCED DEBUGGING VERSION
  debugLog('🔍 Processing message node...');
  
  // 1. Extension enabled check (fastest)
  if (!STATE.enabled) {
    debugLog('❌ Extension disabled');
    return;
  }
  debugLog('🔍 Extension enabled ✓');
  
  // 2. Channel restriction check (fast)
  if (!isChannelAllowed()) {
    debugLog('❌ Channel not allowed for extension');
    return;
  }
  debugLog('🔍 Channel allowed ✓');
  
  // 3. Valid HTML element check (fast)
  if (!(node instanceof HTMLElement)) {
    debugLog('❌ Not HTML element');
    return;
  }
  debugLog('🔍 HTML element ✓');

  // 3. Find message wrapper (fast DOM query)
  const wrapper = node.matches('.group.relative') ? node : node.querySelector('.group.relative');
  if (!wrapper) {
    debugLog('❌ No message wrapper found');
    return;
  }
  debugLog('🔍 Message wrapper found ✓');

  // 4. Parse username FIRST (before expensive checks)
  const userBtn = wrapper.querySelector('button[title]');
  const username = userBtn ? userBtn.textContent.trim() : null;
  if (!username) {
    debugLog('❌ No username found');
    return;
  }
  debugLog('🔍 Username found:', username);

  // 5. WHITELIST CHECK FIRST (most efficient early exit)
  const isWhitelisted = STATE.whitelist.includes(username.toLowerCase());
  debugLog('🔍 Whitelist check - Username:', username.toLowerCase(), 'Whitelist:', STATE.whitelist, 'Result:', isWhitelisted);
  if (!isWhitelisted) {
    debugLog('❌ User not whitelisted');
    return;
  }
  debugLog('🔍 User whitelisted ✓');

  // 6. Check if seen Set is loaded and if already processed (avoid duplicate work)
  if (!seenLoaded) {
    debugLog('⏳ Waiting for processed IDs to load from storage...');
    return;
  }
  
  const id = getMessageId(node);
  debugLog('🔍 Generated message ID:', id);
  if (seen.has(id)) {
    debugLog('❌ Message already processed, ID:', id);
    return;
  }
  debugLog('🔍 Message not processed before ✓, ID:', id);
  debugLog('🔍 Total processed IDs in memory:', seen.size);

  // 7. Parse message text (only if needed) - handle emotes properly
  let text = '';
  const contentSpan = wrapper.querySelector('span.font-normal');
  if (contentSpan) {
    text = parseMessageWithEmotes(contentSpan);
  } else {
    text = parseMessageWithEmotes(wrapper);
  }
  text = text.trim();
  debugLog('🔍 Message text:', `"${text}"`);

  // 8. Message starts with ! check
  if (!text.startsWith('!')) {
    debugLog('❌ Message does not start with !');
    return;
  }
  debugLog('🔍 Message starts with ! ✓');

  // 9. Blacklist check
  if (containsBlacklistedWords(text)) {
    debugLog('❌ Message contains blacklisted words');
    return;
  }
  debugLog('🔍 Blacklist check passed ✓');

  // 10. Subscriber badge check (most expensive, so last) - only if not including subscribers
  if (!STATE.includeSubscribers && hasSubscriberBadge(wrapper)) {
    debugLog('❌ User is subscriber and includeSubscribers is disabled');
    return;
  }
  debugLog('🔍 Subscriber check passed ✓, includeSubscribers:', STATE.includeSubscribers);

  // Check for timeout/ban status before proceeding
  if (isUserTimedOut()) {
    debugLog('❌ User is timed out, cannot send message');
    timeoutCount++;
    updateStats('timeouts', timeoutCount);
    return;
  }
  
  if (isUserBanned()) {
    debugLog('❌ User is banned, cannot send message');
    banCount++;
    updateStats('bans', banCount);
    return;
  }

  // Rate limiting check
  const now = Date.now();
  if (now - lastMessageTime > RATE_LIMIT_WINDOW) {
    messageCount = 0;
    lastMessageTime = now;
  }
  
  if (messageCount >= MAX_MESSAGES_PER_WINDOW) {
    debugLog('❌ Rate limit exceeded (60 messages/minute), skipping message');
    return;
  }
  
  messageCount++;

  // All conditions met!
  seen.add(id);
  saveProcessedIds(); // Persist to storage
  updateStats('totalProcessed');
  
  // Determine what message to send
  let messageToSend = text; // Default: echo original message
  
  if (STATE.customMessage && STATE.customMessage.trim()) {
    // Use custom message if set
    messageToSend = STATE.customMessage;
    debugLog('🔍 Using custom message:', messageToSend);
  } else {
    debugLog('🔍 Echoing original message:', messageToSend);
  }
  
  // Process message for voice rotation
  messageToSend = processMessage(messageToSend);
  debugLog('🔍 After voice processing:', messageToSend);
  
  debugLog('🎉 ALL CONDITIONS MET! Sending message:', messageToSend, 'from:', username);
  
  // Add to queue
  chrome.runtime.sendMessage({
    type: 'ADD_TO_QUEUE',
    message: messageToSend,
    messageType: 'auto'
  });
  
  const delay = 200 + Math.floor(Math.random() * 400);
  debugLog('🔍 Send delay:', delay + 'ms');
  
  setTimeout(() => { 
    sendMessage(messageToSend).then(success => {
      if (success) {
        updateStats('totalReplies');
        updateStats('successCount');
        debugLog('🎉 Message sent successfully!');
      } else {
        debugLog('❌ Message send failed!');
      }
    });
  }, delay);
}

// Observe the chat list
let observerStarted = false;
function startObserver() {
  if (observerStarted) {
    debugLog('⚠️ Observer already started, skipping');
    return;
  }
  
  const root = document.body;
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (!(n instanceof HTMLElement)) continue;

        // Direct message nodes often carry data-index
        if (n.hasAttribute && n.hasAttribute('data-index')) handleMessageNode(n);

        // Scan children that look like messages
        n.querySelectorAll('div[data-index]').forEach(el => handleMessageNode(el));

        // Fallback selector
        if (n.querySelector && n.querySelector('button[title]') && n.querySelector('span.font-normal')) {
          handleMessageNode(n);
        }
      }
    }
  });
  if (root) {
    obs.observe(root, { childList: true, subtree: true });
    observerStarted = true;
    debugLog('✅ MutationObserver started successfully');
  } else {
    debugLog('❌ Root element not found for MutationObserver');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserver);
} else {
  startObserver();
}

// Helper functions for debugging (exposed globally after DOM is ready)
setTimeout(() => {
  // Helper function for users to check extension state manually
  window.checkKickAutoReplyState = function() {
    console.clear();
    debugLog('🔍 KICK AUTO REPLY DEBUG CHECK');
    debugState();
    
    // Check if we can find chat input
    const input = getChatInput();
    debugLog('Chat input element found:', !!input);
    if (input) {
      debugLog('Chat input element:', input);
      debugLog('Chat input classes:', input.className);
    }
    
    // Check if we can find send button
    const btn = getSendButton();
    debugLog('Send button found:', !!btn);
    if (btn) {
      debugLog('Send button element:', btn);
    }
    
    // Check recent messages
    const recentMessages = document.querySelectorAll('div[data-index]');
    debugLog('Recent message elements found:', recentMessages.length);
    
    return {
      enabled: STATE.enabled,
      whitelist: STATE.whitelist,
      blacklistedWords: STATE.blacklistedWords,
      chatInputFound: !!input,
      sendButtonFound: !!btn,
      recentMessagesCount: recentMessages.length
    };
  };

  // Helper function to test message processing manually
  window.testKickAutoReplyMessage = function(username, message) {
    debugLog('🧪 TESTING MESSAGE MANUALLY');
    debugLog('Test username:', username);
    debugLog('Test message:', message);
    
    if (!STATE.enabled) {
      debugLog('❌ Extension is disabled');
      return false;
    }
    
    const isWhitelisted = STATE.whitelist.includes(username.toLowerCase());
    debugLog('Is whitelisted:', isWhitelisted);
    
    if (!isWhitelisted) {
      debugLog('❌ Username not in whitelist');
      return false;
    }
    
    if (!message.startsWith('!')) {
      debugLog('❌ Message does not start with !');
      return false;
    }
    
    if (containsBlacklistedWords(message)) {
      debugLog('❌ Message contains blacklisted words');
      return false;
    }
    
    debugLog('✅ All conditions met, would send message:', message);
    return true;
  };
  
  // Force state check function
  window.forceStateCheck = function() {
    console.clear();
    debugLog('🔍 FORCE STATE CHECK');
    debugLog('Current STATE object:', STATE);
    debugLog('Extension enabled:', STATE.enabled);
    debugLog('Whitelist:', STATE.whitelist);
    debugLog('Blacklisted words:', STATE.blacklistedWords);
    debugLog('Include subscribers:', STATE.includeSubscribers);
    debugLog('Custom message:', STATE.customMessage);
    debugLog('Voice rotation enabled:', STATE.voiceRotationEnabled);
    
    // Test a fake message
    console.log('--- Testing with fake message ---');
    if (STATE.enabled && STATE.whitelist.length > 0) {
      const testUsername = STATE.whitelist[0];
      console.log(`Testing with username: "${testUsername}"`);
      console.log(`Would respond to: "${testUsername}: !test message"`);
    } else {
      console.log('❌ Extension disabled or no whitelist configured');
    }
    
    return STATE;
  };
  
  debugLog('Debug helper functions loaded. Try: checkKickAutoReplyState() or forceStateCheck()');
}, 1000);

// Add periodic state logging to help debug issues - using managed interval
if (typeof window !== 'undefined' && window.intervalManager) {
  window.intervalManager.setInterval('debug-logging', () => {
    if (STATE.enabled) {
      debugLog('🔄 Periodic check - Extension enabled, Channel restriction:', STATE.channelRestriction || 'none');
      debugLog('🔄 Current channel:', currentChannel, 'Allowed:', isChannelAllowed());
      debugLog('🔄 Processed IDs loaded:', seenLoaded, 'Count:', seen.size);
    }
  }, 30000);
} else {
  // Fallback
  setInterval(() => {
    if (STATE.enabled) {
      debugLog('🔄 Periodic check - Extension enabled, Channel restriction:', STATE.channelRestriction || 'none');
      debugLog('🔄 Current channel:', currentChannel, 'Allowed:', isChannelAllowed());
      debugLog('🔄 Processed IDs loaded:', seenLoaded, 'Count:', seen.size);
    }
  }, 30000);
}
