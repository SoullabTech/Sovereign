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

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE-SOVEREIGNTY-03 — DESKTOP-TTS-ALLOY-POLICY-MISMATCH-01
// Founder ruling, 2026-08-29: MEMBER ACT, NOT INFERENCE.
// ═══════════════════════════════════════════════════════════════════════════════
//
// ⭐ THE RULING, in one line:
//
//     Choosing MAIA's voice identity is not the same act as consenting to
//     cloud egress.
//
// `maia_core → OpenAI Alloy` says which voice the member wants. It does not say
// "I consent to sending the text of my conversations to OpenAI for synthesis."
// Two axes, deliberately not collapsed:
//
//     VOICE IDENTITY     maia_core → Alloy        which voice
//     EGRESS CONSENT     local / cloud            whether text may leave
//
// ⛔ CONSENT IS NEVER INFERRED. Not from `maia_core`, not from `Alloy`, not from
//    `auto`, not from an existing default voice, and not from the presence of an
//    OpenAI key. A voice pick MAY INITIATE the consent request. It MAY NOT
//    SUBSTITUTE for it.
//
// ⭐ BOTH GATES ARE REQUIRED, and they are different kinds of thing:
//
//     member consent          stored tts_provider = 'cloud'   (a member act)
//     deployment permission   MAIA_ALLOW_CLOUD_VOICE=1        (an operator act)
//
//    Neither implies the other. An operator cannot consent on a member's behalf
//    by setting a flag; a member cannot open egress on a deployment that forbids
//    it. This mirrors the Daily Anchor `surface_preference` model, where
//    eligibility originates from a member act and the deploy flag is only ever a
//    kill-switch.
//
// ── WHY THIS FUNCTION EXISTS ────────────────────────────────────────────────
//
// The router's escapes previously answered "may I reach the cloud?" and nothing
// else, so a refusal could say only "no". A member then heard silence, and
// silence cannot be acted on: it is indistinguishable from a broken service. To
// let the surface raise the gesture, the refusal has to also say WHICH gate is
// closed and whether a member act could open it — without that classification
// living in the surface, where it would drift.

/**
 * Which gate is closed, and whether a member act can open it.
 *
 * ⭐ Deliberately NOT a boolean. "May I reach the cloud?" has one bit of answer,
 * and a member cannot act on one bit: silence and refusal look identical. Each
 * state below names WHO can change it — member, operator, or nobody — because
 * that is what decides whether a surface should ask, explain, or stay quiet.
 */
export type CloudVoiceGate =
  /** Member consented AND the deployment permits. Cloud synthesis may proceed. */
  | { state: 'cloud_allowed'; storedPreference: string }
  /**
   * The requested identity is cloud-backed, the deployment permits cloud voice,
   * and the member has not chosen it.
   *
   * ⭐ The ONLY state in which a surface may raise the consent gesture. It is
   * also the only state where asking is honest: the member has not answered, and
   * their answer would actually change the outcome.
   */
  | {
      state: 'consent_required';
      storedPreference: string;
      identity: CloudVoiceIdentity;
    }
  /**
   * The deployment forbids cloud voice. NOT a consent question, whatever the
   * member stored — agreeing would change nothing, so asking would be theatre.
   * Only an operator can open this.
   */
  | { state: 'cloud_unavailable'; storedPreference: string }
  /**
   * Nothing is closed and nothing is asked: either the member's own preference
   * is local, or the requested identity is not cloud-backed in the first place.
   * The sovereign default working as intended.
   */
  | { state: 'local_preferred'; storedPreference: string };

/**
 * The voice the member asked for, named for the gesture and the audit trail.
 *
 * ⛔ Naming a voice is not proposing it. This descriptor never influences the
 *    decision — `identityIsCloudBacked` does. Keeping the two apart is what
 *    stops "which voice" from quietly becoming "which data boundary".
 */
export interface CloudVoiceIdentity {
  /** e.g. 'maia_core' — internal ID, never shown to members. */
  archetype: string | null;
  /** e.g. 'Maia' — the member-facing name. */
  label: string | null;
  /** e.g. 'openai' */
  provider: string;
  /** e.g. 'alloy' */
  voice: string | null;
}

/**
 * Classify the cloud-voice gate for one request. Pure: every input is passed in,
 * except the deployment flag, which is read at call time and never cached.
 *
 * @param stored  the member's stored provider preference, VERBATIM. Pass what
 *                the member actually set — never a literal, and never a value
 *                derived from their voice identity. Handing this function a
 *                fabricated 'auto' is the original defect
 *                (DESKTOP-TTS-ALLOY-POLICY-MISMATCH-01, D1).
 * @param identityIsCloudBacked  whether the voice the member selected is served
 *                by a cloud provider. Computed by the caller from the voice
 *                registry, so this module stays pure and cannot be made to
 *                depend on the archetype table.
 * @param identity  descriptor for the gesture and telemetry. Never consulted in
 *                the decision.
 */
export function classifyCloudVoiceGate(
  stored: string | null | undefined,
  identityIsCloudBacked: boolean,
  identity: CloudVoiceIdentity | null = null,
): CloudVoiceGate {
  const pref = resolveVoicePreference(stored);
  const storedPreference = pref.stored;

  // ⛔ Deployment permission is checked FIRST and refuses unconditionally.
  //    "MAIA_ALLOW_CLOUD_VOICE absent → cloud unavailable regardless of member
  //    preference" — so a member who stored 'cloud' is told the deployment
  //    refuses, and a member who stored nothing is never asked a question whose
  //    answer could not be honoured.
  if (!cloudVoicePermitted()) {
    return { state: 'cloud_unavailable', storedPreference };
  }

  // Member consented and the deployment permits: both gates open.
  if (pref.effective === 'cloud') {
    return { state: 'cloud_allowed', storedPreference };
  }

  // ⛔ 'local' is a CHOICE and is never re-litigated by a prompt. Only the
  //    ABSENCE of a choice may be asked about — and asking is not inferring,
  //    because the answer still has to come from the member.
  if (storedPreference === 'local') {
    return { state: 'local_preferred', storedPreference };
  }

  // `auto` (or unset) + a cloud-backed identity + a permitting deployment.
  // The one state where the gesture is honest.
  if (identityIsCloudBacked) {
    return {
      state: 'consent_required',
      storedPreference,
      identity: identity ?? { archetype: null, label: null, provider: 'openai', voice: null },
    };
  }

  // The member picked a locally-served voice. There is no egress question to
  // ask, so none is asked.
  return { state: 'local_preferred', storedPreference };
}
