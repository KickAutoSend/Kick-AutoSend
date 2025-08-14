/**
 * Kick AutoSend - Content Script
 * Copyright (c) 2025 Kick AutoSend
 * 
 * This script provides chat automation features for Kick.com
 * Including auto-reply, message repeater, and voice rotation
 */

console.log('🚀 KICK AUTOSEND CONTENT SCRIPT LOADED');

// Content script ready flag
let contentScriptReady = false;

// Set content script as ready immediately
contentScriptReady = true;

// Current state cached in the page
let STATE = { 
    enabled: false,
    whitelist: [],
    blacklistedWords: [],
    customMessage: '',
    includeSubscribers: false,
    voiceRotationEnabled: false,
    voiceRotationRepeater: false,
    voiceRotationResponder: false,
    voiceMode: 'random',
    selectedVoices: ['duke', 'trump', 'spongebob'],
    customVoices: [],
    channelRestriction: '',
    responderInterval: 30 // Default responder interval
};

// Simple message tracking (no complex storage)
let processedMessages = new Set();
let observerStarted = false;
let currentObserver = null; // Store reference to current observer
let pageLoadTime = Date.now(); // Track when page was loaded
let lastResponseTime = 0; // Track last response time for cooldown

// Rate limiting
let lastMessageTime = 0;
let messageCount = 0;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 60;

// Available TTS voices
const VOICES = [
  'anthony', 'trump', 'spongebob', 'drphil', 'tate', 'petergriffin', 'biden', 'arnold', 
  'train', 'joerogan', 'alexjones', 'samueljackson', 'kermit', 'eddie', 'goku', 'ice', 
  'herbert', 'unc', 'icespice', 'snoop', 'rock', 'morgan', 'sketch', 'kevinhart', 
  '50cent', 'kanye', 'mcgregor', 'willsmith', 'elon', 'kamala', 'jordan', 'shapiro', 
  'djkhaled', 'jayz', 'princeharry', 'robertdowneyjr', 'billgates', 'lex', 'duke', 
  'ebz', 'ariana', 'kim', 'cardi', 'rainbow', 'swift', 'watson', 'hillary', 'thrall', 'steve'
];

// Voice rotation functionality
let voiceIndex = 0;

function getRandomVoice() {
  const allVoices = [...(STATE.selectedVoices || ['duke']), ...(STATE.customVoices || [])];
  return allVoices[Math.floor(Math.random() * allVoices.length)];
}

function getSequentialVoice() {
  const allVoices = [...(STATE.selectedVoices || ['duke']), ...(STATE.customVoices || [])];
  const voice = allVoices[voiceIndex % allVoices.length];
  voiceIndex++;
  return voice;
}

function getNextVoice(context = 'responder') {
  const isEnabled = context === 'repeater' ? 
    STATE.voiceRotationRepeater : 
    STATE.voiceRotationResponder;
    
  if (!isEnabled) return null;
  return STATE.voiceMode === 'random' ? getRandomVoice() : getSequentialVoice();
}

