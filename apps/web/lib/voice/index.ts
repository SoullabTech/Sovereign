/**
 * MAIA Voice System
 *
 * Complete voice synthesis system based on Spiralogic principles:
 * - Phi-ratio timing (golden ratio breath)
 * - Elemental voice modulation (Fire/Water/Earth/Air/Aether)
 * - Formant synthesis (local audio generation)
 * - Voice state management (breath cycle tracking)
 *
 * Primary entry point: getMaiaVoiceEngine()
 */

// Main engine
export { MaiaVoiceEngine, getMaiaVoiceEngine, type SpeakOptions, type ConversationContext } from './integration/maiaVoiceEngine';

// Voice profiles
export {
  type Element,
  type ElementalVoice,
  FIRE_VOICE,
  WATER_VOICE,
  EARTH_VOICE,
  AIR_VOICE,
  AETHER_VOICE,
  ELEMENTAL_VOICES,
  getVoiceProfile,
  blendVoices,
  selectVoiceByIntent,
} from './modulation/elementalVoices';

// State management
export {
  voiceStateManager,
  type VoiceState,
  type VoiceStateData,
} from './state/voiceStateManager';

// Rhythm control
export {
  phiRhythm,
  PhiRhythmController,
  type PhiTiming,
} from './rhythm/phiRhythmController';

// Synthesis
export {
  FormantSynthesizer,
  type Formant,
  VOWEL_FORMANTS,
} from './synthesis/formantSynthesizer';

export {
  PhonemeConverter,
  detectSentencePattern,
  type Phoneme,
} from './synthesis/phonemeConverter';

// Voice lock (echo prevention) - re-export from services
export { voiceLock } from '@/lib/services/VoiceLock';
