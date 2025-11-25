/**
 * Session Gong - Gentle ceremonial sounds for session boundaries
 *
 * Creates soft, resonant gong tones using Web Audio API.
 * Inspired by meditation bells and Audible's chapter transitions.
 */

export class SessionGong {
  private audioContext: AudioContext | null = null;
  private volume: number = 0.3; // Gentle volume (0-1)

  constructor(volume: number = 0.3) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Initialize audio context (call on user interaction)
   */
  private ensureAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Play opening gong - Single gentle tone (grounding, inviting)
   * Lower frequency, longer sustain - "We're beginning"
   */
  async playOpeningGong(): Promise<void> {
    try {
      const ctx = this.ensureAudioContext();
      const now = ctx.currentTime;

      // Create oscillator for fundamental tone
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Lower frequency for grounding (C4 = 261.63 Hz)
      oscillator.frequency.setValueAtTime(261.63, now);
      oscillator.type = 'sine';

      // Gentle attack and long decay (like a singing bowl)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.1); // Soft attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 3.0); // Long sustain

      // Connect and play
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + 3.0);

      console.log('🔔 Opening gong played - session begins');
    } catch (error) {
      console.warn('Could not play opening gong:', error);
    }
  }

  /**
   * Play closing gong - Three soft tones (completion, integration, peace)
   * Higher frequency, spacious timing - "We're complete"
   */
  async playClosingGong(): Promise<void> {
    try {
      const ctx = this.ensureAudioContext();
      const now = ctx.currentTime;

      // Three gentle tones with increasing intervals (like Tibetan bells)
      const tones = [
        { freq: 329.63, delay: 0.0, duration: 2.0 },  // E4 - First bell
        { freq: 392.00, delay: 0.8, duration: 2.2 },  // G4 - Second bell (harmonic)
        { freq: 523.25, delay: 1.8, duration: 2.5 },  // C5 - Third bell (completion)
      ];

      tones.forEach(({ freq, delay, duration }) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.frequency.setValueAtTime(freq, now + delay);
        oscillator.type = 'sine';

        // Each tone fades in and out gently
        const startTime = now + delay;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });

      console.log('🔔 Closing gong played - session complete');
    } catch (error) {
      console.warn('Could not play closing gong:', error);
    }
  }

  /**
   * Play a gentle mid-session bell (optional - for phase transitions)
   * Single soft tone - "A moment of awareness"
   */
  async playTransitionBell(): Promise<void> {
    try {
      const ctx = this.ensureAudioContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Mid-range frequency (A4 = 440 Hz)
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.type = 'sine';

      // Quick, gentle chime
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + 1.5);

      console.log('🔔 Transition bell played');
    } catch (error) {
      console.warn('Could not play transition bell:', error);
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Clean up audio context
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * Singleton instance for global access
 */
let globalGong: SessionGong | null = null;

export function getSessionGong(volume?: number): SessionGong {
  if (!globalGong) {
    globalGong = new SessionGong(volume);
  } else if (volume !== undefined) {
    globalGong.setVolume(volume);
  }
  return globalGong;
}
