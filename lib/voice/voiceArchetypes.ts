/**
 * Voice Archetypes — the MAIA 5.
 *
 * Members choose an archetype (a felt presence), not an engine ID.
 * The archetype resolves to a Kokoro voice behind the scenes.
 *
 * This keeps the member-facing layer sovereign and meaningful,
 * while allowing the engine layer to change without breaking identity.
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
  kokoroVoice: string; // engine id (hidden behind archetype)
}

export const MAIA_VOICE_ARCHETYPES: VoiceArchetypeEntry[] = [
  { id: 'maia_core',  label: 'MAIA (Core)',  desc: 'Clear, balanced, attentive.',  kokoroVoice: 'af_bella' },
  { id: 'maia_warm',  label: 'MAIA (Warm)',  desc: 'Softer, more comforting.',      kokoroVoice: 'af_sarah' },
  { id: 'maia_clear', label: 'MAIA (Clear)', desc: 'Direct, crisp guidance.',       kokoroVoice: 'af_nicole' },
  { id: 'mentor',     label: 'Mentor',       desc: 'Steady masculine counsel.',     kokoroVoice: 'am_michael' },
  { id: 'elder',      label: 'Elder',        desc: 'Deep, grounded presence.',      kokoroVoice: 'bm_lewis' },
  { id: 'puck',       label: 'Puck (Light)', desc: 'Playful confidence, lighter touch.', kokoroVoice: 'am_puck' },
];

/**
 * Resolve archetype string → Kokoro voice ID.
 * Falls back to af_bella (MAIA Core) if archetype is unknown or unset.
 */
export function resolveArchetypeToKokoro(archetype?: string | null): string {
  if (!archetype) return 'af_bella';
  const entry = MAIA_VOICE_ARCHETYPES.find((x) => x.id === archetype);
  return entry?.kokoroVoice ?? 'af_bella';
}

/**
 * Check if a string is a valid archetype ID.
 */
export function isValidArchetype(value: unknown): value is MaiaVoiceArchetype {
  if (typeof value !== 'string') return false;
  return MAIA_VOICE_ARCHETYPES.some((x) => x.id === value);
}
