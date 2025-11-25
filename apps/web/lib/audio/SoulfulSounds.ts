/**
 * Soulful Sound Manager
 * Creates subtle, entrancing audio experiences for Maya's presence
 */

export class SoulfulSounds {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.1; // Very subtle volume
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Audio context not available');
    }
  }

  /**
   * Creates a soft "breath" sound for pauses
   */
  async playBreath() {
    if (!this.audioContext || !this.masterGain || !this.isEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // White noise for breath
    const bufferSize = this.audioContext.sampleRate * 0.3; // 300ms
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = buffer;

    // Filter for soft breath sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    // Envelope for natural breath
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    whiteNoise.start();
    whiteNoise.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Soft typing/thinking sound - like pencil on paper
   */
  async playTextFlow(duration: number = 0.05) {
    if (!this.audioContext || !this.masterGain || !this.isEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Very soft tick sound
    oscillator.frequency.value = 800 + Math.random() * 400; // Slight variation
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.015, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Resonant tone for sacred moments
   */
  async playResonance() {
    if (!this.audioContext || !this.masterGain || !this.isEnabled) return;

    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Harmonic frequencies (perfect fifth)
    oscillator1.frequency.value = 220; // A3
    oscillator2.frequency.value = 329.63; // E4
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';

    // Gentle fade in and out
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 1.5);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(this.audioContext.currentTime + 2);
    oscillator2.stop(this.audioContext.currentTime + 2);
  }

  /**
   * Ambient presence - subtle background hum
   */
  createAmbientPresence(): OscillatorNode | null {
    if (!this.audioContext || !this.masterGain || !this.isEnabled) return null;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    // Base frequency - very low, almost subliminal
    oscillator.frequency.value = 110; // A2
    oscillator.type = 'sine';

    // LFO for subtle movement
    lfo.frequency.value = 0.2; // Very slow oscillation
    lfo.type = 'sine';
    lfoGain.gain.value = 5;

    // Connect LFO to frequency for subtle pitch movement
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    // Very quiet
    gainNode.gain.value = 0.005;

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    lfo.start();

    return oscillator;
  }

  toggle(enabled: boolean) {
    this.isEnabled = enabled;
  }

  setVolume(value: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value * 0.2)); // Cap at 0.2 max
    }
  }
}

export const soulfulSounds = new SoulfulSounds();