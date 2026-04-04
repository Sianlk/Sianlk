// AI Configuration — Sianlk
// Domain: platform | Focus: platform orchestration, user intelligence, cross-app AI unification

export const AI_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.sianlk.com',
  models: {
    primary: 'gpt-4o',
    fast: 'gpt-4o-mini',
    embedding: 'text-embedding-3-large',
    vision: 'gpt-4o',
  },
  domain: 'platform',
  focus: 'platform orchestration, user intelligence, cross-app AI unification',
  features: {
    streamingEnabled: true,
    voiceEnabled: true,
    visionEnabled: true,
    agentsEnabled: true,
  },
  rateLimit: {
    requestsPerMinute: 60,
    tokensPerRequest: 4096,
    maxRetries: 3,
  },
  workforce: {
    orchestratorEnabled: true,
    maxConcurrentAgents: 5,
    agentTimeout: 30000,
  },
};

export default AI_CONFIG;
