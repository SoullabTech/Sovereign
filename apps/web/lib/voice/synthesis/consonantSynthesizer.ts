/**
 * Consonant Synthesizer
 *
 * Generates consonant sounds using filtered noise and formant transitions.
 * This is Phase 2.2 of the voice warmth roadmap.
 *
 * Consonant types:
 * - Plosives (stops): /p/, /b/, /t/, /d/, /k/, /g/
 * - Fricatives: /f/, /v/, /s/, /z/, /sh/, /h/
 * - Nasals: /m/, /n/, /ng/
 * - Liquids: /l/, /r/
 * - Glides: /w/, /y/
 */

export type ConsonantType = 'plosive' | 'fricative' | 'nasal' | 'liquid' | 'glide' | 'silent';

export interface ConsonantDefinition {
  type: ConsonantType;
  duration: number; // seconds
  noiseFreqCenter?: number; // Hz (for fricatives)
  noiseFreqBandwidth?: number; // Hz (for fricatives)
  burstDuration?: number; // seconds (for plosives)
  formantFreq?: number; // Hz (for nasals, liquids)
  isVoiced: boolean; // Add voicing buzz for voiced consonants
}

/**
 * Consonant mappings for common English consonants
 */
export const CONSONANT_DEFINITIONS: Record<string, ConsonantDefinition> = {
  // Plosives (brief silence + burst)
  'p': { type: 'plosive', duration: 0.08, burstDuration: 0.02, isVoiced: false },
  'b': { type: 'plosive', duration: 0.08, burstDuration: 0.02, isVoiced: true },
  't': { type: 'plosive', duration: 0.07, burstDuration: 0.015, isVoiced: false },
  'd': { type: 'plosive', duration: 0.07, burstDuration: 0.015, isVoiced: true },
  'k': { type: 'plosive', duration: 0.09, burstDuration: 0.025, isVoiced: false },
  'g': { type: 'plosive', duration: 0.09, burstDuration: 0.025, isVoiced: true },

  // Fricatives (filtered noise)
  'f': { type: 'fricative', duration: 0.10, noiseFreqCenter: 5000, noiseFreqBandwidth: 3000, isVoiced: false },
  'v': { type: 'fricative', duration: 0.10, noiseFreqCenter: 5000, noiseFreqBandwidth: 3000, isVoiced: true },
  's': { type: 'fricative', duration: 0.12, noiseFreqCenter: 7000, noiseFreqBandwidth: 2000, isVoiced: false },
  'z': { type: 'fricative', duration: 0.12, noiseFreqCenter: 7000, noiseFreqBandwidth: 2000, isVoiced: true },
  'sh': { type: 'fricative', duration: 0.13, noiseFreqCenter: 4000, noiseFreqBandwidth: 2500, isVoiced: false },
  'zh': { type: 'fricative', duration: 0.13, noiseFreqCenter: 4000, noiseFreqBandwidth: 2500, isVoiced: true },
  'th': { type: 'fricative', duration: 0.10, noiseFreqCenter: 6000, noiseFreqBandwidth: 3000, isVoiced: false },
  'dh': { type: 'fricative', duration: 0.10, noiseFreqCenter: 6000, noiseFreqBandwidth: 3000, isVoiced: true }, // voiced "th"
  'h': { type: 'fricative', duration: 0.08, noiseFreqCenter: 3000, noiseFreqBandwidth: 4000, isVoiced: false },

  // Nasals (low formants with nasal resonance)
  'm': { type: 'nasal', duration: 0.10, formantFreq: 250, isVoiced: true },
  'n': { type: 'nasal', duration: 0.09, formantFreq: 300, isVoiced: true },
  'ng': { type: 'nasal', duration: 0.11, formantFreq: 280, isVoiced: true },

  // Liquids (vowel-like with specific formants)
  'l': { type: 'liquid', duration: 0.08, formantFreq: 400, isVoiced: true },
  'r': { type: 'liquid', duration: 0.08, formantFreq: 480, isVoiced: true },

  // Glides (rapid formant transitions - treated as short vowels)
  'w': { type: 'glide', duration: 0.06, formantFreq: 300, isVoiced: true },
  'y': { type: 'glide', duration: 0.05, formantFreq: 250, isVoiced: true },

  // Additional common consonants (approximations)
  'c': { type: 'plosive', duration: 0.09, burstDuration: 0.025, isVoiced: false }, // Usually /k/ or /s/
  'j': { type: 'fricative', duration: 0.11, noiseFreqCenter: 4500, noiseFreqBandwidth: 2000, isVoiced: true }, // /dʒ/ sound
  'q': { type: 'plosive', duration: 0.10, burstDuration: 0.03, isVoiced: false }, // Like /k/
  'x': { type: 'fricative', duration: 0.12, noiseFreqCenter: 5500, noiseFreqBandwidth: 2500, isVoiced: false }, // /ks/ sound
  'ch': { type: 'fricative', duration: 0.11, noiseFreqCenter: 4200, noiseFreqBandwidth: 2200, isVoiced: false }, // /tʃ/

  // Silent consonants (often dropped or blended)
  '_': { type: 'silent', duration: 0.05, isVoiced: false }, // placeholder for silence
};

