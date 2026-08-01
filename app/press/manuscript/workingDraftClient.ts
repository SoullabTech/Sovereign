/**
 * Soullab Press — Working Draft client (pure, framework-free).
 *
 * Extracted from WorkingDraftEditor so the editor's state transitions — most
 * importantly the autosave SEQUENCING — are provable without a DOM. Every
 * function here is deterministic given its injected `http`, so jest can test
 * initialization, saving, checkpointing, restore, and error handling directly.
 *
 * The load-bearing guarantee lives in `createDraftSaver`: a slower earlier
 * autosave can never overwrite a later edit, because at most one PUT is ever
 * in flight and the newest queued content is always saved last.
 */

// Minimal shape of a fetch Response — a real Response satisfies this, and so
// does a test double. Keeps the module free of any fetch/React dependency.
export interface HttpResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}
export type Http = (path: string, init?: RequestInit) => Promise<HttpResponse>;

export const AUTOSAVE_DELAY_MS = 1200;
const CHARS_PER_PAGE = 1800; // matches the Manuscript Room's page estimate

// ---- pure view helpers -------------------------------------------------

export function pageEstimate(chars: number): number {
  return Math.max(1, Math.round(chars / CHARS_PER_PAGE));
}

export function formatWhen(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function draftBase(manuscriptId: string): string {
  return `/api/sovereign/manuscripts/${manuscriptId}/draft`;
}

// ---- typed API results -------------------------------------------------

export interface RevisionSummary {
  revisionNumber: number;
  note: string | null;
  contentChars: number;
  createdAt: string;
}

export type LoadResult =
  | { kind: 'ok'; content: string; revisionCount: number; revisionId: number; updatedAt: string | null }
  | { kind: 'none' }
  | { kind: 'unauthorized' }
  | { kind: 'error' };

export type BeginResult =
  | { kind: 'ok'; content: string; revisionCount: number; revisionId: number }
  | { kind: 'exists' }
  | { kind: 'no-sections' }
  | { kind: 'unauthorized' }
  | { kind: 'error' };

/**
 * `conflict` is not an error to retry. stale_base means the draft moved under
 * us and only the writer can decide what to keep; key_reuse means this client
 * has a defect. Retrying either would loop.
 */
export type SaveResult =
  | { kind: 'ok'; revisionCount: number | null; revisionId: number | null; updatedAt: string | null }
  | { kind: 'conflict'; reason: 'stale_base' | 'idempotency_key_reuse'; currentRevisionId: number }
  | { kind: 'error' };

export type RevisionsResult = { kind: 'ok'; revisions: RevisionSummary[] } | { kind: 'error' };

export type RestoreResult =
  | { kind: 'ok'; revisionId: number | null }
  | { kind: 'conflict'; reason: 'stale_base' | 'idempotency_key_reuse'; currentRevisionId: number }
  | { kind: 'error' };

/** One key per attempt; the same key is reused only when retrying that attempt. */
export function newIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `k-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readConflict(data: Record<string, unknown>) {
  const reason: 'stale_base' | 'idempotency_key_reuse' =
    data.reason === 'idempotency_key_reuse' ? 'idempotency_key_reuse' : 'stale_base';
  const currentRevisionId = typeof data.currentRevisionId === 'number' ? data.currentRevisionId : 0;
  return { kind: 'conflict' as const, reason, currentRevisionId };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

// ---- load / begin ------------------------------------------------------

export async function loadDraft(http: Http, manuscriptId: string): Promise<LoadResult> {
  try {
    const res = await http(draftBase(manuscriptId), { method: 'GET' });
    if (res.status === 401) return { kind: 'unauthorized' };
    if (res.status === 404) return { kind: 'none' };
    if (!res.ok) return { kind: 'error' };
    const data = asRecord(await res.json());
    return {
      kind: 'ok',
      content: typeof data.content === 'string' ? data.content : '',
      revisionCount: typeof data.revisionCount === 'number' ? data.revisionCount : 0,
      revisionId: typeof data.revisionId === 'number' ? data.revisionId : 1,
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
    };
  } catch {
    return { kind: 'error' };
  }
}

export async function beginDraft(http: Http, manuscriptId: string): Promise<BeginResult> {
  try {
    const res = await http(draftBase(manuscriptId), { method: 'POST' });
    if (res.status === 401) return { kind: 'unauthorized' };
    if (res.ok) {
      const data = asRecord(await res.json());
      return {
        kind: 'ok',
        content: typeof data.content === 'string' ? data.content : '',
        revisionCount: typeof data.revisionCount === 'number' ? data.revisionCount : 1,
        revisionId: typeof data.revisionId === 'number' ? data.revisionId : 1,
      };
    }
    if (res.status === 409) {
      const data = asRecord(await res.json().catch(() => ({})));
      if (typeof data.error === 'string' && data.error.includes('already exists')) {
        return { kind: 'exists' };
      }
      if (data.error === 'Manuscript has no sections') return { kind: 'no-sections' };
      return { kind: 'error' };
    }
    return { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

// ---- save / checkpoint -------------------------------------------------

export async function putDraft(
  http: Http,
  manuscriptId: string,
  opts: {
    content: string;
    checkpoint?: boolean;
    note?: string;
    baseRevisionId: number;
    idempotencyKey: string;
  },
): Promise<SaveResult> {
  try {
    const body: Record<string, unknown> = {
      content: opts.content,
      baseRevisionId: opts.baseRevisionId,
      idempotencyKey: opts.idempotencyKey,
    };
    if (opts.checkpoint) body.checkpoint = true;
    if (opts.note !== undefined) body.note = opts.note;
    const res = await http(draftBase(manuscriptId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 409) return readConflict(asRecord(await res.json().catch(() => ({}))));
    if (!res.ok) return { kind: 'error' };
    const data = asRecord(await res.json());
    return {
      kind: 'ok',
      revisionCount: typeof data.revisionCount === 'number' ? data.revisionCount : null,
      revisionId: typeof data.revisionId === 'number' ? data.revisionId : null,
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
    };
  } catch {
    return { kind: 'error' };
  }
}

// ---- revisions ---------------------------------------------------------

export async function loadRevisions(http: Http, manuscriptId: string): Promise<RevisionsResult> {
  try {
    const res = await http(`${draftBase(manuscriptId)}/revisions`, { method: 'GET' });
    if (!res.ok) return { kind: 'error' };
    const data = asRecord(await res.json());
    const rows = Array.isArray(data.revisions) ? (data.revisions as RevisionSummary[]) : [];
    return { kind: 'ok', revisions: rows };
  } catch {
    return { kind: 'error' };
  }
}

export async function restoreRevision(
  http: Http,
  manuscriptId: string,
  revisionNumber: number,
  guard: { baseRevisionId: number; idempotencyKey: string },
): Promise<RestoreResult> {
  try {
    const res = await http(`${draftBase(manuscriptId)}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revisionNumber, ...guard }),
    });
    if (res.status === 409) return readConflict(asRecord(await res.json().catch(() => ({}))));
    if (!res.ok) return { kind: 'error' };
    const data = asRecord(await res.json());
    return { kind: 'ok', revisionId: typeof data.revisionId === 'number' ? data.revisionId : null };
  } catch {
    return { kind: 'error' };
  }
}

