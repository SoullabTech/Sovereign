/**
 * Step 4 — the editorial pass as a server run (founder ruling 2026-11-11: "Let it run on its own"). In-memory database; every model
 * call is a stub. Each "must fail if" in the design (§18) is a test.
 */
import fs from 'node:fs';
import path from 'node:path';
import { LENS_ORDER } from '@/lib/writersStudio/developPresentation';
import { advanceRun, cancelRun, startRun, viewRun, type RunDeps } from '@/lib/writersStudio/studio/passRun';

type Ev = { id: number; run_id: string; state: string; lens: string | null; reading_id: string | null; refusal: string | null; letter_id: string | null };
function world(opts: { grant?: 'work' | 'chapter' | null; sanctuary?: boolean | null; frozen?: string[]; refuse?: Record<string, number> } = {}) {
  const runs: { id: string; member_id: string; manuscript_id: string; draft_revision: number; created_at: Date }[] = [];
  const events: Ev[] = [];
  const readings: { id: string; lens: string; rev: number; scope: string[] }[] =
    (opts.frozen ?? []).map((lens) => ({ id: `old-${lens}`, lens, rev: 5, scope: ['s1', 's2'] }));
  let grant = opts.grant === undefined ? 'work' : opts.grant;
  let sanctuary = opts.sanctuary === undefined ? false : opts.sanctuary;
  const refuse = { ...(opts.refuse ?? {}) };
  let seq = 0;
  const q = jest.fn(async (sql: string, p: unknown[] = []) => {
    if (sql.includes('FROM manuscript_working_drafts d')) return { rows: [{ id: 'd1', rev: 5, sections: ['s1', 's2'] }] };
    if (sql.includes('FROM editorial_pass_runs WHERE member_id = $1 AND manuscript_id')) {
      const r = runs.filter((x) => x.member_id === p[0] && x.manuscript_id === p[1]).sort((a, b) => +b.created_at - +a.created_at);
      return { rows: r.slice(0, 1) };
    }
    if (sql.includes('FROM editorial_pass_run_events WHERE run_id')) return { rows: events.filter((e) => e.run_id === p[0]) };
    if (sql.startsWith('INSERT INTO editorial_pass_run_events')) {
      events.push({ id: ++seq, run_id: p[0] as string, state: p[1] as string, lens: p[2] as string | null, reading_id: p[3] as string | null, refusal: p[4] as string | null, letter_id: p[5] as string | null });
      return { rows: [] };
    }
    if (sql.includes("INTERVAL '1 day'")) return { rows: [{ n: String(runs.length) }] };
    if (sql.startsWith('INSERT INTO editorial_pass_runs')) {
      const r = { id: `run${runs.length + 1}`, member_id: p[0] as string, manuscript_id: p[1] as string, draft_revision: p[2] as number, created_at: new Date(Date.now() + runs.length) };
      runs.push(r); return { rows: [{ id: r.id }] };
    }
    if (sql.includes('FROM manuscript_structure_units')) return { rows: [{ n: '0' }] };
    if (sql.includes('FROM developmental_readings')) return { rows: readings.filter((r) => r.lens === p[2] && r.rev === p[3]).map((r) => ({ id: r.id })) };
    throw new Error(`unexpected SQL: ${sql.slice(0, 60)}`);
  });
  const commission = jest.fn(async (input: { lens: string }) => {
    if ((refuse[input.lens] ?? 0) > 0) { refuse[input.lens]! -= 1; return { outcome: 'refused', stage: 'read', refusal: 'claim_unbindable', detail: '' }; }
    const id = `new-${input.lens}-${commission.mock.calls.length}`;
    readings.push({ id, lens: input.lens, rev: 5, scope: ['s1', 's2'] });
    return { outcome: 'frozen', reading: { id } };
  });
  const deps: RunDeps = {
    q: q as any,
    commission: commission as any,
    load: (async (id: string) => { const r = readings.find((x) => x.id === id); return r ? { id: r.id, scope: { bodyScope: r.scope } } : null; }) as any,
    grant: async () => grant,
    sanctuaryDefault: async () => sanctuary,
    synthesize: jest.fn(async () => ({ ok: true, map: { items: [] }, deepMode: true, revisionNumber: 5, readingIds: [], provenance: {} })) as any,
    keepLetter: jest.fn(async () => 'letter-1') as any,
    opening: jest.fn(async () => null) as any,
  };
  return { deps, commission, events, runs, setGrant: (g: typeof grant) => { grant = g; }, setSanctuary: (s: boolean) => { sanctuary = s; } };
}

