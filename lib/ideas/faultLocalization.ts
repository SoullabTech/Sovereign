/**
 * IDEAS — T1 Fault Localization Instrument
 *
 * Purpose (and only purpose): make every seam in the Ask MAIA path
 * DISTINGUISHABLE when it fails, without changing a single byte of
 * member-facing behavior.
 *
 * Scope discipline (T1 only — authorized 2026-09-02):
 *   IN   structured stage logging; client attempt_id; server request_id;
 *        entered/completed/failed at each named seam; runtime revision on
 *        every event; sanitization; mock-based seam tests.
 *   OUT  durable evidence / any database schema (that is T2); repairs of the
 *        separately demonstrated runtime defects (C3/C5); prompt or response
 *        changes; proposition/standing; runtime fault-injection flags.
 *
 * Two invariants this module exists to hold:
 *
 *   1. AUTHORITY SEPARATION. The client may propose an `attempt_id` and
 *      nothing else. `request_id` is minted server-side, always, and can
 *      never be supplied, influenced, or overridden by a request header.
 *      A client-proposed attempt_id is untrusted input: it is shape-checked
 *      before it is recorded, and a rejection is itself recorded rather than
 *      silently swallowed.
 *
 *   2. NO MEMBER CONTENT LEAVES THE PROCESS. Event detail is not free-form.
 *      Keys pass an allowlist; values pass a token-shape rule. Prose cannot
 *      survive either gate. Measurements about content (lengths, counts,
 *      presence) are the only permitted trace of content.
 *
 * Correlation: the join key between client and server logs is `attempt_id`.
 * The server records both ids on every event; the client records only its
 * own. Nothing is written back into the HTTP response — the response body
 * and headers are untouched, which is what makes "zero member-facing diff"
 * an assertable property rather than a claim.
 */

// ═══════════════════════════════════════════════════════════════
// Seams
//
// A seam is a boundary at which the Ask MAIA path can fail in a way that
// demands a different repair. Naming them is the instrument; the names are
// the vocabulary the evidence is later read in, so they are exhaustive and
// closed.
// ═══════════════════════════════════════════════════════════════

export const CLIENT_SEAMS = [
  'client.autosave',      // persist pending composer draft before asking
  'client.ask_request',   // POST /api/ideas/[id]/ask-maia
  'client.render',        // apply returned block to view state
] as const;

export const SERVER_SEAMS = [
  'server.auth',              // session resolution
  'server.validate',          // idea id shape
  'server.idea_fetch',        // ownership + idea context
  'server.context_assemble',  // recent blocks, last decision, prior reflections
  'server.model_call',        // generateThreadReflection
  'server.recognition',       // flag-gated decision/change recognition
  'server.persist',           // INSERT maia_reflection
  'server.touch',             // UPDATE last_entered_at
] as const;

export type ClientSeam = (typeof CLIENT_SEAMS)[number];
export type ServerSeam = (typeof SERVER_SEAMS)[number];
export type Seam = ClientSeam | ServerSeam;

export const ALL_SEAMS: readonly Seam[] = [...CLIENT_SEAMS, ...SERVER_SEAMS];

export type StagePhase = 'entered' | 'completed' | 'failed';

// ═══════════════════════════════════════════════════════════════
// Sanitization
// ═══════════════════════════════════════════════════════════════

/**
 * Keys explicitly permitted in event detail. Anything not here — and not
 * matching a safe measurement suffix below — is dropped, not redacted:
 * an unrecognized key is a mistake at the call site, and dropping it keeps
 * the mistake from becoming a leak.
 */
export const DETAIL_KEY_ALLOWLIST: readonly string[] = [
  'reason',
  'status',
  'phase_of',
  'seam_origin',
  'recognition_kind',
  'recognition_strength',
  'error_name',
];

/**
 * Measurement suffixes. A key ending in one of these is permitted because
 * its shape guarantees it carries a measure of content, never content.
 */
const SAFE_KEY_SUFFIXES = [
  '_count',
  '_len',
  '_ms',
  '_present',
  '_ok',
  '_rejected',
  '_fired',
  '_offered',
] as const;

const KEY_SHAPE = /^[a-z][a-z0-9_]{0,39}$/;

