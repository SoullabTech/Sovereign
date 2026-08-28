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

/** The guard function body, isolated from the surrounding DDL. */
const GUARD = MIGRATION.slice(
  MIGRATION.indexOf('CREATE OR REPLACE FUNCTION refuse_material_relationship_conflict'),
  MIGRATION.indexOf('$$ LANGUAGE plpgsql;')
);

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
