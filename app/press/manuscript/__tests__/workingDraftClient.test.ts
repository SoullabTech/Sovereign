/**
 * Working Draft client — state transitions for the member-facing editor.
 *
 * These cover the behavior a typecheck cannot establish (the founder's #1 named
 * risk): autosave SEQUENCING — a slower earlier save must never overwrite a
 * later edit — plus initialization from source, checkpoint, restore, and the
 * error state after a failed save. No DOM: the editor's logic is pure and
 * injected with a fake `http`, so jest tests it directly (repo convention).
 */
import {
  loadDraft,
  beginDraft,
  putDraft,
  loadRevisions,
  restoreRevision,
  createDraftSaver,
  pageEstimate,
  type HttpResponse,
  type SaveResult,
  type SaverState,
} from '../workingDraftClient';

const ID = '22222222-2222-2222-2222-222222222222';
const DRAFT = `/api/sovereign/manuscripts/${ID}/draft`;

const GUARD = { baseRevisionId: 4, idempotencyKey: 'k-1' };

function resp(status: number, body: unknown = {}): HttpResponse {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

// Flush all pending microtasks (a real macrotask turn; the saver uses no timers).
const flush = () => new Promise((r) => setTimeout(r, 0));

// -------------------------------------------------------------------------
describe('loadDraft — opening the surface', () => {
  it('maps 200 to the draft content', async () => {
    const http = jest.fn(async () => resp(200, { content: 'hi', revisionCount: 2, updatedAt: 't' }));
    expect(await loadDraft(http, ID)).toEqual({
      kind: 'ok',
      content: 'hi',
      revisionCount: 2,
      revisionId: 1,
      updatedAt: 't',
    });
    expect(http).toHaveBeenCalledWith(DRAFT, { method: 'GET' });
  });

  it('maps 404 to "none" (no draft yet — show the invitation)', async () => {
    expect(await loadDraft(jest.fn(async () => resp(404)), ID)).toEqual({ kind: 'none' });
  });

  it('maps 401 to "unauthorized"', async () => {
    expect(await loadDraft(jest.fn(async () => resp(401)), ID)).toEqual({ kind: 'unauthorized' });
  });

  it('maps 500 and network throws to "error" (never a false success)', async () => {
    expect(await loadDraft(jest.fn(async () => resp(500)), ID)).toEqual({ kind: 'error' });
    expect(
      await loadDraft(
        jest.fn(async () => {
          throw new Error('net');
        }),
        ID,
      ),
    ).toEqual({ kind: 'error' });
  });
});

describe('beginDraft — initialization from source', () => {
  it('returns the verbatim source content on create', async () => {
    const http = jest.fn(async () => resp(201, { id: 'd', content: '# A\n\nbody', revisionCount: 1 }));
    expect(await beginDraft(http, ID)).toEqual({
      kind: 'ok',
      content: '# A\n\nbody',
      revisionCount: 1,
      revisionId: 1,
    });
    expect(http).toHaveBeenCalledWith(DRAFT, { method: 'POST' });
  });

  it('reports "exists" on 409 already-exists (caller reloads the draft)', async () => {
    const http = jest.fn(async () => resp(409, { error: 'Draft already exists' }));
    expect(await beginDraft(http, ID)).toEqual({ kind: 'exists' });
  });

  it('reports "no-sections" on 409 empty manuscript', async () => {
    const http = jest.fn(async () => resp(409, { error: 'Manuscript has no sections' }));
    expect(await beginDraft(http, ID)).toEqual({ kind: 'no-sections' });
  });

  it('reports "unauthorized" on 401', async () => {
    expect(await beginDraft(jest.fn(async () => resp(401)), ID)).toEqual({ kind: 'unauthorized' });
  });
});

describe('putDraft — autosave vs checkpoint', () => {
  it('autosave sends only content', async () => {
    const http = jest.fn(async () => resp(200, { revisionCount: 1, updatedAt: 't', checkpointed: false }));
    const r = await putDraft(http, ID, { content: 'draft', ...GUARD });
    expect(r).toEqual({ kind: 'ok', revisionCount: 1, revisionId: null, updatedAt: 't' });
    const [path, init] = http.mock.calls[0] as [string, RequestInit];
    expect(path).toBe(DRAFT);
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ content: 'draft', ...GUARD });
  });

  it('checkpoint sends checkpoint:true and the optional note', async () => {
    const http = jest.fn(async () => resp(200, { revisionCount: 3, updatedAt: 't', checkpointed: true }));
    const r = await putDraft(http, ID, {
      content: 'hello',
      checkpoint: true,
      note: 'first pass',
      ...GUARD,
    });
    expect(r).toEqual({ kind: 'ok', revisionCount: 3, revisionId: null, updatedAt: 't' });
    const body = JSON.parse((http.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({ content: 'hello', checkpoint: true, note: 'first pass', ...GUARD });
  });

  it('reports error on a failed save — never a false "ok"', async () => {
    expect(
      await putDraft(jest.fn(async () => resp(500)), ID, { content: 'x', ...GUARD })
    ).toEqual({ kind: 'error' });
  });

  it('maps 401 to "unauthorized" — a sign-in, never a retryable failure', async () => {
    expect(
      await putDraft(jest.fn(async () => resp(401)), ID, { content: 'x', ...GUARD })
    ).toEqual({ kind: 'unauthorized' });
  });
});

describe('restoreRevision — restore creates a new revision', () => {
  it('posts the revision number to the revisions route', async () => {
    const http = jest.fn(async () => resp(200, { revisionCount: 5, restoredFrom: 2 }));
    expect(await restoreRevision(http, ID, 2, GUARD)).toEqual({ kind: 'ok', revisionId: null });
    const [path, init] = http.mock.calls[0] as [string, RequestInit];
    expect(path).toBe(`${DRAFT}/revisions`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ revisionNumber: 2, ...GUARD });
  });

  it('reports error on failure', async () => {
    expect(await restoreRevision(jest.fn(async () => resp(500)), ID, 2, GUARD)).toEqual({
      kind: 'error',
    });
  });
});

