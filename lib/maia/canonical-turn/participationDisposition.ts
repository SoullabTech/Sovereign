/**
 * CMT-01 — Participation Disposition Contract (typed form, `pdc-1`).
 *
 * Founder ruling 2026-09-03. Governing document:
 *   docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md
 * Bound into the architecture spec at §5.2 (axes), §6.3 (dispositions), §7.2 (manifest rows).
 *
 * Type contract only. No adjudication logic, no I/O, no live caller until M1.
 *
 * CONSTITUTION (inherited verbatim from CC-A, lib/memory/provenance/turnMemoryProvenance.ts)
 *   A manifest row carries identifiers, classes, counts, booleans, versions and digests only.
 *   No member content, transcript, relational inference, PHI, hypothesis body or prompt body
 *   may enter one. The row shapes have no body field and `assertManifestEntry` refuses
 *   unknown keys, so a body cannot be smuggled in under another name.
 *
 * TWO RULINGS ENCODED HERE
 *   1. A candidate's provenance is three axes, not one scalar. The scalar epistemic class
 *      conflated authorship, participation mechanism and authority; `HELD` must not become a
 *      way of losing that distinction.
 *   2. Every final disposition has a machine-readable basis. OFFERED is a permission-bearing
 *      disclosure act, ADMITTED a participation act — both must be provable later, so neither
 *      is exempt. Reason families are closed and disjoint across the four final states.
 *
 * HELD ≠ EXCLUDED. Excluded: not constitutionally eligible. Held: legitimately considered,
 * deliberately kept out of this turn's encounter. Ephemeral; no persistence implied; no gain
 * in authority; a later turn may reconsider.
 */

export const PARTICIPATION_CONTRACT_VERSION = 'pdc-1';

// ── Provenance axes (§5.2, ratified as amended) ─────────────────────────────

export const AUTHORED_BY = ['house', 'member', 'practitioner', 'system', 'collective'] as const;
export type AuthoredBy = (typeof AUTHORED_BY)[number];

export const PARTICIPATION_CLASS = [
  'constitutional',
  'authored',
  'placed',
  'marked',
  'declared',
  'retrieved',
  'computed',
  'inferred',
  'collective',
] as const;
export type ParticipationClass = (typeof PARTICIPATION_CLASS)[number];

export const AUTHORITY = ['situate', 'compute', 'infer'] as const;
export type Authority = (typeof AUTHORITY)[number];

/** What a candidate IS, before any adjudication of whether it may participate. */
export interface ParticipationIdentity {
  authoredBy: AuthoredBy;
  participationClass: ParticipationClass;
  authority: Authority;
}

/**
 * The pre-ruling scalar classes from spec §5.2 / §5.3, mapped onto the axes so the v1
 * registry seed can be transcribed without re-deciding any row. Migration aid only.
 */
export const LEGACY_EPISTEMIC_CLASS_TO_AXES = {
  constitutional:        { authoredBy: 'house',        participationClass: 'constitutional', authority: 'situate' },
  house_authored:        { authoredBy: 'house',        participationClass: 'authored',       authority: 'situate' },
  member_authored:       { authoredBy: 'member',       participationClass: 'authored',       authority: 'situate' },
  member_placed:         { authoredBy: 'member',       participationClass: 'placed',         authority: 'situate' },
  member_marked:         { authoredBy: 'member',       participationClass: 'marked',         authority: 'situate' },
  member_declared:       { authoredBy: 'member',       participationClass: 'declared',       authority: 'situate' },
  system_retrieved:      { authoredBy: 'system',       participationClass: 'retrieved',      authority: 'situate' },
  system_computed:       { authoredBy: 'system',       participationClass: 'computed',       authority: 'compute' },
  system_inferred:       { authoredBy: 'system',       participationClass: 'inferred',       authority: 'infer' },
  practitioner_authored: { authoredBy: 'practitioner', participationClass: 'authored',       authority: 'situate' },
  collective:            { authoredBy: 'collective',   participationClass: 'collective',     authority: 'situate' },
} as const satisfies Record<string, ParticipationIdentity>;
export type LegacyEpistemicClass = keyof typeof LEGACY_EPISTEMIC_CLASS_TO_AXES;

// ── Dispositions (§6.3) ─────────────────────────────────────────────────────

/** Closed set, in adjudication order. AVAILABLE is the only non-final state. */
export const PARTICIPATION_DISPOSITIONS = ['AVAILABLE', 'HELD', 'OFFERED', 'ADMITTED', 'EXCLUDED'] as const;
export type ParticipationDisposition = (typeof PARTICIPATION_DISPOSITIONS)[number];

export const FINAL_DISPOSITIONS = ['HELD', 'OFFERED', 'ADMITTED', 'EXCLUDED'] as const;
export type FinalDisposition = (typeof FINAL_DISPOSITIONS)[number];

/** Under which anything at all may reach the speaking context. HELD is not one. */
export const SPEAKING_DISPOSITIONS = ['OFFERED', 'ADMITTED'] as const;
export type SpeakingDisposition = (typeof SPEAKING_DISPOSITIONS)[number];

// ── Reason families — v1 seed, closed, disjoint ─────────────────────────────
// The exact codes belong to MIPA implementation (M1) and will grow there. What is fixed is
// the shape: one closed family per final state, no overlap, no free text.

export const HELD_REASONS = [
  'loader_error',
  'sanctuary',
  'recall_pref_off',
  'room_policy',
  'inference_cap',
  'no_surfacing_warrant',
  'no_return_warrant',
  'insufficient_strength',
] as const;
/** `restraint:<rule>` names the policy rule that held the candidate — structured, not prose. */
export type HeldReason = (typeof HELD_REASONS)[number] | `restraint:${string}`;

