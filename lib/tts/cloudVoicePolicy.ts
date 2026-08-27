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
 * Founder canon ruling, 2026-08-27 (SECOND PASS) — what re-permission means:
 *
 *   MAIA_ALLOW_CLOUD_VOICE=1 permits cloud voice to HONOUR AN EXPLICIT MEMBER
 *   CHOICE. It does NOT restore OpenAI as the automatic preferred provider.
 *   `auto` remains sovereign-local even when cloud is technically available.
 *   See `resolveVoicePreference` below for the full matrix.
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
 * ── THE MATRIX ──────────────────────────────────────────────────────────────
 *
 *   MAIA_ALLOW_CLOUD_VOICE unset/0        MAIA_ALLOW_CLOUD_VOICE=1
 *   (current canon)                       (explicit re-permission)
 *
 *     cloud  ->  local                      cloud  ->  cloud
 *     auto   ->  local                      auto   ->  local
 *     local  ->  local                      local  ->  local
 *     unset  ->  local                      unset  ->  local
 *
 * ⭐ Founder ruling, 2026-08-27 (second pass). The flag means "cloud voice is
 * permitted to HONOUR AN EXPLICIT MEMBER CHOICE" — it does NOT mean "OpenAI
 * becomes the automatic preferred provider again."
 *
 * `auto` stays sovereign-local even when cloud is technically available. That
 * one row is the whole ruling: `auto` is the absence of a choice, and the
 * absence of a choice must never be read as consent to leave the local machine.
 * The original violation was precisely an `auto`-shaped default reaching the
 * cloud, so re-permission must not restore it by the back door.
 *
 * ⭐ `cloud` means an explicit member request, never an availability-driven
 * default. Availability decides whether a choice can be served; it never
 * decides what the choice was.
 *
 * ── WHEN THE CHOSEN CLOUD PROVIDER IS UNAVAILABLE ───────────────────────────
 *
 *     cloud preference + cloud unavailable  ->  local, if local is healthy
 *                                           ->  otherwise text
 *
 * Not silence, and not some other unconsented cloud provider. Consent to one
 * named provider is not consent to the category.
 *
 * ⭐ The stored value is NEVER rewritten. A member who chose "cloud" still has
 * "cloud" in their settings even while it resolves local. Silently editing
 * member data to match a policy change would be the system deciding what they
 * meant.
 */
export function resolveVoicePreference(stored: string | null | undefined): {
  /** What the request should actually route to. */
  effective: 'local' | 'cloud';
  /** Exactly what the member stored, unmodified. */
  stored: string;
  /** Member asked for cloud, and the canon cannot serve it today. */
  cloudRequestedButUnavailable: boolean;
} {
  const s = (stored || 'auto').toLowerCase();
  const explicitCloud = s === 'cloud';
  const permitted = cloudVoicePermitted();

  return {
    // ⛔ ONLY an explicit stored "cloud" reaches cloud, and only under explicit
    // re-permission. "auto" is deliberately absent from this condition.
    effective: explicitCloud && permitted ? 'cloud' : 'local',
    stored: s,
    cloudRequestedButUnavailable: explicitCloud && !permitted,
  };
}
