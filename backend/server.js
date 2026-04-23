const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro';

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, message) {
  res.writeHead(status, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(message);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function callGemini(summary) {
  return new Promise((resolve, reject) => {
    if (!GEMINI_API_KEY) {
      reject(new Error('Missing GEMINI_API_KEY environment variable.'));
      return;
    }

    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`);
    url.searchParams.set('key', GEMINI_API_KEY);

    const requestBody = JSON.stringify({
      contents: [{
        parts: [{ text: `Analyze this browser threat summary and provide a concise 2-3 sentence explanation of risk: ${summary}` }],
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 150,
      },
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(url, requestOptions, (res) => {
      let responseData = '';
      res.on('data', chunk => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Gemini API responded ${res.statusCode}: ${responseData}`));
          return;
        }

        try {
          const body = JSON.parse(responseData);
          const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            reject(new Error('Invalid Gemini API response format.'));
            return;
          }
          resolve(text.trim());
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendText(res, 204, '');
    return;
  }

  if (req.method === 'POST' && req.url === '/api/gemini-explain') {
    try {
      const body = await parseBody(req);
      const summary = body.summary;
      if (!summary || typeof summary !== 'string') {
        sendJson(res, 400, { error: 'Missing threat summary.' });
        return;
      }

      const explanation = await callGemini(summary);
      sendJson(res, 200, { explanation });
    } catch (error) {
      console.error('Gemini backend error:', error);
      sendJson(res, 500, { error: error.message });
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/api/status') {
    sendJson(res, 200, { status: 'ok', backend: 'gemini', model: GEMINI_MODEL });
    return;
  }

  sendText(res, 404, 'Not found');
});

server.listen(PORT, () => {
  console.log(`Gemini backend server listening on http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY is not set. Set it in the environment before running this server.');
  }
});
