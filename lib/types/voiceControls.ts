/**
 * Voice Controls — types for the MAIA norm + member preference layer.
 *
 * Control stack: Norm -> Member Offsets -> Conductor -> Clamp/Hysteresis -> TTS
 *
 * These are preferences, not psychological scoring. Safe to persist and member-editable.
 */

export type VoiceControlOffsets = {
  pace: number;          // -1..1 (system), -0.30..0.30 (member)
  warmth: number;
  poetry: number;
  directiveness: number;
  energy: number;
};

export type SystemVoiceProfile = {
  voiceId: string;       // e.g. 'maia'
  base: VoiceControlOffsets;
};

/** Member TTS provider preference: auto (default), cloud (OpenAI), local (Kokoro) */
export type TTSProviderPref = 'auto' | 'cloud' | 'local';

export type MemberVoicePreferences = {
  voiceIdOverride?: string | null;
  /** Member-chosen TTS provider: auto, cloud, or local */
  ttsProvider?: TTSProviderPref | null;
  offset: VoiceControlOffsets;
};

export type VoiceControlsResponse = {
  system: SystemVoiceProfile;
  member: MemberVoicePreferences;
  effective: {
    voiceId: string;
    intent: VoiceControlOffsets; // merged base+offset before conductor modulation
  };
};
