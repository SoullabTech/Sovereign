import * as fs from 'fs';
import * as path from 'path';

/**
 * THE FOCUS CROSSING ACT — A1–A12, predeclared by the founder BEFORE
 * implementation, plus the provenance reconstruction that decides whether the
 * record is strong enough to exist.
 *
 * ⭐⭐ WHAT THE RECORD ANSWERS, and nothing else answers:
 *
 *   What exactly did the writer ask MAIA to attend to when this conversation
 *   happened?
 *
 * ⛔ IT IS NOT THE FOCUS PERSISTENCE STORE. U2 is still its own question. This
 * is an immutable-ish snapshot of ONE deliberate crossing — "this was the state
 * of declared attention at the moment the writer asked" — never "this is the
 * canonical mutable FocusSet forever". The two diverge the instant the writer
 * changes their focus after the conversation, and a record that had quietly
 * become both would then be wrong about the past in order to stay right about
 * the present.
 *
 * ⭐ THE IDEMPOTENCY LAW:
 *
 *   Retries may repeat transport. They may not create a second human act.
 *
 * So the same actId with a different Focus Set is not a retry — it is a
 * CONTRADICTION, and it is hard-refused rather than reconciled. Silently
 * rewriting the member set, the order, the active target or the Work would
 * make the record say the writer asked something they never asked.
 */

const calls: { sql: string; params: unknown[] }[] = [];
let rows: Record<string, unknown[]> = { acts: [], members: [] };
let failAfter = Infinity;

const run = async (sql: string, params: unknown[] = []) => {
    calls.push({ sql, params });
    if (calls.length > failAfter) throw new Error('substrate down mid-write');

    if (/INSERT INTO focus_crossing_acts/.test(sql)) {
      const [actId] = params as string[];
      const existing = (rows.acts as any[]).find((a) => a.act_id === actId);
      if (existing) return { rows: [existing], rowCount: 0 };
      const row = {
        act_id: params[0], member_id: params[1], work_id: params[2],
        active_member_id: params[3] ?? null, canonical_turn_id: null, completed_at: null,
      };
      (rows.acts as any[]).push(row);
      return { rows: [row], rowCount: 1 };
    }
    if (/INSERT INTO focus_crossing_act_members/.test(sql)) {
      (rows.members as any[]).push({
        act_id: params[0], focus_member_id: params[1], ordinal: params[2],
        currency_state: params[3], body_available: params[4],
        disclosure_receipt_id: params[5] ?? null,
      });
      return { rows: [], rowCount: 1 };
    }
    if (/FROM focus_crossing_act_members\b/.test(sql)) {
      const found = (rows.members as any[])
        .filter((m) => m.act_id === params[0])
        .sort((a, b) => a.ordinal - b.ordinal);
      return { rows: found, rowCount: found.length };
    }
    if (/FROM focus_crossing_acts\b/.test(sql)) {
      const found = (rows.acts as any[]).find((a) => a.act_id === params[0]);
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }
    if (/UPDATE focus_crossing_acts/.test(sql)) {
      const a = (rows.acts as any[]).find((x) => x.act_id === params[params.length - 1]);
      if (!a) return { rows: [], rowCount: 0 };
      if (a.canonical_turn_id !== null) return { rows: [], rowCount: 0 };
      a.canonical_turn_id = params[0]; a.completed_at = 'now';
      return { rows: [a], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
};

/* The transaction helper is real in production; here it is the same `run` with
   BEGIN/COMMIT/ROLLBACK recorded, so ordering and rollback are observable. */
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(run),
  transaction: jest.fn(async (cb: (tx: { query: typeof run }) => Promise<unknown>) => {
    calls.push({ sql: 'BEGIN', params: [] });
    const snapshot = JSON.parse(JSON.stringify(rows));
    try {
      const r = await cb({ query: run });
      calls.push({ sql: 'COMMIT', params: [] });
      return r;
    } catch (e) {
      rows = snapshot;
      calls.push({ sql: 'ROLLBACK', params: [] });
      throw e;
    }
  }),
}));

import { openFocusCrossingAct, completeFocusCrossingAct, readFocusCrossingAct } from '../focusCrossingAct';

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const storeSrc = strip(fs.readFileSync(path.join(__dirname, '..', 'focusCrossingAct.ts'), 'utf8'));
const migration = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'database', 'migrations',
    '20260912000001_focus_crossing_acts.sql'), 'utf8');

