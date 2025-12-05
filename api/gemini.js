import { GoogleGenAI } from '@google/genai';

// Ensure Node runtime on Vercel
export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set on server' });
  }

  // Vercel provides parsed JSON when header is application/json; fall back just in case
  const body = req.body || {};
  const prompt = typeof body === 'string' ? body : body.prompt;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const trimmed = String(prompt).slice(0, 800);
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: trimmed,
    });

    const text = extractText(result);
    if (!text) {
      return res.status(500).json({ error: 'Gemini returned empty text' });
    }
    res.status(200).json({ text });
  } catch (err) {
    console.error('Gemini error', err);
    const message = err?.message || 'Failed to fetch from Gemini';
    res.status(500).json({ error: message });
  }
}

function extractText(result) {
  try {
    if (!result) return '';
    if (typeof result.text === 'function') return result.text();
    if (typeof result.text === 'string') return result.text;
    if (typeof result?.response?.text === 'function') return result.response.text();
    if (typeof result?.response?.text === 'string') return result.response.text;

    const candidates = result?.response?.candidates || result?.candidates;
    if (Array.isArray(candidates) && candidates.length) {
      const parts = candidates[0]?.content?.parts;
      if (Array.isArray(parts)) {
        const piece = parts.find(p => typeof p.text === 'string');
        if (piece?.text) return piece.text;
      }
      const firstText = candidates[0]?.content?.parts?.[0];
      if (typeof firstText === 'string') return firstText;
    }
    return '';
  } catch {
    return '';
  }
}
