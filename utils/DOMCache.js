/**
 * DOM Caching System for improved query performance
 * Expected Impact: 20-30% faster DOM operations, reduced reflow/repaint
 */
class DOMCache {
  constructor() {
    this.cache = new Map();
    this.observedElements = new Set();
    this.lastCacheClean = Date.now();
    this.hitCount = 0;
    this.missCount = 0;
    
    // Auto-invalidate cache on DOM mutations
    this.setupMutationObserver();
  }

  /**
   * Get element with caching
   * @param {string} selector - CSS selector
   * @param {boolean} forceRefresh - Force cache refresh
   * @returns {Element|null} Found element
   */
  get(selector, forceRefresh = false) {
    const cacheKey = this.getCacheKey(selector);
    
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      
      // Verify element is still in DOM
      if (cached.element && document.contains(cached.element)) {
        this.hitCount++;
        cached.lastAccessed = Date.now();
        cached.accessCount++;
        return cached.element;
      } else {
        // Element removed from DOM, invalidate cache
        this.cache.delete(cacheKey);
      }
    }

    // Cache miss - query DOM
    this.missCount++;
    const element = document.querySelector(selector);
    
    if (element) {
      this.cache.set(cacheKey, {
        element,
        selector,
        cached: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1
      });
      
      // Track this element for mutations
      this.observedElements.add(element);
    }

    return element;
  }

  /**
   * Get multiple elements with caching
   * @param {string} selector - CSS selector
   * @param {boolean} forceRefresh - Force cache refresh
   * @returns {NodeList} Found elements
   */
  getAll(selector, forceRefresh = false) {
    const cacheKey = this.getCacheKey(selector, 'all');
    
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      
      // Verify elements are still in DOM
      const stillValid = Array.from(cached.elements).every(el => document.contains(el));
      if (stillValid) {
        this.hitCount++;
        cached.lastAccessed = Date.now();
        cached.accessCount++;
        return cached.elements;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Cache miss - query DOM
    this.missCount++;
    const elements = document.querySelectorAll(selector);
    
    if (elements.length > 0) {
      this.cache.set(cacheKey, {
        elements,
        selector,
        cached: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1
      });

      // Track these elements for mutations
      Array.from(elements).forEach(el => this.observedElements.add(el));
    }

    return elements;
  }

  /**
   * Specialized getter for frequently accessed chat elements
   * @returns {object} Chat elements
   */
  getChatElements() {
    return {
      input: this.get('[data-testid="chat-input"]') || 
             this.get('div[data-input="true"] .editor-input[contenteditable="true"]') ||
             this.get('[contenteditable="true"][role="textbox"]'),
      
      sendButton: this.get('#send-message-button') ||
                   this.get('button[aria-label*="Send"]') ||
                   this.get('button[type="submit"]'),
      
      messages: this.getAll('.group.relative'),
      
      chatContainer: this.get('[data-testid="chat-container"]') ||
                     this.get('.chat-container') ||
                     this.get('#chat')
    };
  }

  /**
   * Invalidate cache for specific selector
   * @param {string} selector - Selector to invalidate
   */
  invalidate(selector) {
    const cacheKey = this.getCacheKey(selector);
    this.cache.delete(cacheKey);
    this.cache.delete(this.getCacheKey(selector, 'all'));
  }

  /**
   * Invalidate cache for elements matching pattern
   * @param {RegExp} pattern - Pattern to match selectors
   */
  invalidatePattern(pattern) {
    const toDelete = [];
    this.cache.forEach((cached, key) => {
      if (pattern.test(cached.selector)) {
        toDelete.push(key);
      }
    });
    toDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.observedElements.clear();
    console.log('🧹 DOM Cache cleared');
  }

  /**
   * Clean old cache entries
   * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
   */
  cleanup(maxAge = 300000) {
    const now = Date.now();
    const deleted = [];
    
    this.cache.forEach((cached, key) => {
      if (now - cached.lastAccessed > maxAge) {
        this.cache.delete(key);
        deleted.push(cached.selector);
      }
    });

    if (deleted.length > 0) {
      console.log(`🧹 Cleaned ${deleted.length} old cache entries`);
    }
    
    this.lastCacheClean = now;
  }

  /**
   * Setup mutation observer to invalidate cache on DOM changes
   */
  setupMutationObserver() {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      let shouldInvalidate = false;
      
      mutations.forEach((mutation) => {
        // Check if any observed elements were modified
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (this.observedElements.has(node) || 
                  Array.from(this.observedElements).some(el => node.contains(el))) {
                shouldInvalidate = true;
              }
            }
          });
        }
        
        // Invalidate on attribute changes to observed elements
        if (mutation.type === 'attributes' && this.observedElements.has(mutation.target)) {
          shouldInvalidate = true;
        }
      });

      if (shouldInvalidate) {
        // Selective invalidation based on mutation type
        this.invalidatePattern(/chat|message|input|button/i);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'data-testid']
    });

    // Store observer for cleanup
    if (typeof window !== 'undefined' && window.intervalManager) {
      window.intervalManager.setObserver('dom-cache', observer);
    }
  }

  /**
   * Generate cache key
   * @param {string} selector - CSS selector
   * @param {string} type - Query type ('single' or 'all')
   * @returns {string} Cache key
   */
  getCacheKey(selector, type = 'single') {
    return `${type}:${selector}`;
  }

  /**
   * Get cache performance metrics
   * @returns {object} Performance data
   */
  getMetrics() {
    const totalQueries = this.hitCount + this.missCount;
    const hitRate = totalQueries > 0 ? (this.hitCount / totalQueries) * 100 : 0;
    
    return {
      cacheSize: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      observedElements: this.observedElements.size,
      memoryUsage: this.estimateMemoryUsage(),
      lastCleanup: this.lastCacheClean
    };
  }

  /**
   * Estimate memory usage of cache
   * @returns {number} Estimated bytes
   */
  estimateMemoryUsage() {
    let bytes = 0;
    this.cache.forEach((cached, key) => {
      bytes += key.length * 2; // String characters (rough estimate)
      bytes += 200; // Object overhead estimate
    });
    return bytes;
  }

  /**
   * Performance report
   */
  logPerformance() {
    const metrics = this.getMetrics();
    console.log('📊 DOM Cache Performance:', {
      'Hit Rate': `${metrics.hitRate}%`,
      'Cache Size': metrics.cacheSize,
      'Total Queries': metrics.hitCount + metrics.missCount,
      'Memory Usage': `${Math.round(metrics.memoryUsage / 1024)}KB`,
      'Observed Elements': metrics.observedElements
    });
  }
}

// Global instance
const domCache = new DOMCache();

// Auto-cleanup every 2 minutes
if (typeof window !== 'undefined' && window.intervalManager) {
  window.intervalManager.setInterval('dom-cache-cleanup', () => {
    domCache.cleanup();
  }, 120000);

  // Performance logging every 5 minutes in development
  if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
    window.intervalManager.setInterval('dom-cache-performance', () => {
      domCache.logPerformance();
    }, 300000);
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMCache;
} else if (typeof window !== 'undefined') {
  window.DOMCache = DOMCache;
  window.domCache = domCache;
}
