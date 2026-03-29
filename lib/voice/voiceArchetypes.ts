/**
 * Voice Archetypes — sovereign voice presences with mixed-provider routing.
 *
 * Members choose an archetype (a felt presence), not an engine ID.
 * Each archetype specifies its TTS provider:
 *   - 'openai' — cloud TTS (higher quality feminine voices)
 *   - 'kokoro' — local sovereign TTS (masculine/playful voices)
 *
 * MAIA's feminine voices use OpenAI (Alloy, Shimmer, Nova).
 * Masculine/playful voices use Kokoro (sovereign, no data leaves the machine).
 *
 * This is a conscious architectural choice, not a fallback — documented, not hidden.
 *
 * DB IDs (maia_core, mentor, etc.) are internal — never shown to members.
 * Labels and descriptions are what members see and choose by.
 */

export type MaiaVoiceArchetype =
  | 'maia_core'
  | 'maia_warm'
  | 'maia_clear'
  | 'maia_echo'
  | 'maia_fable'
  | 'maia_onyx'
  | 'mentor'
  | 'elder'
  | 'puck'
  | 'heart'
  | 'bella'
  | 'adam';

export type VoiceProvider = 'openai' | 'kokoro';

export type VoiceGroup = 'cloud' | 'local';

export interface VoiceArchetypeEntry {
  id: MaiaVoiceArchetype;
  label: string;
  desc: string;
  bestFor: string;           // one-phrase orientation for quick selection
  group: VoiceGroup;         // UI grouping: 'cloud' (OpenAI) or 'local' (Kokoro)
  provider: VoiceProvider;   // which TTS engine to use
  voice: string;             // provider-specific voice ID
  kokoroVoice: string;       // Kokoro fallback (used when OpenAI is down, or for local-only mode)
}

/**
 * MAIA_VOICE_OVERRIDE — env-driven escape hatch for MAIA's core voice.
 *
 * SOVEREIGNTY FLIP (2026-03-28): Kokoro is now the DEFAULT for all MAIA voices.
 * Set MAIA_VOICE_OVERRIDE=openai to route back through OpenAI TTS (cloud).
 *
 * Default (unset or "kokoro"): Kokoro local voices. No data leaves the machine.
 * Set to "openai" to use OpenAI TTS (requires OPENAI_API_KEY, sends audio data to cloud).
 *
 * No redeploy needed — just set the env var and restart the container:
 *   docker restart maia-sovereign
 */
const voiceOverride = (process.env.MAIA_VOICE_OVERRIDE || '').toLowerCase();
const maiaProvider: VoiceProvider = voiceOverride === 'openai' ? 'openai' : 'kokoro';

if (maiaProvider === 'openai') {
  console.log('[voiceArchetypes] MAIA_VOICE_OVERRIDE=openai — MAIA voices routed through OpenAI (cloud)');
} else {
  console.log('[voiceArchetypes] MAIA voices routed through Kokoro (sovereign local)');
}

