/**
 * SHIELD Background Service Worker
 *
 * Core threat detection engine that monitors network requests and DOM changes
 * in real-time, calculates risk scores, and manages threat data.
 *
 * @version 1.0.0
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
};

// ============================================================================
// NETWORK MONITORING
// ============================================================================

/**
 * Initialize network request monitoring
 * Sets up Chrome Web Request API listener to intercept all network requests
 */
function initializeNetworkMonitoring() {
  try {
    chrome.webRequest.onBeforeRequest.addListener(
      handleNetworkRequest,
      { urls: ['<all_urls>'] },
      [],
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

    // Initialize domain tracking if not exists
    if (!appState.requestTracker.domains[domain]) {
      appState.requestTracker.domains[domain] = {
        count: 0,
        timestamps: [],
        riskFactors: [],
      };
    }

    const tracker = appState.requestTracker.domains[domain];
    tracker.count++;
    tracker.timestamps.push(timestamp);

    // Maintain sliding window of recent requests (last 60 seconds)
    const cutoffTime = timestamp - CONFIG.CLEANUP_INTERVAL;
    tracker.timestamps = tracker.timestamps.filter(t => t > cutoffTime);

    // Analyze request for threats
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

  // Check for IP address usage (suspicious)
  if (isIPAddress(domain)) {
    riskScore += CONFIG.RISK_THRESHOLDS.IP_ADDRESS;
    riskFactors.push('Direct IP address access');
  }

  // Check for unknown/suspicious domains
  if (isUnknownDomain(domain)) {
    riskScore += CONFIG.RISK_THRESHOLDS.UNKNOWN_DOMAIN;
    riskFactors.push('Unknown domain access');
  }

  // Check for high-frequency requests (potential DoS or data exfiltration)
  const recentRequests = tracker.timestamps.filter(
    t => t > timestamp - CONFIG.HIGH_FREQUENCY_WINDOW,
  );

  if (recentRequests.length > CONFIG.HIGH_FREQUENCY_THRESHOLD) {
    riskScore += CONFIG.RISK_THRESHOLDS.HIGH_FREQUENCY;
    riskFactors.push(`High frequency requests (${recentRequests.length} in ${CONFIG.HIGH_FREQUENCY_WINDOW / 1000}s)`);
  }

  // Return threat object if risk detected
  if (riskScore > 0) {
    return {
      type: 'NETWORK_THREAT',
      domain,
      url,
      score: riskScore,
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
    type: 'DOM_THREAT',
    details: details.type, // 'SCRIPT_INJECTION' or 'IFRAME_INJECTION'
    count: details.count || 1,
    tabId,
    timestamp: Date.now(),
    severity: 'HIGH',
    score: CONFIG.RISK_THRESHOLDS.DOM_INJECTION,
    factors: [`${details.type.toLowerCase().replace('_', ' ')} detected`],
  };

  addThreat(threat);
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

  // Maintain log size limit
  if (appState.threatLog.length > CONFIG.MAX_LOG_SIZE) {
    appState.threatLog.shift();
  }

  // Update global risk score
  updateRiskScore();

  // Notify UI components of new threat
  notifyThreatDetected(threat);
}

/**
 * Update the global risk score based on current threats
 */
function updateRiskScore() {
  appState.riskScore = appState.currentThreats.reduce(
    (sum, threat) => sum + threat.score,
    0,
  );

  // Cap maximum risk score
  appState.riskScore = Math.min(appState.riskScore, CONFIG.RISK_SCORE_CAP);
}

/**
 * Notify UI components about detected threat
 * @param {Object} threat - The detected threat
 */
function notifyThreatDetected(threat) {
  chrome.runtime.sendMessage({
    type: 'THREAT_DETECTED',
    threat: threat,
  }).catch(() => {
    // Popup may not be open, which is fine
  });
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
  // Check against known suspicious domains
  if (CONFIG.SUSPICIOUS_DOMAINS.some(suspicious => domain.includes(suspicious))) {
    return true;
  }

  // Extract base domain (last two parts)
  const domainParts = domain.split('.');
  const baseDomain = domainParts.slice(-2).join('.');

  // Check if it's in trusted domains list
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
    // Return original URL if parsing fails
    return url;
  }
}

/**
 * Generate a human-readable threat summary for AI analysis
 * @returns {string} Formatted threat summary
 */
function generateThreatSummary() {
  if (appState.currentThreats.length === 0) {
    return 'No threats detected.';
  }

  const threatTypes = {};
  const factors = [];

  appState.currentThreats.forEach(threat => {
    threatTypes[threat.type] = (threatTypes[threat.type] || 0) + 1;
    if (threat.factors) {
      factors.push(...threat.factors);
    }
  });

  let summary = `Detected ${appState.currentThreats.length} suspicious activities: `;

  if (threatTypes.NETWORK_THREAT) {
    summary += `${threatTypes.NETWORK_THREAT} suspicious network requests `;
  }

  if (threatTypes.DOM_THREAT) {
    summary += `${threatTypes.DOM_THREAT} DOM injection attempts `;
  }

  const uniqueFactors = Array.from(new Set(factors));
  summary += `Risk factors: ${uniqueFactors.join(', ')}`;

  return summary;
}

/**
 * Disable a Chrome extension
 * @param {string} extensionId - Extension ID to disable
 */
function disableExtension(extensionId) {
  chrome.management.setEnabled(extensionId, false, () => {
    console.log('SHIELD: Extension disabled successfully');
  }).catch((error) => {
    console.error('SHIELD: Cannot disable extension:', error);
  });
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.type) {
    case 'DOM_THREAT':
      recordDOMThreat(message.details, sender.tab.id);
      sendResponse({ status: 'recorded' });
      break;

    case 'GET_THREATS':
      sendResponse({
        threats: appState.currentThreats,
        riskScore: appState.riskScore,
        summary: generateThreatSummary(),
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

    default:
      sendResponse({ status: 'unknown_message_type' });
    }
  } catch (error) {
    console.error('SHIELD: Error handling message:', error);
    sendResponse({ error: error.message });
  }
});

/**
 * Handle network requests reported by content scripts (fallback)
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'NETWORK_REQUEST') {
    recordNetworkRequest(message.url, sender.tab.id, message.timestamp);
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the SHIELD background service
 */
function initialize() {
  console.log('SHIELD: Initializing threat detection system v1.0.0');

  // Start network monitoring
  initializeNetworkMonitoring();

  // Periodic cleanup of old tracking data
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

    // Remove empty trackers
    if (tracker.timestamps.length === 0) {
      delete appState.requestTracker.domains[domain];
    }
  });

  appState.requestTracker.lastCleanup = Date.now();
}

// Start the system
initialize();
