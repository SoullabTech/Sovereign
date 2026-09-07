/**
 * WS-EXPORT-CURRENT-DRAFT · SETTLE REACHABILITY
 *
 * The founder's decisive falsifier, written first because everything else here
 * exists to serve it:
 *
 *   Edit a sentence, press Export while that edit is still pending, and the
 *   exported file must either CONTAIN that sentence or REFUSE. It may never
 *   successfully download without it.
 *
 * The server guard alone cannot produce that outcome — a caller that does not
 * settle names a version the server happily agrees with while the sentence is
 * still in flight. So the guarantee lives in the pairing, and these tests
 * exercise the pairing rather than either half.
 */

import { settleDraft } from '../settleDraft';
import { exportCurrentDraft, exportWithoutSettling } from '../exportDraft';
import type { SettleTarget } from '../settleDraft';

/**
 * A writing session with one pending sentence and a save lane that takes
 * `landsAfter` polls to acknowledge it. The version advances ONLY when the
 * save lands — which is the property the whole guarantee rests on.
 */
function session(opts: { landsAfter: number; version: number }): SettleTarget & {
  flushed: () => number;
  land: () => void;
} {
  let flushes = 0;
  let remaining = Infinity; // nothing settles until flushed
  let version = opts.version;
  return {
    flushPending: () => {
      flushes += 1;
      remaining = opts.landsAfter;
    },
    hasUnsavedWork: () => {
      if (remaining === Infinity) return true;
      if (remaining > 0) {
        remaining -= 1;
        return true;
      }
      return false;
    },
    currentRevisionId: () => version,
    flushed: () => flushes,
    land: () => {
      version += 1;
      remaining = 0;
    },
  };
}

const immediateSleep = () => Promise.resolve();

describe('settleDraft', () => {
  it('flushes, waits for quiet, then reads the acknowledged version', async () => {
    const s = session({ landsAfter: 3, version: 41 });
    const out = await settleDraft(s, { sleep: immediateSleep });
    expect(out).toEqual({ ok: true, version: 41 });
    expect(s.flushed()).toBe(1);
  });

  it('⛔ refuses rather than proceeding when the lane will not go quiet', async () => {
    /* Never settles. Without a deadline this is an infinite wait; with one it
       is a refusal the writer can see. */
    const stuck: SettleTarget = {
      flushPending: () => {},
      hasUnsavedWork: () => true,
      currentRevisionId: () => 99,
    };
    let t = 0;
    const out = await settleDraft(stuck, {
      timeoutMs: 100,
      now: () => (t += 60),
      sleep: immediateSleep,
    });
    expect(out).toEqual({ ok: false, reason: 'unsettled' });
  });

  it('⛔ never reads the version before the lane is quiet', async () => {
    /* The ordering defect: the queue's version advances as saves are
       acknowledged, so a version read mid-flight names a state that is about
       to stop being true — and the server, told it, agrees with a claim the
       writer never made. */
    const reads: boolean[] = [];
    let quiet = false;
    const t: SettleTarget = {
      flushPending: () => {
        setTimeout(() => { quiet = true; }, 0);
      },
      hasUnsavedWork: () => !quiet,
      currentRevisionId: () => {
        reads.push(quiet);
        return 7;
      },
    };
    await settleDraft(t, { sleep: () => new Promise((r) => setTimeout(r, 1)) });
    expect(reads).toEqual([true]); // read exactly once, and only while quiet
  });
});

describe('⛔ THE FALSIFIER — a pending sentence is never silently dropped', () => {
  /**
   * The server, modelled honestly: it holds a version and the text known at
   * that version, and answers by comparing the caller's claim to its own state
   * in ONE read. Nothing here is generous about what the caller meant.
   */
  function server(initial: { version: number; text: string }) {
    const state = { ...initial };
    const calls: { url: string; body: unknown }[] = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ url, body });
      if (url.includes('/write-state')) {
        return new Response(JSON.stringify({ mode: 'section_aware', version: state.version }), {
          status: 200,
        });
      }
      const claimed = (body as { draftVersion?: number } | undefined)?.draftVersion;
      if (claimed === undefined) {
        return new Response(JSON.stringify({ error: 'settle_required' }), { status: 409 });
      }
      if (claimed !== state.version) {
        return new Response(JSON.stringify({ error: 'unsettled_draft' }), { status: 409 });
      }
      return new Response(state.text, { status: 200 });
    };
    return { state, calls, fetcher };
  }

  it('CONTAINS it: the settle lands the sentence, and the export carries it', async () => {
    const srv = server({ version: 4, text: 'chapter one' });
    const s = session({ landsAfter: 2, version: 4 });

    /* The save lands during the settle — exactly the real sequence: the flush
       sends it, the lane goes quiet, the version advances with it. */
    const original = s.hasUnsavedWork.bind(s);
    let polls = 0;
    (s as SettleTarget).hasUnsavedWork = () => {
      const busy = original();
      if (!busy && polls++ === 0) {
        srv.state.version = 5;
        srv.state.text = 'chapter one. And the pending sentence.';
        s.land();
      }
      return busy;
    };

    const out = await exportCurrentDraft(srv.fetcher, 'm1', 'pdf', s, { sleep: immediateSleep });
    expect(out.kind).toBe('ok');
    if (out.kind !== 'ok') return;
    expect(await out.blob.text()).toContain('And the pending sentence.');
  });

  it('OR REFUSES: a draft that moved after settling is never exported', async () => {
    const srv = server({ version: 4, text: 'chapter one' });
    const s = session({ landsAfter: 1, version: 4 });

    /* Someone else wrote between the settle and the request. The claim is
       honest and stale, and staleness is a refusal. */
    srv.state.version = 9;

    const out = await exportCurrentDraft(srv.fetcher, 'm1', 'pdf', s, { sleep: immediateSleep });
    expect(out).toEqual({ kind: 'moved' });
  });

  it('⛔ NEVER downloads without it: an unsettled lane requests nothing at all', async () => {
    const srv = server({ version: 4, text: 'chapter one' });
    const stuck: SettleTarget = {
      flushPending: () => {},
      hasUnsavedWork: () => true,
      currentRevisionId: () => 4,
    };
    let t = 0;
    const out = await exportCurrentDraft(srv.fetcher, 'm1', 'pdf', stuck, {
      timeoutMs: 100,
      now: () => (t += 60),
      sleep: immediateSleep,
    });
    expect(out).toEqual({ kind: 'unsettled' });
    /* Not merely "no file" — no request. A render that is never asked for
       cannot produce provenance, a file, or 120s of pandoc. */
    expect(srv.calls).toEqual([]);
  });

  it('⛔ a refusal is never retried into a newer state', async () => {
    /* The retry that would defeat the whole guard: settle again, get the NEWER
       version, export that. The writer settled one state and would receive
       another. So the module returns the refusal and does not loop. */
    const srv = server({ version: 4, text: 'old' });
    const s = session({ landsAfter: 1, version: 3 }); // claim is already stale
    const out = await exportCurrentDraft(srv.fetcher, 'm1', 'pdf', s, { sleep: immediateSleep });
    expect(out).toEqual({ kind: 'moved' });
    expect(srv.calls).toHaveLength(1);
  });

  it('sends the claim as an omitted field, never as null, when there is no draft', async () => {
    const srv = server({ version: 0, text: 'source' });
    await exportCurrentDraft(srv.fetcher, 'm1', 'pdf', null, { sleep: immediateSleep });
    expect(srv.calls[0].body).toEqual({ format: 'pdf' });
    expect(Object.keys(srv.calls[0].body as object)).not.toContain('draftVersion');
  });
});

