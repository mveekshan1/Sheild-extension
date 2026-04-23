/**
 * SHIELD Popup Interface
 *
 * Manages the extension popup UI, displaying threats, risk scores,
 * and providing user controls for threat analysis and mitigation.
 *
 * @version 1.0.0
 * @author SHIELD Team
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * UI configuration constants
 */
const GEMINI_BACKEND_URL = 'http://localhost:3000/api/gemini-explain';

const UI_CONFIG = {
  // Risk level thresholds
  RISK_LEVELS: {
    LOW: { min: 0, max: 29, color: 'low-risk' },
    MEDIUM: { min: 30, max: 59, color: 'medium-risk' },
    HIGH: { min: 60, max: 100, color: 'high-risk' },
  },

  // Update intervals
  AUTO_REFRESH_INTERVAL: 5000, // 5 seconds

  // UI messages
  MESSAGES: {
    NO_THREATS: 'No threats detected. You\'re safe! ✅',
    ANALYZING: 'Analyzing threat with Google Gemini...',
    GEMINI_NOT_LOADED: 'Gemini backend unavailable. Start the local Gemini server.',
    EXTENSION_DISABLED: 'Extension disabled successfully.',
    NO_EXTENSIONS: 'No user extensions found to disable.',
    DOMAIN_BLOCKED: 'Domain blocked and future requests will be canceled.',
  },
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Popup application state
 */
const popupState = {
  currentThreats: [],
  currentRiskScore: 0,
  geminiExplanation: '',
  isAnalyzing: false,
  autoRefreshTimer: null,
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the popup when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  initializePopup();
});

/**
 * Setup popup components and event listeners
 */
function initializePopup() {
  setupEventListeners();
  loadThreatData();

  // Start auto-refresh for real-time updates
  startAutoRefresh();

  console.log('SHIELD: Popup initialized');
}

/**
 * Setup event listeners for UI controls
 */
function setupEventListeners() {
  const analyzeBtn = document.getElementById('analyze-btn');
  const disableBtn = document.getElementById('disable-btn');
  const clearBtn = document.getElementById('clear-btn');

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalyzeClick);
  }

  const blockBtn = document.getElementById('block-btn');
  if (blockBtn) {
    blockBtn.addEventListener('click', handleBlockClick);
  }

  if (disableBtn) {
    disableBtn.addEventListener('click', handleDisableClick);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearClick);
  }
}

/**
 * Start automatic data refresh
 */
function startAutoRefresh() {
  popupState.autoRefreshTimer = setInterval(() => {
    loadThreatData();
  }, UI_CONFIG.AUTO_REFRESH_INTERVAL);
}

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

/**
 * Load threat data from background script
 */
function loadThreatData() {
  chrome.runtime.sendMessage({ type: 'GET_THREATS' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('SHIELD: Error loading threats:', chrome.runtime.lastError);
      showError('Failed to load threat data');
      return;
    }

    if (response) {
      popupState.currentThreats = response.threats || [];
      popupState.currentRiskScore = response.riskScore || 0;

      updateUI();
    }
  });
}

/**
 * Update the entire UI with current state
 */
function updateUI() {
  updateRiskScoreDisplay();
  updateThreatCountDisplay();
  updateThreatsList();
  updateButtonStates();
}

/**
 * Update risk score display
 */
function updateRiskScoreDisplay() {
  const scoreElement = document.getElementById('score-value');
  const levelElement = document.getElementById('score-level');

  if (!scoreElement || !levelElement) return;

  scoreElement.textContent = popupState.currentRiskScore;

  const riskLevel = getRiskLevel(popupState.currentRiskScore);
  levelElement.textContent = riskLevel.toUpperCase();
  levelElement.className = UI_CONFIG.RISK_LEVELS[riskLevel.toUpperCase()].color;
}

/**
 * Update threat count display
 */
function updateThreatCountDisplay() {
  const countElement = document.getElementById('threat-count-value');
  if (countElement) {
    countElement.textContent = popupState.currentThreats.length;
  }
}

