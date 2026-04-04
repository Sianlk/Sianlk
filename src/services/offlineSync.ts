// Offline-First Sync Engine — Sianlk
// Queue actions offline, sync when connected

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Analytics from '../services/analytics';

interface QueuedAction {
  id: string;
  endpoint: string;
  method: string;
  body?: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

const QUEUE_KEY = '@sianlk_offline_queue';
const MAX_QUEUE_SIZE = 100;

class OfflineSyncEngine {
  private queue: QueuedAction[] = [];
  private isOnline = true;
  private isSyncing = false;
  private unsubscribe: (() => void) | null = null;

  async init(): Promise<void> {
    // Load persisted queue
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) this.queue = JSON.parse(stored);
    } catch {}

    // Monitor connectivity
    this.unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      if (wasOffline && this.isOnline) {
        this.sync();
        Analytics.track('connectivity_restored', { pending_actions: this.queue.length });
      }
    });
  }

  async enqueue(endpoint: string, method: string, body?: unknown): Promise<string> {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const action: QueuedAction = {
      id, endpoint, method, body, timestamp: Date.now(), retries: 0, maxRetries: 3,
    };

    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Drop oldest
      this.queue.shift();
    }
    this.queue.push(action);
    await this.persist();
    Analytics.track('action_queued_offline', { endpoint, method });
    return id;
  }

  async sync(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.queue.length === 0) return;
    this.isSyncing = true;

    const apiBase = process.env.EXPO_PUBLIC_API_URL ?? '';
    const failed: QueuedAction[] = [];

    for (const action of this.queue) {
      try {
        const res = await fetch(`${apiBase}${action.endpoint}`, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: action.body ? JSON.stringify(action.body) : undefined,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        Analytics.track('offline_action_synced', { endpoint: action.endpoint });
      } catch (err) {
        action.retries++;
        if (action.retries < action.maxRetries) {
          failed.push(action);
        } else {
          Analytics.error('OFFLINE_SYNC_FAILED', String(err), action.endpoint);
        }
      }
    }

    this.queue = failed;
    await this.persist();
    this.isSyncing = false;
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch {}
  }

  get pendingCount(): number { return this.queue.length; }

  destroy(): void {
    this.unsubscribe?.();
  }
}

export const offlineSync = new OfflineSyncEngine();
export default offlineSync;
