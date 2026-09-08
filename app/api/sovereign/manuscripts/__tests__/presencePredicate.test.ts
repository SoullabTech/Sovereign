/**
 * STUDIO-WRITING-PRESENCE-01 — the substance predicate, at the query level.
 *
 * ⭐ WITNESSED ON REAL POSTGRES 16, 2026-09-08. The two candidate predicates do
 * NOT agree, and the difference is exactly the case the design cares about:
 *
 *   label            | btrim(body) <> '' | body ~ '[^[:space:]]'
 *   empty string     | false             | false
 *   single space     | false             | false
 *   tab only         | TRUE              | false
 *   newline only     | TRUE              | false
 *   CRLF only        | TRUE              | false
 *   spaces+tabs+nl   | TRUE              | false
 *   one real char    | true              | true
 *   real prose       | true              | true
 *
 * PostgreSQL's one-argument `btrim` strips ORDINARY SPACES only. A draft holding
 * tabs or newlines would therefore have counted as writing — a manuscript could
 * be foregrounded, page-counted and offered back for a document containing not
 * one character.
 *
 * ⚠️ WHAT THIS FILE PROVES, AND WHAT IT DOES NOT. The behavioural fact above was
 * established once, against a real server, by hand. This suite has no database,
 * so what follows is a DOCTRINE guard in the established style of
 * `historyReadDoctrine.test.ts`: it proves the query still ASKS the right
 * question. It cannot re-prove that Postgres answers it. Re-witnessing means
 * running the table above against a real server again.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const CODE = readFileSync(join(__dirname, '..', 'route.ts'), 'utf8');

/** The SQL string only — so prose about the rule cannot satisfy or break it. */
const SQL = CODE.slice(
  CODE.indexOf('SELECT m.id, m.title, m.created_at'),
  CODE.indexOf('ORDER BY m.created_at DESC'),
);
/** Comments explain the rule; only executable SQL implements it. */
const STATEMENTS = SQL.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

describe('substantive-writing predicate', () => {
  it('asks for a non-whitespace character, in both layers', () => {
    /* Draft presence, and the Source arm of the OR. */
    expect(STATEMENTS).toContain("d.content ~ '[^[:space:]]'");
    expect(STATEMENTS).toContain("s.body ~ '[^[:space:]]'");
  });

  it('⛔ never decides substance with btrim', () => {
    /* Comments are stripped above, so the sentence explaining why btrim is wrong
       cannot read as btrim returning — the C21 lesson, applied here. */
    expect(STATEMENTS).not.toContain('btrim(');
  });

  it('keeps char_count as SOURCE extent, unchanged', () => {
    expect(STATEMENTS).toContain('sum(length(s.body))');
    expect(STATEMENTS).toContain('AS char_count');
  });

  it('derives draft extent without touching char_count', () => {
    expect(STATEMENTS).toContain('length(d.content)');
    expect(STATEMENTS).toContain('AS draft_char_count');
  });

  it('⭐ establishes authorship against the revision-1 baseline, not a timestamp', () => {
    expect(STATEMENTS).toContain('r1.revision_number = 1');
    expect(STATEMENTS).toContain('AS has_current_member_contribution');
    /* IS TRUE is what makes a missing baseline fail closed: the correlated
       subquery yields NULL, and NULL IS TRUE is false. */
    expect(STATEMENTS).toMatch(/IS TRUE\s*\n?\s*AS has_current_member_contribution/);
  });
});
