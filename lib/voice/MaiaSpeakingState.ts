/**
 * MaiaSpeakingState - Single Source of Truth for MAIA's Speaking State
 *
 * This module solves the race condition problem where multiple components
 * (useStreamingVoice, OracleConversation, ContinuousConversation) each
 * maintain their own speaking state, leading to desync and stuck mic.
 *
 * ARCHITECTURE:
 * - One global state: isMaiaSpeaking
 * - Built-in timeout recovery (max 60s for any response)
 * - All components subscribe via callback
 * - Fail-safe: cannot get stuck longer than MAX_SPEAKING_MS
 *
 * USAGE:
 *   import { maiaSpeakingState } from '@/lib/voice/MaiaSpeakingState';
 *
 *   // Start speaking (sets timer automatically)
 *   maiaSpeakingState.startSpeaking('response-123');
 *
 *   // Stop speaking
 *   maiaSpeakingState.stopSpeaking('response-123');
 *
 *   // Subscribe to changes
 *   const unsubscribe = maiaSpeakingState.subscribe((isSpeaking) => {
 *     console.log('MAIA speaking:', isSpeaking);
 *   });
 */

import {
  MAX_MAIA_SPEAKING_MS,
  ECHO_SUPPRESSION_GAP_MS,
  IOS_AUDIO_SESSION_HANDOFF_MS,
  MIC_RESTART_DEBOUNCE_MS,
} from './constants';

// Use constants from single source of truth
const MAX_SPEAKING_MS = MAX_MAIA_SPEAKING_MS;
const MIN_GAP_MS = ECHO_SUPPRESSION_GAP_MS;

type SpeakingStateListener = (isSpeaking: boolean, sessionId: string | null) => void;

class MaiaSpeakingStateManager {
  private _isSpeaking = false;
  private _currentSessionId: string | null = null;
  private _speakingStartTime = 0;
  private _recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private _lastStopTime = 0;
  private _listeners = new Set<SpeakingStateListener>();

  // 🔒 RESTART LOCK: Prevents double-start crashes
  private _restartInProgress = false;
  private _restartLockTime = 0;
  private _pendingMicRestart: ReturnType<typeof setTimeout> | null = null;

  /**
   * Is MAIA currently speaking?
   */
  get isSpeaking(): boolean {
    return this._isSpeaking;
  }

  /**
   * Current session ID (for deduplication)
   */
  get currentSessionId(): string | null {
    return this._currentSessionId;
  }

  /**
   * How long has MAIA been speaking? (0 if not speaking)
   */
  get speakingDurationMs(): number {
    if (!this._isSpeaking) return 0;
    return Date.now() - this._speakingStartTime;
  }

  /**
   * Subscribe to speaking state changes
   * @returns unsubscribe function
   */
  subscribe(listener: SpeakingStateListener): () => void {
    this._listeners.add(listener);
    // Immediately notify with current state
    listener(this._isSpeaking, this._currentSessionId);
    return () => this._listeners.delete(listener);
  }

  /**
   * Mark MAIA as speaking (with automatic timeout recovery)
   * @param sessionId - Unique ID for this speaking session (for deduplication)
   */
  startSpeaking(sessionId: string): void {
    // Prevent rapid re-entry (audio feedback prevention)
    const timeSinceLastStop = Date.now() - this._lastStopTime;
    if (timeSinceLastStop < MIN_GAP_MS) {
      console.log(`[MaiaSpeakingState] Ignoring startSpeaking - too soon after stop (${timeSinceLastStop}ms < ${MIN_GAP_MS}ms)`);
      return;
    }

    // Already speaking with same session? Ignore
    if (this._isSpeaking && this._currentSessionId === sessionId) {
      console.log(`[MaiaSpeakingState] Already speaking for session ${sessionId}`);
      return;
    }

    // Clear any existing timer
    if (this._recoveryTimer) {
      clearTimeout(this._recoveryTimer);
    }

    console.log(`[MaiaSpeakingState] 🎤 START speaking (session: ${sessionId})`);
    this._isSpeaking = true;
    this._currentSessionId = sessionId;
    this._speakingStartTime = Date.now();

    // Start recovery timer - WILL fire if stopSpeaking not called
    this._recoveryTimer = setTimeout(() => {
      console.warn(`[MaiaSpeakingState] ⚠️ RECOVERY TIMEOUT after ${MAX_SPEAKING_MS}ms - forcing stop!`);
      this._forceStop('timeout');
    }, MAX_SPEAKING_MS);

    // Notify listeners
    this._notifyListeners();
  }

