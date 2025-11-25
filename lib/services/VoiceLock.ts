/**
 * VoiceLock - Single Source of Truth for Voice State
 *
 * Prevents race conditions between Whisper recording and MAIA's TTS playback.
 * When locked, Whisper microphone is paused. When unlocked, it resumes.
 *
 * This is a singleton - only one instance exists across the entire app.
 */

type VoiceLockListener = (locked: boolean) => void;

class VoiceLockService {
  private locked = false;
  private listeners: Set<VoiceLockListener> = new Set();

  /**
   * Lock the voice system (MAIA is speaking)
   * This pauses Whisper recording to prevent echo/duplication
   */
  lock() {
    if (!this.locked) {
      console.log('🔒 VoiceLock: ENGAGED (MAIA speaking - microphone paused)');
      this.locked = true;
      this.notifyListeners();
    }
  }

  /**
   * Unlock the voice system (MAIA finished speaking)
   * This resumes Whisper recording
   */
  unlock() {
    if (this.locked) {
      console.log('🔓 VoiceLock: RELEASED (MAIA finished - microphone resumed)');
      this.locked = false;
      this.notifyListeners();
    }
  }

  /**
   * Get current lock state
   */
  get isLocked(): boolean {
    return this.locked;
  }

  /**
   * Subscribe to lock state changes
   */
  subscribe(listener: VoiceLockListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.locked));
  }

  /**
   * Reset lock state (cleanup)
   */
  reset() {
    console.log('🔄 VoiceLock: RESET');
    this.locked = false;
    this.notifyListeners();
  }
}

// Export singleton instance
export const voiceLock = new VoiceLockService();
