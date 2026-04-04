// AI Service — Sianlk
// Domain: platform

import axios from 'axios';
import AI_CONFIG from '../config/ai.config';

const aiClient = axios.create({
  baseURL: AI_CONFIG.baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Domain': AI_CONFIG.domain,
  },
});

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export async function aiComplete(messages: AIMessage[]): Promise<AIResponse> {
  const res = await aiClient.post('/api/ai/complete', {
    messages: [
      { role: 'system', content: `Expert AI for platform. Focus: platform orchestration, user intelligence, cross-app AI unification.` },
      ...messages,
    ],
    model: AI_CONFIG.models.primary,
    temperature: 0.7,
  });
  return res.data;
}

export async function domainChat(prompt: string): Promise<string> {
  const res = await aiComplete([{ role: 'user', content: prompt }]);
  return res.content;
}

export async function analyzeImage(base64Image: string, prompt: string): Promise<string> {
  const res = await aiClient.post('/api/ai/vision', { image: base64Image, prompt });
  return res.data.content;
}

export default { aiComplete, domainChat, analyzeImage };