  /**
   * Mark MAIA as done speaking
   * @param sessionId - Must match the startSpeaking session ID
   */
  stopSpeaking(sessionId: string): void {
    // Ignore if not speaking or wrong session
    if (!this._isSpeaking) {
      console.log(`[MaiaSpeakingState] stopSpeaking called but not speaking`);
      return;
    }

    if (this._currentSessionId !== sessionId) {
      console.log(`[MaiaSpeakingState] stopSpeaking session mismatch: got ${sessionId}, expected ${this._currentSessionId}`);
      return;
    }

    const duration = Date.now() - this._speakingStartTime;
    console.log(`[MaiaSpeakingState] 🔇 STOP speaking (session: ${sessionId}, duration: ${duration}ms)`);

    this._clearState();
    this._notifyListeners();
  }

  /**
   * Force stop speaking regardless of session ID (for error recovery)
   */
  forceStop(reason: string = 'manual'): void {
    if (!this._isSpeaking) {
      console.log(`[MaiaSpeakingState] forceStop called but not speaking`);
      return;
    }
    this._forceStop(reason);
  }

  /**
   * Internal force stop
   */
  private _forceStop(reason: string): void {
    const duration = Date.now() - this._speakingStartTime;
    console.warn(`[MaiaSpeakingState] 🚨 FORCE STOP (reason: ${reason}, session: ${this._currentSessionId}, duration: ${duration}ms)`);
    this._clearState();
    this._notifyListeners();
  }

  /**
   * Clear all internal state
   */
  private _clearState(): void {
    this._isSpeaking = false;
    this._currentSessionId = null;
    this._lastStopTime = Date.now();

    if (this._recoveryTimer) {
      clearTimeout(this._recoveryTimer);
      this._recoveryTimer = null;
    }
  }