export class ConsonantSynthesizer {
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Synthesize a consonant sound
   * @param consonant The consonant character(s) ('p', 'sh', 'th', etc.)
   * @param pitch Base pitch for voiced consonants (Hz)
   * @param breathiness Breathiness level 0-1
   * @returns AudioBuffer containing the synthesized consonant
   */
  synthesizeConsonant(consonant: string, pitch: number = 150, breathiness: number = 0.3): AudioBuffer {
    const def = CONSONANT_DEFINITIONS[consonant.toLowerCase()];

    if (!def) {
      // Unknown consonant - return brief silence
      console.warn(`Unknown consonant: ${consonant}, using silence`);
      return this.synthesizeSilence(0.05);
    }

    switch (def.type) {
      case 'plosive':
        return this.synthesizePlosive(def, pitch);
      case 'fricative':
        return this.synthesizeFricative(def, pitch, breathiness);
      case 'nasal':
        return this.synthesizeNasal(def, pitch);
      case 'liquid':
        return this.synthesizeLiquid(def, pitch);
      case 'glide':
        return this.synthesizeGlide(def, pitch);
      case 'silent':
        return this.synthesizeSilence(def.duration);
      default:
        return this.synthesizeSilence(0.05);
    }
  }

  /**
   * Plosive: Brief silence followed by noise burst
   */
  private synthesizePlosive(def: ConsonantDefinition, pitch: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = Math.floor(def.duration * sampleRate);
    const burstSamples = Math.floor((def.burstDuration || 0.02) * sampleRate);
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // Silence period (closure)
    const silenceSamples = numSamples - burstSamples;

    // Burst period (release)
    for (let i = silenceSamples; i < numSamples; i++) {
      const t = (i - silenceSamples) / burstSamples;

      // Noise burst with exponential decay
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 8);

      // Add voicing buzz if voiced
      let voicing = 0;
      if (def.isVoiced) {
        const phase = 2 * Math.PI * pitch * (i / sampleRate);
        voicing = Math.sin(phase) * 0.3 * Math.exp(-t * 5);
      }

      data[i] = (noise * 0.7 + voicing * 0.3) * 0.3; // Mix noise and voicing
    }