/**
 * Update threats list display
 */
function updateThreatsList() {
  const threatsList = document.getElementById('threats-list');
  if (!threatsList) return;

  if (popupState.currentThreats.length === 0) {
    threatsList.innerHTML = `<div id="no-threats">${UI_CONFIG.MESSAGES.NO_THREATS}</div>`;
  } else {
    threatsList.innerHTML = '';

    popupState.currentThreats.forEach((threat, index) => {
      const threatElement = createThreatElement(threat, index);
      threatsList.appendChild(threatElement);
    });
  }
}

/**
 * Update button states based on current threats
 */
function updateButtonStates() {
  const analyzeBtn = document.getElementById('analyze-btn');
  const disableBtn = document.getElementById('disable-btn');
  const blockBtn = document.getElementById('block-btn');
  const hasThreats = popupState.currentThreats.length > 0;

  if (analyzeBtn) {
    analyzeBtn.disabled = !hasThreats || popupState.isAnalyzing;
  }

  if (disableBtn) {
    disableBtn.disabled = !hasThreats;
  }

  if (blockBtn) {
    blockBtn.disabled = !hasThreats;
  }
}

/**
 * Get risk level string based on score
 * @param {number} score - Risk score
 * @returns {string} Risk level ('low', 'medium', 'high')
 */
function getRiskLevel(score) {
  if (score >= UI_CONFIG.RISK_LEVELS.HIGH.min) return 'high';
  if (score >= UI_CONFIG.RISK_LEVELS.MEDIUM.min) return 'medium';
  return 'low';
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

/**
 * Create a threat display element
 * @param {Object} threat - Threat data
 * @param {number} index - Threat index
 * @returns {HTMLElement} Threat element
 */
function createThreatElement(threat, index) {
  const div = document.createElement('div');
  div.className = 'threat-item';

  const severity = threat.severity || 'MEDIUM';
  const type = threat.type === 'NETWORK_THREAT' ? 'Network'
    : threat.type === 'COOKIE_THREAT' ? 'Cookie'
    : 'DOM Injection';

  div.innerHTML = `
    <div class="threat-header">
      <span class="threat-type">${type}</span>
      <span class="threat-severity severity-${severity.toLowerCase()}">${severity}</span>
    </div>
    <div class="threat-details">
      ${threat.domain ? `<div>Domain: ${threat.domain}</div>` : ''}
      ${threat.cookie ? `<div>Cookie: ${threat.cookie.name}@${threat.cookie.domain}</div>` : ''}
      ${threat.details ? `<div>Type: ${threat.details}</div>` : ''}
      ${threat.factors ? `<div>Factors: ${threat.factors.join(', ')}</div>` : ''}
      <div>Score: +${threat.score}</div>
    </div>
  `;

  return div;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle analyze button click
 */
async function handleAnalyzeClick() {
  if (popupState.isAnalyzing) return;

  popupState.isAnalyzing = true;
  updateButtonStates();

  const analysisSection = document.getElementById('analysis-section');
  const explanationDiv = document.getElementById('gemini-explanation');

  if (analysisSection && explanationDiv) {
    analysisSection.style.display = 'block';
    explanationDiv.textContent = UI_CONFIG.MESSAGES.ANALYZING;
  }

  try {
    const explanation = await analyzeThreatsWithGemini();
    if (explanationDiv) {
      explanationDiv.textContent = explanation;
    }
    popupState.geminiExplanation = explanation;

  } catch (error) {
    console.error('SHIELD: Error analyzing threats:', error);
    if (explanationDiv) {
      explanationDiv.textContent = `Error analyzing with Gemini: ${error.message}`;
    }
  } finally {
    popupState.isAnalyzing = false;
    updateButtonStates();
  }
}

/**
 * Handle disable extension button click
 */
function handleDisableClick() {
  disableSuspiciousExtension();
}

/**
 * Handle clear threats button click
 */
function handleClearClick() {
  clearThreats();
}

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Analyze current threats using Gemini AI
 * @returns {Promise<string>} AI explanation
 */
async function analyzeThreatsWithGemini() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_THREAT_SUMMARY' }, async(response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const summary = response.summary;
      try {
        const result = await fetch(GEMINI_BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary }),
        });

        if (!result.ok) {
          const responseText = await result.text();
          throw new Error(`Gemini backend returned ${result.status}: ${responseText}`);
        }

        const payload = await result.json();
        resolve(payload.explanation || 'No explanation returned from backend.');
      } catch (error) {
        console.error('SHIELD: Gemini backend error:', error);
        resolve(`${UI_CONFIG.MESSAGES.GEMINI_NOT_LOADED} ${error.message}`);
      }
    });
  });
}

