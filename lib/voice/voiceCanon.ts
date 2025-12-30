// backend
// Voice Canon - loads mode-specific voice guidelines for MAIA

import { TALK_MODE_VOICE_CORE } from '../maia/talkModeVoice';
import { CARE_MODE_VOICE_CORE } from '../maia/careModeVoice';
import { NOTE_MODE_VOICE_CORE } from '../maia/noteModeVoice';

export type MaiaMode = 'talk' | 'care' | 'note' | 'scribe' | 'counsel' | string;

export type VoiceDoctrineConstraints = {
  maxLengthMultiplier: number;
  forbidNewNumbers: boolean;
  forbidNewProperNouns: boolean;
};

export type VoiceDoctrine = {
  prompt: string;
  constraints: VoiceDoctrineConstraints;
};

export type VoiceCanonLoadResult = {
  doctrine?: VoiceDoctrine | null;
  rules?: string | null;
};

// Mode-specific constraints
const MODE_CONSTRAINTS: Record<string, VoiceDoctrineConstraints> = {
  talk: {
    maxLengthMultiplier: 1.0,  // Keep responses concise in dialogue
    forbidNewNumbers: true,
    forbidNewProperNouns: true,
  },
  care: {
    maxLengthMultiplier: 1.5,  // Allow longer therapeutic responses
    forbidNewNumbers: true,
    forbidNewProperNouns: true,
  },
  note: {
    maxLengthMultiplier: 1.2,  // Moderate length for documentation
    forbidNewNumbers: false,   // Can reference patterns numerically
    forbidNewProperNouns: false,
  },
};

const VOICE_MODE_MAP: Record<string, string> = {
  talk: TALK_MODE_VOICE_CORE,
  dialogue: TALK_MODE_VOICE_CORE,
  care: CARE_MODE_VOICE_CORE,
  counsel: CARE_MODE_VOICE_CORE,
  note: NOTE_MODE_VOICE_CORE,
  scribe: NOTE_MODE_VOICE_CORE,
};

export async function loadVoiceCanonRules(mode: MaiaMode): Promise<VoiceCanonLoadResult> {
  const normalizedMode = mode === 'counsel' ? 'care' : mode === 'scribe' ? 'note' : (mode || 'talk');
  const voiceRules = VOICE_MODE_MAP[normalizedMode] || VOICE_MODE_MAP['talk'];
  const constraints = MODE_CONSTRAINTS[normalizedMode] || MODE_CONSTRAINTS['talk'];

  return {
    doctrine: {
      prompt: voiceRules,
      constraints,
    },
    rules: voiceRules,
  };
}