// ---- single-flight, ordered autosave -----------------------------------

export type SaverState = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error' | 'conflict';

export interface SaverCallbacks {
  onState(state: SaverState): void;
  onSaved?(meta: {
    revisionCount: number | null;
    revisionId: number | null;
    updatedAt: string | null;
  }): void;
  /** The draft moved elsewhere, or this client reused a key. Autosave stops. */
  onConflict?(info: { reason: 'stale_base' | 'idempotency_key_reuse'; currentRevisionId: number }): void;
}

export interface DraftSaver {
  /** Record the latest content and mark it unsaved. Does not persist yet. */
  queue(content: string): void;
  /** Persist the queued content now, respecting single-flight ordering. */
  flush(): void;
  /** True while there is content queued that has not been persisted. */
  hasPending(): boolean;
  /**
   * Resolves when no write is currently in the save lane. NOTE: this is
   * "nothing is writing right now", NOT "everything is persisted" — after a
   * failed save, content stays pending (see hasPending). Prefer beginExclusive
   * for checkpoint/restore, which additionally BLOCKS new autosaves.
   */
  whenIdle(): Promise<void>;
  /**
   * Take the save lane exclusively: wait for any in-flight autosave to finish,
   * then block new autosaves from starting until endExclusive. This is what
   * checkpoint/restore use so their own write cannot race an autosave.
   */
  beginExclusive(): Promise<void>;
  /**
   * Release the exclusive lane. By default, persist anything queued while it
   * was held (content typed during a checkpoint). Pass { flushPending: false }
   * to DROP the pending content instead — used by restore, whose restored
   * content is authoritative over edits made during the operation. Pass the
   * value the exclusive write already persisted so an unchanged queue is
   * dropped rather than re-saved.
   */
  endExclusive(opts?: { flushPending?: boolean; persisted?: string }): void;
}

