/**
 * SHIELD Background Service Worker
 *
 * Core threat detection engine that monitors network requests, cookie risk,
 * and DOM changes in real-time. It scores threats and exposes actions to the popup.
 *
 * @version 1.1.0
 * @author SHIELD Team
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * Application configuration constants
 */
const CONFIG = {
  MAX_LOG_SIZE: 100,
  CLEANUP_INTERVAL: 60000, // 1 minute
  HIGH_FREQUENCY_THRESHOLD: 5, // requests per 10 seconds
  HIGH_FREQUENCY_WINDOW: 10000, // 10 seconds in milliseconds
  RISK_SCORE_CAP: 100,
  COOKIE_SCAN_INTERVAL: 60000,

  // Risk scoring thresholds
  RISK_THRESHOLDS: {
    UNKNOWN_DOMAIN: 30,
    IP_ADDRESS: 40,
    HIGH_FREQUENCY: 20,
    DOM_INJECTION: 40,
    CRITICAL_LEVEL: 60,
  },

  // Known suspicious domains (expandable via updates)
  SUSPICIOUS_DOMAINS: [
    'malicious.com',
    'phishing-site.ru',
    'fake-bank.net',
    'suspicious-malware.xyz',
  ],

  // Trusted domains that are generally safe
  TRUSTED_DOMAINS: [
    'google.com',
    'github.com',
    'stackoverflow.com',
    'wikipedia.org',
    'amazon.com',
    'facebook.com',
    'twitter.com',
    'linkedin.com',
    'youtube.com',
    'microsoft.com',
    'apple.com',
  ],
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Global application state
 */
const appState = {
  threatLog: [],
  currentThreats: [],
  riskScore: 0,
  requestTracker: {
    domains: {},
    lastCleanup: Date.now(),
  },
  blockedDomains: new Set(),
};

// ============================================================================
// NETWORK MONITORING
// ============================================================================

/**
 * Initialize network request monitoring
 */
function initializeNetworkMonitoring() {
  try {
    chrome.webRequest.onBeforeRequest.addListener(
      handleNetworkRequest,
      { urls: ['<all_urls>'] },
      ['blocking'],
    );

    console.log('SHIELD: Network monitoring initialized');
  } catch (error) {
    console.error('SHIELD: Failed to initialize network monitoring:', error);
  }
}

/**
 * Handle incoming network request
 * @param {Object} details - Chrome webRequest details
 */
function handleNetworkRequest(details) {
  try {
    const domain = extractDomain(details.url);

    if (isBlockedDomain(domain)) {
      return { cancel: true };
    }

    recordNetworkRequest(details.url, details.tabId, details.timeStamp);
  } catch (error) {
    console.error('SHIELD: Error handling network request:', error);
  }
}

/**
 * Record and analyze a network request for potential threats
 * @param {string} url - The requested URL
 * @param {number} tabId - Chrome tab ID
 * @param {number} timestamp - Request timestamp
 */
function recordNetworkRequest(url, tabId, timestamp) {
  try {
    const domain = extractDomain(url);
    if (!domain) {
      return;
    }

    if (!appState.requestTracker.domains[domain]) {
      appState.requestTracker.domains[domain] = {
        count: 0,
        timestamps: [],
      };
    }

    const tracker = appState.requestTracker.domains[domain];
    tracker.count += 1;
    tracker.timestamps.push(timestamp);

    const cutoffTime = timestamp - CONFIG.CLEANUP_INTERVAL;
    tracker.timestamps = tracker.timestamps.filter(t => t > cutoffTime);

    const threat = analyzeNetworkRequest(url, domain, tracker, tabId, timestamp);
    if (threat) {
      addThreat(threat);
    }
  } catch (error) {
    console.error('SHIELD: Error recording network request:', error);
  }
}

/**
 * Analyze a network request for security threats
 * @param {string} url - Request URL
 * @param {string} domain - Extracted domain
 * @param {Object} tracker - Domain tracking data
 * @param {number} tabId - Tab ID
 * @param {number} timestamp - Request timestamp
 * @returns {Object|null} Threat object or null if no threat detected
 */
function analyzeNetworkRequest(url, domain, tracker, tabId, timestamp) {
  let riskScore = 0;
  const riskFactors = [];

  if (isIPAddress(domain)) {
    riskScore += CONFIG.RISK_THRESHOLDS.IP_ADDRESS;
    riskFactors.push('Direct IP address access');
  }

  if (isUnknownDomain(domain)) {
    riskScore += CONFIG.RISK_THRESHOLDS.UNKNOWN_DOMAIN;
    riskFactors.push('Unknown domain access');
  }

  const recentRequests = tracker.timestamps.filter(
    t => t > timestamp - CONFIG.HIGH_FREQUENCY_WINDOW,
  );
  if (recentRequests.length > CONFIG.HIGH_FREQUENCY_THRESHOLD) {
    riskScore += CONFIG.RISK_THRESHOLDS.HIGH_FREQUENCY;
    riskFactors.push(`High frequency requests (${recentRequests.length} in ${CONFIG.HIGH_FREQUENCY_WINDOW / 1000}s)`);
  }

  if (riskScore > 0) {
    return {
      id: generateThreatId(),
      type: 'NETWORK_THREAT',
      domain,
      url,
      score: Math.min(riskScore, CONFIG.RISK_SCORE_CAP),
      factors: riskFactors,
      tabId,
      timestamp,
      severity: riskScore >= CONFIG.RISK_THRESHOLDS.CRITICAL_LEVEL ? 'HIGH' : 'MEDIUM',
    };
  }

  return null;
}

// ============================================================================
// DOM MONITORING
// ============================================================================

/**
 * Record a DOM manipulation threat
 * @param {Object} details - Threat details from content script
 * @param {number} tabId - Tab ID where threat occurred
 */
function recordDOMThreat(details, tabId) {
  const threat = {
    id: generateThreatId(),
    type: 'DOM_THREAT',
    details: details.type,
    domain: details.url ? extractDomain(details.url) : 'unknown',
    count: details.count || 1,
    tabId,
    timestamp: Date.now(),
    severity: 'HIGH',
    score: CONFIG.RISK_THRESHOLDS.DOM_INJECTION,
    factors: [`${details.type.toLowerCase().replace('_', ' ')} detected`],
    metadata: {
      url: details.url,
      element: details.element,
    },
  };

  addThreat(threat);
}

// ============================================================================
// COOKIE MONITORING
// ============================================================================

/**
 * Initialize cookie monitoring and periodic scans
 */
function initializeCookieMonitoring() {
  try {
    chrome.cookies.onChanged.addListener(handleCookieChange);
    scanCookies();
    setInterval(scanCookies, CONFIG.COOKIE_SCAN_INTERVAL);
    console.log('SHIELD: Cookie monitoring initialized');
  } catch (error) {
    console.error('SHIELD: Failed to initialize cookie monitoring:', error);
  }
}

/**
 * Handle a cookie change event
 * @param {Object} changeInfo - Cookie change event details
 */
function handleCookieChange(changeInfo) {
  analyzeCookie(changeInfo.cookie, changeInfo.cause || 'updated');
}

/**
 * Scan all cookies and analyze them for risky settings
 */
function scanCookies() {
  chrome.cookies.getAll({}, (cookies) => {
    if (chrome.runtime.lastError) {
      console.error('SHIELD: Cookie scan error:', chrome.runtime.lastError);
      return;
    }

    cookies.forEach((cookie) => {
      analyzeCookie(cookie, 'initial-scan');
    });
  });
}

/**
 * Analyze cookie risk and generate a threat if needed
 * @param {Object} cookie - Cookie details
 * @param {string} cause - Scan or event cause
 */
function analyzeCookie(cookie, cause) {
  const domain = normalizeCookieDomain(cookie.domain || 'unknown');
  let riskScore = 0;
  const riskFactors = [];

  if (!cookie.secure) {
    riskScore += 25;
    riskFactors.push('Cookie missing Secure flag');
  }

  if (!cookie.httpOnly) {
    riskScore += 20;
    riskFactors.push('Cookie missing HttpOnly flag');
  }

  if (cookie.sameSite === 'no_restriction') {
    riskScore += 15;
    riskFactors.push('Cookie allows cross-site requests (SameSite=None)');
  }

  if (!cookie.hostOnly) {
    riskScore += 20;
    riskFactors.push('Potential third-party cookie');
  }

  if (isUnknownDomain(domain)) {
    riskScore += 10;
    riskFactors.push('Cookie domain is not trusted');
  }

  if (riskScore > 0) {
    addThreat({
      id: generateThreatId(),
      type: 'COOKIE_THREAT',
      cookie: {
        name: cookie.name,
        domain,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        hostOnly: cookie.hostOnly,
      },
      score: Math.min(riskScore, CONFIG.RISK_SCORE_CAP),
      severity: riskScore >= CONFIG.RISK_THRESHOLDS.CRITICAL_LEVEL ? 'HIGH' : 'MEDIUM',
      factors: riskFactors,
      cause,
      timestamp: Date.now(),
    });
  }
}

/**
 * Normalize cookie domain values by removing a leading dot
 * @param {string} domain - Raw cookie domain
 * @returns {string} Normalized domain
 */
function normalizeCookieDomain(domain) {
  return domain.startsWith('.') ? domain.substring(1) : domain;
}

// ============================================================================
// THREAT BLOCKING
// ============================================================================

const BLOCK_LIST_STORAGE_KEY = 'shieldBlockedDomains';

/**
 * Load blocked domains from storage
 */
function loadBlockedDomains() {
  chrome.storage.local.get([BLOCK_LIST_STORAGE_KEY], (result) => {
    const stored = result[BLOCK_LIST_STORAGE_KEY] || [];
    appState.blockedDomains = new Set(stored);
  });
}

/**
 * Save blocked domains to storage
 */
function saveBlockedDomains() {
  chrome.storage.local.set({ [BLOCK_LIST_STORAGE_KEY]: Array.from(appState.blockedDomains) });
}

/**
 * Determine whether a domain should be blocked
 * @param {string} domain - Domain to check
 * @returns {boolean} True if blocked
 */
function isBlockedDomain(domain) {
  return domain && appState.blockedDomains.has(domain);
}

/**
 * Block a domain
 * @param {string} domain - Domain to add to block list
 */
function blockDomain(domain) {
  if (!domain) return;
  appState.blockedDomains.add(domain);
  saveBlockedDomains();
}

/**
 * Unblock a domain
 * @param {string} domain - Domain to remove from block list
 */
function unblockDomain(domain) {
  if (!domain) return;
  appState.blockedDomains.delete(domain);
  saveBlockedDomains();
}

// ============================================================================
// THREAT MANAGEMENT
// ============================================================================

/**
 * Add a detected threat to the system
 * @param {Object} threat - Threat object
 */
function addThreat(threat) {
  appState.threatLog.push(threat);
  appState.currentThreats.push(threat);

  if (appState.threatLog.length > CONFIG.MAX_LOG_SIZE) {
    appState.threatLog.shift();
  }

  updateRiskScore();
  notifyThreatDetected(threat);
}

/**
 * Ignore an individual threat by ID
 * @param {string} threatId - Unique threat identifier
 */
function ignoreThreat(threatId) {
  appState.currentThreats = appState.currentThreats.filter(threat => threat.id !== threatId);
  appState.threatLog = appState.threatLog.filter(threat => threat.id !== threatId);
  updateRiskScore();
}

/**
 * Update the global risk score based on current threats
 */
function updateRiskScore() {
  appState.riskScore = appState.currentThreats.reduce(
    (sum, threat) => sum + threat.score,
    0,
  );
  appState.riskScore = Math.min(appState.riskScore, CONFIG.RISK_SCORE_CAP);
}

/**
 * Notify UI components about detected threat
 * @param {Object} threat - The detected threat
 */
function notifyThreatDetected(threat) {
  chrome.runtime.sendMessage({
    type: 'THREAT_DETECTED',
    threat,
  });
}

/**
 * Generate a human-readable threat summary for AI analysis
 * @returns {string} Formatted threat summary
 */
function generateThreatSummary() {
  if (appState.currentThreats.length === 0) {
    return 'No threats detected.';
  }

  const components = appState.currentThreats.map((threat) => {
    if (threat.type === 'NETWORK_THREAT') {
      return `Network request to ${threat.domain} with risks: ${threat.factors.join(', ')}`;
    }
    if (threat.type === 'COOKIE_THREAT') {
      return `Cookie ${threat.cookie.name}@${threat.cookie.domain} with risks: ${threat.factors.join(', ')}`;
    }
    if (threat.type === 'DOM_THREAT') {
      return `DOM injection detected on ${threat.domain} - ${threat.details}`;
    }
    return `Detected ${threat.type}`;
  });

  return components.slice(0, 5).join(' | ');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a domain string is an IP address
 * @param {string} domain - Domain to check
 * @returns {boolean} True if IP address
 */
function isIPAddress(domain) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
  return ipRegex.test(domain);
}

/**
 * Check if domain is unknown or potentially suspicious
 * @param {string} domain - Domain to check
 * @returns {boolean} True if unknown/suspicious
 */
function isUnknownDomain(domain) {
  if (!domain || domain === 'unknown') {
    return true;
  }

  if (CONFIG.SUSPICIOUS_DOMAINS.some(suspicious => domain.includes(suspicious))) {
    return true;
  }

  const domainParts = domain.split('.');
  const baseDomain = domainParts.slice(-2).join('.');
  return !CONFIG.TRUSTED_DOMAINS.includes(baseDomain);
}

/**
 * Extract domain from URL
 * @param {string} url - URL to parse
 * @returns {string} Extracted domain or original URL if parsing fails
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return url;
  }
}

/**
 * Generate a unique threat identifier
 * @returns {string} Unique ID
 */
function generateThreatId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Disable a Chrome extension
 * @param {string} extensionId - Extension ID to disable
 */
function disableExtension(extensionId) {
  chrome.management.setEnabled(extensionId, false, () => {
    if (chrome.runtime.lastError) {
      console.error('SHIELD: Cannot disable extension:', chrome.runtime.lastError);
    } else {
      console.log('SHIELD: Extension disabled successfully');
    }
  });
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'DOM_THREAT':
        recordDOMThreat(message.details, sender.tab?.id || -1);
        sendResponse({ status: 'recorded' });
        break;

      case 'GET_THREATS':
        sendResponse({
          threats: appState.currentThreats,
          riskScore: appState.riskScore,
          summary: generateThreatSummary(),
          blockedDomains: Array.from(appState.blockedDomains),
        });
        break;

      case 'CLEAR_THREATS':
        appState.currentThreats = [];
        appState.riskScore = 0;
        sendResponse({ status: 'cleared' });
        break;

      case 'GET_THREAT_SUMMARY':
        sendResponse({
          summary: generateThreatSummary(),
          riskScore: appState.riskScore,
          threatCount: appState.currentThreats.length,
        });
        break;

      case 'DISABLE_EXTENSION':
        disableExtension(message.extensionId);
        sendResponse({ status: 'attempted' });
        break;

      case 'BLOCK_DOMAIN':
        blockDomain(message.domain);
        sendResponse({ status: 'blocked', blockedDomains: Array.from(appState.blockedDomains) });
        break;

      case 'UNBLOCK_DOMAIN':
        unblockDomain(message.domain);
        sendResponse({ status: 'unblocked', blockedDomains: Array.from(appState.blockedDomains) });
        break;

      case 'IGNORE_THREAT':
        ignoreThreat(message.threatId);
        sendResponse({ status: 'ignored', threatId: message.threatId });
        break;

      default:
        sendResponse({ status: 'unknown_message_type' });
        break;
    }
  } catch (error) {
    console.error('SHIELD: Error handling message:', error);
    sendResponse({ error: error.message });
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'NETWORK_REQUEST') {
    recordNetworkRequest(message.url, sender.tab?.id || -1, message.timestamp);
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

function initialize() {
  console.log('SHIELD: Initializing threat detection system v1.1.0');

  loadBlockedDomains();
  initializeNetworkMonitoring();
  initializeCookieMonitoring();

  setInterval(() => {
    cleanupOldData();
  }, CONFIG.CLEANUP_INTERVAL);

  console.log('SHIELD: Threat detection system ready');
}

/**
 * Clean up old tracking data to prevent memory leaks
 */
function cleanupOldData() {
  const cutoffTime = Date.now() - CONFIG.CLEANUP_INTERVAL;

  Object.keys(appState.requestTracker.domains).forEach(domain => {
    const tracker = appState.requestTracker.domains[domain];
    tracker.timestamps = tracker.timestamps.filter(t => t > cutoffTime);

    if (tracker.timestamps.length === 0) {
      delete appState.requestTracker.domains[domain];
    }
  });

  appState.requestTracker.lastCleanup = Date.now();
}

initialize();
