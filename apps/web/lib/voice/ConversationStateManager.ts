/**
 * Conversation State Manager
 * Extracted from MayaHybridVoiceSystem for better separation of concerns
 */

export type ConversationState = 'dormant' | 'listening' | 'processing' | 'speaking' | 'paused';

export interface StateChangeCallback {
  (newState: ConversationState): void;
}

export class ConversationStateManager {
  private currentState: ConversationState = 'dormant';
  private callbacks: StateChangeCallback[] = [];
  private stateHistory: { state: ConversationState; timestamp: number }[] = [];
  private readonly MAX_HISTORY = 50;

  constructor(initialState: ConversationState = 'dormant') {
    this.currentState = initialState;
  }

  getState(): ConversationState {
    return this.currentState;
  }

  setState(newState: ConversationState, silent: boolean = false): void {
    if (this.currentState === newState) {
      return;
    }

    const previousState = this.currentState;
    this.currentState = newState;

    this.stateHistory.push({
      state: newState,
      timestamp: Date.now(),
    });

    if (this.stateHistory.length > this.MAX_HISTORY) {
      this.stateHistory.shift();
    }

    if (!silent) {
      console.log(`🔄 State: ${previousState} → ${newState}`);
      this.notifyCallbacks(newState);
    }
  }

  onStateChange(callback: StateChangeCallback): () => void {
    this.callbacks.push(callback);

    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  private notifyCallbacks(newState: ConversationState): void {
    this.callbacks.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error('State change callback error:', error);
      }
    });
  }

  isActive(): boolean {
    return this.currentState !== 'dormant';
  }

  isPaused(): boolean {
    return this.currentState === 'paused';
  }

  isListening(): boolean {
    return this.currentState === 'listening';
  }

  isProcessing(): boolean {
    return this.currentState === 'processing';
  }

  isSpeaking(): boolean {
    return this.currentState === 'speaking';
  }

  getStateHistory(): ReadonlyArray<{ state: ConversationState; timestamp: number }> {
    return this.stateHistory;
  }

  getStateDuration(state: ConversationState): number {
    const entries = this.stateHistory.filter(entry => entry.state === state);
    if (entries.length < 2) return 0;

    let totalDuration = 0;
    for (let i = 1; i < entries.length; i++) {
      totalDuration += entries[i].timestamp - entries[i - 1].timestamp;
    }

    return totalDuration;
  }

  reset(): void {
    this.currentState = 'dormant';
    this.stateHistory = [];
    this.callbacks = [];
  }

  destroy(): void {
    this.reset();
  }
}