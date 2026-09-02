/**
 * Member consent gates — the single source of truth for memory-layer recall consent.
 *
 * Authority:
 *   docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P2
 *   docs/architecture/MAIA_INTELLIGENCE_PARTICIPATION_ARCHITECTURE_v0.1.md §8
 *
 * ── THE INVARIANT THIS MODULE EXISTS TO MAKE STRUCTURAL ─────────────────────
 *
 *   READ IMPLIES WRITABLE.
 *   Every column read as a consent gate on a live path is writable by the
 *   member through an authenticated surface.
 *
 * A gate the member cannot set is not consent. It is a default wearing a
 * consent-shaped name.
 *
 * ── WHY A MODULE RATHER THAN A CONVENTION ───────────────────────────────────
 *
 * The defect this closes (census §6.1): `members.episodic_recall_enabled` was
 * added by migration 20260531000001, read on every authenticated turn by
 * `loadEpisodicRecallPref`, and absent from the preferences route's
 * `RECALL_PREFERENCE_COLUMNS` — a constant that file documents as "the single
 * source of truth for which gates exist". The loader shipped ahead of the
 * surface, and nothing detected the divergence, because the reader and the
 * writer each held their own list.
 *
 * Two lists cannot be kept in sync by remembering. So there is now one:
 * `MEMBER_CONSENT_GATES` below. The reader takes its permissible keys FROM it
 * (`ConsentGateName`), and the preferences route takes its exposed columns FROM
 * it. Read-set and write-set are therefore the same object, not two objects
 * asserted to be equal.
 *
 * Reading a gate that is not member-writable is a COMPILE ERROR, because there
 * is no `ConsentGateName` for it. That is the Phase 0 design target applied to
 * itself: invalid states unrepresentable rather than merely discouraged.
 *
 * ── WHAT THIS MODULE DOES NOT DO ────────────────────────────────────────────
 *
 *   - Does NOT write. Reads only; the preferences route owns the write path.
 *   - Does NOT decide what a gate means. It reads a boolean; the consuming
 *     layer's formatter owns suppression semantics.
 *   - Does NOT add, remove, or change any gate's default. Both gates below
 *     already exist in schema with DEFAULT TRUE and are already read today.
 *   - Does NOT gate anything new. Adding a gate here does not create consent
 *     machinery — it declares a gate that already exists in the members table.
 *
 * ── ADDING A GATE ───────────────────────────────────────────────────────────
 *
 * One entry here + one column on `members` + (for discoverability) one toggle
 * in the member-facing settings surface. Adding the entry is what makes the
 * gate simultaneously readable and writable; there is no way to add one
 * without the other.
 */

import { query } from '@/lib/db/postgres';

/**
 * Every member-level consent gate that governs whether a memory layer may
 * surface. Both the loaders and `/api/members/recall-preferences` derive their
 * column sets from this object.
 *
 * `layer` and `description` are documentation carried in code so the gate's
 * meaning travels with its name; nothing reads them at runtime today.
 */
export const MEMBER_CONSENT_GATES = {
  conversational_recall_enabled: {
    layer: 'conversational',
    description:
      'Prior cross-session exchanges may surface into MAIA\'s prompt with provenance grounding.',
    authority: 'docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md §II.A',
  },
  episodic_recall_enabled: {
    layer: 'episodic',
    description:
      'Member-marked significant moments may surface into MAIA\'s prompt, verbatim.',
    authority: 'database/migrations/20260531000001_episodic_member_marked_provenance.sql §5',
  },
} as const;