const FIVE = [
  { focusMemberId: 'f1', ordinal: 1, currencyState: 'current' as const, bodyAvailable: true, disclosureReceiptId: 'act-1:f1' },
  { focusMemberId: 'f2', ordinal: 2, currencyState: 'current' as const, bodyAvailable: true, disclosureReceiptId: 'act-1:f2' },
  { focusMemberId: 'f3', ordinal: 3, currencyState: 'current' as const, bodyAvailable: true, disclosureReceiptId: 'act-1:f3' },
  { focusMemberId: 'f4', ordinal: 4, currencyState: 'unverified' as const, bodyAvailable: false, disclosureReceiptId: null },
  { focusMemberId: 'f5', ordinal: 5, currencyState: 'unavailable' as const, bodyAvailable: false, disclosureReceiptId: null },
];

const open = (over: Record<string, unknown> = {}) => openFocusCrossingAct({
  actId: 'act-1', memberId: 'm-1', workId: 'w-1',
  members: FIVE, activeMemberId: 'f2', ...over,
} as never);

beforeEach(() => {
  calls.length = 0;
  rows = { acts: [], members: [] };
  failAfter = Infinity;
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

/* ══ A1 · a retry is the same act ══════════════════════════════════════════ */

describe('A1 — the same actId with identical membership is ONE act', () => {
  it('opens once and reconstructs on the retry, with no duplicate rows', async () => {
    const first = await open();
    expect(first.kind).toBe('opened');
    const again = await open();
    expect(again.kind).toBe('continued');
    expect((rows.acts as unknown[]).length).toBe(1);
    expect((rows.members as unknown[]).length).toBe(5);
  });

  it('⭐ transport repeated is not a second human act', async () => {
    await open(); await open(); await open();
    expect((rows.acts as unknown[]).length).toBe(1);
  });
});

/* ══ A2–A4, A11 · a different payload is a contradiction, not a retry ══════ */

describe('A2 — the same actId with a changed member set refuses', () => {
  it('a removed member is a contradiction', async () => {
    await open();
    const r = await open({ members: FIVE.slice(0, 4) });
    expect(r.kind).toBe('contradiction');
  });

  it('an added member is a contradiction', async () => {
    await open();
    const r = await open({
      members: [...FIVE, { focusMemberId: 'f6', ordinal: 6, currencyState: 'current', bodyAvailable: true, disclosureReceiptId: 'act-1:f6' }],
    });
    expect(r.kind).toBe('contradiction');
  });

  it('a swapped member identity is a contradiction', async () => {
    await open();
    const swapped = FIVE.map((m, i) => (i === 2 ? { ...m, focusMemberId: 'fX' } : m));
    expect((await open({ members: swapped })).kind).toBe('contradiction');
  });

  it('⛔ and nothing is rewritten by the attempt', async () => {
    await open();
    await open({ members: FIVE.slice(0, 3) });
    const back = await readFocusCrossingAct('act-1');
    expect(back?.members.map((m) => m.focusMemberId)).toEqual(['f1', 'f2', 'f3', 'f4', 'f5']);
  });
});

describe('A3 — the same actId against a different Work refuses', () => {
  it('a changed workId is a contradiction', async () => {
    await open();
    expect((await open({ workId: 'w-OTHER' })).kind).toBe('contradiction');
  });

  it('a changed memberId is a contradiction — an act belongs to one writer', async () => {
    await open();
    expect((await open({ memberId: 'm-OTHER' })).kind).toBe('contradiction');
  });
});

describe('A4 — a changed active target is a NEW act, never a retry', () => {
  it('naming a different active member on the same actId refuses', async () => {
    await open();
    expect((await open({ activeMemberId: 'f1' })).kind).toBe('contradiction');
  });

  it('clearing the active target on the same actId refuses', async () => {
    await open();
    expect((await open({ activeMemberId: null })).kind).toBe('contradiction');
  });

  it('⭐ the writer choosing a new target opens a NEW act, which is lawful', async () => {
    await open();
    const other = await open({ actId: 'act-2', activeMemberId: 'f1' });
    expect(other.kind).toBe('opened');
    expect((rows.acts as unknown[]).length).toBe(2);
  });
});

describe('A11 — member order may not change on a retry', () => {
  it('the same members in a different order is a contradiction', async () => {
    await open();
    const reordered = [FIVE[1], FIVE[0], ...FIVE.slice(2)]
      .map((m, i) => ({ ...m, ordinal: i + 1 }));
    expect((await open({ members: reordered })).kind).toBe('contradiction');
  });

  it('ordinals are stored and read back in the writer’s order', async () => {
    await open();
    const back = await readFocusCrossingAct('act-1');
    expect(back?.members.map((m) => m.ordinal)).toEqual([1, 2, 3, 4, 5]);
  });
});

/* ══ A5–A7 · the record cannot state an impossible act ═════════════════════ */

describe('A5 — an active target outside the member set refuses', () => {
  it('refuses before any row is written', async () => {
    const r = await open({ activeMemberId: 'f9' });
    expect(r.kind).toBe('refused');
    expect(rows.acts).toHaveLength(0);
    expect(rows.members).toHaveLength(0);
  });
});

describe('A6 — an unreadable active target refuses', () => {
  for (const id of ['f4', 'f5']) {
    it(`${id} cannot be the target of an act`, async () => {
      const r = await open({ activeMemberId: id });
      expect(r.kind).toBe('refused');
      expect(rows.acts).toHaveLength(0);
    });
  }

  it('⛔ and it never substitutes a readable one instead', async () => {
    await open({ activeMemberId: 'f4' });
    expect(rows.acts).toHaveLength(0);
    expect(storeSrc).not.toMatch(/activeMemberId\s*\?\?\s*|find\(.*bodyAvailable.*\)\.focusMemberId/);
  });
});

describe('A7 — an unreadable member may not carry a disclosure receipt', () => {
  it('a receipt on an unreadable member refuses the whole act', async () => {
    const lying = FIVE.map((m) => (m.focusMemberId === 'f4'
      ? { ...m, disclosureReceiptId: 'act-1:f4' } : m));
    const r = await open({ members: lying });
    expect(r.kind).toBe('refused');
    expect(rows.acts).toHaveLength(0);
  });

  it('bodyAvailable disagreeing with the currency state refuses', async () => {
    const lying = FIVE.map((m) => (m.focusMemberId === 'f5'
      ? { ...m, bodyAvailable: true } : m));
    expect((await open({ members: lying })).kind).toBe('refused');
  });
});

/* ══ A8–A9 · completion ════════════════════════════════════════════════════ */

describe('A8 — an act cannot complete while a readable member lacks its receipt', () => {
  it('a readable member with no receipt cannot be marked complete', async () => {
    const missing = FIVE.map((m) => (m.focusMemberId === 'f3'
      ? { ...m, disclosureReceiptId: null } : m));
    await open({ members: missing });
    const done = await completeFocusCrossingAct('act-1', 'turn-1');
    expect(done.kind).toBe('refused');
    expect((rows.acts as any[])[0].completed_at).toBeNull();
  });

  it('a fully receipted readable set completes', async () => {
    await open();
    expect((await completeFocusCrossingAct('act-1', 'turn-1')).kind).toBe('completed');
    expect((rows.acts as any[])[0].canonical_turn_id).toBe('turn-1');
  });
});

describe('A9 — a second canonical turn on the same act refuses', () => {
  it('one act, one MAIA turn', async () => {
    await open();
    await completeFocusCrossingAct('act-1', 'turn-1');
    const second = await completeFocusCrossingAct('act-1', 'turn-2');
    expect(second.kind).toBe('refused');
    expect((rows.acts as any[])[0].canonical_turn_id).toBe('turn-1');
  });

  it('re-completing with the SAME turn is a retry, not a second turn', async () => {
    await open();
    await completeFocusCrossingAct('act-1', 'turn-1');
    expect((await completeFocusCrossingAct('act-1', 'turn-1')).kind).toBe('completed');
  });
});

/* ══ A10 · it is provenance, never another content store ═══════════════════ */

describe('A10 — manuscript prose cannot enter the act record', () => {
  /**
   * ⛔ INSTRUMENT NOTE, and it is the C21 class. The first draft scanned the
   * raw SQL and the raw store source for a forbidden vocabulary, and failed on
   * `act_id text PRIMARY KEY` (a postgres TYPE), on a comment saying there is
   * deliberately no JSON column, and on a refusal message reading "a member
   * whose body crossed carries no receipt".
   *
   *   A prose ban must never read as the banned behaviour returning.
   *
   * So these scan COLUMN NAMES and SQL identifiers — the things that can
   * actually hold prose — never the words used to explain why they may not.
   */
  const declaration = migration.replace(/--.*/g, '');
  const columnNames = [...declaration.matchAll(/^\s{2,}([a-z_]+)\s+(text|uuid|integer|boolean|timestamptz)/gm)]
    .map((m) => m[1]);

  it('the schema declares no column that could hold Work text', () => {
    expect(columnNames.length).toBeGreaterThan(8);
    const forbidden = /\b(body|text|content|passage|quote|excerpt|summary|description|about|digest|snippet|prose)\b/i;
    for (const name of columnNames) {
      if (name === 'body_available') continue;   // a boolean, not a body
      expect(name).not.toMatch(forbidden);
    }
  });

  it('no column is free-form JSON that prose could hide inside', () => {
    expect(declaration).not.toMatch(/\bjsonb?\b/i);
    expect(declaration).not.toMatch(/\b(hstore|xml|bytea)\b/i);
  });

  it('⭐ the store writes ONLY the columns the schema declares', () => {
    /* Every identifier the store names inside an INSERT column list. Stronger
       than a word scan: a new column smuggled into either side goes red. */
    const written = new Set<string>();
    for (const m of storeSrc.matchAll(/INSERT INTO \w+\s*\n?\s*\(([^)]+)\)/g)) {
      for (const c of m[1].split(',')) written.add(c.trim());
    }
    expect(written.size).toBeGreaterThan(5);
    for (const c of written) expect(columnNames).toContain(c);
  });

  it('⛔ the member record carries identity and state — never what the member says', async () => {
    await open();
    const back = await readFocusCrossingAct('act-1');
    for (const m of back!.members) {
      expect(Object.keys(m).sort()).toEqual(
        ['bodyAvailable', 'currencyState', 'disclosureReceiptId', 'focusMemberId', 'ordinal'],
      );
    }
  });
});

/* ══ A12 · a partial write may never look like a completed crossing ════════ */

describe('A12 — a partial DB failure claims no completed crossing', () => {
  it('a failure while writing members leaves no act that reports itself open', async () => {
    failAfter = 2;
    const r = await open();
    expect(r.kind).toBe('unavailable');
  });

  it('a failure on completion leaves the act incomplete, never complete', async () => {
    await open();
    failAfter = calls.length;
    const done = await completeFocusCrossingAct('act-1', 'turn-1');
    expect(done.kind).toBe('unavailable');
    expect((rows.acts as any[])[0].completed_at).toBeNull();
  });

  it('⭐ the write is one transaction, so a torn act cannot exist', () => {
    expect(storeSrc).toMatch(/BEGIN|transaction/i);
    expect(storeSrc).toMatch(/ROLLBACK|catch/);
  });
});

/* ══ ⭐ the provenance reconstruction — the test that decides it ═══════════ */

describe('the auditor reconstruction, without consulting chat prose', () => {
  it('the record alone yields 5 declared / 3 readable / active f2 / one turn', async () => {
    await open();
    await completeFocusCrossingAct('act-1', 'turn-1');

    const act = await readFocusCrossingAct('act-1');
    expect(act).not.toBeNull();

    // 5 declared
    expect(act!.members).toHaveLength(5);
    // 3 readable
    expect(act!.members.filter((m) => m.bodyAvailable)).toHaveLength(3);
    // which 3, and by which receipts
    expect(act!.members.filter((m) => m.disclosureReceiptId !== null).map((m) => m.focusMemberId))
      .toEqual(['f1', 'f2', 'f3']);
    // the active target
    expect(act!.activeMemberId).toBe('f2');
    // one MAIA turn
    expect(act!.canonicalTurnId).toBe('turn-1');
    // and why the other two could not be read — distinguishably
    expect(act!.members.find((m) => m.focusMemberId === 'f4')!.currencyState).toBe('unverified');
    expect(act!.members.find((m) => m.focusMemberId === 'f5')!.currencyState).toBe('unavailable');

    // ⛔ and no prose was consulted, because none exists to consult.
    expect(JSON.stringify(act)).not.toMatch(/fire|banked|stones/);
  });

  it('⛔ it is a snapshot of one crossing, not the living Focus Set', () => {
    expect(storeSrc).not.toMatch(/export .*(updateFocusSet|setActiveMember|addMember|removeMember)/);
    // Nothing here mutates membership after the act opens.
    expect(storeSrc).not.toMatch(/UPDATE focus_crossing_act_members/);
  });
});
