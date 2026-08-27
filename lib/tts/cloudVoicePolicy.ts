/**
 * VOICE-SOVEREIGNTY-01 — local TTS is the production authority.
 *
 * Founder canon ruling, 2026-08-27:
 *
 *   DEFAULT            LOCAL
 *   AUTO               LOCAL
 *   EXPLICIT LOCAL     LOCAL
 *   CLOUD              NOT AVAILABLE under current canon
 *   OPENAI FALLBACK    FORBIDDEN
 *   LOCAL UNAVAILABLE  text response + truthful voice-unavailable state
 *
 * ── WHY THIS MODULE EXISTS RATHER THAN SIX EDITS ────────────────────────────
 *
 * The production log showed `[tts.attempt] provider:"openai" reason:"auto/cloud
 * lead"` on ordinary member turns while Kokoro was healthy and available. The
 * implementation had drifted from CLAUDE.md's "Voice: Local TTS/STT or browser
 * APIs only" — not by failing over, but by leading with the cloud.
 *
 * `ttsRouter` alone has six separate escapes to OpenAI. Repairing each one is
 * discipline, and discipline is what drifted in the first place. So the policy
 * lives in ONE place and every escape passes through it: the constructor of
 * `TTSFallbackToOpenAI` itself refuses to be built when cloud voice is
 * forbidden. A seventh escape added later inherits the refusal without anyone
 * remembering to guard it.
 *
 * ⛔ THE DEFAULT IS THE CANON. Cloud voice is forbidden unless
 * `MAIA_ALLOW_CLOUD_VOICE=1` is set explicitly. An unset variable, a fresh
 * environment, a new deployment — all sovereign. Re-permitting cloud is a
 * visible, deliberate act, not the absence of one.
 *
 * ⛔ This is NOT `DISABLE_OPENAI_COMPLETELY`. That flag is broader and would
 * alter unrelated paths; the ruling explicitly declined it as the first repair.
 * This gates the voice path and nothing else.
 */

/** Env var that re-permits cloud voice. Absent or anything but "1" = forbidden. */
export const CLOUD_VOICE_ENV = 'MAIA_ALLOW_CLOUD_VOICE';

/**
 * Is a cloud TTS provider permitted on the production voice path?
 * Read at call time, never cached — a deploy must not bake a stale answer in.
 */
export function cloudVoicePermitted(): boolean {
  return process.env[CLOUD_VOICE_ENV] === '1';
}

/** Raised when something tries to reach a cloud voice provider under the canon. */
export class CloudVoiceForbidden extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(
      `cloud voice is not available under the current sovereignty policy (${reason}). ` +
      `MAIA speaks locally or not at all; set ${CLOUD_VOICE_ENV}=1 to change that deliberately.`,
    );
    this.name = 'CloudVoiceForbidden';
    this.reason = reason;
  }
}

/** Throws unless cloud voice is explicitly permitted. */
export function assertCloudVoiceAllowed(reason: string): void {
  if (!cloudVoicePermitted()) throw new CloudVoiceForbidden(reason);
}

/**
 * What a member's stored preference resolves to under the canon.
 *
 * ⭐ The stored value is NEVER rewritten. A member who chose "cloud" still has
 * "cloud" in their settings; it simply does not resolve to a cloud provider
 * today. Silently editing member data to match a policy change would be the
 * system deciding what they meant.
 *
 * ⭐ A stored "cloud" preference resolves to LOCAL, not to silence. The canon
 * names LOCAL as the DEFAULT, and cloud as unavailable — so a member whose
 * choice is unavailable falls to the default like anyone who never chose.
 * Serving silence would punish them for selecting an option the system offered.
 */
export function resolveVoicePreference(stored: string | null | undefined): {
  effective: 'local';
  stored: string;
  cloudRequestedButUnavailable: boolean;
} {
  const s = (stored || 'auto').toLowerCase();
  return {
    effective: 'local',
    stored: s,
    cloudRequestedButUnavailable: s === 'cloud' && !cloudVoicePermitted(),
  };
}
