/**
 * MAIA Voice Engine
 *
 * Main orchestrator for MAIA's voice system.
 * Integrates:
 * - Formant synthesis (audio generation)
 * - Phi rhythm control (timing)
 * - Voice state management (breath cycle)
 * - Elemental modulation (voice character)
 *
 * This is the single entry point for making MAIA speak.
 */

import { FormantSynthesizer } from '../synthesis/formantSynthesizer';
import { PhiRhythmController } from '../rhythm/phiRhythmController';
import { voiceStateManager, type VoiceState } from '../state/voiceStateManager';
import {
  getVoiceProfile,
  selectVoiceByIntent,
  type Element,
  type ElementalVoice,
  AETHER_VOICE,
} from '../modulation/elementalVoices';
import { voiceLock } from '@/lib/services/VoiceLock';

export interface SpeakOptions {
  element?: Element;           // Override element selection
  userBreathCycle?: number;    // User's detected breath cycle (ms) for entrainment
  coherenceScore?: number;     // User's coherence level (0-1)
  onAmplitude?: (amplitude: number) => void; // Real-time amplitude callback
  onComplete?: () => void;     // Callback when speech completes
}

export interface ConversationContext {
  text: string;
  element?: Element;
  userBreathCycle?: number;
  coherenceScore?: number;
}

/**
 * Main MAIA Voice Engine
 */
export class MaiaVoiceEngine {
  private synthesizer: FormantSynthesizer;
  private rhythmController: PhiRhythmController;
  private audioContext: AudioContext;
  private currentlyPlaying = false;

  constructor() {
    // Initialize audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Initialize synthesizer with shared audio context
    this.synthesizer = new FormantSynthesizer(this.audioContext);

    // Initialize rhythm controller
    this.rhythmController = new PhiRhythmController();

    console.log('🎵 [MaiaVoiceEngine] Initialized');
  }

  /**
   * Make MAIA speak
   * @param text The text to speak
   * @param options Speaking options
   */
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    // Prevent overlapping speech
    if (this.currentlyPlaying) {
      console.warn('🎵 [MaiaVoiceEngine] Already speaking, ignoring new request');
      return;
    }

    try {
      this.currentlyPlaying = true;

      // 1. Select voice profile
      const voice = this.selectVoice(text, options.element);
      console.log(`🎵 [MaiaVoiceEngine] Selected voice: ${voice.name} (${voice.element})`);

      // 2. Update coherence if provided
      if (options.coherenceScore !== undefined) {
        this.rhythmController.setCoherenceScore(options.coherenceScore);
      }

      // 3. Entrain to user's breath if provided
      if (options.userBreathCycle) {
        const currentBreath = voiceStateManager.getBreathDuration();
        const newBreath = this.rhythmController.adjustToUserBreath(
          currentBreath,
          options.userBreathCycle
        );
        voiceStateManager.setBreathDuration(newBreath);
        console.log(`🌬️ [MaiaVoiceEngine] Entrained breath: ${Math.round(newBreath)}ms`);
      }

      // 4. Transition to hold state (processing → about to speak)
      voiceStateManager.transition('hold', voice.element);

      // Brief hold pause before speaking
      await this.rhythmController.wait('short');

      // 5. Lock voice input (prevent echo)
      voiceLock.lock();

      // 6. Transition to exhale state (speaking)
      voiceStateManager.transition('exhale', voice.element);

      // 7. Synthesize audio
      console.log(`🎵 [MaiaVoiceEngine] Synthesizing: "${text}"`);
      const audioBuffer = this.synthesizer.synthesizePhrase(text, voice);

      // 8. Play audio with amplitude feedback
      await this.synthesizer.play(audioBuffer, (amplitude) => {
        // Update voice state with real-time amplitude
        voiceStateManager.updateAudioData(amplitude);

        // Forward to external callback if provided
        if (options.onAmplitude) {
          options.onAmplitude(amplitude);
        }
      });

      // 9. Transition to settling (finishing speech)
      voiceStateManager.transition('settling', voice.element);

      // Settling pause (phi-based)
      await this.rhythmController.wait('breath');

      // 10. Transition to silence
      voiceStateManager.transition('silence', 'aether');

      // 11. Echo cooldown before unlocking microphone
      console.log(`🔒 [MaiaVoiceEngine] Waiting for echo cooldown...`);
      await this.rhythmController.wait('echo');

      // 12. Unlock voice input
      voiceLock.unlock();
      console.log(`🔓 [MaiaVoiceEngine] Voice unlocked, ready to listen`);

      // 13. Call completion callback
      if (options.onComplete) {
        options.onComplete();
      }

    } catch (error) {
      console.error('🎵 [MaiaVoiceEngine] Error during speech:', error);

      // Ensure we clean up state even on error
      voiceStateManager.transition('silence', 'aether');
      voiceLock.unlock();

    } finally {
      this.currentlyPlaying = false;
    }
  }

  /**
   * Select voice profile based on text and context
   */
  private selectVoice(text: string, overrideElement?: Element): ElementalVoice {
    // If element explicitly provided, use it
    if (overrideElement) {
      return getVoiceProfile(overrideElement);
    }

    // Otherwise, analyze text intent
    return selectVoiceByIntent(text);
  }

  /**
   * Test the voice engine with a simple phrase
   */
  async test(element: Element = 'aether'): Promise<void> {
    const testPhrases: Record<Element, string> = {
      fire: 'breakthrough insight',
      water: 'flowing emotion',
      earth: 'grounded stability',
      air: 'clear understanding',
      aether: 'integrated wisdom',
    };

    const text = testPhrases[element];
    console.log(`🧪 [MaiaVoiceEngine] Testing ${element} voice: "${text}"`);

    await this.speak(text, { element });
  }

  /**
   * Stop current playback (if playing)
   */
  stop(): void {
    // TODO: Implement proper stop mechanism
    // For now, just reset state
    this.currentlyPlaying = false;
    voiceStateManager.reset();
    voiceLock.unlock();
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.currentlyPlaying;
  }

  /**
   * Get audio context (for advanced integrations)
   */
  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  /**
   * Get voice state manager (for subscribing to state changes)
   */
  getVoiceStateManager() {
    return voiceStateManager;
  }

  /**
   * Get phi rhythm controller (for timing queries)
   */
  getPhiRhythmController() {
    return this.rhythmController;
  }
}

// Singleton instance for global use
let _engineInstance: MaiaVoiceEngine | null = null;

export function getMaiaVoiceEngine(): MaiaVoiceEngine {
  if (typeof window === 'undefined') {
    throw new Error('MaiaVoiceEngine can only be used in browser environment');
  }

  if (!_engineInstance) {
    _engineInstance = new MaiaVoiceEngine();
  }

  return _engineInstance;
}
