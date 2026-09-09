import * as fs from 'fs';
import * as path from 'path';

/**
 * B1 — FAIL-CLOSED CONTAINMENT OF EVERY `maia_turns` CREATION PATH.
 *
 * ⭐ **A derived copy cannot outlive the member data whose deletion created the
 * obligation to remove it.**
 *
 * `maia_turns` can hold derivative copies of member conversation text and
 * carries no member identity capable of making account deletion authoritative:
 * no `user_id`, and `session_id` is bare TEXT with no foreign key. It is absent
 * from the 44-table refuse-by-default account-deletion list AND from the S5
 * constitutional substrate. Until it can prove whose row it is, nothing may add
 * to it.
 *
 * ⛔ THESE ASSERTIONS GUARD CONTAINMENT, NOT CORRECTNESS. They are removed by
 * the custody lane, once authoritative identity and deletion coverage exist —
 * never to let one write through.
 */

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

const ROUTE = 'app/api/maia/log-turn/route.ts';
const BACKFILL = 'scripts/backfill-training-data.sql';
/**
 * ⭐ THE ONE EXEMPTION, AND WHY IT IS NARROW. The B3 falsifier inserts into
 * maia_turns — it must, to prove the gate refuses and that deletion reaches the
 * rows. It is not a creation path: it runs only against a disposable database
 * and every fixture is rolled back. The assertions below hold it to that, so the
 * exemption cannot quietly become a way in.
 */
const FALSIFIER = 'scripts/witness/maia-turns-custody-falsifier.sql';

/** The exported POST handler only, so the retired body below it is not read. */
function exportedPost(src: string): string {
  const start = src.indexOf('export async function POST');
  expect(start).toBeGreaterThan(-1);
  const next = src.indexOf('\nasync function retiredPost', start);
  return src.slice(start, next > -1 ? next : undefined);
}

describe('the HTTP creation path is closed by refusal, not by accident', () => {
  const src = read(ROUTE);

  it('POST refuses and touches no database', () => {
    const post = exportedPost(src);
    expect(post).toContain('status: 503');
    expect(post).not.toContain('query(');
    expect(post).not.toContain('transaction(');
    expect(post).not.toContain('INSERT');
    /* It must not even read the body: nothing is parsed, so nothing is held. */
    expect(post).not.toContain('request.json()');
  });

  /**
   * ⚠️ THE BROKEN SQL IS EVIDENCE AND MUST STAY BROKEN.
   *
   * The retired statement names four columns that do not exist. A route that
   * fails by accident is one plausible "fix" away from becoming a successful
   * writer, and the accident is not a boundary. If someone repairs it, this
   * fails — which is the point.
   */
  it('the retired statement is preserved unrepaired', () => {
    expect(src).toContain('INSERT INTO maia_turns');
    expect(src).toMatch(/session_id, turn_index, role, content/);
    expect(src).toContain('DO NOT REPAIR');
  });
});

describe('the operator creation path aborts before writing', () => {
  const sql = read(BACKFILL);

  it('raises before any INSERT can run', () => {
    const raise = sql.indexOf('RAISE EXCEPTION');
    const insert = sql.search(/INSERT\s+INTO/i);
    expect(raise).toBeGreaterThan(-1);
    expect(insert).toBeGreaterThan(-1);
    expect(raise).toBeLessThan(insert);
  });

  it('the guard is inside the transaction it aborts', () => {
    expect(sql.indexOf('BEGIN;')).toBeLessThan(sql.indexOf('RAISE EXCEPTION'));
  });
});

describe('no third creation path exists', () => {
  /**
   * ⛔ Source-level containment covers the paths that exist. A NEW writer added
   * later would not be covered — that gap is what a database-level refusal would
   * close, and it is named in the B2 design rather than assumed away.
   */
  it('only the two contained paths write maia_turns', () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) { walk(full); continue; }
        if (!/\.(ts|tsx|sql|js)$/.test(e.name)) continue;
        const rel = path.relative(root, full);
        /* Schema definitions and the captured baseline declare the table; they
           do not create rows from member data. */
        if (rel.startsWith('database/baseline/')) continue;
        if (rel.startsWith('database/migrations/')) continue;
        if (rel.startsWith('lib/database/maia-training-schema.sql')) continue;
        if (rel.startsWith('lib/memory/__tests__/')) continue;
        if (rel === FALSIFIER) continue;
        if (/INSERT\s+INTO\s+maia_turns/i.test(fs.readFileSync(full, 'utf8'))) hits.push(rel);
      }
    };
    walk(root);
    expect(hits.sort()).toEqual([BACKFILL, ROUTE].sort());
  });

  it('the exempt falsifier commits nothing, ever', () => {
    const sql = read(FALSIFIER);
    expect(sql).toContain('ROLLBACK;');
    /* Not one COMMIT anywhere: a fixture that could commit is a creation path
       wearing a test's clothes. */
    expect(sql).not.toMatch(/^\s*COMMIT\s*;/mi);
    expect(sql).toContain('DISPOSABLE database only');
  });
});

describe('what the containment now rests on', () => {
  /**
   * ⚠️ THE TRIPWIRE'S PREMISE CHANGED IN B3, so the tripwire changed with it
   * rather than being left to pass on a stale reading.
   *
   * B1 rested on the table being unable to prove whose row it is. B3 gave it
   * that ability for NEW rows — a nullable `member_id`, an insert-time gate, and
   * a cascade from `members`. What has NOT changed is the historical population:
   * rows that predate the gate remain unattributed, and no join may attribute
   * them.
   *
   * ⛔ So the guards stay for a different reason than they were raised. The
   * writers stay closed until the historical custody question is adjudicated —
   * not because identity is impossible, but because opening them would add to a
   * table whose existing contents are still unaccounted for.
   */
  const migration = 'database/migrations/20260909000001_maia_turns_member_identity.sql';

  it('new rows can carry identity, and are refused without it', () => {
    const sql = read(migration);
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS member_id UUID');
    expect(sql).toContain('REFERENCES public.members(id) ON DELETE CASCADE');
    expect(sql).toContain('maia_turns_require_member_identity');
  });

  /** ⛔ Historical rows keep their NULL. A table-wide NOT NULL would force
   *  backfilling attribution nobody earned. */
  it('the column is nullable, so history is not retroactively attributed', () => {
    const sql = read(migration);
    expect(sql).not.toMatch(/member_id\s+UUID\s+NOT NULL/i);
    expect(sql).not.toMatch(/ALTER COLUMN member_id SET NOT NULL/i);
  });

  /** ⛔ The database refuses missing identity. It does NOT prove the id came
   *  from the authenticated actor — that stays the server's auth boundary. */
  it('claims no authority the database does not have', () => {
    const sql = read(migration);
    const flat = sql.replace(/\s*--\s*/g, ' ').replace(/\s+/g, ' ');
    expect(flat).toContain('does NOT prove the supplied id came from the authenticated actor');
    expect(flat).toContain('Not proof of authenticated actor');
  });

  it('both B1 guards still stand despite the new schema', () => {
    expect(read(ROUTE)).toContain('status: 503');
    expect(read(BACKFILL)).toContain('RAISE EXCEPTION');
  });
});
