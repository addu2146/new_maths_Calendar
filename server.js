import express from 'express';
import cors from 'cors';
import { DEFAULT_MONTHS, DEFAULT_DATA } from './public/js/data.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function runGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('missing-key');
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const trimmed = String(prompt || '').slice(0, 800);
  const result = await model.generateContent(trimmed);
  return result.response.text();
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
  const { prompt } = req.body || {};
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
