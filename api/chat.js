import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from '../lib/knowledge.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation contents
    const contents = [
      ...history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseModalities: ['TEXT', 'AUDIO'], // Request both Text and Audio
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }, // Aoede is a good standard voice, check if Portuguese supported well or fallback
        },
      },
    });

    const text = response.text || '';
    // Extract audio if available (Gemini returns it in parts)
    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData && p.inlineData.mimeType.startsWith('audio'));
    const audioData = audioPart ? audioPart.inlineData.data : null;

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ reply: text, audio: audioData });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      detail: error.message,
    });
  }
}
