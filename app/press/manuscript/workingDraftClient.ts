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
  /**
   * Whether this revision can actually be restored.
   *
   * False on a section-addressable draft for revisions written before the
   * conversion: their section boundaries were never observed, and the server
   * refuses rather than inventing them. Surfaced so the history can say so
   * BEFORE the member chooses, instead of refusing them after.
   */
  restorable: boolean;
}

/**
 * One section of a section-addressable draft.
 *
 * ⛔ THE CLIENT NEVER MINTS OR RE-DERIVES AN ID. Identities come from the
 * server and are carried back unchanged. A client-invented id would name a
 * boundary the draft does not have, and authored structure and developmental
 * evidence both hang off these identities.
 */
export interface DraftSection {
  id: string;
  text: string;
}

/**
 * D9 — the load contract, discriminated rather than sniffed.
 *
 * On a section-addressable draft `content` is a DERIVED DISPLAY PROJECTION: it
 * is what the sections flatten to, useful for counting pages and reading
 * headings, and it must never be sent back. The server derives it.
 */
export interface DraftRepresentation {
  sectionAddressable: boolean;
  /** Present, and authoritative, only when sectionAddressable. */
  sections: DraftSection[] | null;
  /** Derived when sectionAddressable; the writable truth otherwise. */
  content: string;
}

export type LoadResult =
  | ({ kind: 'ok'; revisionCount: number; revisionId: number; updatedAt: string | null }
      & DraftRepresentation)
  | { kind: 'none' }
  | { kind: 'unauthorized' }
  | { kind: 'error' };

export type BeginResult =
  | ({ kind: 'ok'; revisionCount: number; revisionId: number } & DraftRepresentation)
  | { kind: 'exists' }
  | { kind: 'no-sections' }
  | { kind: 'unauthorized' }
  | { kind: 'error' };

/**
 * `conflict` is not an error to retry. stale_base means the draft moved under
 * us and only the writer can decide what to keep; key_reuse means this client
 * has a defect. Retrying either would loop.
 *
 * `unauthorized` is separate from `error` because the writer's next move is
 * different and only they can make it. A session that expired mid-manuscript
 * (a beta writer came back to their book after a week away) answered 401 to
 * every autosave; folded into `error`, the surface said "could not save just
 * now" and offered a retry that could never succeed, for as long as they kept
 * typing. It is recoverable — sign in again and the same queued content saves
 * — so it does NOT stop the saver the way a conflict does.
 *
 * `refused` is the server declining the SHAPE of the write, not failing it.
 *
 * It means this client's picture of the draft disagrees with the draft — a
 * content payload against a section-addressable draft, an id the draft does not
 * own, a section list that would change topology. Nothing was written. Retrying
 * the identical payload would refuse identically, so it closes the save lane
 * exactly as a conflict does; the way out is to reload the draft, not to retry.
 */
export type SaveResult =
  | { kind: 'ok'; revisionCount: number | null; revisionId: number | null; updatedAt: string | null }
  | { kind: 'conflict'; reason: 'stale_base' | 'idempotency_key_reuse'; currentRevisionId: number }
  | { kind: 'refused'; refusal: string; detail: string | null }
  | { kind: 'unauthorized' }
  | { kind: 'error' };

export type RevisionsResult = { kind: 'ok'; revisions: RevisionSummary[] } | { kind: 'error' };

export type RestoreResult =
  | { kind: 'ok'; revisionId: number | null }
  | { kind: 'conflict'; reason: 'stale_base' | 'idempotency_key_reuse'; currentRevisionId: number }
  | { kind: 'refused'; refusal: string; detail: string | null }
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

function readRefusal(data: Record<string, unknown>) {
  return {
    kind: 'refused' as const,
    refusal: typeof data.refusal === 'string' ? data.refusal : 'unknown',
    detail: typeof data.detail === 'string' ? data.detail : null,
  };
}

/**
 * Read the draft's representation from a load or begin response.
 *
 * ⛔ SECTIONS ARE ACCEPTED ONLY WHEN THE SERVER SAYS THE DRAFT IS
 * SECTION-ADDRESSABLE, and only when every entry is a well-formed `{id, text}`.
 * A partially-parsed section list would give the editor a picture of the draft
 * that is missing boundaries, and the very first save from it would be refused
 * as an incomplete payload — after the member had already typed into it.
 */
