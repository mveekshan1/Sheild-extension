require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns').promises;

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

/* -------------------- HEALTH -------------------- */

app.get('/', (req, res) => {
  res.send('SHIELD Backend Running');
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', model: GEMINI_MODEL });
});

/* -------------------- HELPER: BASIC URL ANALYSIS -------------------- */

async function analyzeURL(url) {
  let score = 0;
  const issues = [];

  try {
    const parsed = new URL(url);

    // Rule 1: HTTP (not HTTPS)
    if (parsed.protocol !== 'https:') {
      score += 30;
      issues.push('Uses insecure HTTP protocol');
    }

    // Rule 2: IP-based URL
    if (/^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname)) {
      score += 40;
      issues.push('Uses direct IP address instead of domain');
    }

    // Rule 3: Suspicious keywords
    const suspiciousKeywords = ['login', 'verify', 'secure', 'account', 'bank'];
    if (suspiciousKeywords.some(k => parsed.href.toLowerCase().includes(k))) {
      score += 15;
      issues.push('Contains phishing-related keywords');
    }

    // Rule 4: Very long URL
    if (url.length > 120) {
      score += 15;
      issues.push('Unusually long URL');
    }

    // Rule 5: Many subdomains
    if (parsed.hostname.split('.').length > 3) {
      score += 10;
      issues.push('Too many subdomains');
    }

    // DNS Resolution Check
    try {
      await dns.lookup(parsed.hostname);
    } catch (e) {
      score += 50;
      issues.push('DNS resolution failed (Domain does not exist or unreachable)');
    }

    // Fetch Page Content safely
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout
        
        const res = await fetch(url, { 
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        clearTimeout(timeoutId);

        if (res.redirected) {
          score += 10;
          issues.push('Detected automated redirect chain');
        }

        const html = await res.text();
        
        const iframeCount = (html.match(/<iframe/gi) || []).length;
        if (iframeCount > 0) {
          score += 10;
          issues.push(`Detected ${iframeCount} iframes`);
        }

        const scriptCount = (html.match(/<script/gi) || []).length;
        if (scriptCount > 10) {
          score += 10;
          issues.push('High number of scripts detected');
        }

        const formCount = (html.match(/<form/gi) || []).length;
        if (formCount > 0) {
          score += 20;
          issues.push('Contains interactive forms/logins');
        }

      } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') {
          score += 15;
          issues.push('Page load timed out (Extremely slow response)');
        } else {
          score += 10;
          issues.push('Live page inspection failed or blocked');
        }
      }
    }

  } catch (err) {
    return { score: 90, issues: ['Invalid URL formatting'] };
  }

  return {
    score: Math.min(score, 100),
    issues
  };
}

/* -------------------- MAIN ENDPOINT -------------------- */

app.post('/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key missing' });
  }

  const analysis = await analyzeURL(url);

  try {
    const prompt = `
You are a cybersecurity assistant.

Analyze the following URL risk report and explain clearly to a normal user.

URL: ${url}

Risk Score: ${analysis.score}/100

Detected Issues:
${analysis.issues.length ? analysis.issues.join(', ') : 'No major issues detected'}

Explain:
- Is this URL safe or risky?
- What should the user do?
Keep it simple and concise (2-3 sentences).
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const explanation =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No explanation generated";

    res.json({
      url,
      risk_score: analysis.score,
      issues: analysis.issues,
      explanation
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- START SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`🚀 SHIELD backend running on port ${PORT}`);
});