describe('loadRevisions', () => {
  it('returns the revisions array newest-first as given by the API', async () => {
    const revs = [{ revisionNumber: 2, note: 'n', contentChars: 10, createdAt: 't2' }];
    const http = jest.fn(async () => resp(200, { draftId: 'd', revisions: revs }));
    expect(await loadRevisions(http, ID)).toEqual({ kind: 'ok', revisions: revs });
  });

  it('reports error on failure', async () => {
    expect(await loadRevisions(jest.fn(async () => resp(500)), ID)).toEqual({ kind: 'error' });
  });
});

describe('createDraftSaver — autosave sequencing (the load-bearing guarantee)', () => {
  it('coalesces rapid edits into a single save of the latest content', async () => {
    const save = jest.fn(async (): Promise<SaveResult> => ({ kind: 'ok', revisionCount: null, revisionId: null, updatedAt: null }));
    const saver = createDraftSaver(save, { onState() {} });
    saver.queue('a');
    saver.queue('b');
    saver.queue('c');
    saver.flush();
    await saver.whenIdle();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('c');
    expect(saver.hasPending()).toBe(false);
  });

  it('a slow earlier save NEVER overwrites a later edit; one PUT at a time, latest last', async () => {
    const calls: string[] = [];
    const gates: Array<() => void> = [];
    const save = jest.fn((content: string): Promise<SaveResult> => {
      calls.push(content);
      const d = deferred<SaveResult>();
      gates.push(() => d.resolve({ kind: 'ok', revisionCount: null, revisionId: null, updatedAt: null }));
      return d.promise;
    });
    const states: SaverState[] = [];
    const saver = createDraftSaver(save, { onState: (s) => states.push(s) });

    saver.queue('a');
    saver.flush(); // starts save('a')
    expect(calls).toEqual(['a']);

    // A later edit arrives while save('a') is still in flight.
    saver.queue('b');
    saver.flush(); // must NOT start a second concurrent save
    expect(calls).toEqual(['a']); // proof: no overlap — 'b' has not started

    gates[0](); // resolve save('a')
    await flush();

    // Only now does 'b' save — strictly after 'a' completed.
    expect(calls).toEqual(['a', 'b']);
    expect(save).toHaveBeenCalledTimes(2);

    gates[1]();
    await saver.whenIdle();

    expect(calls[calls.length - 1]).toBe('b'); // server ends with the latest edit
    expect(states[states.length - 1]).toBe('saved');
    expect(saver.hasPending()).toBe(false);
  });

  it('beginExclusive waits for an in-flight save, then blocks autosaves until release', async () => {
    const calls: string[] = [];
    const gates: Array<() => void> = [];
    const save = jest.fn((content: string): Promise<SaveResult> => {
      calls.push(content);
      const d = deferred<SaveResult>();
      gates.push(() => d.resolve({ kind: 'ok', revisionCount: null, revisionId: null, updatedAt: null }));
      return d.promise;
    });
    const saver = createDraftSaver(save, { onState() {} });

    saver.queue('a');
    saver.flush(); // save('a') in flight
    expect(calls).toEqual(['a']);

    // Checkpoint/restore asks for the lane — must not resolve while 'a' is writing.
    let acquired = false;
    const ex = saver.beginExclusive().then(() => {
      acquired = true;
    });
    await flush();
    expect(acquired).toBe(false);

    gates[0](); // 'a' finishes
    await ex;
    expect(acquired).toBe(true);

    // While the lane is held, a new edit + flush must NOT start a save.
    saver.queue('b');
    saver.flush();
    await flush();
    expect(calls).toEqual(['a']); // blocked by the exclusive hold

    // Releasing with content typed during the hold persists it, in order.
    saver.endExclusive({ persisted: 'checkpoint-content' });
    await flush();
    expect(calls).toEqual(['a', 'b']);
    gates[1]?.();
    await saver.whenIdle();
  });

  it('endExclusive({flushPending:false}) discards edits made during the write (restore wins)', async () => {
    const save = jest.fn(async (): Promise<SaveResult> => ({ kind: 'ok', revisionCount: null, revisionId: null, updatedAt: null }));
    const saver = createDraftSaver(save, { onState() {} });

    await saver.beginExclusive(); // nothing in flight → resolves immediately
    saver.queue('typed-during-restore');
    saver.endExclusive({ flushPending: false });
    await saver.whenIdle();

    expect(save).not.toHaveBeenCalled();
    expect(saver.hasPending()).toBe(false);
  });

  it('endExclusive({persisted}) drops an unchanged queue instead of re-saving it', async () => {
    const save = jest.fn(async (): Promise<SaveResult> => ({ kind: 'ok', revisionCount: null, revisionId: null, updatedAt: null }));
    const saver = createDraftSaver(save, { onState() {} });

    saver.queue('same');
    await saver.beginExclusive();
    // The exclusive write persisted 'same'; nothing new typed since.
    saver.endExclusive({ persisted: 'same' });
    await saver.whenIdle();

    expect(save).not.toHaveBeenCalled(); // no redundant autosave PUT
    expect(saver.hasPending()).toBe(false);
  });

  it('a failed save keeps content pending and reports error — never a false "saved"', async () => {
    const save = jest.fn(async (): Promise<SaveResult> => ({ kind: 'error' }));
    const states: SaverState[] = [];
    const saver = createDraftSaver(save, { onState: (s) => states.push(s) });

    saver.queue('x');
    saver.flush();
    await saver.whenIdle();

    expect(states).toContain('saving');
    expect(states[states.length - 1]).toBe('error');
    expect(states).not.toContain('saved');
    expect(saver.hasPending()).toBe(true);

    // A later flush retries and succeeds.
    save.mockResolvedValueOnce({ kind: 'ok', revisionCount: 2, revisionId: null, updatedAt: null });
    saver.flush();
    await saver.whenIdle();
    expect(save).toHaveBeenCalledTimes(2);
    expect(saver.hasPending()).toBe(false);
  });
});

