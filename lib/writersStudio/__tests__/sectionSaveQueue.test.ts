/**
 * The save queue, tested against the races rather than the calm path.
 *
 * Every test here describes a way a writer could lose text: a save built on a
 * version that moved, a section switch during a save, a conflicted body
 * silently dropped, a stale server snapshot overwriting unsaved work. The calm
 * path gets one test; the rest is the dangerous seam.
 */

import { SectionSaveQueue, type SaveOutcome } from '../sectionSaveQueue';

/** A server that serializes and enforces version, like the real one. */
function fakeServer(startVersion = 12) {
  let version = startVersion;
  const committed: { sectionId: string; body: string }[] = [];
  const gates: (() => void)[] = [];
  let holdNext = false;

  const save = async (sectionId: string, body: string, baseVersion: number): Promise<SaveOutcome> => {
    if (holdNext) {
      holdNext = false;
      await new Promise<void>((r) => gates.push(r));
    }
    if (baseVersion !== version) return { ok: false, refusal: 'stale_base' };
    version += 1;
    committed.push({ sectionId, body });
    return { ok: true, version };
  };
  return {
    save,
    committed,
    get version() { return version; },
    holdNextSave() { holdNext = true; },
    release() { gates.shift()?.(); },
    /** Simulate another device advancing the draft. */
    advanceElsewhere() { version += 1; },
  };
}

describe('the calm path', () => {
  it('saves one section and advances the version', async () => {
    const s = fakeServer();
    const q = new SectionSaveQueue(12, s.save);
    q.enqueue('A', 'hello');
    await q.settled();
    expect(s.committed).toEqual([{ sectionId: 'A', body: 'hello' }]);
    expect(q.state().version).toBe(13);
    expect(q.statusOf('A')).toBe('clean');
    expect(q.hasUnsavedWork()).toBe(false);
  });
});

describe('THE RACE: switching sections during a save', () => {
  it('B waits for A instead of racing it into stale_base', async () => {
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);

    s.holdNextSave();
    q.enqueue('A', 'chapter seventeen text');   // dispatched, held open
    await Promise.resolve();
    q.enqueue('B', 'chapter eighteen text');    // edited while A is in flight

    expect(q.statusOf('A')).toBe('saving');
    expect(q.statusOf('B')).toBe('dirty');

    s.release();
    await q.settled();

    // Both landed, in order, and neither was refused.
    expect(s.committed).toEqual([
      { sectionId: 'A', body: 'chapter seventeen text' },
      { sectionId: 'B', body: 'chapter eighteen text' },
    ]);
    expect(q.state().version).toBe(14);
    expect(q.hasUnsavedWork()).toBe(false);
  });

  it('B is saved with the version A produced, not the one B was typed at', async () => {
    const seen: number[] = [];
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, async (id, body, base) => {
      seen.push(base);
      return s.save(id, body, base);
    });
    s.holdNextSave();
    q.enqueue('A', 'a');
    await Promise.resolve();
    q.enqueue('B', 'b');
    s.release();
    await q.settled();
    expect(seen).toEqual([12, 13]);   // NOT [12, 12]
  });

  it('editing A again while A is in flight does not lose the newer text', async () => {
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);
    s.holdNextSave();
    q.enqueue('A', 'first');
    await Promise.resolve();
    q.enqueue('A', 'first and second');
    s.release();
    await q.settled();
    expect(s.committed).toEqual([
      { sectionId: 'A', body: 'first' },
      { sectionId: 'A', body: 'first and second' },
    ]);
  });

  it('typing repeatedly before dispatch coalesces to the latest text', async () => {
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);
    s.holdNextSave();
    q.enqueue('A', 'x');          // dispatched and held
    await Promise.resolve();
    q.enqueue('B', 'b1');
    q.enqueue('B', 'b2');
    q.enqueue('B', 'b3');
    s.release();
    await q.settled();
    expect(s.committed.filter((c) => c.sectionId === 'B')).toEqual([{ sectionId: 'B', body: 'b3' }]);
  });
});

