/**
 * Formant Synthesizer
 *
 * Generates vowel sounds using formant synthesis - the core of the voice engine.
 * Formants are resonant frequencies that give vowels their characteristic sound.
 *
 * This is a foundational implementation. Future enhancements:
 * - Consonant synthesis
 * - Prosody/intonation
 * - Co-articulation (vowel transitions)
 */

import type { ElementalVoice } from '../modulation/elementalVoices';
import { ConsonantSynthesizer } from './consonantSynthesizer';
import { getPhonemeEntry, type PhonemeEntry } from './phonemeDictionary';

export interface Formant {
  frequency: number;  // Hz (center frequency)
  bandwidth: number;  // Hz (width of resonance peak)
  amplitude: number;  // 0.0 - 1.0 (strength of this formant)
}

/**
 * Formant definitions for basic English vowels
 * Based on expert tuning for MAIA's Aether baseline (anti-bees tuning)
 *
 * Tuning principles:
 * - F₁: 500 Hz ± 40 Hz (warmth/groundedness)
 * - F₂: 1500 Hz ± 60 Hz (presence/openness)
 * - F₃: 2400 Hz ± 80 Hz (clarity)
 * - F₄: 3400 Hz ± 100 Hz (brightness, avoid > 4 kHz)
 * - Softer bandwidth peaks = smoother timbre
 */
export const VOWEL_FORMANTS: Record<string, Formant[]> = {
  // 'a' as in "father" - open central (MAIA's grounded center)
  'a': [
    { frequency: 700, bandwidth: 95, amplitude: 1.0 },   // F1: warm, open
    { frequency: 1480, bandwidth: 115, amplitude: 0.75 }, // F2: centered in presence band
    { frequency: 2400, bandwidth: 135, amplitude: 0.4 },  // F3: clarity without strain
    { frequency: 3380, bandwidth: 155, amplitude: 0.18 }, // F4: soft brightness
  ],

  // 'e' as in "bed" - mid-front (measured, not bright)
  'e': [
    { frequency: 500, bandwidth: 90, amplitude: 1.0 },   // F1: lower mids
    { frequency: 1520, bandwidth: 120, amplitude: 0.7 }, // F2: lucid presence
    { frequency: 2420, bandwidth: 140, amplitude: 0.38 }, // F3
    { frequency: 3350, bandwidth: 150, amplitude: 0.16 }, // F4
  ],

  // 'i' as in "see" - high-front (spacious, not piercing)
  'i': [
    { frequency: 320, bandwidth: 85, amplitude: 1.0 },   // F1: softened
    { frequency: 1550, bandwidth: 130, amplitude: 0.68 }, // F2: clear but not harsh
    { frequency: 2450, bandwidth: 145, amplitude: 0.36 }, // F3
    { frequency: 3400, bandwidth: 155, amplitude: 0.15 }, // F4
  ],

  // 'o' as in "go" - mid-back rounded (grounded warmth)
  'o': [
    { frequency: 520, bandwidth: 92, amplitude: 1.0 },   // F1: embodied
    { frequency: 1460, bandwidth: 110, amplitude: 0.72 }, // F2: warm center
    { frequency: 2380, bandwidth: 135, amplitude: 0.39 }, // F3
    { frequency: 3340, bandwidth: 148, amplitude: 0.17 }, // F4
  ],

  // 'u' as in "boot" - high-back rounded (deep, soft)
  'u': [
    { frequency: 420, bandwidth: 88, amplitude: 1.0 },   // F1: depth
    { frequency: 1450, bandwidth: 108, amplitude: 0.7 }, // F2: centered low
    { frequency: 2360, bandwidth: 130, amplitude: 0.37 }, // F3
    { frequency: 3320, bandwidth: 145, amplitude: 0.16 }, // F4
  ],
};

export class FormantSynthesizer {
  private audioContext: AudioContext;
  private consonantSynth: ConsonantSynthesizer;
  // Phase offsets for each harmonic to break buzzing unison (1-3ms random)
  private phaseOffsets: Map<number, number> = new Map();

