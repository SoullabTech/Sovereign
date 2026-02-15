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
  | 'mentor'
  | 'elder'
  | 'puck';

export type VoiceProvider = 'openai' | 'kokoro';

export interface VoiceArchetypeEntry {
  id: MaiaVoiceArchetype;
  label: string;
  desc: string;
  bestFor: string;           // one-phrase orientation for quick selection
  provider: VoiceProvider;   // which TTS engine to use
  voice: string;             // provider-specific voice ID
  kokoroVoice: string;       // Kokoro fallback (used when OpenAI is down, or for local-only mode)
}

/**
 * MAIA_VOICE_OVERRIDE — env-driven A/B test switch for MAIA's core voice.
 *
 * Set MAIA_VOICE_OVERRIDE=kokoro in docker-compose or .env to route
 * all three MAIA feminine archetypes through Kokoro (af_kore, af_sarah, af_nicole)
 * instead of OpenAI (alloy, shimmer, nova).
 *
 * Default (unset or "openai"): OpenAI voices. Set to "kokoro" to go fully local.
 * No redeploy needed — just set the env var and restart the container:
 *   docker restart maia-sovereign
 */
const voiceOverride = (process.env.MAIA_VOICE_OVERRIDE || '').toLowerCase();
const maiaProvider: VoiceProvider = voiceOverride === 'kokoro' ? 'kokoro' : 'openai';

if (maiaProvider === 'kokoro') {
  console.log('[voiceArchetypes] MAIA_VOICE_OVERRIDE=kokoro — MAIA voices routed through Kokoro (sovereign local)');
}

export const MAIA_VOICE_ARCHETYPES: VoiceArchetypeEntry[] = [
  { id: 'maia_core',  label: 'Maia',           desc: 'Steady, balanced, and quietly luminous.',                     bestFor: 'Everyday guidance',    provider: maiaProvider, voice: maiaProvider === 'kokoro' ? 'af_kore' : 'alloy',       kokoroVoice: 'af_kore' },
  { id: 'maia_warm',  label: 'Maia (Warm)',    desc: 'Softer presence: comforting, relational, gently encouraging.', bestFor: 'Tender days',          provider: maiaProvider, voice: maiaProvider === 'kokoro' ? 'af_sarah' : 'shimmer',    kokoroVoice: 'af_sarah' },
  { id: 'maia_clear', label: 'Maia (Clear)',   desc: 'Crisp and direct: focused, practical, cleanly articulated.',  bestFor: 'Decisions + clarity',  provider: maiaProvider, voice: maiaProvider === 'kokoro' ? 'af_nicole' : 'nova',      kokoroVoice: 'af_nicole' },
  { id: 'mentor',     label: 'Atlas',          desc: 'Grounded masculine: calm, steady, confident without pressure.', bestFor: 'Steady mentorship',  provider: 'kokoro', voice: 'am_michael', kokoroVoice: 'am_michael' },
  { id: 'elder',      label: 'Atlas (Deep)',   desc: 'Deeper register: slow gravity, contemplative, anchoring.',    bestFor: 'Ritual + reflection',  provider: 'kokoro', voice: 'bm_lewis',   kokoroVoice: 'bm_lewis' },
  { id: 'puck',       label: 'Puck',           desc: 'Light, quick, playfully confident. Best when you want play, not solemnity.', bestFor: 'Lightness + humor', provider: 'kokoro', voice: 'am_puck', kokoroVoice: 'am_puck' },
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
