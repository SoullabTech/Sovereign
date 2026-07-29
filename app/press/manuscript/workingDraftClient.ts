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
  | { kind: 'ok'; content: string; revisionCount: number; updatedAt: string | null }
  | { kind: 'none' }
  | { kind: 'unauthorized' }
  | { kind: 'error' };

export type BeginResult =
  | { kind: 'ok'; content: string; revisionCount: number }
  | { kind: 'exists' }
  | { kind: 'no-sections' }
  | { kind: 'unauthorized' }
  | { kind: 'error' };

export type SaveResult =
  | { kind: 'ok'; revisionCount: number | null; updatedAt: string | null }
  | { kind: 'error' };

export type RevisionsResult = { kind: 'ok'; revisions: RevisionSummary[] } | { kind: 'error' };

export type RestoreResult = { kind: 'ok' } | { kind: 'error' };

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
  opts: { content: string; checkpoint?: boolean; note?: string },
): Promise<SaveResult> {
  try {
    const body: Record<string, unknown> = { content: opts.content };
    if (opts.checkpoint) body.checkpoint = true;
    if (opts.note !== undefined) body.note = opts.note;
    const res = await http(draftBase(manuscriptId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { kind: 'error' };
    const data = asRecord(await res.json());
    return {
      kind: 'ok',
      revisionCount: typeof data.revisionCount === 'number' ? data.revisionCount : null,
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
): Promise<RestoreResult> {
  try {
    const res = await http(`${draftBase(manuscriptId)}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revisionNumber }),
    });
    return res.ok ? { kind: 'ok' } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

// ---- single-flight, ordered autosave -----------------------------------

export type SaverState = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

export interface SaverCallbacks {
  onState(state: SaverState): void;
  onSaved?(meta: { revisionCount: number | null; updatedAt: string | null }): void;
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

  async function run(): Promise<void> {
    if (queued === null) return;
    const value = queued;
    cb.onState('saving');
    const result = await save(value);
    if (result.kind === 'ok') {
      cb.onSaved?.({ revisionCount: result.revisionCount, updatedAt: result.updatedAt });
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