/**
 * A permitted string value is a token: no whitespace, no punctuation beyond
 * a small set, at most 64 characters. Member prose fails this by
 * construction (it contains whitespace, or exceeds the bound, or both).
 * A string that fails becomes '[redacted]' rather than being dropped, so the
 * event still records that a value was present and was refused.
 */
const TOKEN_SHAPE = /^[A-Za-z0-9_.:\-]{1,64}$/;

export const REDACTED = '[redacted]';

export type DetailValue = string | number | boolean | null;

export function isAllowedDetailKey(key: string): boolean {
  if (!KEY_SHAPE.test(key)) return false;
  if (DETAIL_KEY_ALLOWLIST.includes(key)) return true;
  return SAFE_KEY_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/**
 * Reduce arbitrary call-site detail to a shape that cannot carry member
 * content. Drops disallowed keys and non-scalar values; redacts scalar
 * strings that are not token-shaped.
 */
export function sanitizeDetail(
  detail: Record<string, unknown> | undefined
): Record<string, DetailValue> {
  const out: Record<string, DetailValue> = {};
  if (!detail) return out;

  for (const [key, value] of Object.entries(detail)) {
    if (!isAllowedDetailKey(key)) continue;

    if (value === null) {
      out[key] = null;
    } else if (typeof value === 'boolean') {
      out[key] = value;
    } else if (typeof value === 'number') {
      if (Number.isFinite(value)) out[key] = value;
    } else if (typeof value === 'string') {
      out[key] = TOKEN_SHAPE.test(value) ? value : REDACTED;
    }
    // objects, arrays, functions, symbols, undefined: dropped
  }

  return out;
}

// ═══════════════════════════════════════════════════════════════
// Identifiers — authority separation
// ═══════════════════════════════════════════════════════════════

/**
 * A client-proposed attempt_id must be a bounded, unambiguous token. It is
 * never used as, promoted to, or mixed with the server's request_id.
 */
const ATTEMPT_ID_SHAPE = /^[A-Za-z0-9_-]{8,64}$/;

export function sanitizeAttemptId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  return ATTEMPT_ID_SHAPE.test(raw) ? raw : null;
}