function readRepresentation(data: Record<string, unknown>): DraftRepresentation {
  const content = typeof data.content === 'string' ? data.content : '';
  if (data.sectionAddressable !== true || !Array.isArray(data.sections)) {
    return { sectionAddressable: false, sections: null, content };
  }
  const sections: DraftSection[] = [];
  for (const raw of data.sections as unknown[]) {
    const r = asRecord(raw);
    if (typeof r.id !== 'string' || r.id.length === 0 || typeof r.text !== 'string') {
      return { sectionAddressable: false, sections: null, content };
    }
    sections.push({ id: r.id, text: r.text });
  }
  return { sectionAddressable: true, sections, content };
}

// ---- pure section-state helpers ----------------------------------------

/** What a section-addressable draft's sections flatten to. Adds no separator. */
export function flattenDraftSections(sections: readonly DraftSection[]): string {
  return sections.map((s) => s.text).join('');
}

/**
 * Replace one section's text, returning a NEW array.
 *
 * ⛔ AN UNKNOWN ID CHANGES NOTHING. It does not append a section and it does
 * not create the id — the client has no authority to bring a boundary into
 * existence. Returning the array unchanged means a stale keystroke against a
 * section that no longer exists is dropped rather than resurrecting it.
 *
 * The new array identity is what the single-flight saver compares to decide
 * "is this still the newest queued value", so a no-op edit must NOT allocate.
 */
export function applySectionEdit(
  sections: readonly DraftSection[],
  id: string,
  text: string,
): DraftSection[] {
  const i = sections.findIndex((s) => s.id === id);
  if (i === -1 || sections[i].text === text) return sections as DraftSection[];
  const next = sections.slice();
  next[i] = { id: sections[i].id, text };
  return next;
}

/**
 * The character offset at which each section begins in the flattened content.
 *
 * Used to map a whole-draft offset (a heading the navigator found) onto the
 * section that holds it. ⛔ These offsets are a VIEW over live text and go
 * stale on the next keystroke — they are never sent to the server and never
 * stored. The durable form of this relation is the revision partition, which is
 * only stable because its target is immutable.
 */
export function sectionOffsets(sections: readonly DraftSection[]): number[] {
  const out: number[] = [];
  let cursor = 0;
  for (const s of sections) {
    out.push(cursor);
    cursor += s.text.length;
  }
  return out;
}

/** Which section holds a given whole-draft offset. -1 when there are none. */
export function sectionIndexAtOffset(sections: readonly DraftSection[], offset: number): number {
  const starts = sectionOffsets(sections);
  let found = -1;
  for (let i = 0; i < starts.length; i += 1) {
    if (starts[i] <= offset) found = i;
  }
  return found === -1 && sections.length > 0 ? 0 : found;
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
      ...readRepresentation(data),
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
        ...readRepresentation(data),
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
    return readSaveResponse(res);
  } catch {
    return { kind: 'error' };
  }
}

/**
 * The ordinary save on a SECTION-ADDRESSABLE draft.
 *
 * ⛔ IT SENDS SECTIONS AND NEVER CONTENT. Content on a converted draft is
 * derived server-side from these sections; sending both would be two claims
 * about the same text, and the server refuses that outright rather than
 * choosing between them.
 *
 * The list is COMPLETE STATE — every section the draft has, in its order.
 * Omitting one is not a deletion; it is an incomplete payload, and it is
 * refused with nothing written.
 */
