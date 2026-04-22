/**
 * SHIELD Gemini AI Service
 *
 * Integrates with Google Gemini AI to provide intelligent threat analysis
 * and explanations for detected security threats.
 *
 * @version 1.0.0
 * @author SHIELD Team
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * Gemini API configuration
 * In production, these should be loaded from environment variables
 */
const GEMINI_CONFIG = {
  // API endpoint
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models',

  // Model settings
  MODEL: 'gemini-pro',
  TEMPERATURE: 0.3,
  MAX_OUTPUT_TOKENS: 150,

  // Request timeout (milliseconds)
  REQUEST_TIMEOUT: 10000,

  // Cache settings
  CACHE_SIZE_LIMIT: 50,
  CACHE_TTL: 300000, // 5 minutes
};

// ============================================================================
// ENVIRONMENT VARIABLE HANDLING
// ============================================================================

/**
 * Get Gemini API key from environment variables
 * @returns {string|null} API key or null if not configured
 */
function getGeminiApiKey() {
  // In Chrome extension, we can't directly access process.env
  // API key should be configured via extension options or stored securely
  // For development, check if a global variable is set
  if (typeof GEMINI_API_KEY !== 'undefined' && GEMINI_API_KEY) {
    return GEMINI_API_KEY;
  }

  // Check for API key in chrome storage (preferred secure method)
  // This would be set during extension setup
  return null; // Will be handled by configuration check
}

/**
 * Check if Gemini service is properly configured
 * @returns {boolean} True if configured and ready
 */
function isGeminiConfigured() {
  const apiKey = getGeminiApiKey();
  return apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE';
}

// ============================================================================
// AI ANALYSIS
// ============================================================================

/**
 * Analyze a threat summary using Google Gemini AI
 * @param {string} threatSummary - Description of detected threats
 * @returns {Promise<string>} AI-generated explanation or error message
 */
async function analyzeThreatWithGemini(threatSummary) {
  if (!isGeminiConfigured()) {
    return 'Gemini AI analysis not configured. Please set up your API key in extension settings.';
  }

  try {
    const apiKey = getGeminiApiKey();
    const analysisPrompt = buildAnalysisPrompt(threatSummary);

    const response = await makeGeminiRequest(apiKey, analysisPrompt);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return extractGeminiResponse(data);

  } catch (error) {
    console.error('SHIELD: Gemini API error:', error);
    return generateFallbackExplanation(threatSummary, error);
  }
}

/**
 * Build the analysis prompt for Gemini
 * @param {string} threatSummary - Threat description
 * @returns {string} Formatted prompt
 */
function buildAnalysisPrompt(threatSummary) {
  return `You are a cybersecurity expert analyzing browser extension threats. Provide a concise 2-3 sentence explanation of why this behavior might be suspicious or malicious:

${threatSummary}

Focus on the security implications and potential risks to the user.`;
}

/**
 * Make HTTP request to Gemini API
 * @param {string} apiKey - Gemini API key
 * @param {string} prompt - Analysis prompt
 * @returns {Promise<Response>} Fetch response
 */
async function makeGeminiRequest(apiKey, prompt) {
  const url = `${GEMINI_CONFIG.API_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt,
      }],
    }],
    generationConfig: {
      temperature: GEMINI_CONFIG.TEMPERATURE,
      maxOutputTokens: GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Extract response text from Gemini API response
 * @param {Object} data - Gemini API response data
 * @returns {string} Extracted explanation
 */
function extractGeminiResponse(data) {
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid Gemini response format');
  }

  const text = data.candidates[0].content.parts[0].text;
  return text ? text.trim() : 'No explanation provided by Gemini.';
}

/**
 * Generate fallback explanation when Gemini is unavailable
 * @param {string} threatSummary - Original threat summary
 * @param {Error} error - The error that occurred
 * @returns {string} Fallback explanation
 */
function generateFallbackExplanation(threatSummary, error) {
  const baseMessage = 'Unable to analyze with Gemini AI. ';

  if (error.message.includes('timeout')) {
    return baseMessage + 'Request timed out. The detected behavior appears suspicious based on pattern analysis.';
  }

  if (error.message.includes('401') || error.message.includes('403')) {
    return baseMessage + 'API key invalid. Please check your Gemini API configuration.';
  }

  return baseMessage + `Error: ${error.message}. This behavior appears suspicious based on security pattern matching.`;
}

// ============================================================================
// CACHING SYSTEM
// ============================================================================

/**
 * Simple in-memory cache for Gemini responses
 */
class GeminiCache {
  constructor() {
    this.cache = new Map();
    this.accessTimes = new Map();
  }

  /**
   * Get cached response
   * @param {string} key - Cache key
   * @returns {string|null} Cached response or null
   */
  get(key) {
    const entry = this.cache.get(key);
    if (entry && this.isValid(key)) {
      this.accessTimes.set(key, Date.now());
      return entry;
    }
    return null;
  }

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {string} value - Response to cache
   */
  set(key, value) {
    // Maintain cache size limit
    if (this.cache.size >= GEMINI_CONFIG.CACHE_SIZE_LIMIT) {
      this.evictOldest();
    }

    this.cache.set(key, value);
    this.accessTimes.set(key, Date.now());
  }

  /**
   * Clear all cached responses
   */
  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }

  /**
   * Check if cache entry is still valid
   * @param {string} key - Cache key
   * @returns {boolean} True if valid
   */
  isValid(key) {
    const accessTime = this.accessTimes.get(key);
    return accessTime && (Date.now() - accessTime) < GEMINI_CONFIG.CACHE_TTL;
  }

  /**
   * Remove oldest cache entry
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
    }
  }
}

// Initialize cache
const geminiCache = new GeminiCache();

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get threat explanation with caching
 * @param {string} threatSummary - Description of threats
 * @returns {Promise<string>} AI explanation
 */
async function getThreatExplanation(threatSummary) {
  // Check cache first
  const cacheKey = threatSummary;
  const cached = geminiCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  // Get fresh analysis
  const explanation = await analyzeThreatWithGemini(threatSummary);

  // Cache the result
  geminiCache.set(cacheKey, explanation);

  return explanation;
}

/**
 * Clear the explanation cache
 */
function clearExplanationCache() {
  geminiCache.clear();
}

/**
 * Get service status
 * @returns {Object} Service status information
 */
function getServiceStatus() {
  return {
    configured: isGeminiConfigured(),
    cacheSize: geminiCache.cache.size,
    model: GEMINI_CONFIG.MODEL,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export service interface
window.ShieldGemini = {
  analyzeThreat: analyzeThreatWithGemini,
  getExplanation: getThreatExplanation,
  clearCache: clearExplanationCache,
  getStatus: getServiceStatus,
};

// Log service initialization
console.log('SHIELD: Gemini AI service initialized', getServiceStatus());