describe('createDraftSaver — a session that ended mid-manuscript', () => {
  /* Reported by a beta writer returning to their book after time away: every
     save answered 401, the surface said "could not save just now", and the
     retry it offered could never succeed. The two things that must hold: the
     writer is told it is a sign-in and not a glitch, and the lane stays open
     so the very same content saves once they are back. */
  it('reports unauthorized, keeps the content, and saves it after signing back in', async () => {
    const save = jest.fn(async (): Promise<SaveResult> => ({ kind: 'unauthorized' }));
    const states: SaverState[] = [];
    const unauthorized = jest.fn();
    const saver = createDraftSaver(save, {
      onState: (s) => states.push(s),
      onUnauthorized: unauthorized,
    });

    saver.queue('a page of the book');
    saver.flush();
    await saver.whenIdle();

    expect(states[states.length - 1]).toBe('unauthorized');
    expect(states).not.toContain('saved');
    expect(states).not.toContain('error'); // not a transient failure — a sign-in
    expect(unauthorized).toHaveBeenCalledTimes(1);
    expect(saver.hasPending()).toBe(true); // the words are still held

    // Signed in again in another tab; the same content goes through.
    save.mockResolvedValueOnce({ kind: 'ok', revisionCount: 3, revisionId: 7, updatedAt: 't' });
    saver.flush();
    await saver.whenIdle();
    expect(save).toHaveBeenNthCalledWith(2, 'a page of the book');
    expect(saver.hasPending()).toBe(false);
    expect(states[states.length - 1]).toBe('saved');
  });

  it('keeps typing while signed out and saves the LATEST content, not the stale one', async () => {
    const save = jest.fn(async (): Promise<SaveResult> => ({ kind: 'unauthorized' }));
    const saver = createDraftSaver(save, { onState: () => {} });

    saver.queue('first');
    saver.flush();
    await saver.whenIdle();
    saver.queue('first, then more');
    saver.flush();
    await saver.whenIdle();

    save.mockResolvedValueOnce({ kind: 'ok', revisionCount: 1, revisionId: 2, updatedAt: null });
    saver.flush();
    await saver.whenIdle();
    expect(save).toHaveBeenLastCalledWith('first, then more');
  });
});

describe('pageEstimate', () => {
  it('is at least one page and scales by 1800 chars', () => {
    expect(pageEstimate(0)).toBe(1);
    expect(pageEstimate(1800)).toBe(1);
    expect(pageEstimate(3600)).toBe(2);
  });
});

describe('createDraftSaver — a conflict stops the lane', () => {
  it('does not retry, and says so', async () => {
    const save = jest.fn(async (): Promise<SaveResult> => ({
      kind: 'conflict',
      reason: 'stale_base',
      currentRevisionId: 9,
    }));
    const states: string[] = [];
    const conflicts: unknown[] = [];
    const saver = createDraftSaver(save, {
      onState: (s) => states.push(s),
      onConflict: (i) => conflicts.push(i),
    });
    saver.queue('a');
    saver.flush();
    await saver.whenIdle();
    saver.queue('b');
    saver.flush();
    await saver.whenIdle();
    expect(save).toHaveBeenCalledTimes(1); // the second write never went out
    expect(states).toContain('conflict');
    expect(conflicts).toEqual([{ reason: 'stale_base', currentRevisionId: 9 }]);
    expect(saver.hasPending()).toBe(true); // the writer's text is still held
  });
});