/**
 * Consent-shaped boolean columns on `members` that exist in schema but that
 * NOTHING READS YET. They are declared here, not in MEMBER_CONSENT_GATES,
 * because exposing a member toggle for a layer that does not surface would be
 * a UI claim without verified state — the project's standing doctrine forbids
 * it ("no static UI claim without verified state").
 *
 * This bucket is falsifiable, not a parking lot: the P2 certification test
 * asserts that every column listed here has ZERO readers. A gate cannot be
 * hidden here while being consulted — the moment a loader reads it, the test
 * fails and the gate must move into MEMBER_CONSENT_GATES (which makes it
 * member-writable) before that loader can ship.
 *
 * `recurrence_recall_enabled` — added by migration 20260601000001, default
 * TRUE, read by nothing. lib/maia/recurrenceDetector.ts:25 instructs a future
 * caller that it "MUST gate this behind members.recurrence_recall_enabled",
 * which is precisely how the episodic gate became unreachable: the intent was
 * recorded in a comment and the surface was never built. Listed here so the
 * next reader trips the gate instead of repeating it.
 */
export const DECLARED_UNREAD_GATES = ['recurrence_recall_enabled'] as const;

/**
 * Boolean columns on `members` that are NOT consent gates — account state,
 * capability flags, and onboarding progress. Classified explicitly so the
 * certification test can require that every boolean column on the table is
 * accounted for in exactly one bucket. A newly added column belongs to none of
 * the three until a human places it, and the test fails until then.
 */
export const NOT_CONSENT_GATES = [
  'onboarded',
  'is_practitioner',
  'email_verified',
  'has_webauthn',
  'has_oauth',
  'subscription_active',
  'guardian_required',
  'youth_onboarded',
  'must_reset_password',
  'first_descent_completed',
  'cm_environment_enabled',
  'tester',
  'attention_notifications_enabled',
  'orientation_seen',
] as const;

/**
 * The permissible gate names. A gate not in `MEMBER_CONSENT_GATES` cannot be
 * named here, so it cannot be read through `readConsentGate` — the compile
 * error is the enforcement.
 */
export type ConsentGateName = keyof typeof MEMBER_CONSENT_GATES;

/** Ordered list of gate column names. Used by the preferences route's SQL. */
export const CONSENT_GATE_NAMES = Object.keys(
  MEMBER_CONSENT_GATES,
) as ConsentGateName[];

/** Runtime narrowing for request bodies, which arrive untyped. */
export function isConsentGateName(key: string): key is ConsentGateName {
  return Object.prototype.hasOwnProperty.call(MEMBER_CONSENT_GATES, key);
}

/**
 * Read one member consent gate.
 *
 * DEFAULT-ON OPT-OUT DOCTRINE, preserved exactly as the two prior readers
 * implemented it: the gate is TRUE unless explicitly FALSE. Missing member,
 * NULL column, missing input and DB error all resolve TRUE, so a conversation
 * never blocks on a preference lookup and a transient failure never silently
 * withholds a layer the member has not opted out of.
 *
 * NOTE ON THE DIRECTION OF THIS FAILURE MODE. Defaulting TRUE on error is
 * fail-OPEN with respect to surfacing, which is the inverse of MIPA's
 * withhold-by-default posture. It is preserved unchanged here because P2 is a
 * structural-parity repair and must not alter live return behavior: changing
 * it would suppress recall for members who never opted out, every time the DB
 * hiccups. Whether these gates should fail closed is a participation-policy
 * question for a later phase, and is recorded as such — not decided here.
 */
export async function readConsentGate(
  memberId: string,
  gate: ConsentGateName,
): Promise<boolean> {
  if (!memberId) return true;
  try {
    // `gate` is a key of MEMBER_CONSENT_GATES, never caller-supplied text —
    // the type system is the allowlist. No interpolation of user input.
    const result = await query<Record<string, boolean | null>>(
      `SELECT ${gate} FROM members WHERE id = $1 LIMIT 1`,
      [memberId],
    );
    if (result.rows.length === 0) return true; // member not found → default-on
    return result.rows[0][gate] !== false;
  } catch (err) {
    console.warn(`[consentGates] read failed for ${gate} (non-fatal):`, err);
    return true; // graceful: default-on
  }
}
