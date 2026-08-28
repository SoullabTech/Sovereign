/**
 * WS2-SUBSTRATE-01 Repair 2 — the mutual-exclusion invariant.
 *
 * The claim under test is NOT "the routes transition correctly". It is the
 * stronger one the migration makes: a consideration and a belonging
 * declaration CANNOT both exist for one material/Work pair, even when two
 * member acts race.
 *
 * Three of the four required falsifications live here. The fourth — real
 * concurrent PostgreSQL — needs a database this container does not have, and
 * is `scripts/verify-ws2-substrate-01-concurrency.ts`, a pre-merge gate on a
 * host that can run it. What CAN be pinned here is the structure that makes
 * the race impossible, so a future edit that removes the lock fails in CI
 * rather than in production.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATION = readFileSync(
  join(
    process.cwd(),
    'database/migrations/20260828000001_living_work_material_considerations.sql'
  ),
  'utf8'
);

/**
 * EXACTLY-ONCE DDL — and this suite's own correctness depends on it.
 *
 * `4fb520f9c` shipped this file with the whole tail duplicated: a dangling
 * DROP TRIGGER, a second CREATE TABLE, and a SECOND copy of the guard — the
 * OLD, unlocked one. Two failures in one artifact. The migration would not
 * parse; and if someone repaired only the syntax, the second CREATE OR REPLACE
 * would win and silently reinstate the raceable guard.
 *
 * The structural pin below sliced from the FIRST function definition to the
 * FIRST terminator, so it proved the first copy had the lock while the LAST
 * copy was what the database would actually run. A green test over the wrong
 * copy is worse than no test.
 *
 * So uniqueness is asserted before anything is sliced, and the guard is taken
 * from the LAST definition — the one PostgreSQL would end up with.
 */
function occurrences(needle: string): number {
  return MIGRATION.split(needle).length - 1;
}

describe('the migration defines each object exactly once', () => {
  it.each([
    ['CREATE TABLE IF NOT EXISTS living_work_material_considerations', 1],
    ['CREATE OR REPLACE FUNCTION refuse_material_relationship_conflict', 1],
    ['CREATE INDEX IF NOT EXISTS living_work_material_considerations_work_idx', 1],
    ['CREATE TRIGGER living_work_material_considerations_no_declaration', 1],
    ['CREATE TRIGGER living_work_materials_no_consideration', 1],
    ['pg_advisory_xact_lock', 1],
  ])('%s appears exactly %i time(s)', (needle, want) => {
    expect(occurrences(needle as string)).toBe(want);
  });

  it('has no dangling DROP TRIGGER — every one names its table', () => {
    const drops = [...MIGRATION.matchAll(/DROP TRIGGER IF EXISTS[\s\S]{0,200}?;/g)].map(
      (m) => m[0]
    );
    expect(drops.length).toBeGreaterThan(0);
    for (const d of drops) expect(d).toMatch(/\bON\s+\w+\s*;/);
  });
});

/**
 * The guard body as PostgreSQL would finally have it: the LAST definition.
 * With uniqueness asserted above, last and first are the same — but taking the
 * last is what makes the assertion meaningful rather than incidental.
 */
const GUARD = (() => {
  const start = MIGRATION.lastIndexOf(
    'CREATE OR REPLACE FUNCTION refuse_material_relationship_conflict'
  );
  const end = MIGRATION.indexOf('$$ LANGUAGE plpgsql;', start);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return MIGRATION.slice(start, end);
})();

describe('the pair lock is acquired before either counterpart is read', () => {
  it('takes a transaction-scoped advisory lock', () => {
    expect(GUARD).toContain('pg_advisory_xact_lock');
    /* xact-scoped, not session-scoped: a session lock would outlive the
       transaction and leak across pooled connections. */
    expect(GUARD).not.toMatch(/pg_advisory_lock\s*\(/);
  });

  it('locks the PAIR, not the whole Work', () => {
    expect(GUARD).toContain('hashtext(NEW.living_work_id::text)');
    expect(GUARD).toContain("hashtext(NEW.material_type || ':' || NEW.material_id)");
  });

  it('acquires the lock BEFORE the first counterpart SELECT — in both branches', () => {
    const lockAt = GUARD.indexOf('pg_advisory_xact_lock');
    const selects = [...GUARD.matchAll(/SELECT count\(\*\) INTO counterpart/g)].map(
      (m) => m.index as number
    );
    // Both branches read a counterpart...
    expect(selects).toHaveLength(2);
    // ...and both do so after the lock. A lock inside one branch only would
    // leave the other branch racing.
    for (const at of selects) expect(lockAt).toBeLessThan(at);
  });

  it('takes the lock exactly once, on a path both branches pass through', () => {
    expect([...GUARD.matchAll(/pg_advisory_xact_lock/g)]).toHaveLength(1);
    // It is above the branch, so neither branch can be edited out of it.
    expect(GUARD.indexOf('pg_advisory_xact_lock')).toBeLessThan(GUARD.indexOf('IF TG_TABLE_NAME'));
  });
});

describe('both tables are guarded, and the guard refuses rather than clears', () => {
  it('fires on INSERT and UPDATE of both tables', () => {
    expect(MIGRATION).toMatch(
      /BEFORE INSERT OR UPDATE ON living_work_material_considerations/
    );
    expect(MIGRATION).toMatch(/BEFORE INSERT OR UPDATE ON living_work_materials/);
  });

  it('never deletes the counterpart — the transition stays a visible member act', () => {
    expect(GUARD).not.toMatch(/DELETE\s+FROM/i);
    expect(GUARD).not.toMatch(/UPDATE\s+living_work/i);
  });

  it('raises restrict_violation with the recognizable prefix, in both branches', () => {
    expect([...GUARD.matchAll(/ERRCODE = 'restrict_violation'/g)]).toHaveLength(2);
    expect([...GUARD.matchAll(/material_relationship_conflict:/g)]).toHaveLength(2);
  });
});

describe("'belongs' is never a state in the enum", () => {
  it('permits maybe and not_now only', () => {
    const check = MIGRATION.match(/CHECK \(state IN \([^)]*\)\)/);
    expect(check).not.toBeNull();
    expect(check![0]).toBe("CHECK (state IN ('maybe', 'not_now'))");
    /* The word appears in the file's prose, explaining why it is absent here.
       What must never appear is 'belongs' as a permitted VALUE. */
    expect(check![0]).not.toMatch(/belong/i);
  });

  it('holds one current stance per pair, with no history table', () => {
    expect(MIGRATION).toContain('UNIQUE (living_work_id, material_type, material_id)');
    expect(MIGRATION).not.toMatch(/CREATE TABLE[^;]*(_history|_events|_log)\b/);
  });

  it('requires a real member as the actor', () => {
    expect(MIGRATION).toMatch(
      /acted_by\s+UUID NOT NULL\s+REFERENCES members\(id\) ON DELETE RESTRICT/
    );
  });
});