export const OFFERED_REASONS = ['member_contextual_doorway', 'member_requested_exploration'] as const;
export type OfferedReason = (typeof OFFERED_REASONS)[number];

export const ADMITTED_REASONS = ['eligible', 'member_invoked', 'member_placed', 'mandatory_floor'] as const;
export type AdmittedReason = (typeof ADMITTED_REASONS)[number];

export const EXCLUDED_REASONS = [
  'no_verified_member',
  'room_forbids',
  'consent_absent',
  'not_registered_for_room',
  'insufficient_provenance',
  'no_permission',
] as const;
export type ExcludedReason = (typeof EXCLUDED_REASONS)[number];

// ── Manifest rows (§7.2) ────────────────────────────────────────────────────

interface EntryBase extends ParticipationIdentity {
  /** Narrows to the registry's closed `ProducerId` union once PRODUCER_REGISTRY lands (M1). */
  producerId: string;
  itemCount?: number;
}
/** Nothing rendered → nothing to size or digest. */
export interface HeldEntry extends EntryBase { disposition: 'HELD'; reason: HeldReason }
export interface ExcludedEntry extends EntryBase { disposition: 'EXCLUDED'; reason: ExcludedReason }
/** Rendered → sized and digested, never quoted. */
export interface OfferedEntry extends EntryBase { disposition: 'OFFERED'; reason: OfferedReason; chars: number; blockDigest: string }
export interface AdmittedEntry extends EntryBase { disposition: 'ADMITTED'; reason: AdmittedReason; chars: number; blockDigest: string }

export type ParticipationManifestEntry = HeldEntry | OfferedEntry | AdmittedEntry | ExcludedEntry;

const ENTRY_KEYS = new Set([
  'producerId', 'authoredBy', 'participationClass', 'authority',
  'disposition', 'reason', 'itemCount', 'chars', 'blockDigest',
]);

function oneOf(list: readonly string[], v: unknown): v is string {
  return typeof v === 'string' && list.includes(v);
}

export function isFinalDisposition(d: unknown): d is FinalDisposition {
  return oneOf(FINAL_DISPOSITIONS, d);
}

export function isHeldReason(r: unknown): r is HeldReason {
  return oneOf(HELD_REASONS, r) || (typeof r === 'string' && /^restraint:[A-Za-z0-9_.-]+$/.test(r));
}

/** Invariant: HELD content never enters canonical speaking composition. */
export function mayEnterSpeakingContext(d: ParticipationDisposition): d is SpeakingDisposition {
  return oneOf(SPEAKING_DISPOSITIONS, d);
}

function fail(msg: string): never {
  throw new Error(`participation manifest entry: ${msg}`);
}

/**
 * Refuses: unknown keys (a body under any name); a non-final disposition; a missing axis;
 * a reason outside the disposition's own family; a rendered-only field on HELD/EXCLUDED;
 * a missing `chars`/`blockDigest` on OFFERED/ADMITTED; a malformed count.
 */
export function assertManifestEntry(value: unknown): asserts value is ParticipationManifestEntry {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail('must be an object');
  const rec = value as Record<string, unknown>;
  for (const key of Object.keys(rec)) if (!ENTRY_KEYS.has(key)) fail(`non-contract key: ${key}`);

  if (typeof rec.producerId !== 'string' || rec.producerId.length === 0) fail('requires producerId');
  if (!oneOf(AUTHORED_BY, rec.authoredBy)) fail(`authoredBy must be one of ${AUTHORED_BY.join('|')}`);
  if (!oneOf(PARTICIPATION_CLASS, rec.participationClass)) fail(`participationClass must be one of ${PARTICIPATION_CLASS.join('|')}`);
  if (!oneOf(AUTHORITY, rec.authority)) fail(`authority must be one of ${AUTHORITY.join('|')}`);
  if (!isFinalDisposition(rec.disposition)) fail(`disposition must be final (${FINAL_DISPOSITIONS.join('|')}), got ${String(rec.disposition)}`);
  if (rec.itemCount !== undefined && (typeof rec.itemCount !== 'number' || !Number.isInteger(rec.itemCount) || rec.itemCount < 0)) {
    fail('itemCount must be a non-negative integer');
  }

  const d = rec.disposition;
  const reasonOk =
    d === 'HELD' ? isHeldReason(rec.reason)
    : d === 'OFFERED' ? oneOf(OFFERED_REASONS, rec.reason)
    : d === 'ADMITTED' ? oneOf(ADMITTED_REASONS, rec.reason)
    : oneOf(EXCLUDED_REASONS, rec.reason);
  if (!reasonOk) fail(`${d} requires a reason from the ${d} family, got ${String(rec.reason)}`);

  const rendered = d === 'OFFERED' || d === 'ADMITTED';
  if (rendered) {
    if (typeof rec.chars !== 'number' || !Number.isInteger(rec.chars) || rec.chars < 0) fail(`${d} requires integer chars`);
    if (typeof rec.blockDigest !== 'string' || rec.blockDigest.length === 0) fail(`${d} requires blockDigest`);
  } else if (rec.chars !== undefined || rec.blockDigest !== undefined) {
    fail(`${d} rendered nothing and may not carry chars/blockDigest`);
  }
}

/** AVAILABLE, tightened: a completed turn leaves no candidate undispositioned. */
export function assertTurnDispositioned(entries: readonly unknown[]): asserts entries is readonly ParticipationManifestEntry[] {
  for (const entry of entries) {
    if (typeof entry === 'object' && entry !== null && (entry as { disposition?: unknown }).disposition === 'AVAILABLE') {
      fail('completed turn left a candidate AVAILABLE — every considered candidate must be dispositioned');
    }
    assertManifestEntry(entry);
  }
}