export const MAIA_VOICE_ARCHETYPES: VoiceArchetypeEntry[] = [
  // ── MAIA Cloud Voices (OpenAI) ──
  { id: 'maia_core',  label: 'Maia',           desc: 'Steady, balanced, and quietly luminous.',                     bestFor: 'Everyday guidance',    group: 'cloud', provider: maiaProvider, voice: maiaProvider === 'kokoro' ? 'af_kore' : 'alloy',       kokoroVoice: 'af_kore' },
  { id: 'maia_warm',  label: 'Maia (Warm)',    desc: 'Softer presence: comforting, relational, gently encouraging.', bestFor: 'Tender days',          group: 'cloud', provider: maiaProvider, voice: maiaProvider === 'kokoro' ? 'af_sarah' : 'shimmer',    kokoroVoice: 'af_sarah' },
  { id: 'maia_clear', label: 'Maia (Clear)',   desc: 'Crisp and direct: focused, practical, cleanly articulated.',  bestFor: 'Decisions + clarity',  group: 'cloud', provider: maiaProvider, voice: maiaProvider === 'kokoro' ? 'af_nicole' : 'nova',      kokoroVoice: 'af_nicole' },
  { id: 'maia_echo',  label: 'Maia (Echo)',    desc: 'Measured and resonant. A contemplative quality.',             bestFor: 'Journaling + insight', group: 'cloud', provider: maiaProvider, voice: maiaProvider === 'kokoro' ? 'af_heart' : 'echo',      kokoroVoice: 'af_heart' },
  { id: 'maia_fable', label: 'Maia (Fable)',   desc: 'Expressive and narrative. Storytelling warmth.',              bestFor: 'Stories + exploration', group: 'cloud', provider: maiaProvider, voice: maiaProvider === 'kokoro' ? 'af_bella' : 'fable',     kokoroVoice: 'af_bella' },
  { id: 'maia_onyx',  label: 'Maia (Onyx)',    desc: 'Deep and grounded. Authoritative without pressure.',          bestFor: 'Grounding + structure', group: 'cloud', provider: maiaProvider, voice: maiaProvider === 'kokoro' ? 'am_adam' : 'onyx',      kokoroVoice: 'am_adam' },

  // ── Sovereign Local Voices (Kokoro) ──
  { id: 'mentor',     label: 'Atlas',          desc: 'Grounded masculine: calm, steady, confident without pressure.', bestFor: 'Steady mentorship',  group: 'local', provider: 'kokoro', voice: 'am_michael', kokoroVoice: 'am_michael' },
  { id: 'elder',      label: 'Atlas (Deep)',   desc: 'Deeper register: slow gravity, contemplative, anchoring.',    bestFor: 'Ritual + reflection',  group: 'local', provider: 'kokoro', voice: 'bm_lewis',   kokoroVoice: 'bm_lewis' },
  { id: 'puck',       label: 'Puck',           desc: 'Light, quick, playfully confident. Best when you want play, not solemnity.', bestFor: 'Lightness + humor', group: 'local', provider: 'kokoro', voice: 'am_puck', kokoroVoice: 'am_puck' },
  { id: 'heart',      label: 'Kore (Heart)',   desc: 'Warm and nurturing. The original local presence.',            bestFor: 'Comfort + holding',    group: 'local', provider: 'kokoro', voice: 'af_heart',   kokoroVoice: 'af_heart' },
  { id: 'bella',      label: 'Kore (Bella)',   desc: 'Clear and articulate. Bright without sharpness.',             bestFor: 'Clarity + energy',     group: 'local', provider: 'kokoro', voice: 'af_bella',   kokoroVoice: 'af_bella' },
  { id: 'adam',       label: 'Atlas (Adam)',   desc: 'Warm masculine. Gentle strength, approachable.',              bestFor: 'Conversation + ease',  group: 'local', provider: 'kokoro', voice: 'am_adam',    kokoroVoice: 'am_adam' },
];

/**
 * Resolve archetype → { provider, voice }.
 * Default (no archetype set): OpenAI Alloy (MAIA's primary voice).
 */
export function resolveArchetypeVoice(archetype?: string | null): { provider: VoiceProvider; voice: string } {
  if (!archetype) return { provider: 'openai', voice: 'alloy' };
  const entry = MAIA_VOICE_ARCHETYPES.find((x) => x.id === archetype);
  return entry
    ? { provider: entry.provider, voice: entry.voice }
    : { provider: 'openai', voice: 'alloy' };
}

/**
 * Resolve archetype → OpenAI voice ID.
 * Used when routing through OpenAI regardless of the archetype's default provider.
 * Falls back to alloy if archetype is unknown or unset.
 */
export function resolveArchetypeToOpenAI(archetype?: string | null): string {
  if (!archetype) return 'alloy';
  const entry = MAIA_VOICE_ARCHETYPES.find((x) => x.id === archetype);
  return entry?.kokoroVoice
    // Map Kokoro voice → OpenAI equivalent
    ? ({ af_kore: 'alloy', af_sarah: 'shimmer', af_nicole: 'nova', af_heart: 'shimmer', af_bella: 'nova', am_adam: 'echo', am_michael: 'onyx', am_puck: 'fable', bm_lewis: 'onyx' }[entry.kokoroVoice] ?? 'alloy')
    : 'alloy';
}

/**
 * Resolve archetype string → Kokoro voice ID.
 * Used as fallback when OpenAI is unavailable or for local-only mode.
 * Falls back to af_kore (Maia Kore) if archetype is unknown or unset.
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
