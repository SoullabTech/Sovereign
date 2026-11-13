/**
 * Falsifiers for the shadow MAIA reading meter (step M1).
 * Design: docs/programme/WRITERS-STUDIO_MAIA_READING_ALLOWANCE_DESIGN_2026-11-13.md §4 (A-numbers match where they apply).
 * Founder rulings 2026-11-13 on #1800: meter MAIA, never Works; count the amount MAIA reads; shadow first.
 */
import { execSync } from 'child_process';
import { join } from 'path';

const query = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));
const seam = jest.fn();
jest.mock('@/lib/ai/structured/router', () => ({ runStructured: (...a: unknown[]) => seam(...a) }));

import {
  USAGE_INSERT_SQL,
  bindMaiaMeter,
  maiaMeterMode,
  meteredRoute,
  reportMaiaUsage,
  shouldRecord,
} from '../maiaMeter';
import { runStructured } from '../meteredStructured';

const ROOT = join(__dirname, '..', '..', '..');
const SECRET = 'THE WRITER’S OWN SENTENCE — must never reach a usage row';
const req = { model: 'claude-opus-5', system: 'S', messages: [{ role: 'user' as const, content: SECRET }], maxTokens: 100 };
const ok = (inputTokens: number, outputTokens: number) => ({
  ok: true as const,
  result: { content: [], stopReason: 'tool_use', usage: { inputTokens, outputTokens },
    provenance: { provider: 'anthropic', model: 'claude-opus-5', reportedModel: 'claude-opus-5', modelAgreement: 'agreed', latencyMs: 1 } },
});
const flush = () => new Promise((r) => setImmediate(r));
const inserts = () => query.mock.calls.filter(([sql]) => String(sql).includes('writers_studio_maia_usage'));

const saved = process.env.WS_MAIA_METER_MODE;
beforeEach(() => { query.mockReset(); query.mockResolvedValue({ rows: [] }); seam.mockReset(); delete process.env.WS_MAIA_METER_MODE; });
afterAll(() => { if (saved === undefined) delete process.env.WS_MAIA_METER_MODE; else process.env.WS_MAIA_METER_MODE = saved; });

/** A metered route that binds a member with a posture, then makes `calls` readings. */
function route(memberId: string, sanctuary: boolean, calls: Array<[number, number]>, bind = true) {
  return meteredRoute('readings', async () => {
    if (bind) bindMaiaMeter(memberId, { sanctuary });
    const outcomes = [];
    for (const [i, o] of calls) { seam.mockResolvedValueOnce(ok(i, o)); outcomes.push(await runStructured(req as never)); }
    return outcomes;
  });
}

describe('mode switch', () => {
  it('only exactly "shadow" records; enforce is not built, so it is off', () => {
    expect(maiaMeterMode({ WS_MAIA_METER_MODE: 'shadow' })).toBe('shadow');
    for (const v of [undefined, '', 'SHADOW', 'enforce', 'on', 'true', ' shadow']) {
      expect(maiaMeterMode({ WS_MAIA_METER_MODE: v })).toBe('off');
    }
  });
});

describe('A1 · off (the default) is exactly today', () => {
  it('no write, and the handler result is returned untouched', async () => {
    const handlerResult = { anything: 1 };
    const handler = jest.fn(async () => { bindMaiaMeter('m1', { sanctuary: false }); return handlerResult; });
    expect(await meteredRoute('ask', handler)()).toBe(handlerResult);
    seam.mockResolvedValueOnce(ok(10, 2));
    await route('m1', false, [[10, 2]])();
    await flush();
    expect(query).not.toHaveBeenCalled();
  });
});

