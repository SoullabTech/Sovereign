"use client";

/**
 * Maya Voice Handler with Nudge System
 * Provides gentle nudges during long silences with cooldown
 */

import { MayaVoiceSystem } from './maya-voice';

// Nudge configuration
const NUDGE_LINES = [
  "I'm still here.",
  "Whenever you're ready.",
  "I'm with you.",
  "Take your time.",
  "Here when you want to continue."
];

const SILENCE_THRESHOLD = 45_000; // 45 seconds
const NUDGE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

function getRandomNudge(): string {
  return NUDGE_LINES[Math.floor(Math.random() * NUDGE_LINES.length)];
}

export class MayaVoiceHandler {
  private mayaVoice: MayaVoiceSystem;
  private silenceTimer: NodeJS.Timeout | null = null;
  private lastNudgeTime: number | null = null;
  private conversationState: 'active' | 'paused' | 'idle' = 'idle';
  private nudgesEnabled: boolean = true;

  constructor() {
    this.mayaVoice = new MayaVoiceSystem();
  }

  /**
   * Reset the silence timer
   */
  public resetSilenceTimer(): void {
    // Clear existing timer
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    // Only set timer if conversation is active and nudges are enabled
    if (this.conversationState === 'active' && this.nudgesEnabled) {
      this.silenceTimer = setTimeout(() => {
        const now = Date.now();

        // Only nudge if cooldown has passed
        if (!this.lastNudgeTime || now - this.lastNudgeTime > NUDGE_COOLDOWN) {
          this.playNudge();
          this.lastNudgeTime = now;
        }
      }, SILENCE_THRESHOLD);
    }
  }

  /**
   * Play a nudge with reduced volume
   */
  private async playNudge(): Promise<void> {
    const nudgeText = getRandomNudge();

    // Temporarily reduce volume for gentle nudge
    const originalConfig = this.mayaVoice['config'];
    this.mayaVoice.updateConfig({ volume: 0.5 });

    try {
      await this.mayaVoice.speak(nudgeText);
    } finally {
      // Restore original volume
      this.mayaVoice.updateConfig({ volume: originalConfig.volume });
    }
  }

  /**
   * Start conversation (activates nudge timer)
   */
  public startConversation(): void {
    this.conversationState = 'active';
    this.resetSilenceTimer();
  }

  /**
   * Pause conversation (stops nudges)
   */
  public pauseConversation(): void {
    this.conversationState = 'paused';
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * End conversation (stops all timers)
   */
  public endConversation(): void {
    this.conversationState = 'idle';
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.lastNudgeTime = null;
  }

  /**
   * Handle user input (resets silence timer)
   */
  public handleUserInput(): void {
    this.resetSilenceTimer();
  }

  /**
   * Handle Maya response (resets silence timer)
   */
  public handleMayaResponse(): void {
    this.resetSilenceTimer();
  }

  /**
   * Set nudges enabled/disabled
   */
  public setNudgesEnabled(enabled: boolean): void {
    this.nudgesEnabled = enabled;

    // If disabling, clear any pending timer
    if (!enabled && this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    } else if (enabled && this.conversationState === 'active') {
      // If enabling during active conversation, start timer
      this.resetSilenceTimer();
    }
  }

  /**
   * Get nudge state
   */
  public getNudgeState(): {
    nudgesEnabled: boolean;
    conversationState: 'active' | 'paused' | 'idle';
    lastNudgeTime: number | null;
    timeUntilNextNudge: number | null;
  } {
    let timeUntilNextNudge = null;

    if (this.lastNudgeTime) {
      const timeSinceLastNudge = Date.now() - this.lastNudgeTime;
      const cooldownRemaining = NUDGE_COOLDOWN - timeSinceLastNudge;

      if (cooldownRemaining > 0) {
        timeUntilNextNudge = cooldownRemaining;
      }
    }

    return {
      nudgesEnabled: this.nudgesEnabled,
      conversationState: this.conversationState,
      lastNudgeTime: this.lastNudgeTime,
      timeUntilNextNudge
    };
  }

  /**
   * Speak with Maya's voice (and reset timer)
   */
  public async speak(text: string): Promise<void> {
    await this.mayaVoice.speak(text);
    this.handleMayaResponse();
  }

  /**
   * Get the underlying Maya voice instance
   */
  public getMayaVoice(): MayaVoiceSystem {
    return this.mayaVoice;
  }
}

// Global instance
let globalHandler: MayaVoiceHandler | null = null;

/**
 * Get the global Maya voice handler
 */
export function getMayaVoiceHandler(): MayaVoiceHandler {
  if (!globalHandler) {
    globalHandler = new MayaVoiceHandler();
  }
  return globalHandler;
}