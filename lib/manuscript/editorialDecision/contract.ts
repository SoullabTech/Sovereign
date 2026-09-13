/**
 * EDITORIAL-DECISION-01 — the contract, as pure functions.
 *
 *   Standing records what you decide about an observation.
 *   Editorial decisions record what you decide about the Work.
 *
 * ⛔ A DECISION IS NOT A PROTO-REVISIONPROPOSAL. The body carries a ruling, an
 * intent and a principle — never prose, offsets, diff hunks or edit operations.
 * Those belong below the authority boundary, in machinery that does not exist
 * yet and is deliberately not anticipated here.
 */

export type DecisionAuthorship = 'member_authored' | 'member_confirmed_maia_proposal';

export const AUTHORSHIPS: readonly DecisionAuthorship[] =
  ['member_authored', 'member_confirmed_maia_proposal'];

export const isAuthorship = (v: unknown): v is DecisionAuthorship =>
  typeof v === 'string' && (AUTHORSHIPS as readonly string[]).includes(v);

/** One observation this ruling governs. ⛔ Explicit. Never inferred. */
export interface GovernedObservation {
  readonly readingId: string;
  readonly observationKey: string;
}

/**
 * ⭐ THE BODY. Three parts, one required.
 *
 * ⛔ There is deliberately NO field here that prose, a replacement, a range or
 * an operation could travel in. The absence is the law; `ED-8` asserts it over
 * this type rather than trusting the comment.
 */
export interface DecisionBody {
  /** The member-authorized editorial ruling. */
  readonly statement: string;
  /** What the writer is trying to preserve or accomplish. */
  readonly intent?: string;
  /** The craft principle agreed on. */
  readonly principle?: string;
}

export interface DecisionEvent extends DecisionBody {
  readonly id: string;
  readonly decisionChainId: string;
  readonly eventIndex: number;
  readonly workId: string;
  readonly governs: readonly GovernedObservation[];
  readonly authorship: DecisionAuthorship;
  /** Which state of the Work it was ruled against. ⛔ Never the prose itself. */
  readonly workingDraftId: string | null;
  readonly workingDraftVersion: number | null;
  readonly recordedAt: string;
}

export type DecisionRefusal =
  /** The reading is not this member's, or not in this Work, or absent. */
  | 'address_unresolved'
  /** The key does not resolve inside that frozen reading. */
  | 'observation_unknown'
  /** The token is not the chain's current event. ⛔ Never auto-retried. */
  | 'stale_expectation'
  /** Another act took this index between the snapshot and the write. */
  | 'simultaneous_write'
  /** The chain id was supplied but names no decision of this member's. */
  | 'chain_unknown'
  /** The request could not be read. */
  | 'malformed';

export type DecisionWriteResult =
  | { outcome: 'appended'; event: DecisionEvent }
  /** ⭐ Re-recording an identical ruling is NOT a new decision. */
  | { outcome: 'unchanged'; current: DecisionEvent }
  | { outcome: 'refused'; reason: DecisionRefusal };

export interface RecordDecisionRequest {
  /** Absent = open a new chain; the SERVER mints its identity. */
  readonly decisionChainId?: string;
  readonly expectedCurrentEventId: string | null;
  readonly body: DecisionBody;
  readonly governs: readonly GovernedObservation[];
  readonly authorship: DecisionAuthorship;
  readonly workingDraftId: string | null;
  readonly workingDraftVersion: number | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim().length > 0 ? v : undefined;

/**
 * ⛔ AN UNKNOWN FIELD IS A REFUSAL, not something to ignore. The forbidden body
 * — `proposedText`, `range`, `operation` — cannot arrive by being tolerated.
 */
export function parseRecordDecision(body: unknown): { ok: true; request: RecordDecisionRequest } | { ok: false } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false };
  const b = body as Record<string, unknown>;

  const allowed = ['decisionChainId', 'expectedCurrentEventId', 'statement', 'intent',
    'principle', 'governs', 'authorship', 'workingDraftId', 'workingDraftVersion'];
  if (Object.keys(b).some((k) => !allowed.includes(k))) return { ok: false };

  const statement = text(b.statement);
  if (!statement) return { ok: false };

  if (b.intent !== undefined && typeof b.intent !== 'string') return { ok: false };
  if (b.principle !== undefined && typeof b.principle !== 'string') return { ok: false };

  if (b.decisionChainId !== undefined
      && !(typeof b.decisionChainId === 'string' && UUID.test(b.decisionChainId))) return { ok: false };

  const expected = b.expectedCurrentEventId;
  if (expected !== null && !(typeof expected === 'string' && UUID.test(expected))) return { ok: false };

  if (!isAuthorship(b.authorship)) return { ok: false };

  if (!Array.isArray(b.governs) || b.governs.length === 0) return { ok: false };
  const governs: GovernedObservation[] = [];
  for (const g of b.governs) {
    if (typeof g !== 'object' || g === null) return { ok: false };
    const { readingId, observationKey } = g as Record<string, unknown>;
    if (typeof readingId !== 'string' || !UUID.test(readingId)) return { ok: false };
    if (typeof observationKey !== 'string' || observationKey.length === 0) return { ok: false };
    governs.push({ readingId, observationKey });
  }

  const draftId = b.workingDraftId ?? null;
  const draftVersion = b.workingDraftVersion ?? null;
  if (draftId !== null && !(typeof draftId === 'string' && UUID.test(draftId))) return { ok: false };
  if (draftVersion !== null && !Number.isInteger(draftVersion)) return { ok: false };
  /* Provenance is whole or absent — a version with no draft names nothing. */
  if ((draftId === null) !== (draftVersion === null)) return { ok: false };

  return {
    ok: true,
    request: {
      ...(b.decisionChainId ? { decisionChainId: b.decisionChainId as string } : {}),
      expectedCurrentEventId: expected as string | null,
      body: { statement, ...(text(b.intent) ? { intent: b.intent as string } : {}),
        ...(text(b.principle) ? { principle: b.principle as string } : {}) },
      governs, authorship: b.authorship,
      workingDraftId: draftId as string | null,
      workingDraftVersion: draftVersion as number | null,
    },
  };
}

/**
 * ⭐ THE SAME THREE-STATE READ THE STANDING SURFACE USES, and for the same
 * reason: a failed lookup rendered as "no decisions" would tell a writer they
 * have never ruled on something they may have ruled on, and then let them
 * overwrite that ruling from a state they never saw.
 */
export type DecisionLookup =
  | { readonly state: 'loading'; readonly workId: string }
  | { readonly state: 'unavailable'; readonly workId: string }
  | { readonly state: 'available'; readonly workId: string; readonly decisions: readonly DecisionEvent[] };

export type DecisionsView =
  | { readonly state: 'unknown'; readonly reason: 'loading' | 'unavailable' | 'other-work' }
  | { readonly state: 'none' }
  | { readonly state: 'some'; readonly decisions: readonly DecisionEvent[] };

export function decisionsFor(lookup: DecisionLookup, workId: string): DecisionsView {
  if (lookup.workId !== workId) return { state: 'unknown', reason: 'other-work' };
  if (lookup.state === 'loading') return { state: 'unknown', reason: 'loading' };
  if (lookup.state === 'unavailable') return { state: 'unknown', reason: 'unavailable' };
  return lookup.decisions.length === 0
    ? { state: 'none' }
    : { state: 'some', decisions: lookup.decisions };
}

/** ⭐ The act is only offerable when the current state is actually known. */
export const mayRecord = (v: DecisionsView): boolean => v.state !== 'unknown';
