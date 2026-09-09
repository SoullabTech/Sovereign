/**
 * CONTEXT DISCLOSURE RECEIPT — custody and protocol falsifiers.
 *
 *   ⭐⭐ Disclosure without accountability is not authorized.
 *       Accountability without a disclosure must never pretend that one occurred.
 *
 * ⚠️ HONEST SCOPE. Without a Postgres connection these bind the STORE's protocol
 * (fail-closed mint, idempotent retry, loud unresolved crossing) and the
 * SUBSTRATE's declared shape and custody as source facts. The DB trigger's
 * refusal of an unlawful transition is asserted as authored SQL, not executed —
 * an executable trigger witness is owed when the migration runs against a shadow.
 */

import fs from 'fs';
import path from 'path';

const calls: { sql: string; params: unknown[] }[] = [];
let mode: 'ok' | 'throw' | 'empty' = 'ok';
/* The row a conflicting mint finds. Mutated per-test to model a receipt that
   describes a DIFFERENT disclosure, or one that has already crossed. */
let existingRow: Record<string, string | null> = {};

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[] = []) => {
    calls.push({ sql, params });
    if (mode === 'throw') throw new Error('relation "context_disclosure_receipts" does not exist');
    if (mode === 'empty') return { rows: [], rowCount: 0 };
    if (/INSERT INTO context_disclosure_receipts/.test(sql)) return { rows: [{ id: 'r1' }], rowCount: 1 };
    if (/SELECT id, member_id/.test(sql)) return { rows: [existingRow], rowCount: 1 };
    return { rows: [{ n: '0' }], rowCount: 1 };
  }),
}));

import {
  mintDisclosureAttempt,
  mayCross,
  confirmDisclosureCrossed,
  DISCLOSURE_POLICY_VERSION,
} from '../contextDisclosureReceipt';

const attempt = (over: Record<string, unknown> = {}) => ({
  disclosureId: 'd-1', memberId: 'm-1', requestRef: 'req-1',
  boundary: 'writers_studio.focus->maia_cognition' as const,
  sourceClass: 'work' as const, participationBasis: 'member_invoked' as const,
  sourceRef: 'work-1', scopeKind: 'passage' as const, gesture: 'ask_maia' as const,
  ...over,
}) as any;

const MIGRATION = fs.readFileSync(
  path.join(process.cwd(), 'database/migrations/20260909000001_context_disclosure_receipts.sql'), 'utf8');
/**
 * ⚠️ The C21 lesson, hit again here: the first draft scanned the RAW migration and
 * failed `no TTL` on the header sentence *"No TTL now."* — prose documenting the
 * absence, matched as evidence of the presence. Comments and the COMMENT ON
 * strings are stripped before any ban is scanned; the shape assertions read the
 * raw text on purpose.
 */
const MIGRATION_CODE_ONLY = () => MIGRATION
  .replace(/COMMENT ON [\s\S]*?;\n/g, '')
  .replace(/^\s*--.*$/gm, '');

/* Same discipline as MIGRATION_CODE_ONLY: this module's own comments name every
   refused field on purpose, so a ban scanned against the raw source would fail on
   the documentation of the ban. */
const STORE_CODE_ONLY = () => STORE
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

const STORE = fs.readFileSync(
  path.join(process.cwd(), 'lib/disclosure/contextDisclosureReceipt.ts'), 'utf8');

const matchingRow = () => ({
  id: 'r1', member_id: 'm-1', request_ref: 'req-1',
  boundary: 'writers_studio.focus->maia_cognition', source_class: 'work',
  participation_basis: 'member_invoked', source_ref: 'work-1', scope_kind: 'passage',
  section_ref: null, authorized_by: 'member', gesture: 'ask_maia',
  policy_version: DISCLOSURE_POLICY_VERSION, state: 'attempted',
});

