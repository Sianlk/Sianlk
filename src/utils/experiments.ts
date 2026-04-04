// A/B Testing & Feature Flags — Sianlk
// Lightweight client-side experiment engine

export type Variant = 'control' | 'a' | 'b' | 'c';

interface Experiment {
  id: string;
  name: string;
  variants: Variant[];
  weights: number[]; // Must sum to 1
  enabled: boolean;
}

interface ExperimentResult {
  experimentId: string;
  variant: Variant;
  timestamp: number;
}

// Active experiments for Sianlk
const EXPERIMENTS: Experiment[] = [
  {
    id: 'ai_chat_placement',
    name: 'AI Chat Button Placement',
    variants: ['control', 'a', 'b'],
    weights: [0.34, 0.33, 0.33],
    enabled: true,
  },
  {
    id: 'onboarding_flow',
    name: 'Onboarding Flow Optimisation',
    variants: ['control', 'a'],
    weights: [0.5, 0.5],
    enabled: true,
  },
  {
    id: 'ai_response_format',
    name: 'AI Response Format',
    variants: ['control', 'a', 'b'],
    weights: [0.34, 0.33, 0.33],
    enabled: true,
  },
  {
    id: 'pricing_display',
    name: 'Pricing Page Layout',
    variants: ['control', 'a'],
    weights: [0.5, 0.5],
    enabled: true,
  },
];

// Feature flags
export const FEATURE_FLAGS = {
  aiVoiceEnabled:     { enabled: true,  rollout: 1.0 },
  aiVisionEnabled:    { enabled: true,  rollout: 1.0 },
  quantumFeatures:    { enabled: false, rollout: 1.0 },
  betaAgents:         { enabled: true,  rollout: 0.2 },
  darkModeDefault:    { enabled: false, rollout: 0.0 },
  offlineMode:        { enabled: true,  rollout: 0.5 },
  pushNotifications:  { enabled: true,  rollout: 1.0 },
  biometricAuth:      { enabled: true,  rollout: 1.0 },
  socialLogin:        { enabled: true,  rollout: 1.0 },
  referralProgram:    { enabled: true,  rollout: 1.0 },
  subscriptionUpsell: { enabled: true,  rollout: 0.8 },
} as const;

class ExperimentEngine {
  private assignments = new Map<string, ExperimentResult>();

  assign(experimentId: string, userId: string): Variant {
    const cached = this.assignments.get(`${experimentId}_${userId}`);
    if (cached) return cached.variant;

    const experiment = EXPERIMENTS.find(e => e.id === experimentId);
    if (!experiment || !experiment.enabled) return 'control';

    // Deterministic hash-based assignment
    const hash = this.hash(`${experimentId}_${userId}`);
    const bucket = (hash % 1000) / 1000;

    let cumulative = 0;
    let variant: Variant = 'control';
    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += experiment.weights[i];
      if (bucket < cumulative) {
        variant = experiment.variants[i];
        break;
      }
    }

    const result: ExperimentResult = { experimentId, variant, timestamp: Date.now() };
    this.assignments.set(`${experimentId}_${userId}`, result);
    return variant;
  }

  isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS, userId?: string): boolean {
    const f = FEATURE_FLAGS[flag];
    if (!f.enabled) return false;
    if (f.rollout >= 1.0) return true;
    if (!userId) return false;
    const hash = this.hash(`${String(flag)}_${userId}`);
    return (hash % 1000) / 1000 < f.rollout;
  }

  private hash(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h;
  }
}

export const experiments = new ExperimentEngine();
export default experiments;
