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
  putDraftSections,
  checkpointServerDraft,
  applySectionEdit,
  flattenDraftSections,
  sectionOffsets,
  sectionIndexAtOffset,
  type DraftSection,
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
      sectionAddressable: false,
      sections: null,
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
      sectionAddressable: false,
      sections: null,
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

describe('checkpointServerDraft — bodyless server-truth checkpoint', () => {
  it('sends the guard as headers and NO request body', async () => {
    const http = jest.fn(async () => resp(200, {
      revisionCount: 4, revisionId: 8, updatedAt: 't', checkpointed: true,
    }));
    const r = await checkpointServerDraft(http, ID, GUARD);
    expect(r).toEqual({ kind: 'ok', revisionCount: 4, revisionId: 8, updatedAt: 't' });
    const [path, init] = http.mock.calls[0] as [string, RequestInit];
    expect(path).toBe(`${DRAFT}/checkpoint`);
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
    const headers = init.headers as Record<string, string>;
    expect(headers['x-draft-base-revision']).toBe('4');
    expect(headers['idempotency-key']).toBe('k-1');
  });

  it('preserves conflict semantics without retrying', async () => {
    const http = jest.fn(async () => resp(409, { reason: 'stale_base', currentRevisionId: 9 }));
    expect(await checkpointServerDraft(http, ID, GUARD)).toEqual({
      kind: 'conflict', reason: 'stale_base', currentRevisionId: 9,
    });
    expect(http).toHaveBeenCalledTimes(1);
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
    /* `restorable` defaults true where the server omits it: on an unconverted
       draft every revision is restorable under the existing contract. */
    expect(await loadRevisions(http, ID)).toEqual({
      kind: 'ok',
      revisions: [{ ...revs[0], restorable: true }],
    });
  });

  it('carries a section-addressable draft\'s non-restorable revisions through', async () => {
    /* A revision written before the conversion has no recorded partition, so
       the server marks it non-restorable. Losing that flag here would offer the
       member a restore that can only be refused. */
    const http = jest.fn(async () => resp(200, {
      draftId: 'd',
      sectionAddressable: true,
      revisions: [
        { revisionNumber: 2, note: null, contentChars: 4, createdAt: 't2', restorable: true },
        { revisionNumber: 1, note: null, contentChars: 4, createdAt: 't1', restorable: false },
      ],
    }));
    const r = await loadRevisions(http, ID);
    expect(r.kind).toBe('ok');
    expect((r as { revisions: { restorable: boolean }[] }).revisions.map((x) => x.restorable))
      .toEqual([true, false]);
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

/* ── the section-addressable draft ────────────────────────────────────────── */

const SECTIONS: DraftSection[] = [
  { id: 's-1', text: 'One\n\nfirst\n\n' },
  { id: 's-2', text: 'Two\n\nsecond\n' },
];

describe('loadDraft — the D9 representation', () => {
  it('carries server-minted section identities through', async () => {
    const http = jest.fn(async () => resp(200, {
      sectionAddressable: true,
      sections: SECTIONS,
      content: flattenDraftSections(SECTIONS),
      revisionCount: 3,
      revisionId: 7,
    }));
    const r = await loadDraft(http, ID);
    expect(r).toMatchObject({ kind: 'ok', sectionAddressable: true, sections: SECTIONS });
  });

  it('does NOT treat a draft as section-addressable on sections alone', async () => {
    /* The server discriminates; the client must not sniff for a key. A draft
       that is not addressable is writable by content, and guessing otherwise
       would send sections the server refuses. */
    const http = jest.fn(async () => resp(200, { sections: SECTIONS, content: 'x' }));
    expect(await loadDraft(http, ID)).toMatchObject({ sectionAddressable: false, sections: null });
  });

  it('refuses a partially-formed section list rather than a partial picture', async () => {
    /* A dropped section would make the editor's very first save an incomplete
       payload — refused AFTER the member had already typed into it.
       This originally asserted a DOWNGRADE to a content-authoritative draft,
       which was the fail-open defect: it answered "the client cannot read this
       draft's sections" with "then let the legacy writable editor have it".
       The answer is `unreadable`; the exhaustive controls are below. */
    for (const bad of [
      [{ id: 's-1', text: 'a' }, { id: 's-2' }],
      [{ id: 's-1', text: 'a' }, { text: 'b' }],
      [{ id: '', text: 'a' }],
      [{ id: 's-1', text: 3 }],
    ]) {
      const http = jest.fn(async () => resp(200, {
        sectionAddressable: true, sections: bad, content: 'ab',
      }));
      expect(await loadDraft(http, ID)).toEqual({ kind: 'unreadable' });
    }
  });
});

describe('putDraftSections', () => {
  it('sends sections and NEVER content', async () => {
    const http = jest.fn(async () => resp(200, { revisionId: 5 }));
    await putDraftSections(http, ID, { sections: SECTIONS, ...GUARD });
    const body = JSON.parse((http.mock.calls[0][1] as RequestInit).body as string);
    expect(body.sections).toEqual(SECTIONS);
    /* Content on a converted draft is derived server-side. Sending it too is
       two claims about the same text, and the server refuses that outright. */
    expect(Object.prototype.hasOwnProperty.call(body, 'content')).toBe(false);
  });

  it('sends only id and text — no client-side extras ride along', async () => {
    const http = jest.fn(async () => resp(200, {}));
    await putDraftSections(http, ID, {
      sections: [{ id: 's-1', text: 'a', dirty: true } as DraftSection & { dirty: boolean }],
      ...GUARD,
    });
    const body = JSON.parse((http.mock.calls[0][1] as RequestInit).body as string);
    expect(body.sections).toEqual([{ id: 's-1', text: 'a' }]);
  });

  it('reads a typed refusal as a refusal, not as a stale_base conflict', async () => {
    /* Both arrive as 409. Reporting a refusal as stale_base would tell the
       writer another tab overwrote them when nothing did. */
    const http = jest.fn(async () => resp(409, {
      refusal: 'unknown_section_id', detail: 's-9',
    }));
    expect(await putDraftSections(http, ID, { sections: SECTIONS, ...GUARD }))
      .toEqual({ kind: 'refused', refusal: 'unknown_section_id', detail: 's-9' });
  });

  it('still reads a real conflict as a conflict', async () => {
    const http = jest.fn(async () => resp(409, { reason: 'stale_base', currentRevisionId: 9 }));
    expect(await putDraftSections(http, ID, { sections: SECTIONS, ...GUARD }))
      .toEqual({ kind: 'conflict', reason: 'stale_base', currentRevisionId: 9 });
  });
});

describe('applySectionEdit', () => {
  it('replaces one section and leaves the rest byte-identical', () => {
    const next = applySectionEdit(SECTIONS, 's-2', 'changed');
    expect(next[0]).toBe(SECTIONS[0]);
    expect(next[1]).toEqual({ id: 's-2', text: 'changed' });
  });

  it('returns a NEW array for a real edit — the saver compares by identity', () => {
    expect(applySectionEdit(SECTIONS, 's-1', 'x')).not.toBe(SECTIONS);
  });

  it('returns the SAME array for a no-op, so nothing is queued needlessly', () => {
    expect(applySectionEdit(SECTIONS, 's-1', SECTIONS[0].text)).toBe(SECTIONS);
  });

  it('an unknown id changes nothing — the client cannot mint a boundary', () => {
    /* Appending would create an identity the draft does not own, and the save
       carrying it would be refused as unknown_section_id. */
    const next = applySectionEdit(SECTIONS, 's-99', 'ghost');
    expect(next).toBe(SECTIONS);
    expect(next).toHaveLength(2);
  });

  it('never changes the number or order of sections', () => {
    const next = applySectionEdit(SECTIONS, 's-1', 'x');
    expect(next.map((s) => s.id)).toEqual(SECTIONS.map((s) => s.id));
  });
});

describe('flattenDraftSections', () => {
  it('adds no separator — any separator would be a character nobody wrote', () => {
    expect(flattenDraftSections([{ id: 'a', text: 'x' }, { id: 'b', text: 'y' }])).toBe('xy');
  });

  it('matches the content the server derives from the same sections', () => {
    expect(flattenDraftSections(SECTIONS)).toBe('One\n\nfirst\n\nTwo\n\nsecond\n');
  });
});

describe('sectionOffsets / sectionIndexAtOffset', () => {
  it('offsets start at zero and advance by each section length', () => {
    expect(sectionOffsets(SECTIONS)).toEqual([0, SECTIONS[0].text.length]);
  });

  it('maps a whole-draft offset onto the section holding it', () => {
    const start = SECTIONS[0].text.length;
    expect(sectionIndexAtOffset(SECTIONS, 0)).toBe(0);
    expect(sectionIndexAtOffset(SECTIONS, start - 1)).toBe(0);
    expect(sectionIndexAtOffset(SECTIONS, start)).toBe(1);
    expect(sectionIndexAtOffset(SECTIONS, 10_000)).toBe(1);
  });

  it('answers -1 when there are no sections rather than inventing one', () => {
    expect(sectionIndexAtOffset([], 0)).toBe(-1);
  });
});

describe('createDraftSaver — sections travel the same single-flight lane', () => {
  const states: SaverState[] = [];
  const drain = () => new Promise<void>((r) => setTimeout(r, 0));

  beforeEach(() => { states.length = 0; });

  it('persists the NEWEST section state last when an edit lands mid-save', async () => {
    const seen: DraftSection[][] = [];
    let release: (() => void) | null = null;
    const saver = createDraftSaver<DraftSection[]>(async (v) => {
      seen.push(v);
      if (seen.length === 1) await new Promise<void>((r) => { release = r; });
      return { kind: 'ok', revisionCount: 1, revisionId: seen.length + 1, updatedAt: null };
    }, { onState: (s) => states.push(s) });

    const first = applySectionEdit(SECTIONS, 's-1', 'A');
    saver.queue(first);
    saver.flush();
    await drain();
    const second = applySectionEdit(first, 's-1', 'AB');
    saver.queue(second);
    release!();
    await saver.whenIdle();

    expect(seen).toEqual([first, second]);
    expect(states[states.length - 1]).toBe('saved');
  });

  it('a typed refusal closes the lane and keeps the words queued', async () => {
    const saver = createDraftSaver<DraftSection[]>(
      async () => ({ kind: 'refused', refusal: 'section_state_required', detail: null }),
      { onState: (s) => states.push(s) },
    );
    saver.queue(SECTIONS);
    saver.flush();
    await saver.whenIdle();

    expect(states).toContain('refused');
    /* Nothing the member wrote is dropped — but retrying the identical payload
       would refuse identically, so the lane does not reopen on its own. */
    expect(saver.hasPending()).toBe(true);
    saver.queue(applySectionEdit(SECTIONS, 's-1', 'more'));
    saver.flush();
    await saver.whenIdle();
    expect(states.filter((x) => x === 'saving')).toHaveLength(1);
  });

  it('reports the refusal so the surface can name it', async () => {
    const seen: { refusal: string; detail: string | null }[] = [];
    const saver = createDraftSaver<DraftSection[]>(
      async () => ({ kind: 'refused', refusal: 'unknown_section_id', detail: 's-9' }),
      { onState: () => {}, onRefused: (i) => seen.push(i) },
    );
    saver.queue(SECTIONS);
    saver.flush();
    await saver.whenIdle();
    expect(seen).toEqual([{ refusal: 'unknown_section_id', detail: 's-9' }]);
  });
});

/* ── failing CLOSED on an unreadable section representation ───────────────── */

/**
 * The server claims section authority; the section state cannot be established.
 *
 * ⛔ The one answer that must never be produced here is a content-authoritative
 * representation. That answer opens the legacy whole-document editor onto a
 * draft the Canvas owns — the single outcome the Press handoff exists to
 * prevent — and the writer discovers it only when a save they already made is
 * refused, or worse, when a boundary the client never saw is written over.
 */
const MALFORMED: [string, unknown][] = [
  ['sections absent entirely', undefined],
  ['sections null', null],
  ['sections not an array', { '0': { id: 'a', text: 'x' } }],
  ['sections empty', []],
  ['an entry that is not an object', ['a string']],
  ['an entry that is null', [null]],
  ['an entry missing id', [{ text: 'x' }]],
  ['an entry with an empty id', [{ id: '', text: 'x' }]],
  ['an entry with a non-string id', [{ id: 7, text: 'x' }]],
  ['an entry missing text', [{ id: 'a' }]],
  ['an entry with non-string text', [{ id: 'a', text: 7 }]],
  ['one good entry and one malformed', [{ id: 'a', text: 'x' }, { id: 'b' }]],
];

describe('loadDraft — fails CLOSED when section state cannot be established', () => {
  for (const [name, sections] of MALFORMED) {
    it(`${name} → unreadable, never a writable legacy draft`, async () => {
      const body: Record<string, unknown> = { sectionAddressable: true, content: 'the whole draft' };
      if (sections !== undefined) body.sections = sections;
      const r = await loadDraft(jest.fn(async () => resp(200, body)), ID);
      expect(r.kind).toBe('unreadable');
      /* The load-bearing half of the assertion: not merely "not ok", but never
         a representation any surface would treat as content-authoritative. */
      expect((r as { sectionAddressable?: boolean }).sectionAddressable).toBeUndefined();
    });
  }

  it('a draft the server does NOT call section-addressable stays writable', async () => {
    /* The fail-closed rule is about a claim the client cannot honour. Where no
       claim is made, a legacy draft is written by content, and a stray
       `sections` key changes nothing about that. */
    const r = await loadDraft(jest.fn(async () => resp(200, {
      content: 'legacy', sections: 'nonsense',
    })), ID);
    expect(r).toMatchObject({ kind: 'ok', sectionAddressable: false, sections: null });
  });
});

describe('beginDraft — fails CLOSED on the same responses', () => {
  for (const [name, sections] of MALFORMED) {
    it(`${name} → unreadable, so a NEW draft never lands in the legacy editor`, async () => {
      const body: Record<string, unknown> = { id: 'd', sectionAddressable: true, content: 'x' };
      if (sections !== undefined) body.sections = sections;
      const r = await beginDraft(jest.fn(async () => resp(201, body)), ID);
      expect(r.kind).toBe('unreadable');
      expect((r as { sectionAddressable?: boolean }).sectionAddressable).toBeUndefined();
    });
  }

  it('a well-formed section-addressable create reports its authority', async () => {
    /* The positive control the fail-closed cases are measured against: this is
       the response a Press begin must route to the read-only handoff, NOT to
       the writable editor. */
    const r = await beginDraft(jest.fn(async () => resp(201, {
      id: 'd', sectionAddressable: true, sections: SECTIONS,
      content: flattenDraftSections(SECTIONS), revisionCount: 1, revisionId: 1,
    })), ID);
    expect(r).toMatchObject({ kind: 'ok', sectionAddressable: true, sections: SECTIONS });
  });

  it('a legacy create still reports content authority', async () => {
    const r = await beginDraft(jest.fn(async () => resp(201, {
      id: 'd', content: '# A\n\nbody', revisionCount: 1,
    })), ID);
    expect(r).toMatchObject({ kind: 'ok', sectionAddressable: false, sections: null });
  });
});
