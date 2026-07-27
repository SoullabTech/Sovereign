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
    expect(await beginDraft(http, ID)).toEqual({ kind: 'ok', content: '# A\n\nbody', revisionCount: 1 });
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
    const r = await putDraft(http, ID, { content: 'draft' });
    expect(r).toEqual({ kind: 'ok', revisionCount: 1, updatedAt: 't' });
    const [path, init] = http.mock.calls[0] as [string, RequestInit];
    expect(path).toBe(DRAFT);
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ content: 'draft' });
  });

  it('checkpoint sends checkpoint:true and the optional note', async () => {
    const http = jest.fn(async () => resp(200, { revisionCount: 3, updatedAt: 't', checkpointed: true }));
    const r = await putDraft(http, ID, { content: 'hello', checkpoint: true, note: 'first pass' });
    expect(r).toEqual({ kind: 'ok', revisionCount: 3, updatedAt: 't' });
    const body = JSON.parse((http.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({ content: 'hello', checkpoint: true, note: 'first pass' });
  });

  it('reports error on a failed save — never a false "ok"', async () => {
    expect(await putDraft(jest.fn(async () => resp(500)), ID, { content: 'x' })).toEqual({ kind: 'error' });
  });
});

describe('restoreRevision — restore creates a new revision', () => {
  it('posts the revision number to the revisions route', async () => {
    const http = jest.fn(async () => resp(200, { revisionCount: 5, restoredFrom: 2 }));
    expect(await restoreRevision(http, ID, 2)).toEqual({ kind: 'ok' });
    const [path, init] = http.mock.calls[0] as [string, RequestInit];
    expect(path).toBe(`${DRAFT}/revisions`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ revisionNumber: 2 });
  });

  it('reports error on failure', async () => {
    expect(await restoreRevision(jest.fn(async () => resp(500)), ID, 2)).toEqual({ kind: 'error' });
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
    const save = jest.fn(async (): Promise<SaveResult> => ({ kind: 'ok', revisionCount: null, updatedAt: null }));
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
      gates.push(() => d.resolve({ kind: 'ok', revisionCount: null, updatedAt: null }));
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
    save.mockResolvedValueOnce({ kind: 'ok', revisionCount: 2, updatedAt: null });
    saver.flush();
    await saver.whenIdle();
    expect(save).toHaveBeenCalledTimes(2);
    expect(saver.hasPending()).toBe(false);
  });
});

describe('pageEstimate', () => {
  it('is at least one page and scales by 1800 chars', () => {
    expect(pageEstimate(0)).toBe(1);
    expect(pageEstimate(1800)).toBe(1);
    expect(pageEstimate(3600)).toBe(2);
  });
});
