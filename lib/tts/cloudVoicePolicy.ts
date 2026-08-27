/**
 * VOICE-SOVEREIGNTY — where MAIA's voice is allowed to be synthesized.
 *
 * ── FOUNDER CANON RULING, 2026-08-27 (THIRD PASS — CURRENT) ─────────────────
 *
 *   NORMAL / AUTO / UNSET   Alloy (cloud) first
 *   EXPLICIT CLOUD          Alloy
 *   EXPLICIT LOCAL          Kokoro only, no cloud path
 *   SANCTUARY               Kokoro forced — no cloud path, no cloud fallback
 *   ALLOY FAILURE           Kokoro fallback for ordinary sessions
 *   KOKORO FAILURE          text, when local-only or Sanctuary
 *
 * Why this reverses the two earlier passes: it is a QUALITY ruling, not an
 * ideological one. Alloy is the preferred MAIA conversational voice on direct
 * comparative member experience. `af_kore` is not perceptually equivalent.
 * Local/open-source remains the strategic replacement path and must genuinely
 * match or exceed Alloy — on naturalness, warmth, responsiveness, emotional
 * range, pacing, reliability and latency — before it is promoted back.
 *
 * Kokoro is therefore MAIA's SOVEREIGN/LOCAL PATH AND FALLBACK. It is not
 * MAIA's default voice, and this module should not be read as saying so.
 *
 * ── THE TWO EARLIER PASSES, AND WHAT SURVIVES THEM ──────────────────────────
 *
 * FIRST PASS (2026-08-27) made local the production authority after the log
 * showed `[tts.attempt] provider:"openai" reason:"auto/cloud lead"` on ordinary
 * turns while Kokoro was healthy — the implementation leading with the cloud,
 * against CLAUDE.md. SECOND PASS narrowed re-permission so a flag could honour
 * an explicit member choice without restoring cloud as the automatic default.
 *
 * Both rulings were about an `auto`-shaped default reaching the cloud WITHOUT
 * anyone deciding it should. This third pass decides it, deliberately, in the
 * open, with disclosure and a Sanctuary floor attached. That is the difference
 * between drift and an amendment, and it is the only reason this reversal is
 * legitimate.
 *
 * WHAT DOES NOT CHANGE, and must not be quietly re-litigated later:
 *
 *   ⭐ Sanctuary NEVER leaves the machine. Not on preference, not on failure,
 *      not on a flag. It is the one row with no escape, because Sanctuary is a
 *      promise made in UI copy — "This session won't be remembered. Speak
 *      freely." — and a promise that bends under load was never a promise.
 *   ⭐ An explicit `local` member is never overridden by availability.
 *   ⭐ The stored preference is never rewritten to match policy.
 *   ⭐ Cloud synthesis is disclosed, never silent.
 *
 * ── WHY THIS MODULE EXISTS RATHER THAN SIX EDITS ────────────────────────────
 *
 * `ttsRouter` alone has six separate escapes to OpenAI. Repairing each one is
 * discipline, and discipline is what drifted in the first place. So the policy
 * lives in ONE place and every escape passes through it: the constructor of
 * `TTSFallbackToOpenAI` itself refuses to be built when cloud voice is
 * forbidden. A seventh escape added later inherits the refusal without anyone
 * remembering to guard it. That choke point is unchanged by this amendment —
 * only what it permits has changed.
 */

/** Env var that force-disables cloud voice entirely. "0" = local everywhere. */
export const CLOUD_VOICE_ENV = 'MAIA_ALLOW_CLOUD_VOICE';

/**
 * Is a cloud TTS provider permitted on the production voice path?
 *
 * ⭐ THIRD-PASS INVERSION. Under the previous canon this required an explicit
 * `=1`; the default was forbidden. The amendment makes cloud voice the default
 * and keeps the same variable as a KILL SWITCH: `MAIA_ALLOW_CLOUD_VOICE=0`
 * returns the whole deployment to local-only, immediately, without a code
 * change or a deploy.
 *
 * Read at call time, never cached — a deploy must not bake a stale answer in,
 * and the kill switch must take effect on the next turn.
 */
