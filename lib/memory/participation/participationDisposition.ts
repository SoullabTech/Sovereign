/**
 * CMT-01 — Participation Disposition Contract (typed form).
 *
 * Founder ruling 2026-09-03. Governing document:
 *   docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md
 *
 * A type-contract refinement with NO behaviour change and NO live caller. The canonical
 * participation layer (CMT-01 Step 2) imports these dispositions rather than redeclaring
 * them; CDPI depends on `HELD` and may not define it.
 *
 * CONSTITUTION (inherited verbatim from CC-A, lib/memory/provenance/turnMemoryProvenance.ts)
 *   A manifest entry carries identifiers, classes, counts, booleans, versions and hashes only.
 *   No member content, transcript, relational inference, PHI, hypothesis body or prompt body
 *   may enter one. The entry shape has no body field, and `assertManifestEntry` refuses
 *   unknown keys so a body cannot be smuggled in under another name.
 *
 * LOAD-BEARING DISTINCTION
 *   HELD  ≠  EXCLUDED.
 *   EXCLUDED: not constitutionally eligible.
 *   HELD:     legitimately considered, deliberately kept out of this turn's encounter.
 *   The two carry disjoint reason-code sets so the distinction is structural.
 *
 * HELD is an ephemeral participation disposition, not a persistence category. It does not
 * increase epistemic authority, and a later turn may reconsider a held candidate.
 */

/** Bump when the disposition set or entry shape changes in a way a reader must notice. */
export const PARTICIPATION_CONTRACT_VERSION = 'pdc-1';

/**
 * The closed disposition set, in adjudication order. AVAILABLE is the only non-final state:
 * it means "entered adjudication, not yet dispositioned" — never "quietly withheld".
 */
export const PARTICIPATION_DISPOSITIONS = [
  'AVAILABLE',
  'HELD',
  'OFFERED',
  'ADMITTED',
  'EXCLUDED',
] as const;
export type ParticipationDisposition = (typeof PARTICIPATION_DISPOSITIONS)[number];

/** Every disposition a completed turn may leave a candidate in. */
export const FINAL_DISPOSITIONS = ['HELD', 'OFFERED', 'ADMITTED', 'EXCLUDED'] as const;
export type FinalDisposition = (typeof FINAL_DISPOSITIONS)[number];

/** Dispositions under which anything at all may reach the speaking context. HELD is not one. */
export const SPEAKING_DISPOSITIONS = ['OFFERED', 'ADMITTED'] as const;
export type SpeakingDisposition = (typeof SPEAKING_DISPOSITIONS)[number];

/** Why a legitimately considered candidate is kept out of THIS turn's encounter. */
export const HELD_REASON_CODES = [
  'NO_SURFACING_WARRANT',
  'NO_RETURN_WARRANT',
  'INSUFFICIENT_STRENGTH',
  'CONTRADICTORY',
  'SENSITIVE_RETAINED',
  'WITHHELD_BY_JUDGMENT',
] as const;
export type HeldReasonCode = (typeof HELD_REASON_CODES)[number];

/** Why a candidate is not constitutionally eligible to participate. */
export const EXCLUDED_REASON_CODES = [
  'INSUFFICIENT_PROVENANCE',
  'INSUFFICIENT_AUTHORITY',
  'NO_PERMISSION',
  'INELIGIBLE_CLASS',
  'SANCTUARY',
] as const;
export type ExcludedReasonCode = (typeof EXCLUDED_REASON_CODES)[number];

/**
 * One row of a turn participation manifest: an epistemic class, how many candidates of that
 * class received this disposition, and — for HELD / EXCLUDED — why. Nothing else. There is
 * deliberately no field in which a body could travel.
 */
export type ParticipationManifestEntry =
  | { epistemicClass: string; disposition: 'HELD'; count: number; reasonCode: HeldReasonCode }
  | { epistemicClass: string; disposition: 'EXCLUDED'; count: number; reasonCode: ExcludedReasonCode }
  | { epistemicClass: string; disposition: 'OFFERED' | 'ADMITTED'; count: number };

const ENTRY_KEYS = new Set(['epistemicClass', 'disposition', 'count', 'reasonCode']);

export function isFinalDisposition(d: string): d is FinalDisposition {
  return (FINAL_DISPOSITIONS as readonly string[]).includes(d);
}

/** Invariant 1: HELD content never enters canonical speaking composition. */
export function mayEnterSpeakingContext(d: ParticipationDisposition): d is SpeakingDisposition {
  return (SPEAKING_DISPOSITIONS as readonly string[]).includes(d);
}

/**
 * Invariant 3: class / count / reason only. Refuses unknown keys (a body under any name),
 * a non-final disposition, a HELD or EXCLUDED entry without a reason, a reason from the
 * wrong set, and a non-integer or negative count.
 */
export function assertManifestEntry(value: unknown): asserts value is ParticipationManifestEntry {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('participation manifest entry must be an object');
  }
  const rec = value as Record<string, unknown>;
  for (const key of Object.keys(rec)) {
    if (!ENTRY_KEYS.has(key)) {
      throw new Error(`participation manifest entry carries a non-contract key: ${key}`);
    }
  }
  if (typeof rec.epistemicClass !== 'string' || rec.epistemicClass.length === 0) {
    throw new Error('participation manifest entry requires a non-empty epistemicClass');
  }
  if (typeof rec.disposition !== 'string' || !isFinalDisposition(rec.disposition)) {
    throw new Error(
      `participation manifest entry disposition must be final (${FINAL_DISPOSITIONS.join(' | ')}), got ${String(rec.disposition)}`,
    );
  }
  if (typeof rec.count !== 'number' || !Number.isInteger(rec.count) || rec.count < 0) {
    throw new Error('participation manifest entry count must be a non-negative integer');
  }
  const reason = rec.reasonCode;
  if (rec.disposition === 'HELD') {
    if (!(HELD_REASON_CODES as readonly unknown[]).includes(reason)) {
      throw new Error(`HELD entry requires a HELD reason code, got ${String(reason)}`);
    }
  } else if (rec.disposition === 'EXCLUDED') {
    if (!(EXCLUDED_REASON_CODES as readonly unknown[]).includes(reason)) {
      throw new Error(`EXCLUDED entry requires an EXCLUDED reason code, got ${String(reason)}`);
    }
  } else if (reason !== undefined) {
    throw new Error(`${rec.disposition} entry may not carry a reason code`);
  }
}

/**
 * AVAILABLE, tightened: for a completed turn nothing remains AVAILABLE. Every considered
 * candidate has received exactly one final disposition.
 */
export function assertTurnDispositioned(entries: readonly unknown[]): asserts entries is readonly ParticipationManifestEntry[] {
  for (const entry of entries) {
    if (
      typeof entry === 'object' &&
      entry !== null &&
      (entry as { disposition?: unknown }).disposition === 'AVAILABLE'
    ) {
      throw new Error('completed turn left a candidate AVAILABLE — every considered candidate must be dispositioned');
    }
    assertManifestEntry(entry);
  }
}