export async function putDraftSections(
  http: Http,
  manuscriptId: string,
  opts: {
    sections: readonly DraftSection[];
    checkpoint?: boolean;
    note?: string;
    baseRevisionId: number;
    idempotencyKey: string;
  },
): Promise<SaveResult> {
  try {
    const body: Record<string, unknown> = {
      sections: opts.sections.map((s) => ({ id: s.id, text: s.text })),
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
    return readSaveResponse(res);
  } catch {
    return { kind: 'error' };
  }
}

/**
 * One reader for both save shapes, so a refusal can never be understood by one
 * path and swallowed as a generic error by the other.
 */
async function readSaveResponse(res: HttpResponse): Promise<SaveResult> {
  if (res.status === 409) {
    const data = asRecord(await res.json().catch(() => ({})));
    /* A 409 now carries two different meanings. A refusal names the SHAPE the
       server would not accept; a conflict names a version that moved. Reading
       `refusal` first keeps a typed refusal from being reported as stale_base,
       which would tell the writer another tab overwrote them when nothing did. */
    return typeof data.refusal === 'string' ? readRefusal(data) : readConflict(data);
  }
  if (res.status === 401) return { kind: 'unauthorized' };
  if (!res.ok) return { kind: 'error' };
  const data = asRecord(await res.json());
  return {
    kind: 'ok',
    revisionCount: typeof data.revisionCount === 'number' ? data.revisionCount : null,
    revisionId: typeof data.revisionId === 'number' ? data.revisionId : null,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
  };
}

// ---- revisions ---------------------------------------------------------

export async function loadRevisions(http: Http, manuscriptId: string): Promise<RevisionsResult> {
  try {
    const res = await http(`${draftBase(manuscriptId)}/revisions`, { method: 'GET' });
    if (!res.ok) return { kind: 'error' };
    const data = asRecord(await res.json());
    const raw = Array.isArray(data.revisions) ? (data.revisions as unknown[]) : [];
    /* `restorable` defaults TRUE only because an unconverted draft's server
       omits it and every revision on one is restorable. A section-addressable
       draft always sends it explicitly. */
    const rows: RevisionSummary[] = raw.map((r) => {
      const v = asRecord(r);
      return {
        revisionNumber: typeof v.revisionNumber === 'number' ? v.revisionNumber : 0,
        note: typeof v.note === 'string' ? v.note : null,
        contentChars: typeof v.contentChars === 'number' ? v.contentChars : 0,
        createdAt: typeof v.createdAt === 'string' ? v.createdAt : '',
        restorable: v.restorable !== false,
      };
    });
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
    if (res.status === 409) {
      const data = asRecord(await res.json().catch(() => ({})));
      return typeof data.refusal === 'string' ? readRefusal(data) : readConflict(data);
    }
    if (!res.ok) return { kind: 'error' };
    const data = asRecord(await res.json());
    return { kind: 'ok', revisionId: typeof data.revisionId === 'number' ? data.revisionId : null };
  } catch {
    return { kind: 'error' };
  }
}

// ---- single-flight, ordered autosave -----------------------------------

export type SaverState =
  | 'idle'
  | 'unsaved'
  | 'saving'
  | 'saved'
  | 'error'
  | 'conflict'
  | 'refused'
  | 'unauthorized';

export interface SaverCallbacks {
  onState(state: SaverState): void;
  /**
   * The server declined the shape of the write. Nothing was saved and nothing
   * was lost — but this client's picture of the draft is wrong, so the lane
   * closes exactly as it does for a conflict. Reloading is the way out.
   */
  onRefused?(info: { refusal: string; detail: string | null }): void;
  onSaved?(meta: {
    revisionCount: number | null;
    revisionId: number | null;
    updatedAt: string | null;
  }): void;
  /** The draft moved elsewhere, or this client reused a key. Autosave stops. */
  onConflict?(info: { reason: 'stale_base' | 'idempotency_key_reuse'; currentRevisionId: number }): void;
  /**
   * The session is no longer valid. Nothing was saved and nothing was lost —
   * the content stays queued, and signing in again makes the same save work.
   */
  onUnauthorized?(): void;
}

/**
 * Generic over WHAT is saved, because a section-addressable draft queues an
 * ordered section array and an unconverted one queues a string. The sequencing
 * guarantee — one write in flight, newest value last — is identical for both
 * and must not be duplicated into a second implementation that drifts.
 *
 * The "is this still the newest queued value" test is `===`. That is by value
 * for a string and by identity for a section array, which is why
 * `applySectionEdit` returns a NEW array for a real edit and the SAME array for
 * a no-op.
 */
export interface DraftSaver<T = string> {
  /** Record the latest content and mark it unsaved. Does not persist yet. */
  queue(content: T): void;
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
  endExclusive(opts?: { flushPending?: boolean; persisted?: T }): void;
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
  saver: Pick<DraftSaver<unknown>, 'hasPending' | 'flush'>,
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
export function createDraftSaver<T = string>(
  save: (content: T) => Promise<SaveResult>,
  cb: SaverCallbacks,
): DraftSaver<T> {
  let queued: T | null = null;
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
    if (result.kind === 'refused') {
      /* Terminal, like a conflict, and for the same reason: the identical
         payload would be refused identically, so retrying loops. Content stays
         queued and unsaved — nothing the member wrote is dropped. */
      stopped = true;
      cb.onRefused?.({ refusal: result.refusal, detail: result.detail });
      cb.onState('refused');
      return;
    }
    if (result.kind === 'unauthorized') {
      // Recoverable, unlike a conflict: the lane stays OPEN so the next flush
      // — the writer's own "Save now", or their next keystroke after signing
      // back in — persists this same content. Nothing is dequeued, so nothing
      // written while signed out is dropped.
      cb.onUnauthorized?.();
      cb.onState('unauthorized');
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
    queue(content: T) {
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