// Message processing with voice replacement
function processMessage(template, context = 'responder') {
  const isEnabled = context === 'repeater' ? 
    STATE.voiceRotationRepeater : 
    STATE.voiceRotationResponder;
    
  if (!isEnabled) return template;
  
  const voicePattern = /![a-zA-Z0-9]+/g;
  const matches = template.match(voicePattern);
  
  if (!matches || matches.length === 0) return template;
  
  const currentVoice = matches[0];
  const nextVoice = getNextVoice(context);
  
  if (nextVoice) {
    const processedMessage = template.replace(currentVoice, `!${nextVoice}`);
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
  try {
    chrome.runtime.sendMessage({
      type: 'UPDATE_STATS',
      stat: stat,
      value: value
    });
  } catch (error) {
    // Silent error handling for production
  }
}

// Helper functions to find chat elements
function getChatInput() {
  return document.querySelector('[data-testid="chat-input"]') ||
         document.querySelector('div[data-input="true"] .editor-input[contenteditable="true"]') ||
         document.querySelector('[contenteditable="true"][role="textbox"]') ||
         document.querySelector('.editor-input[contenteditable="true"]') ||
         document.querySelector('div[contenteditable="true"]') ||
         document.querySelector('.chat-input') ||
         document.querySelector('input[placeholder*="message"]');
}

function getSendButton() {
  return document.querySelector('#send-message-button') || 
         document.querySelector('button[aria-label*="Send"]') ||
         document.querySelector('button[type="submit"]') ||
         document.querySelector('[data-testid="send-button"]');
}

// Send message function
async function sendMessage(text) {
  const input = getChatInput();
  if (!input) {
    return false;
  }

  input.focus();

  // Clear content
  document.execCommand('selectAll', false, null);
  document.execCommand('delete', false, null);

  // Insert text
  const ev = new InputEvent('beforeinput', {
    inputType: 'insertText',
    data: text,
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  input.dispatchEvent(ev);

  await new Promise(r => setTimeout(r, 100));

  // Safety net if text did not appear
  if (!input.textContent || input.textContent.trim() === '') {
    document.execCommand('insertText', false, text);
  }

  await new Promise(r => setTimeout(r, 50));

  const btn = getSendButton();
  if (btn) {
    btn.click();
    return true;
  }

  // Fallback to Enter key
  const kd = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
  const ku = new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
  input.dispatchEvent(kd);
  input.dispatchEvent(ku);
  return true;
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

// Badge check - look for subscriber badge images
function hasSubscriberBadge(msgEl) {
  const badgeImg = msgEl.querySelector('img[src*="channel_subscriber_badges"]');
  return !!badgeImg;
}

// Parse message with emotes
function parseMessageWithEmotes(element) {
  const clone = element.cloneNode(true);
  
  const emoteSpans = clone.querySelectorAll('span[data-emote-name]');
  emoteSpans.forEach(emoteSpan => {
    const emoteName = emoteSpan.getAttribute('data-emote-name');
    if (emoteName) {
      const textNode = document.createTextNode(emoteName);
      emoteSpan.parentNode.replaceChild(textNode, emoteSpan);
    }
  });
  
  return clone.textContent || '';
}

// Get message ID for duplicate prevention
function getMessageId(node) {
  const holder = node.closest('div[data-index]');
  if (holder && holder.getAttribute('data-index')) {
    return 'idx:' + String(holder.getAttribute('data-index'));
  }
  
  const userBtn = node.querySelector('button[title]');
  const username = userBtn ? userBtn.textContent.trim() : 'unknown';
  const contentSpan = node.querySelector('span.font-normal');
  const text = contentSpan ? (contentSpan.textContent || '').trim() : '';
  
  // Create a unique ID based on content and username
  const content = `${username}:${text}`;
  const hash = content.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return `msg:${username}:${Math.abs(hash)}`;
}

// Check if message is truly new (sent after page load)
function isNewMessage(node) {
  // Check if the message has a timestamp or other indicators that it's recent
  const messageTime = node.getAttribute('data-timestamp') || 
                     node.getAttribute('data-time') || 
                     node.querySelector('[data-time]')?.getAttribute('data-time');
  
  if (messageTime) {
    const messageTimestamp = parseInt(messageTime);
    return messageTimestamp > pageLoadTime;
  }
  
  // Fallback: check if message is in the last few seconds of DOM
  // This is a heuristic - messages at the bottom are likely newer
  const allMessages = document.querySelectorAll('div[data-index]');
  const messageIndex = Array.from(allMessages).indexOf(node);
  const totalMessages = allMessages.length;
  
  // Consider messages in the last 20% as "new"
  return messageIndex >= totalMessages * 0.8;
}

// Check cooldown
function checkCooldown() {
  const now = Date.now();
  const cooldownMs = (STATE.responderInterval || 30) * 1000; // Convert seconds to milliseconds
  
  if (now - lastResponseTime < cooldownMs) {
    return false;
  }
  
  return true;
}

// Get current channel name from the page
function getCurrentChannel() {
  // Try multiple selectors to find the channel name
  const selectors = [
    'h1[data-testid="channel-name"]',
    'h1[class*="channel"]',
    'div[data-testid="channel-name"]',
    'span[data-testid="channel-name"]',
    'a[href*="/"] h1',
    'a[href*="/"] span',
    '.channel-name',
    '[class*="channel-name"]',
    'h1[class*="text-"]',
    'div[class*="channel"] h1',
    'div[class*="channel"] span',
    'header h1',
    'header span'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text) {
        return text.toLowerCase();
      }
    }
  }
  
  // Fallback: try to extract from URL
  const url = window.location.href;
  const match = url.match(/kick\.com\/([^\/\?]+)/);
  if (match) {
    const channelFromUrl = match[1].toLowerCase();
    return channelFromUrl;
  }
  
  return null;
}

// Check if current channel is allowed
function isChannelAllowed() {
  if (!STATE.channelRestriction || STATE.channelRestriction.trim() === '') {
    return true; // No restriction set
  }
  
  const currentChannel = getCurrentChannel();
  if (!currentChannel) {
    return true; // Allow if we can't determine channel
  }
  
  const restrictedChannel = STATE.channelRestriction.toLowerCase().trim();
  return currentChannel === restrictedChannel;
}

// Main message processing function
function handleMessageNode(node) {
  // 1. Extension enabled check
  if (!STATE.enabled || !observerStarted) {
    return;
  }

  // 2. Channel restriction check
  if (!isChannelAllowed()) {
    return;
  }

  // 3. Valid HTML element check
  if (!(node instanceof HTMLElement)) {
    return;
  }

  // 4. Find message wrapper
  const wrapper = node.matches('.group.relative') ? node : node.querySelector('.group.relative');
  if (!wrapper) {
    return;
  }

  // 5. Parse username
  const userBtn = wrapper.querySelector('button[title]');
  const username = userBtn ? userBtn.textContent.trim() : null;
  if (!username) {
    return;
  }

  // 6. Whitelist check
  const isWhitelisted = STATE.whitelist.includes(username.toLowerCase());
  if (!isWhitelisted) {
    return;
  }

  // 7. Check if already processed
  const id = getMessageId(node);
  if (processedMessages.has(id)) {
    return;
  }

  // 8. Check if message is truly new (not from page load)
  if (!isNewMessage(node)) {
    return;
  }

  // 9. Check cooldown
  if (!checkCooldown()) {
    return;
  }

  // 10. Parse message text
  let text = '';
  const contentSpan = wrapper.querySelector('span.font-normal');
  if (contentSpan) {
    text = parseMessageWithEmotes(contentSpan);
  } else {
    text = parseMessageWithEmotes(wrapper);
  }
  text = text.trim();

  // 11. Message starts with ! check
  if (!text.startsWith('!')) {
    return;
  }

  // 12. Blacklist check
  if (containsBlacklistedWords(text)) {
    return;
  }

  // 13. Subscriber badge check
  if (!STATE.includeSubscribers && hasSubscriberBadge(wrapper)) {
    return;
  }

  // 14. Additional safety check - prevent rapid processing
  if (processedMessages.has(id)) {
    return;
  }

  // Check for timeout/ban status
  if (isUserTimedOut()) {
    return;
  }
  
  if (isUserBanned()) {
    return;
  }

  // Rate limiting check
  const now = Date.now();
  if (now - lastMessageTime > RATE_LIMIT_WINDOW) {
    messageCount = 0;
    lastMessageTime = now;
  }
  
  if (messageCount >= MAX_MESSAGES_PER_WINDOW) {
    return;
  }
  
  messageCount++;

  // All conditions met! Mark as processed immediately
  processedMessages.add(id);
  updateStats('totalProcessed');
  
  // Update last response time
  lastResponseTime = Date.now();
  
  // Determine what message to send
  let messageToSend = text; // Default: echo original message
  
  if (STATE.customMessage && STATE.customMessage.trim()) {
    messageToSend = STATE.customMessage;
  }
  
  // Process message for voice rotation
  messageToSend = processMessage(messageToSend, 'responder');
  
  const delay = 200 + Math.floor(Math.random() * 400);
  
  setTimeout(() => { 
    sendMessage(messageToSend).then(success => {
      if (success) {
        updateStats('totalReplies');
        updateStats('successCount');
      }
    });
  }, delay);
}

// Start observer
function startObserver() {
  if (observerStarted) {
    return;
  }
  
  const root = document.body;
  if (!root) {
    return;
  }
  
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (!(n instanceof HTMLElement)) continue;

        // Add a small delay to ensure DOM is fully updated
        setTimeout(() => {
          // Double check extension is still enabled
          if (!STATE.enabled || !observerStarted) return;

          // Direct message nodes often carry data-index
          if (n.hasAttribute && n.hasAttribute('data-index')) handleMessageNode(n);

          // Scan children that look like messages
          n.querySelectorAll('div[data-index]').forEach(el => handleMessageNode(el));

          // Fallback selector
          if (n.querySelector && n.querySelector('button[title]') && n.querySelector('span.font-normal')) {
            handleMessageNode(n);
          }
        }, 50); // 50ms delay
      }
    }
  });
  
  obs.observe(root, { childList: true, subtree: true });
  observerStarted = true;
  currentObserver = obs;
}

