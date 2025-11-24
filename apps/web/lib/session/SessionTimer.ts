// frontend
// apps/web/lib/session/SessionTimer.ts

'use client';

export interface SessionPreset {
  name: string;
  duration: number; // in minutes
  description?: string;
  color?: string;
}

export interface SessionTimerState {
  isActive: boolean;
  isPaused: boolean;
  remainingTime: number; // in seconds
  totalDuration: number; // in seconds
  startTime?: Date;
  endTime?: Date;
}

export interface SessionTimerEvents {
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onComplete?: () => void;
  onTick?: (remainingTime: number) => void;
}

// Default session presets for MAIA conversations
export const SESSION_PRESETS: SessionPreset[] = [
  {
    name: 'Quick Check-in',
    duration: 5,
    description: 'Brief mindful moment',
    color: '#10B981' // emerald
  },
  {
    name: 'Deep Reflection',
    duration: 15,
    description: 'Focused contemplative session',
    color: '#3B82F6' // blue
  },
  {
    name: 'Wisdom Journey',
    duration: 30,
    description: 'Extended exploration and insight',
    color: '#8B5CF6' // violet
  },
  {
    name: 'Sacred Hour',
    duration: 60,
    description: 'Full transformational experience',
    color: '#F59E0B' // amber
  },
  {
    name: 'Custom',
    duration: 20,
    description: 'Set your own duration',
    color: '#6B7280' // gray
  }
];

/**
 * SessionTimer class for managing timed MAIA conversation sessions.
 * Provides start/pause/stop functionality with event callbacks.
 */
export class SessionTimer {
  private state: SessionTimerState;
  private events: SessionTimerEvents;
  private intervalId?: NodeJS.Timeout;

  constructor(events: SessionTimerEvents = {}) {
    this.events = events;
    this.state = {
      isActive: false,
      isPaused: false,
      remainingTime: 0,
      totalDuration: 0,
    };
  }

  /**
   * Start a new session with the specified duration
   */
  start(durationMinutes: number): void {
    this.stop(); // Clear any existing session

    const totalSeconds = durationMinutes * 60;
    const now = new Date();

    this.state = {
      isActive: true,
      isPaused: false,
      remainingTime: totalSeconds,
      totalDuration: totalSeconds,
      startTime: now,
      endTime: new Date(now.getTime() + totalSeconds * 1000),
    };

    this.startTicking();
    this.events.onStart?.();
  }

  /**
   * Pause the current session
   */
  pause(): void {
    if (!this.state.isActive || this.state.isPaused) return;

    this.state.isPaused = true;
    this.stopTicking();
    this.events.onPause?.();
  }

  /**
   * Resume a paused session
   */
  resume(): void {
    if (!this.state.isActive || !this.state.isPaused) return;

    this.state.isPaused = false;
    this.startTicking();
    this.events.onResume?.();
  }

  /**
   * Stop the current session completely
   */
  stop(): void {
    if (!this.state.isActive) return;

    this.state.isActive = false;
    this.state.isPaused = false;
    this.stopTicking();
    this.events.onStop?.();
  }

  /**
   * Get the current session state
   */
  getState(): SessionTimerState {
    return { ...this.state };
  }

  /**
   * Get remaining time formatted as MM:SS
   */
  getFormattedTime(): string {
    const minutes = Math.floor(this.state.remainingTime / 60);
    const seconds = this.state.remainingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get session progress as a percentage (0-100)
   */
  getProgress(): number {
    if (this.state.totalDuration === 0) return 0;
    return ((this.state.totalDuration - this.state.remainingTime) / this.state.totalDuration) * 100;
  }

  /**
   * Add additional time to the session
   */
  extendSession(additionalMinutes: number): void {
    if (!this.state.isActive) return;

    const additionalSeconds = additionalMinutes * 60;
    this.state.remainingTime += additionalSeconds;
    this.state.totalDuration += additionalSeconds;

    if (this.state.endTime) {
      this.state.endTime = new Date(this.state.endTime.getTime() + additionalSeconds * 1000);
    }
  }

  private startTicking(): void {
    this.intervalId = setInterval(() => {
      if (this.state.remainingTime > 0) {
        this.state.remainingTime--;
        this.events.onTick?.(this.state.remainingTime);
      } else {
        this.complete();
      }
    }, 1000);
  }

  private stopTicking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private complete(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.remainingTime = 0;
    this.stopTicking();
    this.events.onComplete?.();
  }

  /**
   * Cleanup resources when timer is no longer needed
   */
  destroy(): void {
    this.stopTicking();
  }
}

// Helper function to create a timer with a preset
export function createSessionTimer(preset: SessionPreset, events?: SessionTimerEvents): SessionTimer {
  const timer = new SessionTimer(events);
  return timer;
}

// Helper to find preset by name
export function findPresetByName(name: string): SessionPreset | undefined {
  return SESSION_PRESETS.find(preset => preset.name === name);
}

// Default export
export default SessionTimer;