describe('the server run and the Free / Pro line (writing.wholeWork)', () => {
  it('⭐ not entitled: nothing is started, no run row, no reading commissioned', async () => {
    const w = world();
    w.deps.wholeWork = async () => false;
    expect(await startRun('me', 'm', w.deps)).toEqual({ ok: false, refusal: 'whole_work_entitlement_required' });
    expect(w.runs).toHaveLength(0);
    expect(w.commission).not.toHaveBeenCalled();
  });
  it('entitled: starts as before', async () => {
    const w = world();
    w.deps.wholeWork = async () => true;
    expect(await startRun('me', 'm', w.deps)).toMatchObject({ ok: true, resumed: false });
  });
  it('a failed lookup throws rather than starting or reading as "not Pro"', async () => {
    const w = world();
    w.deps.wholeWork = async () => { throw new Error('db down'); };
    await expect(startRun('me', 'm', w.deps)).rejects.toThrow('db down');
    expect(w.runs).toHaveLength(0);
  });
});

describe('the editorial pass runs on the server', () => {
  it('⭐ a full run reads every lens, synthesizes once with the deep lenses, and keeps the letter', async () => {
    const w = world();
    expect(await startRun('me', 'm', w.deps)).toMatchObject({ ok: true, resumed: false });
    const done = await advanceRun('me', 'm', w.deps);
    expect(done).toMatchObject({ state: 'done', done: LENS_ORDER.length, letterId: 'letter-1' });
    expect(w.commission).toHaveBeenCalledTimes(LENS_ORDER.length);
    const sent = (w.deps.synthesize as jest.Mock).mock.calls[0][2] as string[];
    expect(sent).toHaveLength(LENS_ORDER.length - 1);
    expect(sent.some((id) => id.includes('overview'))).toBe(false);
  });

  it('⭐ MUST FAIL IF reopening pays again for a saved lens: frozen readings of this draft are reused', async () => {
    const w = world({ frozen: ['overview', 'arc', 'voice'] });
    await startRun('me', 'm', w.deps);
    await advanceRun('me', 'm', w.deps);
    const lenses = w.commission.mock.calls.map((c) => (c[0] as { lens: string }).lens);
    expect(lenses).not.toContain('arc');
    expect(lenses).not.toContain('voice');
    expect(lenses).toHaveLength(LENS_ORDER.length - 3);
  });

  it('⭐ MUST FAIL IF a run continues after permission is withdrawn: it stops before the next reading', async () => {
    const w = world();
    await startRun('me', 'm', w.deps);
    let calls = 0;
    (w.commission as jest.Mock).mockImplementation(async (input: { lens: string }) => { calls += 1; if (calls === 2) w.setGrant('chapter'); return { outcome: 'frozen', reading: { id: `x-${input.lens}` } }; });
    const out = await advanceRun('me', 'm', w.deps);
    expect(out).toMatchObject({ state: 'stopped', refusal: 'permission_withdrawn' });
    expect(calls).toBe(2);
    expect(w.deps.synthesize).not.toHaveBeenCalled();
  });

  it('⭐ Sanctuary turned on mid-run stops it; Sanctuary at the start refuses it', async () => {
    const w = world({ sanctuary: true });
    expect(await startRun('me', 'm', w.deps)).toEqual({ ok: false, refusal: 'sanctuary' });
    const w2 = world();
    await startRun('me', 'm', w2.deps);
    (w2.commission as jest.Mock).mockImplementation(async (input: { lens: string }) => { w2.setSanctuary(true); return { outcome: 'frozen', reading: { id: `x-${input.lens}` } }; });
    expect(await advanceRun('me', 'm', w2.deps)).toMatchObject({ state: 'stopped', refusal: 'sanctuary' });
    expect(w2.commission).toHaveBeenCalledTimes(1);
  });

  it('⭐ MUST FAIL IF a refused reading counts as done: one retry, then the run fails at that lens', async () => {
    const w = world({ refuse: { voice: 2 } });
    await startRun('me', 'm', w.deps);
    const out = await advanceRun('me', 'm', w.deps);
    expect(out).toMatchObject({ state: 'failed', lens: 'voice' });
    expect(w.events.filter((e) => e.state === 'lens_done' && e.lens === 'voice')).toHaveLength(0);
    expect(w.deps.synthesize).not.toHaveBeenCalled();
    const w2 = world({ refuse: { voice: 1 } });
    await startRun('me', 'm', w2.deps);
    expect(await advanceRun('me', 'm', w2.deps)).toMatchObject({ state: 'done' });
  });

  it('a failed run continues on the writer\'s Continue, reusing the readings already made', async () => {
    const w = world({ refuse: { voice: 2 } });
    await startRun('me', 'm', w.deps);
    await advanceRun('me', 'm', w.deps);
    const before = w.commission.mock.calls.length;
    expect(await startRun('me', 'm', w.deps)).toMatchObject({ ok: true, resumed: true });
    expect(await advanceRun('me', 'm', w.deps)).toMatchObject({ state: 'done' });
    const after = w.commission.mock.calls.slice(before).map((c) => (c[0] as { lens: string }).lens);
    expect(after).toEqual(['voice', 'coherence', 'reader'].filter((l) => LENS_ORDER.includes(l as never)).filter((l) => LENS_ORDER.indexOf(l as never) >= LENS_ORDER.indexOf('voice' as never)));
  });

  it('⭐ MUST FAIL IF two runs proceed on one manuscript: an active run is resumed, never doubled', async () => {
    const w = world();
    await startRun('me', 'm', w.deps);
    expect(await startRun('me', 'm', w.deps)).toMatchObject({ ok: true, resumed: true });
    expect(w.runs).toHaveLength(1);
    const [a, b] = await Promise.all([advanceRun('me', 'm', w.deps), advanceRun('me', 'm', w.deps)]);
    expect([a?.state, b?.state]).toContain('done');
    expect(w.commission).toHaveBeenCalledTimes(LENS_ORDER.length);
  });

  it('no whole-Work permission: the run is not started', async () => {
    expect(await startRun('me', 'm', world({ grant: 'chapter' }).deps)).toEqual({ ok: false, refusal: 'not_permitted' });
  });

  it('a cancelled run reads nothing more', async () => {
    const w = world();
    await startRun('me', 'm', w.deps);
    expect(await cancelRun('me', 'm', w.deps)).toBe(true);
    expect(await advanceRun('me', 'm', w.deps)).toMatchObject({ state: 'cancelled' });
    expect(w.commission).not.toHaveBeenCalled();
  });

  it('the daily ceiling is honoured (placeholder 3 until the founder sets it)', async () => {
    const w = world();
    for (let i = 0; i < 3; i += 1) { await startRun('me', 'm', w.deps); await cancelRun('me', 'm', w.deps); }
    expect(await startRun('me', 'm', w.deps)).toEqual({ ok: false, refusal: 'daily_limit' });
  });

  it('⭐ MUST FAIL IF the run and the route synthesize differently: both call the one synthesis', () => {
    const run = fs.readFileSync(path.join(process.cwd(), 'lib/writersStudio/studio/passRun.ts'), 'utf8');
    const route = fs.readFileSync(path.join(process.cwd(), 'app/api/sovereign/manuscripts/[id]/attention-map/route.ts'), 'utf8');
    expect(run).toMatch(/synthesize: synthesizeAttentionMap/);
    expect(route).toMatch(/await synthesizeAttentionMap\(memberId, manuscriptId, body\.readingIds, body\.request\)/);
    expect(route).not.toMatch(/runStructured/);
  });

  it('the start route runs the keep gate before anything', () => {
    const r = fs.readFileSync(path.join(process.cwd(), 'app/api/sovereign/manuscripts/[id]/editorial-pass/route.ts'), 'utf8');
    expect(r.indexOf('await keepGate(memberId, body)')).toBeLessThan(r.indexOf('await startRun('));
  });
});