  /**
   * Notify all listeners of state change
   */
  private _notifyListeners(): void {
    const isSpeaking = this._isSpeaking;
    const sessionId = this._currentSessionId;
    for (const listener of this._listeners) {
      try {
        listener(isSpeaking, sessionId);
      } catch (err) {
        console.error('[MaiaSpeakingState] Listener error:', err);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 🔒 MIC RESTART LOCK - Prevents double-start crashes
  // ═══════════════════════════════════════════════════════════

  /**
   * Is a mic restart currently in progress?
   */
  get isRestartLocked(): boolean {
    // Lock expires after debounce period
    if (this._restartInProgress) {
      const elapsed = Date.now() - this._restartLockTime;
      if (elapsed > MIC_RESTART_DEBOUNCE_MS) {
        console.log(`[MaiaSpeakingState] Restart lock expired (${elapsed}ms)`);
        this._restartInProgress = false;
      }
    }
    return this._restartInProgress;
  }

  /**
   * Request permission to restart the mic.
   * Returns true if granted, false if locked.
   * Call releaseRestartLock() when done.
   */
  acquireRestartLock(): boolean {
    if (this.isRestartLocked) {
      console.log('[MaiaSpeakingState] 🔒 Restart lock DENIED - already in progress');
      return false;
    }

    if (this._isSpeaking) {
      console.log('[MaiaSpeakingState] 🔒 Restart lock DENIED - MAIA is speaking');
      return false;
    }

    // Check echo suppression gap
    const timeSinceStop = Date.now() - this._lastStopTime;
    if (timeSinceStop < IOS_AUDIO_SESSION_HANDOFF_MS) {
      console.log(`[MaiaSpeakingState] 🔒 Restart lock DENIED - need ${IOS_AUDIO_SESSION_HANDOFF_MS - timeSinceStop}ms more cooldown`);
      return false;
    }

    console.log('[MaiaSpeakingState] 🔓 Restart lock ACQUIRED');
    this._restartInProgress = true;
    this._restartLockTime = Date.now();
    return true;
  }

  /**
   * Release the restart lock after mic is started or failed.
   */
  releaseRestartLock(): void {
    console.log('[MaiaSpeakingState] 🔓 Restart lock RELEASED');
    this._restartInProgress = false;
  }

  /**
   * Schedule a mic restart after MAIA finishes speaking.
   * Uses the proper handoff delay. Only ONE pending restart allowed.
   * @param callback - Function to call when it's safe to restart
   */
  scheduleMicRestart(callback: () => void): void {
    // Cancel any existing pending restart
    if (this._pendingMicRestart) {
      clearTimeout(this._pendingMicRestart);
      this._pendingMicRestart = null;
    }

    // If MAIA is still speaking, wait for stop event
    if (this._isSpeaking) {
      console.log('[MaiaSpeakingState] 📅 Mic restart deferred - MAIA still speaking');
      // Subscribe to get notified when speaking stops
      const unsub = this.subscribe((isSpeaking) => {
        if (!isSpeaking) {
          unsub();
          this.scheduleMicRestart(callback);
        }
      });
      return;
    }

    // Calculate remaining cooldown
    const timeSinceStop = Date.now() - this._lastStopTime;
    const remainingCooldown = Math.max(0, IOS_AUDIO_SESSION_HANDOFF_MS - timeSinceStop);

    console.log(`[MaiaSpeakingState] 📅 Mic restart scheduled in ${remainingCooldown}ms`);

    this._pendingMicRestart = setTimeout(() => {
      this._pendingMicRestart = null;

      // Final check before callback
      if (this._isSpeaking) {
        console.log('[MaiaSpeakingState] 📅 Mic restart ABORTED - MAIA started speaking');
        return;
      }

      if (!this.acquireRestartLock()) {
        console.log('[MaiaSpeakingState] 📅 Mic restart ABORTED - lock denied');
        return;
      }

      try {
        callback();
      } finally {
        // Lock will be released by the component after mic starts
        // or after a timeout
        setTimeout(() => {
          if (this._restartInProgress) {
            console.log('[MaiaSpeakingState] 📅 Auto-releasing restart lock (timeout)');
            this.releaseRestartLock();
          }
        }, 2000);
      }
    }, remainingCooldown);
  }

  /**
   * Cancel any pending mic restart
   */
  cancelPendingRestart(): void {
    if (this._pendingMicRestart) {
      console.log('[MaiaSpeakingState] 📅 Pending mic restart CANCELLED');
      clearTimeout(this._pendingMicRestart);
      this._pendingMicRestart = null;
    }
  }

  /**
   * Debug: Get current state snapshot
   */
  getDebugState(): {
    isSpeaking: boolean;
    sessionId: string | null;
    durationMs: number;
    listenerCount: number;
    restartLocked: boolean;
    msSinceStop: number;
  } {
    return {
      isSpeaking: this._isSpeaking,
      sessionId: this._currentSessionId,
      durationMs: this.speakingDurationMs,
      listenerCount: this._listeners.size,
      restartLocked: this._restartInProgress,
      msSinceStop: Date.now() - this._lastStopTime,
    };
  }
}

// Singleton instance - THE single source of truth
export const maiaSpeakingState = new MaiaSpeakingStateManager();

// React hook for components
import { useState, useEffect } from 'react';

export function useMaiaSpeakingState(): {
  isSpeaking: boolean;
  sessionId: string | null;
  durationMs: number;
} {
  const [state, setState] = useState(() => ({
    isSpeaking: maiaSpeakingState.isSpeaking,
    sessionId: maiaSpeakingState.currentSessionId,
    durationMs: maiaSpeakingState.speakingDurationMs,
  }));

  useEffect(() => {
    const unsubscribe = maiaSpeakingState.subscribe((isSpeaking, sessionId) => {
      setState({
        isSpeaking,
        sessionId,
        durationMs: maiaSpeakingState.speakingDurationMs,
      });
    });
    return unsubscribe;
  }, []);

  return state;
}

// Export for testing
export { MAX_SPEAKING_MS, MIN_GAP_MS };