// Stop observer
function stopObserver() {
  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }
  observerStarted = false;
  processedMessages.clear();
}

// Listen for state updates from background or popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Handle ping requests to test connection
  if (msg && msg.type === "PING") {
    sendResponse({ 
      status: 'ready', 
      timestamp: Date.now(),
      contentScriptReady: true,
      enabled: STATE.enabled,
      whitelist: STATE.whitelist
    });
    return true;
  }
  
  // Handle master state changes
  if (msg && msg.type === "MASTER_STATE_CHANGE") {
    if (!msg.enabled) {
      stopObserver();
    } else {
      startObserver();
    }
    sendResponse({status: 'master_state_updated'});
    return true;
  }
  
  if (msg && msg.type === "STATE" && msg.payload) {
    STATE = {
      ...STATE,
      ...msg.payload,
      enabled: msg.payload.enabled !== undefined ? msg.payload.enabled : STATE.enabled,
      whitelist: (msg.payload.whitelist || []).map(s => String(s).toLowerCase().slice(0, 50)),
      blacklistedWords: (msg.payload.blacklistedWords || []).map(s => String(s).toLowerCase().slice(0, 50)),
      channelRestriction: String(msg.payload.channelRestriction || '').slice(0, 100),
      responderInterval: parseInt(msg.payload.responderInterval) || STATE.responderInterval || 30,
    };
    
    // Start/stop observer based on enabled state
    if (STATE.enabled && !observerStarted) {
      startObserver();
    } else if (!STATE.enabled && observerStarted) {
      stopObserver();
    }
  }
  
  if (msg && msg.type === "SEND_REPEATER_MESSAGE") {
    // Check channel restriction
    if (!isChannelAllowed()) {
      if (sendResponse) {
        sendResponse({ success: false, error: 'Channel restriction: not allowed on this channel' });
      }
      return true;
    }
    
    let processedMessage = processMessage(msg.message, 'repeater');
    
    sendMessage(processedMessage).then(success => {
      if (success) {
        updateStats('totalRepeater');
        updateStats('successCount');
        
        if (sendResponse) {
          sendResponse({ success: true, message: 'Message sent successfully' });
        }
      } else {
        if (sendResponse) {
          sendResponse({ success: false, error: 'Message send failed' });
        }
      }
    }).catch(error => {
      if (sendResponse) {
        sendResponse({ success: false, error: error.toString() });
      }
    });
    return true;
  }
});

