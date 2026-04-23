/**
 * SHIELD Gemini Client
 *
 * Sends summarized threat details to a secure backend endpoint for Gemini analysis.
 * No API keys are stored or used in the frontend.
 *
 * @version 1.0.0
 * @author SHIELD Team
 */

const GEMINI_BACKEND_URL = 'http://localhost:3000/api/gemini-explain';
const CACHE_TTL = 300000; // 5 minutes

class GeminiCache {
  constructor() {
    this.cache = new Map();
    this.accessTimes = new Map();
  }

  get(key) {
    const value = this.cache.get(key);
    const accessTime = this.accessTimes.get(key);
    if (value && accessTime && Date.now() - accessTime < CACHE_TTL) {
      this.accessTimes.set(key, Date.now());
      return value;
    }
    this.cache.delete(key);
    this.accessTimes.delete(key);
    return null;
  }

  set(key, value) {
    this.cache.set(key, value);
    this.accessTimes.set(key, Date.now());
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }
}

const geminiCache = new GeminiCache();

async function requestGeminiExplanation(summary) {
  const response = await fetch(GEMINI_BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ summary }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Backend error ${response.status}: ${message}`);
  }

  const payload = await response.json();
  return payload.explanation || 'No explanation returned by Gemini backend.';
}

async function getThreatExplanation(summary) {
  const cacheKey = summary;
  const cached = geminiCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const explanation = await requestGeminiExplanation(summary);
    geminiCache.set(cacheKey, explanation);
    return explanation;
  } catch (error) {
    console.error('SHIELD: Gemini backend request failed:', error);
    return `Gemini analysis unavailable: ${error.message}`;
  }
}

window.ShieldGemini = {
  getExplanation: getThreatExplanation,
};

console.log('SHIELD: Gemini client initialized. Backend endpoint:', GEMINI_BACKEND_URL);