describe('A2 · shadow records every reading and never refuses', () => {
  beforeEach(() => { process.env.WS_MAIA_METER_MODE = 'shadow'; });

  it('one row per successful call, with member, act, tokens and the pinned model', async () => {
    await route('m1', false, [[1200, 300], [800, 50]])();
    await flush();
    expect(inserts().map(([, p]) => p)).toEqual([
      ['m1', 'readings', 1200, 300, 'claude-opus-5'],
      ['m1', 'readings', 800, 50, 'claude-opus-5'],
    ]);
  });

  it('the seam outcome passes through exactly, including refusals (not recorded)', async () => {
    const refusal = { ok: false, refusal: 'provider_unavailable', detail: 'x' };
    seam.mockResolvedValueOnce(refusal);
    const out = await meteredRoute('ask', async () => { bindMaiaMeter('m1', { sanctuary: false }); return runStructured(req as never); })();
    expect(out).toBe(refusal);
    await flush();
    expect(inserts()).toHaveLength(0);
  });

  it('⭐ a failed write is swallowed: the reading and the response are unaffected', async () => {
    query.mockRejectedValue(new Error('db down: INSERT … with text'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const out = await route('m1', false, [[5, 5]])();
    await flush();
    expect(out[0]).toMatchObject({ ok: true });
    expect(JSON.stringify(warn.mock.calls)).not.toContain('db down');
    warn.mockRestore();
  });

  it('background work the request started is still counted to that member', async () => {
    let background: Promise<unknown> = Promise.resolve();
    await meteredRoute('editorial_pass', async () => {
      bindMaiaMeter('m9', { sanctuary: false });
      background = (async () => { await flush(); seam.mockResolvedValueOnce(ok(7, 1)); return runStructured(req as never); })();
      return 'accepted';
    })();
    await background; await flush();
    expect(inserts().map(([, p]) => p[0])).toEqual(['m9']);
  });

  it('two concurrent requests each record their own member', async () => {
    seam.mockImplementation(async () => ok(1, 1));
    const a = meteredRoute('ask', async () => { bindMaiaMeter('alice', { sanctuary: false }); await flush(); return runStructured(req as never); });
    const b = meteredRoute('ask', async () => { bindMaiaMeter('bob', { sanctuary: false }); await flush(); return runStructured(req as never); });
    await Promise.all([a(), b(), a()]);
    await flush();
    expect(inserts().map(([, p]) => p[0]).sort()).toEqual(['alice', 'alice', 'bob']);
  });
});

describe('A3 · a usage row holds no content', () => {
  beforeEach(() => { process.env.WS_MAIA_METER_MODE = 'shadow'; });
  it('only member, act, two counts and the model — never the writer’s words', async () => {
    await route('m1', false, [[3, 4]])();
    await flush();
    const [sql, params] = inserts()[0];
    expect(params).toHaveLength(5);
    expect(JSON.stringify(params)).not.toContain(SECRET);
    expect(String(sql)).toMatch(/\(member_id, act, input_tokens, output_tokens, model\)/);
  });
  it('the table has no content column', () => {
    const sql = execSync('cat database/migrations/20261113000005_writers_studio_maia_usage.sql', { cwd: ROOT }).toString();
    const body = sql.slice(sql.indexOf('CREATE TABLE'), sql.indexOf('\n);'));
    const columns = body.split('\n').map((l) => /^ {2}([a-z_]+) /.exec(l)?.[1]).filter(Boolean);
    expect(columns.sort()).toEqual(['act', 'id', 'input_tokens', 'member_id', 'model', 'occurred_at', 'output_tokens']);
  });
});

describe('A4 · Sanctuary is never recorded', () => {
  beforeEach(() => { process.env.WS_MAIA_METER_MODE = 'shadow'; });
  it('a turn the route bound as Sanctuary writes nothing', async () => {
    await route('m1', true, [[9, 9]])();
    await flush();
    expect(inserts()).toHaveLength(0);
  });
  it('a request the route never bound (no member, no posture) writes nothing', async () => {
    await route('m1', false, [[9, 9]], false)();
    await flush();
    expect(inserts()).toHaveLength(0);
  });
  it('the write itself skips a member whose default memory mode is Sanctuary', () => {
    expect(USAGE_INSERT_SQL).toMatch(/NOT EXISTS[\s\S]*member_settings[\s\S]*default_memory_mode = 'sanctuary'/);
  });
  it('pure rule', () => {
    expect(shouldRecord('shadow', { act: 'ask', memberId: 'm', notSanctuary: true })).toBe(true);
    expect(shouldRecord('shadow', { act: 'ask', memberId: 'm', notSanctuary: false })).toBe(false);
    expect(shouldRecord('shadow', { act: 'ask', memberId: null, notSanctuary: true })).toBe(false);
    expect(shouldRecord('off', { act: 'ask', memberId: 'm', notSanctuary: true })).toBe(false);
    expect(shouldRecord('shadow', undefined)).toBe(false);
  });
});

describe('outside a metered route', () => {
  it('a reading made anywhere else is never recorded', async () => {
    process.env.WS_MAIA_METER_MODE = 'shadow';
    seam.mockResolvedValueOnce(ok(100, 100));
    await runStructured(req as never);
    reportMaiaUsage({ inputTokens: 1, outputTokens: 1, model: 'x' });
    bindMaiaMeter('m1', { sanctuary: false });
    await flush();
    expect(query).not.toHaveBeenCalled();
  });
});

describe('A13 · every Writer reader goes through the metered seam', () => {
  it('no file under the Writer reader trees imports runStructured from the seam directly (only meteredStructured.ts)', () => {
    const out = execSync(
      `git grep --untracked -l -E "import \\{[^}]*runStructured[^}]*\\} from '(@/lib/ai/structured/router|(\\.\\./)+ai/structured/router)'" -- lib/manuscript lib/writersStudio lib/writers-studio app/api/sovereign/manuscripts app/api/sovereign/living-works app/api/sovereign/writers-studio app/api/writers-studio || true`,
      { cwd: ROOT },
    ).toString().split('\n').filter(Boolean).filter((f) => !f.includes('__tests__'));
    /* classify.ts reads MAIA's own claims (not the writer's material), and its role law (readingBoundaries.test.ts) allows
       "the seam and the vocabularies only — no store": it stays on the bare seam by design. */
    expect(out.sort()).toEqual(['lib/manuscript/developmentalReading/classify.ts', 'lib/writersStudio/meteredStructured.ts']);
  });
  it('the seam itself is untouched by the meter', () => {
    const router = execSync('cat lib/ai/structured/router.ts', { cwd: ROOT }).toString();
    expect(router).not.toMatch(/maiaMeter|meteredStructured|writersStudio/);
  });
});

describe('A4b · a route tells the meter "not Sanctuary" only after it has established a KEPT turn (re-review R2-2)', () => {
  /* Each route allowed to bind a literal `false`, with the refusal that must precede the bind in its source. Under the
     Sanctuary closure (founder ruling 2026-11-09) only a declared-ordinary turn is kept; Sanctuary AND an undeclared
     posture keep nothing, so they must record nothing. */
  const LITERAL_FALSE_AFTER: Record<string, RegExp> = {
    'app/api/sovereign/manuscripts/[id]/readings/route.ts': /!posture\.keep/,
    'app/api/sovereign/manuscripts/[id]/editorial-pass/route.ts': /keepGate\(/,
    'app/api/sovereign/manuscripts/[id]/plans/route.ts': /keepGate\(/,
    'app/api/sovereign/manuscripts/[id]/structure/read/route.ts': /keepGate\(/,
    'app/api/sovereign/manuscripts/[id]/review-discuss/route.ts': /typeof body\.sanctuary !== 'boolean'[\s\S]*if \(body\.sanctuary\)/,
    'app/api/writers-studio/editorial/turn/route.ts': /posture_required[\s\S]*if \(posture\.sanctuary\)/,
  };
  const binds = () => execSync('git grep --untracked -n "bindMaiaMeter(memberId" -- app', { cwd: ROOT }).toString()
    .split('\n').filter(Boolean).map((l) => {
      const [file, line, ...rest] = l.split(':');
      return { file, line: Number(line), arg: /\{ sanctuary: ([^}]+?) \}/.exec(rest.join(':'))?.[1] };
    });

  it('a literal `false` appears only in the routes listed, and only after their refusal', () => {
    for (const b of binds().filter((x) => x.arg === 'false')) {
      const gate = LITERAL_FALSE_AFTER[b.file];
      expect(`${b.file}: literal false allowed ${gate !== undefined}`).toBe(`${b.file}: literal false allowed true`);
      const before = execSync(`cat ${JSON.stringify(b.file)}`, { cwd: ROOT }).toString().split('\n').slice(0, b.line - 1).join('\n');
      expect(`${b.file}: gate before bind ${gate!.test(before)}`).toBe(`${b.file}: gate before bind true`);
    }
  });

  it('every other bind is `true` (records nothing) or the keep decision itself', () => {
    for (const b of binds().filter((x) => x.arg !== 'false')) {
      expect(`${b.file}:${b.line} ${b.arg}`).toMatch(/ (true|!studioPosture\.keep)$/);
    }
  });
});
