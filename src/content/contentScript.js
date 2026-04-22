/**
 * SHIELD Content Script
 *
 * Monitors DOM changes and network requests within web pages to detect
 * malicious injections and suspicious network activity.
 *
 * @version 1.0.0
 * @author SHIELD Team
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Content script configuration
 */
const CONTENT_CONFIG = {
  // DOM monitoring settings
  MONITOR_SUBTREE: true,
  MONITOR_CHILD_LIST: true,
  MONITOR_ATTRIBUTES: false, // Focus on structural changes

  // Suspicious element types to monitor
  SUSPICIOUS_ELEMENTS: ['script', 'iframe', 'object', 'embed'],

  // Network monitoring settings
  MONITOR_FETCH: true,
  MONITOR_XMLHTTPREQUEST: true,
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Content script state
 */
const contentState = {
  mutationObserver: null,
  injectionCount: 0,
  isInitialized: false,
  monitoring: {
    dom: false,
    network: false,
  },
};

// ============================================================================
// DOM MONITORING
// ============================================================================

/**
 * Initialize DOM change monitoring using MutationObserver
 * Detects injection of suspicious elements like scripts and iframes
 */
function initializeDOMMonitoring() {
  if (contentState.mutationObserver) {
    contentState.mutationObserver.disconnect();
  }

  contentState.mutationObserver = new MutationObserver(handleDOMMutations);

  // Configure observer to watch for structural changes
  const observerConfig = {
    childList: CONTENT_CONFIG.MONITOR_CHILD_LIST,
    subtree: CONTENT_CONFIG.MONITOR_SUBTREE,
    attributes: CONTENT_CONFIG.MONITOR_ATTRIBUTES,
  };

  try {
    contentState.mutationObserver.observe(document, observerConfig);
    contentState.monitoring.dom = true;
    console.log('SHIELD: DOM monitoring initialized');
  } catch (error) {
    console.error('SHIELD: Failed to initialize DOM monitoring:', error);
  }
}

/**
 * Handle DOM mutations detected by MutationObserver
 * @param {MutationRecord[]} mutations - Array of DOM mutations
 */
function handleDOMMutations(mutations) {
  mutations.forEach((mutation) => {
    // Check newly added nodes for suspicious elements
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        analyzeElementForInjection(node);
      }
    });
  });
}

/**
 * Analyze an element for potential malicious injection
 * @param {Element} element - DOM element to analyze
 */
function analyzeElementForInjection(element) {
  const tagName = element.tagName?.toLowerCase();

  if (CONTENT_CONFIG.SUSPICIOUS_ELEMENTS.includes(tagName)) {
    contentState.injectionCount++;
    reportDOMThreat(tagName.toUpperCase() + '_INJECTION', element);
  }
}

/**
 * Report a DOM-based threat to the background script
 * @param {string} threatType - Type of threat (SCRIPT_INJECTION, IFRAME_INJECTION, etc.)
 * @param {Element} element - The suspicious DOM element
 */
function reportDOMThreat(threatType, element) {
  const threatDetails = {
    type: threatType,
    count: contentState.injectionCount,
    element: {
      tagName: element.tagName,
      src: element.src || element.getAttribute('src') || 'inline',
      id: element.id || 'no-id',
      className: element.className || 'no-class',
      outerHTML: element.outerHTML?.substring(0, 200) + '...', // Limit size
    },
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  chrome.runtime.sendMessage({
    type: 'DOM_THREAT',
    details: threatDetails,
  }).catch((error) => {
    console.error('SHIELD: Failed to report DOM threat:', error);
  });
}

// ============================================================================
// NETWORK MONITORING (FALLBACK)
// ============================================================================

/**
 * Initialize network request monitoring as fallback
 * Monitors fetch() and XMLHttpRequest calls when background monitoring misses them
 */
function initializeNetworkMonitoring() {
  if (CONTENT_CONFIG.MONITOR_FETCH) {
    monitorFetchRequests();
  }

  if (CONTENT_CONFIG.MONITOR_XMLHTTPREQUEST) {
    monitorXMLHttpRequests();
  }

  contentState.monitoring.network = true;
  console.log('SHIELD: Network monitoring initialized (content script fallback)');
}

/**
 * Monitor fetch API calls
 */
function monitorFetchRequests() {
  const originalFetch = window.fetch;

  window.fetch = function(...args) {
    const url = args[0] instanceof Request ? args[0].url : args[0];

    // Report network request to background script
    reportNetworkRequest(url);

    // Execute original fetch
    return originalFetch.apply(this, args);
  };
}

/**
 * Monitor XMLHttpRequest calls
 */
function monitorXMLHttpRequests() {
  const originalOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    // Report network request to background script
    reportNetworkRequest(url);

    // Execute original open
    return originalOpen.call(this, method, url, ...rest);
  };
}

/**
 * Report a network request to the background script
 * @param {string} url - The requested URL
 */
function reportNetworkRequest(url) {
  chrome.runtime.sendMessage({
    type: 'NETWORK_REQUEST',
    url: url,
    timestamp: Date.now(),
    initiator: 'content_script',
  }).catch(() => {
    // Background script may not be listening, which is fine
  });
}

// ============================================================================
// LIFECYCLE MANAGEMENT
// ============================================================================

/**
 * Initialize the content script
 * Sets up DOM and network monitoring when page is ready
 */
function initializeContentScript() {
  if (contentState.isInitialized) {
    return;
  }

  // Wait for DOM to be ready before starting monitoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMonitoring);
  } else {
    startMonitoring();
  }

  contentState.isInitialized = true;
}

/**
 * Start all monitoring systems
 */
function startMonitoring() {
  initializeDOMMonitoring();
  initializeNetworkMonitoring();

  console.log('SHIELD: Content script monitoring active');
}

/**
 * Clean up resources when page unloads
 */
function cleanup() {
  if (contentState.mutationObserver) {
    contentState.mutationObserver.disconnect();
    contentState.mutationObserver = null;
  }

  contentState.monitoring.dom = false;
  contentState.monitoring.network = false;

  console.log('SHIELD: Content script cleaned up');
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Handle messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.type) {
    case 'GET_INJECTION_COUNT':
      sendResponse({
        count: contentState.injectionCount,
        monitoring: contentState.monitoring,
      });
      break;

    case 'RESET_COUNTERS':
      contentState.injectionCount = 0;
      sendResponse({ status: 'reset' });
      break;

    default:
      sendResponse({ status: 'unknown_message_type' });
    }
  } catch (error) {
    console.error('SHIELD: Error handling message in content script:', error);
    sendResponse({ error: error.message });
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

// Start the content script
initializeContentScript();

// Clean up on page unload
window.addEventListener('beforeunload', cleanup);