/**
 * WS2-07 · BUILD-07F — DEVELOPMENTAL DECISIONS · the standing contract.
 *
 * A writer's standing toward ONE frozen developmental observation. Design of
 * record: docs/programme/WS2-07-BUILD-07F_DESIGN_2026-09-05.md.
 *
 * WHAT THE TYPES REFUSE TO SAY, and why each absence is load-bearing:
 *
 *   UNSET is not a value. It is ZERO EVENTS (design §2). There is no `'unset'`
 *   member of `Standing`, so no code path can write one, and a writer cannot
 *   return to never having ruled. A writer who no longer wishes to rule takes
 *   the explicit standing `unresolved` — which is a member ACT, not the absence
 *   of one.
 *
 *   `investigate` is not here. It is a DIFFERENT AXIS (adjudication Q4):
 *   keep-and-investigate, dismiss-and-investigate and unresolved-and-investigate
 *   are all coherent, so putting it in this union would make mutually
 *   compatible states falsely exclusive — the exact compression the founder
 *   ruling forbids.
 *
 *   There is no `clear`, no `delete`, no successor pointer and no actor. Each
 *   is named in the design as absent by construction.
 *
 * `expectedCurrentEventId` is a three-state field and its absence is NOT its
 * null: absent is a malformed request, `null` is a caller acting from an
 * observed UNSET, and a uuid is a caller acting from that exact event. A parser
 * that treated absent as null would let a client that never looked overwrite a
 * standing it never saw.
 */

/** The three values, and only these. */
export type Standing = 'keep' | 'dismiss' | 'unresolved';

export const STANDINGS: readonly Standing[] = ['keep', 'dismiss', 'unresolved'];

export function isStanding(v: unknown): v is Standing {
  return typeof v === 'string' && (STANDINGS as readonly string[]).includes(v);
}

/**
 * One recorded act. `id` matters independently of the projection: a later stage
 * should be able to reference the exact standing event that informed a
 * revision rather than reconstructing it from timestamps (design §3).
 */
export interface StandingEvent {
  readonly id: string;
  readonly observationKey: string;
  readonly standing: Standing;
  readonly eventIndex: number;
  readonly recordedAt: string;
}

/**
 * The write envelope — closed. No `memberId` (authentication supplies it, the
 * request never does), no anchor, no reading id (it is the address of the
 * resource, not a field a body may disagree with).
 */
export interface StandingRequest {
  readonly observationKey: string;
  readonly standing: Standing;
  readonly expectedCurrentEventId: string | null;
}

export type StandingRefusal =
  /** The reading is not this member's, or does not exist. The two are not distinguished. */
  | 'reading_unknown'
  /** The key does not resolve in THIS frozen reading. Never repaired to a nearby one. */
  | 'observation_unknown'
  /** The caller acted from a state that is no longer current. Caught by the CAS token. */
  | 'stale_expectation'
  /** Another act took this index first. Caught by the unique constraint. */
  | 'simultaneous_write';

/**
 * The outcomes, discriminated. `unchanged` is reported ONLY after the
 * expected-current test has passed (design §4): a caller holding a stale token
 * whose value happens to match must be told `stale_expectation`, never taught
 * that its token was current.
 *
 * A refusal deliberately carries NO current event. The design forbids automatic
 * retry — "the writer refetches the now-current standing and may act again,
 * deliberately" — and a refusal that handed back a fresh CAS token would be an
 * invitation to retry in a loop that the member never authored.
 */
export type StandingWriteResult =
  | { readonly outcome: 'appended'; readonly event: StandingEvent }
  | { readonly outcome: 'unchanged'; readonly current: StandingEvent }
  | { readonly outcome: 'refused'; readonly reason: StandingRefusal };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parse the closed envelope. Anything else — a `memberId`, an `investigate`
 * flag, a `readingId`, an absent expectation — is malformed. Extra fields are
 * refused rather than ignored: a body carrying a field this contract does not
 * name is a caller believing something untrue about this resource.
 */
export function parseStandingRequest(
  body: unknown,
): { readonly ok: true; readonly request: StandingRequest } | { readonly ok: false } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false };
  const b = body as Record<string, unknown>;

  const allowed = ['observationKey', 'standing', 'expectedCurrentEventId'];
  if (Object.keys(b).some((k) => !allowed.includes(k))) return { ok: false };
  if (!allowed.every((k) => k in b)) return { ok: false };

  const { observationKey, standing, expectedCurrentEventId: expected } = b;
  if (typeof observationKey !== 'string' || observationKey.length === 0) return { ok: false };
  if (!isStanding(standing)) return { ok: false };
  if (expected !== null && !(typeof expected === 'string' && UUID.test(expected))) return { ok: false };

  return { ok: true, request: { observationKey, standing, expectedCurrentEventId: expected } };
}