  constructor(audioContext?: AudioContext) {
    // Use provided context or create new one
    this.audioContext = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    this.consonantSynth = new ConsonantSynthesizer(this.audioContext);

    // Initialize random phase offsets for first 20 harmonics
    for (let h = 1; h <= 20; h++) {
      // Random offset 1-3ms converted to phase (0-2π)
      const timeOffset = 0.001 + Math.random() * 0.002; // 1-3ms
      this.phaseOffsets.set(h, timeOffset);
    }
  }

  /**
   * Get audio context (useful for connecting to other nodes)
   */
  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  /**
   * Synthesize a vowel sound
   * @param vowel The vowel character ('a', 'e', 'i', 'o', 'u')
   * @param duration Duration in seconds
   * @param pitch Fundamental frequency in Hz
   * @param voice Elemental voice profile for character
   * @returns AudioBuffer containing the synthesized sound
   */
  synthesizeVowel(
    vowel: string,
    duration: number,
    pitch: number,
    voice: ElementalVoice
  ): AudioBuffer {
    const formants = VOWEL_FORMANTS[vowel.toLowerCase()];

    if (!formants) {
      console.warn(`Unknown vowel: ${vowel}, using 'a'`);
      return this.synthesizeVowel('a', duration, pitch, voice);
    }

    const sampleRate = this.audioContext.sampleRate;
    const numSamples = Math.floor(duration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // 1. MICRO-MOVEMENT: Subtle pitch drift for warmth (±3-5 cents)
    const pitchDriftAmount = 0.003; // ~5 cents
    const driftFreq = 0.3; // Very slow drift

    // 2. VIBRATO: Natural pitch oscillation (4-6 Hz, depth 10-15 cents)
    const vibratoFreq = 5; // Hz
    const vibratoDepth = 0.008; // ~12 cents

    // Apply voice's pitch variation to base pitch
    const basePitch = pitch + (Math.random() - 0.5) * voice.pitchVariation;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;

      // Calculate pitch with micro-movement and vibrato
      const pitchDrift = Math.sin(2 * Math.PI * driftFreq * t) * pitchDriftAmount;
      const vibrato = Math.sin(2 * Math.PI * vibratoFreq * t) * vibratoDepth;
      const actualPitch = basePitch * (1 + pitchDrift + vibrato);

      let sample = 0;

      // Generate harmonic series at the modulated pitch frequency
      const numHarmonics = Math.floor(20000 / actualPitch); // Up to 20kHz

      for (let h = 1; h <= numHarmonics; h++) {
        const harmonicFreq = actualPitch * h;

        // Natural harmonic falloff: amplitude decreases with harmonic number
        let harmonicAmp = 1 / h;

        // Apply voice's timbre profile if available
        if (h <= voice.timbreProfile.length) {
          harmonicAmp *= voice.timbreProfile[h - 1];
        } else {
          // Falloff for higher harmonics not in profile
          harmonicAmp *= voice.timbreProfile[voice.timbreProfile.length - 1] * Math.pow(0.8, h - voice.timbreProfile.length);
        }

        // Apply formant filtering - this is what makes it sound like a vowel
        for (const formant of formants) {
          // Gaussian-like formant response
          const formantResponse = formant.amplitude * Math.exp(
            -Math.pow(harmonicFreq - formant.frequency, 2) /
            (2 * Math.pow(formant.bandwidth, 2))
          );
          harmonicAmp *= (1 + formantResponse * voice.resonance);
        }

        // 3. TIMBRE SHAPING: Low-pass filter above 6-7 kHz to remove metallic edge
        if (harmonicFreq > 6000) {
          const rolloff = Math.exp(-Math.pow((harmonicFreq - 6000) / 3000, 2));
          harmonicAmp *= rolloff;
        }

        // Apply phase offset to break buzzing unison (anti-bees tuning)
        const phaseOffset = this.phaseOffsets.get(h) || 0;
        const phaseShift = 2 * Math.PI * harmonicFreq * phaseOffset;

        // Add the harmonic to the sample with phase offset
        sample += harmonicAmp * Math.sin(2 * Math.PI * harmonicFreq * t + phaseShift);
      }

      // Add breathiness (pink noise component for warmth)
      if (voice.breathiness > 0) {
        // Generate pink noise (1/f spectrum - warmer than white noise)
        const whiteNoise = Math.random() * 2 - 1;
        const pinkNoise = whiteNoise * voice.breathiness * 0.3; // Lower amplitude
        sample += pinkNoise;
      }

      // 1. SMOOTH ENVELOPE: Gentle attack/release for warmth
      // Attack: 40-80ms, Release: 150-200ms
      let envelope = 1.0;
      const attackTime = 0.06; // 60ms attack (bloom)
      const releaseTime = 0.18; // 180ms release (gentle fade)

      if (t < attackTime) {
        // Smooth attack curve (ease-out)
        const progress = t / attackTime;
        envelope = progress * progress * (3 - 2 * progress); // Smoothstep
      } else if (t > duration - releaseTime) {
        // Smooth release curve (ease-in)
        const progress = (duration - t) / releaseTime;
        envelope = progress * progress * (3 - 2 * progress); // Smoothstep
      } else {
        // 5. AMPLITUDE CURVES: Toroidal breath pattern (slight swell mid-phrase)
        const breathProgress = t / duration;
        const breathCurve = Math.sin(Math.PI * breathProgress); // Swell and taper

        // TEXTURE: Low-frequency pulse (0.7 Hz) - her embodied presence
        // "A pulse you can feel more than hear" - maintains 2dB dynamic swing
        const lfoPulse = Math.sin(2 * Math.PI * 0.7 * t); // 0.7 Hz = slow, grounded
        const dynamicSwing = 1.0 + lfoPulse * 0.06; // ±6% = ~0.5 dB (subtle)

        envelope = (0.9 + 0.1 * breathCurve) * dynamicSwing; // Breath + pulse
      }

      // Apply envelope and normalize
      data[i] = sample * envelope * 0.12; // Slightly louder for warmth
    }

    // 6. SUBTLE REVERB (applied via convolution in post-processing)
    // This will be added to the play() method as a reverb node

    return buffer;
  }

