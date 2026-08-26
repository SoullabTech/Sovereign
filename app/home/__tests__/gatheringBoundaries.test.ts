/**
 * /home gathering strip — member-safety boundaries, pinned at the source.
 *
 * WHY THIS EXISTS: before MLX-06 Unit 1A both gathering reads filtered on
 * member_id alone. That let three classes of material into a member's personal
 * strip that do not belong there:
 *
 *   - sanctuary sessions, which by invariant never enter continuity;
 *   - client- and encounter-scoped atoms, which are a practitioner's material
 *     about another person, held in a different context;
 *   - archived and protected atoms, defined in schema as removed from active
 *     recall / non-circulating.
 *
 * WHAT THIS PROVES: that the predicates closing those three doors are present
 * in the SQL that ships. Comments are stripped before every check, following
 * lib/navigation/__tests__/journalReachability.test.ts, so a docstring
 * recording the old defect can never satisfy the guard.
 *
 * WHAT IT DOES NOT PROVE: nothing about production behavior, live rows, the
 * planner, or what a member actually sees. It is a source-shape guard. The
 * runtime walk remains the acceptance test.
 *
 * Sibling guarantee: app/api/maia/house-continuity asserts the same three
 * boundaries against the SQL it emits, with an execution-level test. These two
 * surfaces must not drift apart while both exist.
 */
import { readFileSync } from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

/** Comments describe history; code is what ships. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const HOME = 'app/home/page.tsx';
const src = stripComments(read(HOME));

/** The template-literal SQL for one table, as it actually ships. */
function sqlFor(table: string): string {
  const m = src.match(new RegExp('`[^`]*FROM\\s+' + table + '[^`]*`'));
  if (!m) throw new Error(`no SQL found against ${table} in ${HOME}`);
  return m[0];
}

describe('/home gathering strip — sessions', () => {
  const sql = () => sqlFor('maia_sessions');

  it('excludes sanctuary sessions', () => {
    expect(sql()).toMatch(/privacy_mode\s*<>\s*'sanctuary'/);
  });

  it('is scoped to the member', () => {
    expect(sql()).toMatch(/member_id\s*=\s*\$1/);
  });
});

describe('/home gathering strip — atoms', () => {
  const sql = () => sqlFor('member_memory_atoms');

  it('shows only personal-scope atoms — never client or encounter material', () => {
    expect(sql()).toMatch(/memory_scope\s*=\s*'personal'/);
  });

  it('shows only active atoms — archived and protected are not ambient', () => {
    expect(sql()).toMatch(/status\s*=\s*'active'/);
  });

  it('is scoped to the member', () => {
    expect(sql()).toMatch(/member_id\s*=\s*\$1/);
  });
});

describe('the strip reads and never writes', () => {
  it('issues no INSERT / UPDATE / DELETE', () => {
    expect(src).not.toMatch(/\b(INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i);
  });
});

describe('guard integrity', () => {
  it('fails when a predicate is removed (the guard actually guards)', () => {
    const withoutScope = sqlFor('member_memory_atoms').replace(/AND\s+memory_scope\s*=\s*'personal'/, '');
    expect(withoutScope).not.toMatch(/memory_scope\s*=\s*'personal'/);
  });

  it('cannot be satisfied by a comment mentioning the predicate', () => {
    const commented = stripComments("// AND memory_scope = 'personal'\nconst x = 1;");
    expect(commented).not.toMatch(/memory_scope\s*=\s*'personal'/);
  });
});
