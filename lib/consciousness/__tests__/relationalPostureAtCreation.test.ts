/**
 * RELATIONAL POSTURE-AT-CREATION — acceptance proof.
 *
 * WHY THIS EXISTS: `observeRelationalContent` has received the turn's consent
 * posture as a REQUIRED argument since RU-0 (2026-08-10) and refuses outright
 * under Sanctuary — but the rows it wrote recorded nothing about that posture.
 * The sibling guard test (`relationalSanctuaryGuard.test.ts`) names the exact
 * consequence in its own header: "the relational tables carry no
 * `posture_at_creation`, so such a row is not even identifiable afterwards."
 *
 * Measured in production 2026-08-11: 1,165 `relationship_entries` and 44
 * `member_relationships`, not one able to state the posture it was created
 * under. That indeterminacy is why the named-person reader has never been wired
 * to the live conversational route.
 *
 * WHAT THIS ASSERTS — the founder's four acceptance conditions, 2026-08-11:
 *   1. normal turn            → every row records 'normal'
 *   2. sanctuary turn         → observer still refuses persistence
 *   3. unknown/invalid posture → no relational write at all (fail closed)
 *   4. existing rows          → untouched; no backfill, no inference
 *
 * SCOPE: creation posture only. Says nothing about retrieval, identity
 * resolution, correction, or continuity — those remain open and unauthorized.
 */
import { readFileSync } from 'fs';
import path from 'path';

const insertOne = jest.fn();
const queryOne = jest.fn();
const query = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  insertOne: (...a: unknown[]) => insertOne(...a),
  queryOne: (...a: unknown[]) => queryOne(...a),
  query: (...a: unknown[]) => query(...a),
}));

import { observeRelationalContent } from '../relationalObserver';

/** Two relational signals → confidence 0.56, above the 0.35 write threshold. */
const RELATIONAL_MESSAGE = 'my partner and I keep arguing about the same thing';
const MAIA_RESPONSE = 'That sounds like a pattern worth looking at.';

/** The observer is fire-and-forget; let its background promise settle. */
const settle = () => new Promise((r) => setImmediate(r));

beforeEach(() => {
  jest.clearAllMocks();
  queryOne.mockResolvedValue({ id: 'rel-existing' }); // catch-all already exists
  insertOne.mockResolvedValue({ id: 'entry-1' });
  query.mockResolvedValue({ rows: [] });
});

describe('1 — normal turn records posture explicitly', () => {
  it('writes posture_at_creation: "normal" on every relational row', async () => {
    observeRelationalContent('member-1', RELATIONAL_MESSAGE, MAIA_RESPONSE, {
      isSanctuary: false,
    });
    await settle();

    expect(insertOne).toHaveBeenCalled();
    for (const [table, row] of insertOne.mock.calls as [string, Record<string, unknown>][]) {
      expect({ table, posture: row.posture_at_creation }).toEqual({
        table,
        posture: 'normal',
      });
    }
  });

  it('covers relationship_entries specifically — the 1,165-row table', async () => {
    observeRelationalContent('member-1', RELATIONAL_MESSAGE, MAIA_RESPONSE, {
      isSanctuary: false,
    });
    await settle();

    const entryCall = (insertOne.mock.calls as [string, Record<string, unknown>][]).find(
      ([t]) => t === 'relationship_entries'
    );
    expect(entryCall).toBeDefined();
    expect(entryCall![1].posture_at_creation).toBe('normal');
  });
});

describe('2 — sanctuary turn still refuses persistence', () => {
  it('performs no write of any kind', async () => {
    observeRelationalContent('member-1', RELATIONAL_MESSAGE, MAIA_RESPONSE, {
      isSanctuary: true,
    });
    await settle();

    expect(insertOne).not.toHaveBeenCalled();
    expect(queryOne).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses silently — the refusal itself must not be logged per-turn', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    observeRelationalContent('member-1', RELATIONAL_MESSAGE, MAIA_RESPONSE, {
      isSanctuary: true,
    });
    await settle();
    // Logging the refusal would leak the fact and cadence of sanctuary use.
    expect(warn).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
    warn.mockRestore();
    log.mockRestore();
  });
});

describe('3 — indeterminate posture fails closed', () => {
  // Types are erased at runtime and both call sites are route handlers fed by
  // dynamic input, so each of these is reachable in production.
  const INDETERMINATE: [string, unknown][] = [
    ['undefined', undefined],
    ['null', null],
    ['empty object', {}],
    ['string "false"', { isSanctuary: 'false' }],
    ['string "true"', { isSanctuary: 'true' }],
    ['number 0', { isSanctuary: 0 }],
    ['isSanctuary undefined', { isSanctuary: undefined }],
  ];

  it.each(INDETERMINATE)('refuses to write when posture is %s', async (_label, posture) => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    observeRelationalContent(
      'member-1',
      RELATIONAL_MESSAGE,
      MAIA_RESPONSE,
      posture as { isSanctuary: boolean }
    );
    await settle();

    expect(insertOne).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
    // Loud, unlike the sanctuary path: an unreadable posture is a defect, and
    // saying so leaks nothing about a member.
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('posture indeterminate'));
    warn.mockRestore();
  });

  it('a truthy non-boolean is NOT treated as sanctuary-and-therefore-safe', async () => {
    // Regression guard: `if (posture.isSanctuary)` alone would let
    // { isSanctuary: 'false' } through as falsy-checked truthy garbage. The
    // typeof check is what makes unknown ≠ normal.
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    observeRelationalContent('member-1', RELATIONAL_MESSAGE, MAIA_RESPONSE, {
      isSanctuary: 'false',
    } as unknown as { isSanctuary: boolean });
    await settle();
    expect(insertOne).not.toHaveBeenCalled();
  });
});

describe('4 — existing rows remain untouched', () => {
  const migration = readFileSync(
    path.resolve(
      __dirname,
      '../../../database/migrations/20260812000002_relational_posture_at_creation.sql'
    ),
    'utf8'
  );

  it('labels historical rows "unknown-historical" — not "normal"', () => {
    expect(migration).toContain("DEFAULT 'unknown-historical'");
    expect(migration).not.toMatch(/DEFAULT\s+'normal'/);
  });

  it('drops the default so new rows must state posture explicitly', () => {
    for (const t of [
      'member_relationships',
      'relationship_entries',
      'relationship_entry_patterns',
    ]) {
      expect(migration).toContain(`ALTER TABLE ${t} ALTER COLUMN posture_at_creation DROP DEFAULT`);
    }
  });

  it('performs NO backfill and NO inference over existing rows', () => {
    // The founder's boundary: "no historical backfill; no attempt to infer
    // posture for the existing 1,165 entries."
    expect(migration).not.toMatch(/UPDATE\s+(member_relationships|relationship_entries|relationship_entry_patterns)/i);
    expect(migration).not.toMatch(/SET\s+posture_at_creation/i);
  });

  it('mint gate refuses anything but "normal" on new rows', () => {
    expect(migration).toContain("NEW.posture_at_creation <> 'normal'");
    expect(migration).toMatch(/RAISE EXCEPTION/);
  });

  it('does not weaken Sanctuary or touch catch-all behaviour', () => {
    expect(migration).not.toMatch(/DROP\s+TRIGGER\s+.*sanctuary/i);
    // The catch-all may be NAMED in a comment (the scope boundary cites it);
    // what must not exist is executable SQL that touches it.
    const executable = migration
      .split('\n')
      .filter((l) => !l.trim().startsWith('--'))
      .join('\n');
    expect(executable).not.toContain('Unresolved Relational Field');
  });
});
