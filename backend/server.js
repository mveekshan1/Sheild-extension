require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash'; // Fixed directly to 1.5-flash

app.use(cors());
app.use(express.json());

// Root endpoint for simple health check
app.get('/', (req, res) => {
  res.status(200).send('SHIELD Backend API is running properly!');
});

// Explicit health status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', backend: 'gemini', model: GEMINI_MODEL });
});

// Endpoint to list available models for debugging
app.get('/api/models', async (req, res) => {
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await fetch(listUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Main analysis endpoint used by both Extension and Web Demo
app.post('/analyze', async (req, res) => {
  const { summary } = req.body;

  if (!summary) {
    return res.status(400).json({ error: 'Missing threat summary.' });
  }

  if (!GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not configured in the environment variables.');
    return res.status(500).json({ error: 'Server misconfiguration: API key is missing.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
      contents: [{
        parts: [{ text: `Analyze this browser threat summary and provide a concise 2-3 sentence explanation of risk: ${summary}` }],
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 150,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: `Gemini API Error: ${errorData}` });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('Invalid response format received from Gemini.');
    }

    res.json({ explanation: text.trim() });

  } catch (error) {
    console.error('Gemini Backend Processing Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SHIELD Gemini backend listening on port ${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is not set. Requests will fail until configured.');
  }
});