    return buffer;
  }

  /**
   * Fricative: Filtered noise (sustained hiss/buzz)
   */
  private synthesizeFricative(def: ConsonantDefinition, pitch: number, breathiness: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = Math.floor(def.duration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    const centerFreq = def.noiseFreqCenter || 5000;
    const bandwidth = def.noiseFreqBandwidth || 3000;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;

      // Envelope: fade in and out
      let envelope = 1.0;
      const fadeIn = 0.02; // 20ms
      const fadeOut = 0.03; // 30ms

      if (t < fadeIn) {
        envelope = t / fadeIn;
      } else if (t > def.duration - fadeOut) {
        envelope = (def.duration - t) / fadeOut;
      }

      // White noise
      const noise = (Math.random() * 2 - 1);

      // Simple spectral shaping (approximation of band-pass filter)
      // In production, use Web Audio API BiquadFilterNode
      const shapedNoise = noise * 0.5;

      // Add voicing for voiced fricatives
      let voicing = 0;
      if (def.isVoiced) {
        const phase = 2 * Math.PI * pitch * t;
        voicing = Math.sin(phase) * 0.4;
      }

      data[i] = (shapedNoise * 0.6 + voicing * 0.4) * envelope * (0.2 + breathiness * 0.3);
    }

    return buffer;
  }

  /**
   * Nasal: Low formant resonance with voicing
   */
  private synthesizeNasal(def: ConsonantDefinition, pitch: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = Math.floor(def.duration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    const formantFreq = def.formantFreq || 300;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;

      // Envelope
      let envelope = 1.0;
      const fadeIn = 0.015;
      const fadeOut = 0.025;

      if (t < fadeIn) {
        envelope = t / fadeIn;
      } else if (t > def.duration - fadeOut) {
        envelope = (def.duration - t) / fadeOut;
      }

      // Fundamental + low formant
      let sample = 0;
      sample += Math.sin(2 * Math.PI * pitch * t) * 0.5; // Fundamental
      sample += Math.sin(2 * Math.PI * formantFreq * t) * 0.3; // Nasal formant
      sample += Math.sin(2 * Math.PI * pitch * 2 * t) * 0.15; // Second harmonic

      // Add slight breathiness
      sample += (Math.random() * 2 - 1) * 0.1;

      data[i] = sample * envelope * 0.25;
    }

    return buffer;
  }

  /**
   * Liquid: Vowel-like with specific formant (l, r)
   */
  private synthesizeLiquid(def: ConsonantDefinition, pitch: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = Math.floor(def.duration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    const formantFreq = def.formantFreq || 400;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;

      // Smooth envelope
      let envelope = 1.0;
      const fadeIn = 0.02;
      const fadeOut = 0.02;

      if (t < fadeIn) {
        envelope = t / fadeIn;
      } else if (t > def.duration - fadeOut) {
        envelope = (def.duration - t) / fadeOut;
      }

      // Fundamental + formants (vowel-like)
      let sample = 0;
      sample += Math.sin(2 * Math.PI * pitch * t) * 0.6; // Fundamental
      sample += Math.sin(2 * Math.PI * formantFreq * t) * 0.4; // Formant
      sample += Math.sin(2 * Math.PI * pitch * 2 * t) * 0.2; // Second harmonic

      data[i] = sample * envelope * 0.2;
    }

    return buffer;
  }

  /**
   * Glide: Very short transition (like quick vowel)
   */
  private synthesizeGlide(def: ConsonantDefinition, pitch: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = Math.floor(def.duration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    const formantFreq = def.formantFreq || 300;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const progress = t / def.duration;

      // Rapid formant transition (glide effect)
      const transitionFormant = formantFreq + progress * (formantFreq * 0.5);

      // Smooth envelope
      const envelope = Math.sin(progress * Math.PI); // Bell curve

      // Fundamental + transitioning formant
      let sample = 0;
      sample += Math.sin(2 * Math.PI * pitch * t) * 0.5;
      sample += Math.sin(2 * Math.PI * transitionFormant * t) * 0.4;

      data[i] = sample * envelope * 0.2;
    }

    return buffer;
  }

  /**
   * Silence: Empty buffer
   */
  private synthesizeSilence(duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = Math.floor(duration * sampleRate);
    return this.audioContext.createBuffer(1, numSamples, sampleRate);
  }
}
