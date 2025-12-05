import express from 'express';
import cors from 'cors';
import { DEFAULT_MONTHS, DEFAULT_DATA } from './public/js/data.js';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();

async function runGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('missing-key');
  }
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const trimmed = String(prompt || '').slice(0, 800);
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: trimmed,
  });

  const text = typeof result?.text === 'function'
    ? result.text()
    : (result?.text || result?.response?.text?.());

  return text;
}

app.use(cors());
app.use(express.json());

app.get('/api/months', (_req, res) => {
  res.json({
    months: DEFAULT_MONTHS,
    data: DEFAULT_DATA,
    source: 'local-express-api'
  });
});

const geminiHandler = async (req, res) => {
  const body = req.body || {};
  const prompt = typeof body === 'string' ? body : body.prompt;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }
  try {
    const text = await runGemini(prompt);
    return res.json({ text });
  } catch (err) {
    if (err.message === 'missing-key') {
      return res.status(500).json({ error: 'GEMINI_API_KEY not set on server' });
    }
    console.error('Gemini error', err);
    return res.status(500).json({ error: 'Failed to fetch from Gemini' });
  }
};

app.post('/api/gemini', geminiHandler);
app.post('/api/gemini/explain', geminiHandler); // backward compatible

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}/api/months`);
  if (GEMINI_API_KEY) {
    console.log('Gemini enabled: POST /api/gemini');
  } else {
    console.log('Gemini disabled: set GEMINI_API_KEY to enable');
  }
});