/**
 * Disable a suspicious extension
 */
function disableSuspiciousExtension() {
  chrome.management.getAll((extensions) => {
    if (chrome.runtime.lastError) {
      showError('Cannot access extension management: ' + chrome.runtime.lastError.message);
      return;
    }

    const userExtensions = extensions.filter(ext =>
      !ext.isApp && ext.id !== chrome.runtime.id && ext.enabled,
    );

    if (userExtensions.length === 0) {
      showError(UI_CONFIG.MESSAGES.NO_EXTENSIONS);
      return;
    }

    // For demo purposes, disable the first user extension
    // In production, this should correlate with actual threat sources
    const ext = userExtensions[0];

    if (confirm(`Disable extension "${ext.name}"? This may break functionality.`)) {
      chrome.runtime.sendMessage({
        type: 'DISABLE_EXTENSION',
        extensionId: ext.id,
      }, (response) => {
        if (chrome.runtime.lastError) {
          showError('Cannot disable extension: ' + chrome.runtime.lastError.message);
        } else {
          showSuccess(UI_CONFIG.MESSAGES.EXTENSION_DISABLED);
          clearThreats();
        }
      });
    }
  });
}

/**
 * Clear all threats and reset state
 */
function clearThreats() {
  chrome.runtime.sendMessage({ type: 'CLEAR_THREATS' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('SHIELD: Error clearing threats:', chrome.runtime.lastError);
      return;
    }

    popupState.currentThreats = [];
    popupState.currentRiskScore = 0;
    popupState.geminiExplanation = '';

    updateUI();

    const analysisSection = document.getElementById('analysis-section');
    if (analysisSection) {
      analysisSection.style.display = 'none';
    }
  });
}

/**
 * Handle block domain button click
 */
function handleBlockClick() {
  const domain = getMostRiskyDomain();
  if (!domain) {
    showError('No domain available to block.');
    return;
  }

  chrome.runtime.sendMessage({ type: 'BLOCK_DOMAIN', domain }, (response) => {
    if (chrome.runtime.lastError) {
      showError('Unable to block domain: ' + chrome.runtime.lastError.message);
      return;
    }

    showSuccess(UI_CONFIG.MESSAGES.DOMAIN_BLOCKED);
    loadThreatData();
  });
}

/**
 * Get the most risky domain from current threats
 * @returns {string|null} Domain to block
 */
function getMostRiskyDomain() {
  const networkThreat = popupState.currentThreats.find(threat => threat.domain);
  if (networkThreat) {
    return networkThreat.domain;
  }
  const cookieThreat = popupState.currentThreats.find(threat => threat.cookie?.domain);
  return cookieThreat ? cookieThreat.cookie.domain : null;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show error message to user
 * @param {string} message - Error message
 */
function showError(message) {
  alert(`Error: ${message}`);
}

/**
 * Show success message to user
 * @param {string} message - Success message
 */
function showSuccess(message) {
  alert(message);
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'THREAT_DETECTED') {
    // Reload threat data when new threats are detected
    loadThreatData();
  }
});

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Cleanup when popup is closed
 */
window.addEventListener('beforeunload', () => {
  if (popupState.autoRefreshTimer) {
    clearInterval(popupState.autoRefreshTimer);
  }
});
