// AI Service — Sianlk
// Domain: platform
// Capabilities: platform orchestration, user intelligence, cross-app AI unification

import axios from 'axios';
import AI_CONFIG from '../config/ai.config';
import { useAuthStore } from '../store/authStore';

const aiClient = axios.create({
  baseURL: AI_CONFIG.baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Domain': AI_CONFIG.domain,
  },
});

aiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
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

// Core AI completion
export async function aiComplete(
  messages: AIMessage[],
  options: { model?: string; temperature?: number; stream?: boolean } = {}
): Promise<AIResponse> {
  const res = await aiClient.post('/api/ai/complete', {
    messages: [
      {
        role: 'system',
        content: `You are an expert AI assistant specialised in platform. ${
          'Focus on: platform orchestration, user intelligence, cross-app AI unification.'
        }`,
      },
      ...messages,
    ],
    model: options.model ?? AI_CONFIG.models.primary,
    temperature: options.temperature ?? 0.7,
    stream: options.stream ?? false,
  });
  return res.data;
}

// Domain-specific AI chat
export async function domainChat(prompt: string): Promise<string> {
  const res = await aiComplete([{ role: 'user', content: prompt }]);
  return res.content;
}

// AI with vision (image analysis)
export async function analyzeImage(base64Image: string, prompt: string): Promise<string> {
  const res = await aiClient.post('/api/ai/vision', {
    image: base64Image,
    prompt,
    model: AI_CONFIG.models.vision,
  });
  return res.data.content;
}

// Streaming AI response
export async function streamAI(
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const res = await aiClient.post('/api/ai/stream', {
    prompt,
    model: AI_CONFIG.models.fast,
  }, { responseType: 'stream' });

  res.data.on('data', (chunk: Buffer) => {
    const lines = chunk.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            onChunk(parsed.choices?.[0]?.delta?.content ?? '');
          } catch {}
        }
      }
    }
  });
}

// Vector search / RAG
export async function semanticSearch(
  query: string,
  topK = 5
): Promise<Array<{ content: string; score: number; metadata: Record<string, string> }>> {
  const res = await aiClient.post('/api/ai/search', { query, top_k: topK });
  return res.data.results;
}

export default { aiComplete, domainChat, analyzeImage, streamAI, semanticSearch };