export function cloudVoicePermitted(): boolean {
  if (process.env[CLOUD_VOICE_ENV] === '0') return false;
  if (process.env.DISABLE_OPENAI_COMPLETELY === 'true') return false;
  return Boolean(process.env.OPENAI_API_KEY);
}

/** Raised when something tries to reach a cloud voice provider against policy. */
export class CloudVoiceForbidden extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(
      `cloud voice is not available for this request (${reason}). ` +
      `MAIA speaks locally or not at all on this path.`,
    );
    this.name = 'CloudVoiceForbidden';
    this.reason = reason;
  }
}

/** Throws unless cloud voice is permitted for this deployment. */
export function assertCloudVoiceAllowed(reason: string): void {
  if (!cloudVoicePermitted()) throw new CloudVoiceForbidden(reason);
}

/**
 * Context a voice request must declare before a provider can be chosen.
 *
 * ⭐ `sanctuary` is REQUIRED, not optional, and that is deliberate. An optional
 * flag is a flag someone forgets at the one call site that mattered. Making it
 * required means a new voice path cannot compile until its author has answered
 * "is this Sanctuary?" — structural, not disciplinary, in the same spirit as
 * the choke point above.
 */
export interface VoiceRequestContext {
  /** True when this turn belongs to a Sanctuary session. */
  sanctuary: boolean;
}

/**
 * What a member's stored preference resolves to under the current canon.
 *
 * ── THE MATRIX ──────────────────────────────────────────────────────────────
 *
 *                     cloud permitted (default)   MAIA_ALLOW_CLOUD_VOICE=0
 *                                                 or no API key (kill switch)
 *
 *     unset/auto  ->  cloud  (Alloy)              local
 *     cloud       ->  cloud  (Alloy)              local
 *     local       ->  local                       local
 *     SANCTUARY   ->  local  ALWAYS               local
 *
 * ⭐ The Sanctuary row is absolute and is evaluated FIRST. No preference, no
 * flag state and no provider outage can move it. A member in Sanctuary who has
 * stored "cloud" is still served locally, and their stored value is still not
 * rewritten — the session context decides this turn, not their settings.
 *
 * ── WHEN THE CHOSEN CLOUD PROVIDER IS UNAVAILABLE ───────────────────────────
 *
 *     cloud preference + cloud unavailable  ->  local, if local is healthy
 *                                           ->  otherwise text
 *
 * Not silence, and not some other unconsented cloud provider. Consent to one
 * named provider is not consent to the category.
 *
 * ⭐ The stored value is NEVER rewritten. A member who chose "local" still has
 * "local" in their settings; a member in Sanctuary still has whatever they
 * chose. Silently editing member data to match a policy or a session state
 * would be the system deciding what they meant.
 */
export function resolveVoicePreference(
  stored: string | null | undefined,
  context: VoiceRequestContext,
): {
  /** What the request should actually route to. */
  effective: 'local' | 'cloud';
  /** Exactly what the member stored, unmodified. */
  stored: string;
  /** Member asked for cloud, and this request cannot serve it. */
  cloudRequestedButUnavailable: boolean;
  /** Sanctuary forced this request local regardless of preference. */
  sanctuaryForcedLocal: boolean;
} {
  const s = (stored || 'auto').toLowerCase();
  const explicitLocal = s === 'local' || s === 'kokoro';
  const explicitCloud = s === 'cloud';
  const permitted = cloudVoicePermitted();

  // ⛔ Sanctuary first, and unconditionally. Everything below is irrelevant
  // once this is true.
  if (context.sanctuary) {
    return {
      effective: 'local',
      stored: s,
      cloudRequestedButUnavailable: false,
      sanctuaryForcedLocal: true,
    };
  }

  return {
    effective: !explicitLocal && permitted ? 'cloud' : 'local',
    stored: s,
    cloudRequestedButUnavailable: explicitCloud && !permitted,
    sanctuaryForcedLocal: false,
  };
}
