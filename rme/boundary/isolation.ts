/**
 * RME-001 — One-way isolation boundary
 *
 * GOVERNING INVARIANT (constitutional, not policy):
 *
 *   RME may learn about MAIA from encounters.
 *   MAIA may not learn about members from RME.
 *
 * This module is the ONLY legitimate way RME data exists in the process. It is
 * built so that the invariant is enforced by construction rather than by review:
 *
 *   1. Every RME value is wrapped in `Quarantined<T>` — a nominal type carrying a
 *      unique symbol brand. No MAIA-side function signature accepts it, and TypeScript
 *      cannot structurally coerce it, because the brand key is a module-private symbol.
 *
 *   2. Unwrapping requires an `EvaluationCapability` token. The token is minted only
 *      inside `withEvaluationBoundary()` and is never exported, never stored, and is
 *      revoked when the scope exits. A token captured by a closure is dead on use.
 *
 *   3. Every unwrap is recorded. `egressLedger()` returns the full record so a
 *      falsification test can assert that no unwrap occurred on a MAIA call path.
 *
 * There is deliberately NO function in this file that converts a Quarantined value
 * into a plain string or object without a live token. Adding one would break the
 * invariant, and the falsification suite asserts the module's export surface.
 */

const BRAND = Symbol('rme.quarantined');
const TOKEN_BRAND = Symbol('rme.capability');

/** A value that originated in RME. Structurally unusable outside this boundary. */
export type Quarantined<T> = {
  readonly [BRAND]: true;
  readonly kind: RmeArtifactKind;
  /** Opaque. Never read this directly — it is not the value. */
  readonly _opaque: unique symbol | never;
} & { readonly __phantom?: (t: T) => void };

export type RmeArtifactKind =
  | 'condition_b_response'
  | 'evaluator_judgment'
  | 'dimension_score'
  | 'evaluator_annotation'
  | 'rme_metadata'
  | 'member_feedback';

/**
 * Every named surface RME output is forbidden to reach. Enumerated so the
 * falsification suite can assert each one, rather than trusting prose.
 */
export const FORBIDDEN_SINKS = [
  'maia.memory',
  'maia.conversation_history',
  'maia.retrieval',
  'maia.awareness_scoring',
  'maia.developmental_memory',
  'maia.routing',
  'maia.gates',
  'maia.prompt_composition',
  'maia.member_observations',
] as const;

export type ForbiddenSink = (typeof FORBIDDEN_SINKS)[number];

export class BoundaryViolation extends Error {
  constructor(
    readonly attemptedSink: string,
    readonly artifactKind: RmeArtifactKind,
  ) {
    super(
      `RME-001 boundary violation: attempted to deliver ${artifactKind} to "${attemptedSink}". ` +
        `MAIA may not learn about members from RME.`,
    );
    this.name = 'BoundaryViolation';
  }
}

export interface EvaluationCapability {
  readonly [TOKEN_BRAND]: true;
  readonly scopeId: string;
  /** Set false when the boundary scope exits. Checked on every unwrap. */
  live: boolean;
}

interface EgressRecord {
  readonly scopeId: string;
  readonly kind: RmeArtifactKind;
  readonly sink: string;
  readonly seq: number;
}

const ledger: EgressRecord[] = [];
let seq = 0;
let scopeCounter = 0;

/** Immutable view of every unwrap performed this process. Used by falsification tests. */
export function egressLedger(): readonly EgressRecord[] {
  return ledger.slice();
}

export function resetLedgerForTest(): void {
  ledger.length = 0;
  seq = 0;
}

const store = new WeakMap<object, unknown>();

/**
 * Bring a value under quarantine. Everything RME produces must pass through here.
 * There is no other constructor for Quarantined.
 */
export function quarantine<T>(kind: RmeArtifactKind, value: T): Quarantined<T> {
  const handle = { [BRAND]: true as const, kind } as unknown as Quarantined<T>;
  store.set(handle as unknown as object, value);
  return handle;
}

/**
 * Read a quarantined value. Requires a live capability token and an explicitly
 * declared sink. Throws if the sink is a MAIA surface — the check is on the
 * declared destination, so mislabelling is the only way through, and mislabelling
 * is itself a reviewable act rather than an accident.
 */
export function reveal<T>(
  artifact: Quarantined<T>,
  cap: EvaluationCapability,
  sink: string,
): T {
  if (!cap || cap[TOKEN_BRAND] !== true) {
    throw new BoundaryViolation(sink, artifact.kind);
  }
  if (!cap.live) {
    throw new BoundaryViolation(`${sink} (expired capability)`, artifact.kind);
  }
  if ((FORBIDDEN_SINKS as readonly string[]).includes(sink)) {
    throw new BoundaryViolation(sink, artifact.kind);
  }
  if (sink.startsWith('maia.')) {
    // Defence in depth: any unenumerated MAIA surface is refused by prefix.
    throw new BoundaryViolation(sink, artifact.kind);
  }
  ledger.push({ scopeId: cap.scopeId, kind: artifact.kind, sink, seq: seq++ });
  return store.get(artifact as unknown as object) as T;
}

/**
 * The only place an EvaluationCapability is minted. The token dies when `fn` returns,
 * so a token smuggled out by a closure cannot be used later.
 */
export async function withEvaluationBoundary<R>(
  purpose: string,
  fn: (cap: EvaluationCapability) => Promise<R>,
): Promise<R> {
  const cap: EvaluationCapability = {
    [TOKEN_BRAND]: true,
    scopeId: `${purpose}#${scopeCounter++}`,
    live: true,
  };
  try {
    return await fn(cap);
  } finally {
    cap.live = false;
  }
}
