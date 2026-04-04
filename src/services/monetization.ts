// Monetization & Subscription Engine — Sianlk
// IAP, subscriptions, and revenue optimisation

import { Platform, Alert } from 'react-native';
import Analytics from '../services/analytics';

export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface PlanConfig {
  id: Plan;
  name: string;
  price_monthly: number;
  price_annual: number;
  sku_monthly: string;
  sku_annual: string;
  features: string[];
  ai_requests_per_day: number;
  agents_enabled: boolean;
  priority_support: boolean;
}

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_annual: 0,
    sku_monthly: '',
    sku_annual: '',
    features: [
      '10 AI requests/day',
      'Basic platform features',
      'Community support',
    ],
    ai_requests_per_day: 10,
    agents_enabled: false,
    priority_support: false,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price_monthly: 9.99,
    price_annual: 7.99,
    sku_monthly: 'com.sianlk.sianlk.starter.monthly',
    sku_annual: 'com.sianlk.sianlk.starter.annual',
    features: [
      '100 AI requests/day',
      'All platform features',
      'AI Workforce (1 agent)',
      'Email support',
      'Export data',
    ],
    ai_requests_per_day: 100,
    agents_enabled: true,
    priority_support: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price_monthly: 29.99,
    price_annual: 19.99,
    sku_monthly: 'com.sianlk.sianlk.pro.monthly',
    sku_annual: 'com.sianlk.sianlk.pro.annual',
    features: [
      'Unlimited AI requests',
      'All platform features',
      'AI Workforce (5 agents)',
      'Priority support',
      'Advanced analytics',
      'API access',
      'Custom integrations',
      'White-label options',
    ],
    ai_requests_per_day: -1, // unlimited
    agents_enabled: true,
    priority_support: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price_monthly: 99.99,
    price_annual: 79.99,
    sku_monthly: 'com.sianlk.sianlk.enterprise.monthly',
    sku_annual: 'com.sianlk.sianlk.enterprise.annual',
    features: [
      'Unlimited everything',
      'Dedicated AI models',
      'AI Workforce (unlimited agents)',
      '24/7 dedicated support',
      'SLA guarantee',
      'On-premise deployment',
      'Custom AI training',
      'SOC2 compliance',
    ],
    ai_requests_per_day: -1,
    agents_enabled: true,
    priority_support: true,
  },
};

class MonetizationEngine {
  private currentPlan: Plan = 'free';
  private requestsToday = 0;
  private lastResetDate = new Date().toDateString();

  getCurrentPlan(): Plan { return this.currentPlan; }
  getPlanConfig(): PlanConfig { return PLANS[this.currentPlan]; }

  canMakeAIRequest(): boolean {
    this.resetIfNewDay();
    const limit = this.getPlanConfig().ai_requests_per_day;
    if (limit === -1) return true;
    return this.requestsToday < limit;
  }

  recordAIRequest(): void {
    this.resetIfNewDay();
    this.requestsToday++;
    Analytics.track('ai_request_counted', {
      plan: this.currentPlan,
      requests_today: this.requestsToday,
      limit: this.getPlanConfig().ai_requests_per_day,
    });
  }

  showUpgradePrompt(feature: string): void {
    Alert.alert(
      '⚡ Upgrade Required',
      `${feature} requires a Pro plan or higher.\n\nUnlock unlimited AI requests, 5 AI agents, and priority support.`,
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Upgrade to Pro — $29.99/mo',
          onPress: () => {
            Analytics.track('upgrade_prompt_clicked', { feature, current_plan: this.currentPlan });
            // TODO: Navigate to PaywallScreen
          },
        },
      ]
    );
  }

  private resetIfNewDay(): void {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.requestsToday = 0;
      this.lastResetDate = today;
    }
  }

  setплан(plan: Plan): void {
    this.currentPlan = plan;
    Analytics.track('plan_changed', { plan });
  }

  // Annual discount %
  discountPercent(plan: Plan): number {
    const p = PLANS[plan];
    if (!p.price_monthly || !p.price_annual) return 0;
    return Math.round((1 - p.price_annual / p.price_monthly) * 100);
  }
}

export const monetization = new MonetizationEngine();
export default monetization;