describe('exportWithoutSettling — the weaker door, honestly weaker', () => {
  function pressServer(state: { version: number | null; text: string }) {
    const calls: { url: string; body: unknown }[] = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ url, body });
      if (url.includes('/write-state')) {
        return state.version === null
          ? new Response(JSON.stringify({ mode: 'no_draft' }), { status: 200 })
          : new Response(JSON.stringify({ mode: 'continuous', version: state.version }), {
              status: 200,
            });
      }
      const claimed = (body as { draftVersion?: number } | undefined)?.draftVersion;
      if (state.version !== null && claimed !== state.version) {
        return new Response(JSON.stringify({ error: 'unsettled_draft' }), { status: 409 });
      }
      return new Response(state.text, { status: 200 });
    };
    return { calls, fetcher };
  }

  it('names the version the server acknowledges rather than claiming nothing', async () => {
    const srv = pressServer({ version: 12, text: 'book' });
    const out = await exportWithoutSettling(srv.fetcher, 'm1', 'pdf');
    expect(out.kind).toBe('ok');
    expect(srv.calls[1].body).toEqual({ format: 'pdf', draftVersion: 12 });
  });

  it('sends NO claim when the manuscript has never been drafted', async () => {
    /* The Source IS the current state there, so there is nothing to settle and
       nothing to name. This is the one correct absence. */
    const srv = pressServer({ version: null, text: 'source book' });
    const out = await exportWithoutSettling(srv.fetcher, 'm1', 'pdf');
    expect(out.kind).toBe('ok');
    expect(srv.calls[1].body).toEqual({ format: 'pdf' });
  });

  it('a 404 write-state means no draft, not a failure', async () => {
    const fetcher = async (url: string, init?: RequestInit) =>
      url.includes('/write-state')
        ? new Response('', { status: 404 })
        : new Response('source book', { status: 200 });
    const out = await exportWithoutSettling(fetcher, 'm1', 'pdf');
    expect(out.kind).toBe('ok');
  });

  it('⛔ still refuses when the draft moved under it', async () => {
    const srv = pressServer({ version: 12, text: 'book' });
    const fetcher = async (url: string, init?: RequestInit) => {
      const res = await srv.fetcher(url, init);
      if (url.includes('/write-state')) return res;
      return res;
    };
    /* The version read is stale by the time the export lands. */
    const staleSrv = pressServer({ version: 12, text: 'book' });
    const moving = async (url: string, init?: RequestInit) => {
      if (url.includes('/write-state')) return staleSrv.fetcher(url, init);
      return new Response(JSON.stringify({ error: 'unsettled_draft' }), { status: 409 });
    };
    void fetcher;
    expect(await exportWithoutSettling(moving, 'm1', 'pdf')).toEqual({ kind: 'moved' });
  });

  it('distinguishes an empty page from its own malformed request', async () => {
    /* A 400 is not one thing, and dressing a client bug as the writer's blank
       page sends them looking for writing they did not lose. */
    const empty = async (url: string) =>
      url.includes('/write-state')
        ? new Response(JSON.stringify({ mode: 'no_draft' }), { status: 200 })
        : new Response(JSON.stringify({ error: 'This manuscript has no sections to render' }), {
            status: 400,
          });
    expect(await exportWithoutSettling(empty, 'm1', 'pdf')).toEqual({ kind: 'empty' });

    const malformed = async (url: string) =>
      url.includes('/write-state')
        ? new Response(JSON.stringify({ mode: 'no_draft' }), { status: 200 })
        : new Response(JSON.stringify({ error: 'draftVersion must be a number' }), { status: 400 });
    expect(await exportWithoutSettling(malformed, 'm1', 'pdf')).toEqual({ kind: 'error' });
  });
});
