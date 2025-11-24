/**
 * Nudge System
 * Extracted from MayaHybridVoiceSystem for better separation of concerns
 * Provides gentle reminders when user is silent for extended periods
 */

export interface NudgeSystemConfig {
  enabled: boolean;
  nudgeThresholdSeconds: number;
  nudgeMessages?: string[];
}

export interface NudgeSystemCallbacks {
  onNudge?: (message: string) => void;
  onNudgeSpoken?: (message: string) => void;
}

const DEFAULT_NUDGE_MESSAGES = [
  "I'm still here.",
  "Take your time.",
  "I'm listening whenever you're ready.",
  "No rush, I'm here for you.",
];

export class NudgeSystem {
  private config: NudgeSystemConfig;
  private callbacks: NudgeSystemCallbacks;
  private nudgeTimer: NodeJS.Timeout | null = null;
  private lastActivityTime: number = 0;
  private nudgeCount: number = 0;
  private isActive: boolean = false;

  constructor(config: NudgeSystemConfig, callbacks: NudgeSystemCallbacks = {}) {
    this.config = {
      nudgeMessages: DEFAULT_NUDGE_MESSAGES,
      ...config,
    };
    this.callbacks = callbacks;
  }

  start(): void {
    if (!this.config.enabled) {
      console.log('🔕 Nudges disabled');
      return;
    }

    this.isActive = true;
    this.lastActivityTime = Date.now();
    this.resetTimer();
    console.log(`👋 Nudge system started (${this.config.nudgeThresholdSeconds}s threshold)`);
  }

  stop(): void {
    this.isActive = false;
    this.clearTimer();
    this.nudgeCount = 0;
  }

  onUserActivity(): void {
    if (!this.isActive) return;

    this.lastActivityTime = Date.now();
    this.resetTimer();
  }

  private resetTimer(): void {
    this.clearTimer();

    if (!this.config.enabled || !this.isActive) {
      return;
    }

    this.nudgeTimer = setTimeout(() => {
      this.deliverNudge();
    }, this.config.nudgeThresholdSeconds * 1000);
  }

  private deliverNudge(): void {
    const messages = this.config.nudgeMessages || DEFAULT_NUDGE_MESSAGES;
    const message = messages[this.nudgeCount % messages.length];

    console.log(`👋 Nudge #${this.nudgeCount + 1}: "${message}"`);

    this.callbacks.onNudge?.(message);
    this.nudgeCount++;

    this.resetTimer();
  }

  private clearTimer(): void {
    if (this.nudgeTimer) {
      clearTimeout(this.nudgeTimer);
      this.nudgeTimer = null;
    }
  }

  setEnabled(enabled: boolean): void {
    const wasEnabled = this.config.enabled;
    this.config.enabled = enabled;

    if (enabled && !wasEnabled && this.isActive) {
      this.start();
    } else if (!enabled && wasEnabled) {
      this.clearTimer();
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivityTime;
  }

  getNudgeCount(): number {
    return this.nudgeCount;
  }

  updateConfig(newConfig: Partial<NudgeSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.isActive && this.config.enabled) {
      this.resetTimer();
    }
  }

  destroy(): void {
    this.stop();
  }
}