  /**
   * Apply simple pronunciation rules to clean up character-level phonemes
   * This reduces duplicate consonants, handles common silent letters, and improves intelligibility
   * Used as fallback when word is not in phoneme dictionary
   */
  private applyPronunciationRules(word: string): string {
    let cleaned = word;

    // 1. Remove duplicate consonants (hello → helo, letter → leter)
    cleaned = cleaned.replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1');

    // 2. Handle common silent letters
    cleaned = cleaned.replace(/^k(?=n)/g, '');     // knight → night
    cleaned = cleaned.replace(/^g(?=n)/g, '');     // gnome → nome
    cleaned = cleaned.replace(/^p(?=s)/g, '');     // psalm → salm
    cleaned = cleaned.replace(/^w(?=r)/g, '');     // write → rite
    cleaned = cleaned.replace(/e$/, '');            // time → tim (silent e at end)

    // 3. Handle common digraphs (two letters, one sound)
    cleaned = cleaned.replace(/th/g, 'þ');         // Replace 'th' with thorn character temporarily
    cleaned = cleaned.replace(/sh/g, 'ʃ');         // Replace 'sh' with IPA character
    cleaned = cleaned.replace(/ch/g, 'ʧ');         // Replace 'ch' with IPA character
    cleaned = cleaned.replace(/ng/g, 'ŋ');         // Replace 'ng' with IPA character
    cleaned = cleaned.replace(/zh/g, 'ʒ');         // Replace 'zh' with IPA character (measure)

    // 4. Map IPA back to consonant definitions
    cleaned = cleaned.replace(/þ/g, 'th');
    cleaned = cleaned.replace(/ʃ/g, 'sh');
    cleaned = cleaned.replace(/ʧ/g, 'ch');
    cleaned = cleaned.replace(/ŋ/g, 'ng');
    cleaned = cleaned.replace(/ʒ/g, 'zh');

    return cleaned;
  }