describe('a refused save NEVER loses text', () => {
  it('a conflict keeps the body pending and marks the section', async () => {
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);
    s.advanceElsewhere();                       // another device wrote
    q.enqueue('A', 'work the writer just did');
    await q.settled();

    expect(s.committed).toEqual([]);
    expect(q.statusOf('A')).toBe('conflict');
    expect(q.localBody('A')).toBe('work the writer just did');
    expect(q.hasUnsavedWork()).toBe(true);
  });

  it('does not auto-retry a conflict — that is how a device overwrites another', async () => {
    let calls = 0;
    const q = new SectionSaveQueue(12, async () => { calls++; return { ok: false, refusal: 'stale_base' }; });
    q.enqueue('A', 'text');
    await q.settled();
    await new Promise((r) => setTimeout(r, 20));
    expect(calls).toBe(1);
  });

  it('a network failure is also kept, not discarded', async () => {
    const q = new SectionSaveQueue(12, async () => { throw new Error('offline'); });
    q.enqueue('A', 'unsent words');
    await q.settled();
    expect(q.localBody('A')).toBe('unsent words');
    expect(q.hasUnsavedWork()).toBe(true);
  });

  it('a conflicted save does not clobber a newer edit made while it was open', async () => {
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);
    s.holdNextSave();
    q.enqueue('A', 'older');
    await Promise.resolve();
    q.enqueue('A', 'newer');
    s.advanceElsewhere();          // the save in flight will come back stale
    s.release();
    await q.settled();
    expect(q.localBody('A')).toBe('newer');
  });

  it('typing does NOT clear a conflict — a keystroke is not a reconciliation', () => {
    // The earlier version of this test reached through the abstraction
    // (`(q as any).version = ...`) to manufacture a rebase the queue cannot
    // perform, so it proved something that did not exist. What the queue
    // actually does is latch, and that is what is asserted now.
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);
    s.advanceElsewhere();
    q.enqueue('A', 'v1');
    return q.settled().then(async () => {
      expect(q.statusOf('A')).toBe('conflict');
      q.enqueue('A', 'v2');
      await q.settled();
      expect(q.statusOf('A')).toBe('conflict');   // still latched
      expect(q.localBody('A')).toBe('v2');        // but the newer text is kept
      expect(s.committed).toEqual([]);            // and nothing was sent
    });
  });

  it('takeLocalVersion resolves it — and needs the server version to do so', async () => {
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);
    s.advanceElsewhere();                       // server now at 13
    q.enqueue('A', 'the writer\'s text');
    await q.settled();
    expect(q.statusOf('A')).toBe('conflict');

    // The caller can only know 13 by reloading, which means the member could
    // have seen the other version. Overwriting is then a decision, not a race.
    q.takeLocalVersion('A', s.version);
    await q.settled();
    expect(s.committed).toEqual([{ sectionId: 'A', body: "the writer's text" }]);
    expect(q.statusOf('A')).toBe('clean');
  });

  it('discardLocalVersion drops the local text without sending it', async () => {
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);
    s.advanceElsewhere();
    q.enqueue('A', 'text the writer chose to drop');
    await q.settled();
    q.discardLocalVersion('A', s.version);
    await q.settled();
    expect(s.committed).toEqual([]);
    expect(q.statusOf('A')).toBe('clean');
    expect(q.localBody('A')).toBeNull();
    expect(q.hasUnsavedWork()).toBe(false);
  });

  it('an unknown outcome is an error, NOT a conflict', async () => {
    // Never tell someone their draft changed elsewhere because Wi-Fi dropped.
    const q = new SectionSaveQueue(12, async () => { throw new Error('offline'); });
    q.enqueue('A', 'unsent words');
    await q.settled();
    expect(q.statusOf('A')).toBe('error');
    expect(q.state().conflicted).toEqual([]);
  });

  it('an error does not latch: typing retries, because the server still checks', async () => {
    let attempts = 0;
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, async (id, body, base) => {
      attempts++;
      if (attempts === 1) throw new Error('offline');
      return s.save(id, body, base);
    });
    q.enqueue('A', 'first try');
    await q.settled();
    expect(q.statusOf('A')).toBe('error');
    q.enqueue('A', 'second try');
    await q.settled();
    expect(s.committed).toEqual([{ sectionId: 'A', body: 'second try' }]);
    expect(q.statusOf('A')).toBe('clean');
  });
});

describe('local text stays authoritative while pending', () => {
  it('PENDING WINS: a newer edit is shown, never the older in-flight snapshot', async () => {
    // A is saving "first"; the writer types more; they navigate away and back.
    // Returning the in-flight body here would hand the UI stale text from the
    // very method that exists to prevent stale text reaching the screen.
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);
    s.holdNextSave();
    q.enqueue('A', 'first');
    await Promise.resolve();
    q.enqueue('A', 'first and second');

    expect(q.localBody('A')).toBe('first and second');
    expect(q.statusOf('A')).toBe('dirty');   // not 'saving': the visible words are not on the wire

    s.release();
    await q.settled();
    expect(q.localBody('A')).toBeNull();
  });

  it('returning to a section in flight shows the local body, not the server copy', async () => {
    const s = fakeServer(12);
    const q = new SectionSaveQueue(12, s.save);
    s.holdNextSave();
    q.enqueue('A', 'the edit in flight');
    await Promise.resolve();
    // the UI navigates away and back; it must not repopulate from an older snapshot
    expect(q.localBody('A')).toBe('the edit in flight');
    s.release();
    await q.settled();
    expect(q.localBody('A')).toBeNull();   // now safe to read from the server
  });

  it('a clean section has no local override', () => {
    const q = new SectionSaveQueue(12, async () => ({ ok: true, version: 13 }));
    expect(q.localBody('untouched')).toBeNull();
  });
});
