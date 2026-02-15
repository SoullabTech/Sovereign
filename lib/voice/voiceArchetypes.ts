/**
 * Voice Archetypes — sovereign voice presences.
 *
 * Members choose an archetype (a felt presence), not an engine ID.
 * The archetype resolves to a Kokoro voice behind the scenes.
 *
 * This keeps the member-facing layer sovereign and meaningful,
 * while allowing the engine layer to change without breaking identity.
 *
 * DB IDs (maia_core, mentor, etc.) are internal — never shown to members.
 * Labels and descriptions are what members see and choose by.
 */

export type MaiaVoiceArchetype =
  | 'maia_core'
  | 'maia_warm'
  | 'maia_clear'
  | 'mentor'
  | 'elder'
  | 'puck';

export interface VoiceArchetypeEntry {
  id: MaiaVoiceArchetype;
  label: string;
  desc: string;
  bestFor: string;           // one-phrase orientation for quick selection
  kokoroVoice: string;       // engine id (hidden behind archetype)
}

export const MAIA_VOICE_ARCHETYPES: VoiceArchetypeEntry[] = [
  { id: 'maia_core',  label: 'Maia (Kore)',   desc: 'Steady, balanced, and quietly luminous.',                     bestFor: 'Everyday guidance',    kokoroVoice: 'af_kore' },
  { id: 'maia_warm',  label: 'Maia (Warm)',    desc: 'Softer presence: comforting, relational, gently encouraging.', bestFor: 'Tender days',          kokoroVoice: 'af_sarah' },
  { id: 'maia_clear', label: 'Maia (Clear)',   desc: 'Crisp and direct: focused, practical, cleanly articulated.',  bestFor: 'Decisions + clarity',  kokoroVoice: 'af_nicole' },
  { id: 'mentor',     label: 'Atlas',          desc: 'Grounded masculine: calm, steady, confident without pressure.', bestFor: 'Steady mentorship',  kokoroVoice: 'am_michael' },
  { id: 'elder',      label: 'Atlas (Deep)',   desc: 'Deeper register: slow gravity, contemplative, anchoring.',    bestFor: 'Ritual + reflection',  kokoroVoice: 'bm_lewis' },
  { id: 'puck',       label: 'Puck',           desc: 'Light, quick, playfully confident. Best when you want play, not solemnity.', bestFor: 'Lightness + humor', kokoroVoice: 'am_puck' },
];

/**
 * Resolve archetype string → Kokoro voice ID.
 * Falls back to af_kore (Maia Kore — primary voice) if archetype is unknown or unset.
 */
export function resolveArchetypeToKokoro(archetype?: string | null): string {
  if (!archetype) return 'af_kore';
  const entry = MAIA_VOICE_ARCHETYPES.find((x) => x.id === archetype);
  return entry?.kokoroVoice ?? 'af_kore';
}

/**
 * Check if a string is a valid archetype ID.
 */
export function isValidArchetype(value: unknown): value is MaiaVoiceArchetype {
  if (typeof value !== 'string') return false;
  return MAIA_VOICE_ARCHETYPES.some((x) => x.id === value);
}