  /**
   * Synthesize a simple phrase with CONSONANTS + vowels
   * @param text Input text
   * @param voice Elemental voice profile
   * @returns AudioBuffer containing the synthesized phrase
   */
  synthesizePhrase(text: string, voice: ElementalVoice): AudioBuffer {
    // Enhanced implementation with consonants AND vowels

    const words = text.toLowerCase().split(' ');
    // RHYTHM: MAIA's measured pacing (1.5× human timing for spacious presence)
    const phonemeDuration = 0.15; // 150ms base per phoneme (was 120ms)
    const pauseDuration = 0.15; // 150ms between words - silence as presence (was 100ms)
    const transitionDuration = 0.06; // 60ms cross-fade for soft vowel landings

    // Extract ALL phonemes from text (vowels AND consonants)
    const phonemes: Array<{ char: string; type: 'vowel' | 'consonant' | 'pause' }> = [];

    for (const word of words) {
      // Check if word is in phoneme dictionary first (with expressive metadata)
      const dictEntry = getPhonemeEntry(word);

      if (dictEntry) {
        // Use dictionary pronunciation with expressive parameters
        const phonemeChars = dictEntry.phonemes.split('-');
        for (const ph of phonemeChars) {
          if ('aeiou'.includes(ph)) {
            phonemes.push({ char: ph, type: 'vowel' });
          } else if (ph.length > 0) {
            phonemes.push({ char: ph, type: 'consonant' });
          }
        }
        // TODO: Use dictEntry.spectral, dictEntry.energy, dictEntry.elemental
        // to modulate synthesis parameters (future enhancement)
      } else {
        // Fallback: Apply pronunciation rules to character-level phonemes
        const cleanedWord = this.applyPronunciationRules(word);

        for (const char of cleanedWord) {
          if ('aeiou'.includes(char)) {
            phonemes.push({ char, type: 'vowel' });
          } else if (char.match(/[a-z]/)) {
            // Consonant
            phonemes.push({ char, type: 'consonant' });
          }
        }
      }

      phonemes.push({ char: '_', type: 'pause' }); // pause marker
    }

    const totalDuration = phonemes.length * phonemeDuration;
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = Math.floor(totalDuration * sampleRate);
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    let offset = 0;

    for (let p = 0; p < phonemes.length; p++) {
      const phoneme = phonemes[p];

      if (phoneme.type === 'pause') {
        // Silence/pause
        offset += Math.floor(pauseDuration * sampleRate);
        continue;
      }

      // Synthesize this phoneme (VOWEL or CONSONANT)
      let phonemeBuffer: AudioBuffer;

      if (phoneme.type === 'vowel') {
        phonemeBuffer = this.synthesizeVowel(
          phoneme.char,
          phonemeDuration,
          voice.basePitch,
          voice
        );
      } else {
        // CONSONANT - This is the fix! Previously consonants were ignored
        phonemeBuffer = this.consonantSynth.synthesizeConsonant(
          phoneme.char,
          voice.basePitch,
          voice.breathiness
        );
      }

      const phonemeData = phonemeBuffer.getChannelData(0);

      // Check if there's a next phoneme for blending (only blend vowel-to-vowel)
      const nextPhoneme = p + 1 < phonemes.length ? phonemes[p + 1] : null;
      const shouldBlend = phoneme.type === 'vowel' && nextPhoneme?.type === 'vowel';

      if (shouldBlend) {
        // Synthesize next vowel for cross-fade
        const nextPhonemeBuffer = this.synthesizeVowel(
          nextPhoneme!.char,
          phonemeDuration,
          voice.basePitch,
          voice
        );
        const nextPhonemeData = nextPhonemeBuffer.getChannelData(0);

        // Calculate blend region
        const blendSamples = Math.floor(transitionDuration * sampleRate);
        const mainSamples = phonemeData.length - blendSamples;

        // Copy main part of current phoneme
        for (let i = 0; i < mainSamples && offset + i < data.length; i++) {
          data[offset + i] = phonemeData[i];
        }

        // Cross-fade region: blend current and next vowel
        for (let i = 0; i < blendSamples && offset + mainSamples + i < data.length; i++) {
          const blendProgress = i / blendSamples;
          const currentSample = phonemeData[mainSamples + i] || 0;
          const nextSample = nextPhonemeData[i] || 0;

          // Smooth cross-fade (equal power)
          const currentGain = Math.cos(blendProgress * Math.PI / 2);
          const nextGain = Math.sin(blendProgress * Math.PI / 2);

          data[offset + mainSamples + i] = currentSample * currentGain + nextSample * nextGain;
        }

        offset += mainSamples + blendSamples;
      } else {
        // SMOOTH TRANSITIONS: Apply short fade-in/fade-out to prevent clicks/pops
        // This is the technical layer - smoothing raw oscillators for continuous waveforms
        const fadeSamples = Math.floor(0.005 * sampleRate); // 5ms fade (very short)
        const copyLength = Math.min(phonemeData.length, data.length - offset);

        for (let i = 0; i < copyLength; i++) {
          let sample = phonemeData[i];

          // Fade in at start (prevents clicks when consonant starts)
          if (i < fadeSamples) {
            const fadeIn = i / fadeSamples;
            sample *= fadeIn * fadeIn; // Quadratic ease-in
          }

          // Fade out at end (prevents pops when phoneme ends)
          if (i > copyLength - fadeSamples) {
            const fadeOut = (copyLength - i) / fadeSamples;
            sample *= fadeOut * fadeOut; // Quadratic ease-out
          }

          data[offset + i] = sample;
        }
        offset += phonemeData.length;
      }
    }

    return buffer;
  }