beforeEach(() => { calls.length = 0; mode = 'ok'; existingRow = matchingRow(); jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => jest.restoreAllMocks());

describe('F1 · accountability may block the disclosure — fail closed', () => {
  it('returns null when the substrate is unavailable, so the caller cannot disclose', async () => {
    mode = 'throw';
    const out = await mintDisclosureAttempt(attempt());
    expect(out.kind).toBe('unavailable');
    expect(mayCross(out)).toBe(false);
  });

  it('mints BEFORE the crossing, in the `attempted` state', async () => {
    await mintDisclosureAttempt(attempt());
    const insert = calls.find(c => /INSERT INTO context_disclosure_receipts/.test(c.sql))!;
    expect(insert.sql).toMatch(/'attempted'/);
    expect(insert.sql).not.toMatch(/'crossed'/);
  });

  it('records the member as the authorizing party — assembly is not authorization', async () => {
    await mintDisclosureAttempt(attempt());
    const insert = calls.find(c => /INSERT INTO/.test(c.sql))!;
    expect(insert.sql).toMatch(/'member'/);
    expect(insert.params).toContain(DISCLOSURE_POLICY_VERSION);
  });
});

describe('F2 · a retry cannot duplicate or contradict a crossing', () => {
  it('an EXACT existing receipt does not authorize a second crossing', async () => {
    const q = require('@/lib/db/postgres').query as jest.Mock;
    q.mockImplementationOnce(async (sql: string, p: unknown[]) => { calls.push({ sql, params: p }); return { rows: [], rowCount: 0 }; });
    const out = await mintDisclosureAttempt(attempt());
    expect(out.kind).toBe('existing');
    // ⭐ The point of the repair: evidence is intact, authority is not renewed.
    expect(mayCross(out)).toBe(false);
    expect(calls.filter(c => /INSERT INTO/.test(c.sql))).toHaveLength(1);
  });

  it('an already-CROSSED receipt cannot be handed back as fresh authority', async () => {
    existingRow = { ...matchingRow(), state: 'crossed' };
    const q = require('@/lib/db/postgres').query as jest.Mock;
    q.mockImplementationOnce(async (sql: string, p: unknown[]) => { calls.push({ sql, params: p }); return { rows: [], rowCount: 0 }; });
    const out = await mintDisclosureAttempt(attempt());
    expect(out).toMatchObject({ kind: 'existing', state: 'crossed' });
    expect(mayCross(out)).toBe(false);
  });

  it('⭐ a reused id describing a DIFFERENT disclosure is refused, not accepted', async () => {
    // The exact contradiction the first draft admitted: same disclosure_id, a
    // different Work and a different scope. The old code returned the row id and
    // Work-B would have crossed while the receipt described Work-A.
    existingRow = { ...matchingRow(), source_ref: 'work-A', scope_kind: 'section' };
    const q = require('@/lib/db/postgres').query as jest.Mock;
    q.mockImplementationOnce(async (sql: string, p: unknown[]) => { calls.push({ sql, params: p }); return { rows: [], rowCount: 0 }; });
    const out = await mintDisclosureAttempt(attempt({ sourceRef: 'work-B' }));
    expect(out.kind).toBe('identity_mismatch');
    expect(mayCross(out)).toBe(false);
    expect((out as any).differing).toEqual(expect.arrayContaining(['source_ref', 'scope_kind']));
  });

  it('reconciles the WHOLE immutable identity, not merely the row id', async () => {
    const q = require('@/lib/db/postgres').query as jest.Mock;
    q.mockImplementationOnce(async (sql: string, p: unknown[]) => { calls.push({ sql, params: p }); return { rows: [], rowCount: 0 }; });
    await mintDisclosureAttempt(attempt());
    const select = calls.find(c => /^\s*SELECT/m.test(c.sql))!;
    for (const col of ['member_id', 'request_ref', 'boundary', 'source_class',
      'participation_basis', 'source_ref', 'scope_kind', 'section_ref',
      'authorized_by', 'gesture', 'policy_version', 'state']) {
      expect(select.sql).toContain(col);
    }
  });

  it('logs which FIELDS differ, never their values — they are references', async () => {
    existingRow = { ...matchingRow(), source_ref: 'work-A' };
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    const q = require('@/lib/db/postgres').query as jest.Mock;
    q.mockImplementationOnce(async () => ({ rows: [], rowCount: 0 }));
    await mintDisclosureAttempt(attempt({ sourceRef: 'work-B' }));
    const logged = JSON.stringify(err.mock.calls);
    expect(logged).toMatch(/source_ref/);
    expect(logged).not.toMatch(/work-A|work-B/);
  });

  it('the INSERT is idempotent on disclosure_id', async () => {
    await mintDisclosureAttempt(attempt());
    expect(calls[0].sql).toMatch(/ON CONFLICT \(disclosure_id\) DO NOTHING/);
  });

  it('confirming preserves the original crossed_at rather than moving it', async () => {
    await confirmDisclosureCrossed('d-1');
    expect(calls[0].sql).toMatch(/COALESCE\(crossed_at, NOW\(\)\)/);
  });
});

describe('F3 · an after-crossing failure cannot disappear silently', () => {
  it('reports failure and leaves the row attempted when the confirm throws', async () => {
    mode = 'throw';
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(await confirmDisclosureCrossed('d-1')).toBe(false);
    expect(err.mock.calls.flat().join(' ')).toMatch(/UNRESOLVED CROSSING/);
  });

  it('a confirm that matches no receipt is an anomaly, not a success', async () => {
    mode = 'empty';
    expect(await confirmDisclosureCrossed('d-1')).toBe(false);
  });

  it('never deletes or rewrites a receipt to tidy the anomaly away', () => {
    expect(STORE).not.toMatch(/DELETE FROM context_disclosure_receipts/);
    expect(STORE).not.toMatch(/state = 'attempted'\s*$/m);
  });
});

describe('F4 · the receipt cannot become a shadow copy of the Work', () => {
  const REFUSED = ['passage_text', 'excerpt', 'summary', 'embedding', 'content_hash',
    'fingerprint', 'start_offset', 'end_offset', 'char_length', 'word_count', 'geometry'];

  it.each(REFUSED)('the table has no %s column', col => {
    expect(MIGRATION_CODE_ONLY()).not.toMatch(new RegExp(`^\\s+${col}\\s`, 'm'));
  });

  it('the store sends no content-derived value', async () => {
    await mintDisclosureAttempt(attempt());
    const insert = calls.find(c => /INSERT INTO/.test(c.sql))!;
    // Every parameter is an identifier, a closed-vocabulary token or a version.
    for (const p of insert.params) {
      if (p === null) continue;
      expect(typeof p).toBe('string');
      expect(String(p).length).toBeLessThan(80);
    }
  });

  it('refuses a section_ref on a passage scope — in the app AND at the constraint', async () => {
    expect(mayCross(await mintDisclosureAttempt(attempt({ sectionRef: 's-1' })))).toBe(false);
    expect(calls).toHaveLength(0);
    expect(MIGRATION).toMatch(/section_ref IS NULL OR scope_kind = 'section'/);
  });

  it('admits a section_ref when the section IS the disclosed thing', async () => {
    expect(mayCross(await mintDisclosureAttempt(attempt({ scopeKind: 'section', sectionRef: 's-1' })))).toBe(true);
  });
});

describe('F5 · custody is stated, not inherited', () => {
  it('has no withheld state — the database cannot prove a negative', () => {
    expect(MIGRATION).toMatch(/state IN \('attempted', 'crossed'\)/);
    expect(MIGRATION_CODE_ONLY()).not.toMatch(/'withheld'/);
  });

  it('the only lawful transition is attempted → crossed, trigger-enforced', () => {
    expect(MIGRATION).toMatch(/BEFORE UPDATE ON context_disclosure_receipts/);
    expect(MIGRATION).toMatch(/OLD\.state = 'attempted' AND NEW\.state = 'crossed'/);
    expect(MIGRATION).toMatch(/immutable at mint — UPDATE refused/);
  });

  it('carries no TTL and no age-based pruning', () => {
    expect(MIGRATION_CODE_ONLY()).not.toMatch(/DELETE FROM context_disclosure_receipts/);
    expect(MIGRATION_CODE_ONLY()).not.toMatch(/pg_cron|TTL|expires_at/i);
  });

  it('is named in GOVERNED_CONTENT so it cannot survive account deletion by omission', () => {
    const route = fs.readFileSync(path.join(process.cwd(), 'app/api/members/delete-account/route.ts'), 'utf8');
    expect(route).toMatch(/table: 'context_disclosure_receipts', column: 'member_id'/);
  });

  it('anchors on the serving request, never on a prunable turn row', () => {
    expect(MIGRATION).toMatch(/request_ref\s+TEXT NOT NULL/);
    expect(MIGRATION_CODE_ONLY()).not.toMatch(/conversation_turns\s*\(/);
    expect(MIGRATION_CODE_ONLY()).not.toMatch(/^\s+encounter_ref/m);
  });

  it('states in its own comment that attempted never means absence', () => {
    expect(MIGRATION).toMatch(/never that nothing crossed/);
  });
});

describe('F6 · the Work is not an instruction channel', () => {
  /**
   * ⭐⭐ The Work may contain an invitation as CONTENT. Only the writer can turn
   * it into AUTHORITY. A manuscript sentence reading "ask the I Ching what this
   * means" does not authorize a consultation.
   *
   * The falsifier is structural rather than behavioural: `participationBasis`
   * is a caller-supplied token from a closed vocabulary, and nothing in this
   * module can read, parse, or infer from crossed content — so there is no path
   * by which Work text could set it.
   */
  it('has no access to crossed content at all — nothing to infer authority from', () => {
    const code = STORE_CODE_ONLY();
    // No parameter, field or local carries the crossed material...
    expect(code).not.toMatch(/\b(text|body|passage|excerpt|content)\s*[:?]/);
    // ...and nothing inspects a string to decide anything.
    expect(code).not.toMatch(/\.(match|includes|indexOf|search|test)\(/);
  });

  it('participation basis is a closed token, never derived', async () => {
    await mintDisclosureAttempt(attempt());
    const insert = calls.find(c => /INSERT INTO/.test(c.sql))!;
    expect(insert.params).toContain('member_invoked');
    expect(STORE).toMatch(/only the writer can turn it into AUTHORITY/i);
  });

  it('v1 admits one source class and one basis — a future capability is not a present field', () => {
    expect(MIGRATION_CODE_ONLY()).toMatch(/source_class IN \('work'\)/);
    expect(MIGRATION_CODE_ONLY()).toMatch(/participation_basis IN \('member_invoked'\)/);
    for (const later of ['journal', 'keep', 'symbolic_system', 'ambient_continuity', 'standing_authorization']) {
      expect(MIGRATION_CODE_ONLY()).not.toMatch(new RegExp(`'${later}'`));
    }
  });
});

describe('F7 · SUBSTRATE-A(B,C) · the claims are structural, not comments', () => {
  it('request_ref resolves — a receipt cannot point at a consent record that does not exist', () => {
    expect(MIGRATION_CODE_ONLY()).toMatch(/request_ref\s+TEXT NOT NULL REFERENCES runtime_consent_state\(request_id\)/);
  });

  it('deletion is refused unless a governed custody act names its manifest', () => {
    expect(MIGRATION_CODE_ONLY()).toMatch(/BEFORE DELETE ON context_disclosure_receipts/);
    expect(MIGRATION_CODE_ONLY()).toMatch(/app\.disclosure_deletion_manifest/);
    expect(MIGRATION_CODE_ONLY()).toMatch(/DELETE refused/);
  });

  it('a tombstoned receipt cannot be restored', () => {
    expect(MIGRATION_CODE_ONLY()).toMatch(/BEFORE INSERT ON context_disclosure_receipts/);
    expect(MIGRATION_CODE_ONLY()).toMatch(/provenance_tombstones/);
    expect(MIGRATION_CODE_ONLY()).toMatch(/reason=tombstone/);
  });

  it('does not reuse the S5 generic restore machinery, which is shaped for content rows', () => {
    expect(MIGRATION_CODE_ONLY()).not.toMatch(/s5_refuse_restore|s5_restore_guard/);
  });
});