/**
 * W-1 — the exit guard.
 *
 * Autosave is debounced by AUTOSAVE_DELAY_MS, so there is always a window in
 * which the writer's newest words are queued but not yet sent. Every way OUT of
 * the editor must close that window: unmount (Room tab switch, route change,
 * manuscript change), page hide, mobile backgrounding, and unload.
 *
 * The original defect was that the unmount path cleared the debounce timer
 * WITHOUT flushing — cancelling the pending save instead of completing it. That
 * pairing is the whole bug, so it lives here as one operation that cannot be
 * half-performed, and is unit-tested rather than left implicit in an effect.
 */
export interface ExitGuard {
  /** Cancel the pending debounce and persist immediately. Returns whether anything was pending. */
  flushNow(): boolean;
  /** Whether content remains unpersisted (e.g. a dispatched save has not resolved, or failed). */
  stillPending(): boolean;
}

export function createExitGuard(
  saver: Pick<DraftSaver, 'hasPending' | 'flush'>,
  clearTimer: () => void,
): ExitGuard {
  return {
    flushNow() {
      // Order matters: clear the timer so it cannot fire later against a
      // unmounted component, but ALWAYS flush what it would have saved.
      clearTimer();
      const wasPending = saver.hasPending();
      if (wasPending) saver.flush();
      return wasPending;
    },
    stillPending() {
      return saver.hasPending();
    },
  };
}

/**
 * Guarantees, given a `save(content)` that resolves in arbitrary order:
 *   - at most ONE save runs at a time (no two PUTs racing the DB);
 *   - the NEWEST queued content is always persisted last, so a slow earlier
 *     save can never overwrite a later edit;
 *   - a failed save leaves the pending content intact for retry (no silent
 *     "saved" after a failure, no lost keystrokes).
 */
export function createDraftSaver(
  save: (content: string) => Promise<SaveResult>,
  cb: SaverCallbacks,
): DraftSaver {
  let queued: string | null = null;
  let inFlight: Promise<void> | null = null;
  let paused = false; // an exclusive write (checkpoint/restore) holds the lane
  let stopped = false; // a conflict closed the lane for good

  async function run(): Promise<void> {
    if (stopped) return;
    if (queued === null) return;
    const value = queued;
    cb.onState('saving');
    const result = await save(value);
    if (result.kind === 'conflict') {
      // Not retryable. Retrying a stale base loops forever and cannot resolve
      // itself; only the writer can decide. Content stays queued, unsaved.
      stopped = true;
      cb.onConflict?.({ reason: result.reason, currentRevisionId: result.currentRevisionId });
      cb.onState('conflict');
      return;
    }
    if (result.kind === 'ok') {
      cb.onSaved?.({
        revisionCount: result.revisionCount,
        revisionId: result.revisionId,
        updatedAt: result.updatedAt,
      });
      if (queued === value) {
        // Nothing newer arrived while saving — we are current.
        queued = null;
        cb.onState('saved');
      } else {
        // A later edit arrived mid-save; persist it next, in order.
        cb.onState('unsaved');
        await run();
      }
    } else {
      // Keep `queued` (>= value) so the next flush retries the latest content.
      cb.onState('error');
    }
  }

  function flush(): void {
    if (stopped) return; // a conflict is unresolved; writing again would loop
    if (paused) return; // an exclusive write holds the lane; it will re-flush on release
    if (inFlight) return; // an active run will pick up the latest queued value
    if (queued === null) return;
    inFlight = run().finally(() => {
      inFlight = null;
    });
  }

  return {
    queue(content: string) {
      queued = content;
      cb.onState('unsaved');
    },
    flush,
    hasPending() {
      return queued !== null;
    },
    whenIdle() {
      return inFlight ?? Promise.resolve();
    },
    async beginExclusive() {
      // Drain any in-flight autosave (including its ordered continuations),
      // then close the lane so no new autosave can start mid-write.
      while (inFlight) await inFlight;
      paused = true;
    },
    endExclusive(opts) {
      paused = false;
      if (opts?.flushPending === false) {
        queued = null; // restore: restored content is authoritative
        return;
      }
      if (opts?.persisted !== undefined && queued === opts.persisted) {
        queued = null; // nothing new was typed during the write; already persisted
        return;
      }
      flush(); // content typed during the exclusive write — persist it, in order
    },
  };
}