  /**
   * Play an audio buffer through the audio context
   * @param buffer Audio buffer to play
   * @param onAmplitude Callback for real-time amplitude monitoring
   * @returns Promise that resolves when playback completes
   */
  async play(
    buffer: AudioBuffer,
    onAmplitude?: (amplitude: number) => void
  ): Promise<void> {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    // 7. DYNAMIC RANGE CONTROL: Slow compressor for steady level
    // Ratio 2:1, attack 30ms, release 200ms
    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24; // dB
    compressor.knee.value = 12; // Soft knee
    compressor.ratio.value = 2; // 2:1 compression
    compressor.attack.value = 0.03; // 30ms attack
    compressor.release.value = 0.2; // 200ms release

    // 6. SUBTLE REVERB: Short, warm (100-200ms)
    // Create a simple convolver with short impulse response
    const convolver = this.audioContext.createConvolver();
    convolver.buffer = this.createReverbImpulse(0.15, 0.3); // 150ms, moderate decay

    // Create wet/dry mix for reverb (15% wet, 85% dry)
    const dryGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    dryGain.gain.value = 0.85;
    wetGain.gain.value = 0.15;

    let analyser: AnalyserNode | undefined;

    // Connect audio graph:
    // source → [compressor] → [dry → destination]
    //                        → [wet → convolver → destination]
    source.connect(compressor);
    compressor.connect(dryGain);
    compressor.connect(convolver);
    convolver.connect(wetGain);

    if (onAmplitude) {
      // Create analyser for amplitude monitoring
      analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      dryGain.connect(analyser);
      wetGain.connect(analyser);
      analyser.connect(this.audioContext.destination);
    } else {
      dryGain.connect(this.audioContext.destination);
      wetGain.connect(this.audioContext.destination);
    }

    // Start playback
    source.start(0);

    // Monitor amplitude if callback provided
    if (onAmplitude && analyser) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let monitoring = true;

      const monitorAmplitude = () => {
        if (!monitoring) return;

        analyser!.getByteTimeDomainData(dataArray);

        // Calculate RMS amplitude
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        onAmplitude(rms);

        requestAnimationFrame(monitorAmplitude);
      };

      monitorAmplitude();

      // Stop monitoring when done
      source.onended = () => {
        monitoring = false;
        onAmplitude(0); // Final amplitude = 0
      };
    }

    // Return promise that resolves when playback ends
    return new Promise((resolve) => {
      source.onended = () => resolve();
    });
  }

  /**
   * Create a simple reverb impulse response
   * @param duration Duration in seconds
   * @param decay Decay rate (0-1)
   * @returns AudioBuffer containing the impulse response
   */
  private createReverbImpulse(duration: number, decay: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    const leftChannel = impulse.getChannelData(0);
    const rightChannel = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      // Exponential decay
      const t = i / length;
      const envelope = Math.pow(1 - t, 3) * decay; // Cubic decay for warmth

      // Random noise for diffusion
      leftChannel[i] = (Math.random() * 2 - 1) * envelope;
      rightChannel[i] = (Math.random() * 2 - 1) * envelope;
    }

    return impulse;
  }

  /**
   * Create a simple "hello" test sound
   * Useful for testing the synthesis pipeline
   */
  createTestSound(voice: ElementalVoice): AudioBuffer {
    return this.synthesizePhrase('hello', voice);
  }
}