function randomToken(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  // Deterministic-length fallback for runtimes without WebCrypto. Identifier
  // uniqueness, not unpredictability, is what this value is for.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Mint the client's attempt_id. Prefixed so a value that shows up in a
 * server log is unambiguously of client origin.
 */
export function newAttemptId(): string {
  return `att-${randomToken()}`.slice(0, 64);
}

/**
 * Mint the server's request_id. Called once per request, server-side only.
 * There is deliberately no parameter by which an inbound value could reach
 * this function.
 */
export function newRequestId(): string {
  return `req-${randomToken()}`.slice(0, 64);
}

export const ATTEMPT_ID_HEADER = 'x-ideas-attempt-id';

// ═══════════════════════════════════════════════════════════════
// Runtime revision
//
// Rule: report what the build actually stamped, or report that it is
// unknown. Never fabricate. A build that was not stamped must LOOK
// unstamped, otherwise the evidence attributes a fault to the wrong code.
// ═══════════════════════════════════════════════════════════════

export const UNKNOWN_REVISION = 'unknown';

export function serverRuntimeRevision(): string {
  const raw = process.env.GIT_COMMIT;
  if (typeof raw !== 'string') return UNKNOWN_REVISION;
  const trimmed = raw.trim();
  if (!trimmed) return UNKNOWN_REVISION;
  return TOKEN_SHAPE.test(trimmed) ? trimmed : UNKNOWN_REVISION;
}

export function clientRuntimeRevision(stampedCommit: string | undefined): string {
  if (typeof stampedCommit !== 'string') return UNKNOWN_REVISION;
  const trimmed = stampedCommit.trim();
  if (!trimmed) return UNKNOWN_REVISION;
  return TOKEN_SHAPE.test(trimmed) ? trimmed : UNKNOWN_REVISION;
}

// ═══════════════════════════════════════════════════════════════
// Event shape + emission
// ═══════════════════════════════════════════════════════════════

export const T1_MARKER = '[ideas/T1]';
export const T1_INSTRUMENT_VERSION = 1;

export interface StageEvent {
  instrument: 'ideas.fault_localization';
  v: number;
  side: 'client' | 'server';
  seam: Seam;
  phase: StagePhase;
  /** Server-minted. Null on client-side events by construction. */
  request_id: string | null;
  /** Client-proposed, sanitized. Null when absent or rejected. */
  attempt_id: string | null;
  runtime_revision: string;
  ts: string;
  detail: Record<string, DetailValue>;
}

export interface StageContext {
  side: 'client' | 'server';
  requestId: string | null;
  attemptId: string | null;
  runtimeRevision: string;
  /** Injectable for tests; defaults to console.log. */
  sink?: (line: string) => void;
  /** Injectable for tests; defaults to Date.now. */
  now?: () => number;
}

function disabled(): boolean {
  return process.env.IDEAS_T1_DISABLED === '1';
}

export function buildStageEvent(
  ctx: StageContext,
  seam: Seam,
  phase: StagePhase,
  detail?: Record<string, unknown>
): StageEvent {
  return {
    instrument: 'ideas.fault_localization',
    v: T1_INSTRUMENT_VERSION,
    side: ctx.side,
    seam,
    phase,
    // Structural guarantee: a client context can never carry a request_id.
    request_id: ctx.side === 'server' ? ctx.requestId : null,
    attempt_id: ctx.attemptId,
    runtime_revision: ctx.runtimeRevision,
    ts: new Date(ctx.now ? ctx.now() : Date.now()).toISOString(),
    detail: sanitizeDetail(detail),
  };
}

export function emitStage(
  ctx: StageContext,
  seam: Seam,
  phase: StagePhase,
  detail?: Record<string, unknown>
): void {
  if (disabled()) return;
  const event = buildStageEvent(ctx, seam, phase, detail);
  const sink = ctx.sink ?? ((line: string) => console.log(line));
  try {
    sink(`${T1_MARKER} ${JSON.stringify(event)}`);
  } catch {
    // The instrument must never be the reason a member request fails.
  }
}

/**
 * Run one seam with entered/completed/failed bracketing.
 *
 * Behavioral contract — the reason this is safe to wire into a live path:
 *   - the wrapped function's return value is passed through unchanged
 *   - a thrown error is re-thrown unchanged, after `failed` is emitted
 *   - nothing here alters control flow, timing semantics, or the response
 *
 * `detailOf` derives completion detail from the result. It runs inside the
 * emitter's guard, so a throwing detail function degrades the log line, never
 * the request.
 */
export async function stage<T>(
  ctx: StageContext,
  seam: Seam,
  fn: () => Promise<T> | T,
  detailOf?: (result: T) => Record<string, unknown>
): Promise<T> {
  const started = ctx.now ? ctx.now() : Date.now();
  emitStage(ctx, seam, 'entered');
  try {
    const result = await fn();
    let completionDetail: Record<string, unknown> = {};
    try {
      completionDetail = detailOf ? detailOf(result) : {};
    } catch {
      completionDetail = { detail_ok: false };
    }
    emitStage(ctx, seam, 'completed', {
      ...completionDetail,
      duration_ms: (ctx.now ? ctx.now() : Date.now()) - started,
    });
    return result;
  } catch (error) {
    emitStage(ctx, seam, 'failed', {
      error_name: error instanceof Error ? error.name : 'unknown',
      duration_ms: (ctx.now ? ctx.now() : Date.now()) - started,
    });
    throw error;
  }
}

/**
 * Build the server-side stage context from an inbound request.
 *
 * This is the single point at which client input touches identity, and it is
 * one-directional: the header can populate `attemptId` and nothing else.
 * A malformed attempt_id yields `attempt_id: null` plus an
 * `attempt_id_rejected` marker on the first event, so a rejection is visible
 * in the evidence rather than indistinguishable from absence.
 */
export function serverStageContext(headers: {
  get(name: string): string | null;
}): { ctx: StageContext; attemptIdRejected: boolean } {
  const raw = headers.get(ATTEMPT_ID_HEADER);
  const attemptId = sanitizeAttemptId(raw);
  return {
    ctx: {
      side: 'server',
      requestId: newRequestId(),
      attemptId,
      runtimeRevision: serverRuntimeRevision(),
    },
    attemptIdRejected: raw !== null && attemptId === null,
  };
}