// Load initial state and start observer
chrome.storage.local.get(["enabled", "whitelist", "blacklistedWords", "customMessage", "includeSubscribers", "voiceRotationRepeater", "voiceRotationResponder", "voiceMode", "selectedVoices", "customVoices", "channelRestriction", "responderInterval"], (cfg) => {
  try {
    STATE.enabled = Boolean(cfg.enabled);
    STATE.whitelist = Array.isArray(cfg.whitelist)
      ? cfg.whitelist.map(s => String(s).toLowerCase())
      : [];
    STATE.blacklistedWords = Array.isArray(cfg.blacklistedWords)
      ? cfg.blacklistedWords.map(s => String(s).toLowerCase())
      : [];
    STATE.customMessage = String(cfg.customMessage || '');
    STATE.includeSubscribers = Boolean(cfg.includeSubscribers);
    STATE.voiceRotationRepeater = Boolean(cfg.voiceRotationRepeater);
    STATE.voiceRotationResponder = Boolean(cfg.voiceRotationResponder);
    STATE.voiceMode = String(cfg.voiceMode || 'random');
    STATE.selectedVoices = Array.isArray(cfg.selectedVoices) ? cfg.selectedVoices : ['duke', 'trump', 'spongebob'];
    STATE.customVoices = Array.isArray(cfg.customVoices) ? cfg.customVoices : [];
    STATE.channelRestriction = String(cfg.channelRestriction || '');
    STATE.responderInterval = parseInt(cfg.responderInterval) || 30;
    
    // Start observer if enabled
    if (STATE.enabled) {
      startObserver();
    }
    
  } catch (error) {
    STATE.enabled = false;
    STATE.whitelist = [];
    STATE.blacklistedWords = [];
  }
});
