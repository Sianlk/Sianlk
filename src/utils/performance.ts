// Performance Monitoring — Sianlk
// Web Vitals, React Native performance, and AI latency tracking

import { Platform } from 'react-native';
import Analytics from '../services/analytics';

interface PerformanceEntry {
  name: string;
  duration: number;
  timestamp: number;
  category: 'ai' | 'navigation' | 'render' | 'network' | 'agent';
  metadata?: Record<string, string | number>;
}

class PerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private timers = new Map<string, number>();
  private readonly MAX_ENTRIES = 200;

  start(name: string): void {
    this.timers.set(name, Date.now());
  }

  end(name: string, category: PerformanceEntry['category'], metadata?: Record<string, string | number>): number {
    const start = this.timers.get(name);
    if (!start) return 0;
    const duration = Date.now() - start;
    this.timers.delete(name);

    const entry: PerformanceEntry = {
      name, duration, timestamp: Date.now(), category, metadata,
    };
    this.entries.push(entry);
    if (this.entries.length > this.MAX_ENTRIES) this.entries.shift();

    // Alert on slow operations
    if (category === 'ai' && duration > 5000) {
      Analytics.track('perf_ai_slow', { name, duration_ms: duration, platform: Platform.OS });
    } else if (category === 'navigation' && duration > 300) {
      Analytics.track('perf_nav_slow', { name, duration_ms: duration });
    }

    return duration;
  }

  // Track AI-specific metrics
  trackAILatency(model: string, tokens: number, duration: number): void {
    const tokensPerSecond = Math.round((tokens / duration) * 1000);
    Analytics.track('ai_performance', {
      model,
      duration_ms: duration,
      tokens,
      tokens_per_second: tokensPerSecond,
      platform: Platform.OS,
      app: 'Sianlk',
    });
  }

  // Track agent performance
  trackAgentPerformance(agentType: string, taskType: string, duration: number, success: boolean): void {
    Analytics.track('agent_performance', {
      agent_type: agentType,
      task_type: taskType,
      duration_ms: duration,
      success,
      domain: 'platform',
    });
  }

  // Get summary stats
  getSummary(): Record<string, {count: number; avg: number; p95: number; p99: number}> {
    const grouped = new Map<string, number[]>();
    for (const e of this.entries) {
      const key = `${e.category}:${e.name}`;
      const arr = grouped.get(key) ?? [];
      arr.push(e.duration);
      grouped.set(key, arr);
    }
    const summary: Record<string, {count: number; avg: number; p95: number; p99: number}> = {};
    grouped.forEach((durations, key) => {
      const sorted = [...durations].sort((a, b) => a - b);
      const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
      summary[key] = {
        count:  sorted.length,
        avg:    Math.round(avg),
        p95:    sorted[Math.floor(sorted.length * 0.95)] ?? 0,
        p99:    sorted[Math.floor(sorted.length * 0.99)] ?? 0,
      };
    });
    return summary;
  }

  clear(): void { this.entries = []; this.timers.clear(); }
}

export const perf = new PerformanceMonitor();
export default perf;
