/**
 * Conversation export — session-derived subject binding + datasource guard.
 *
 * Vulnerability (fixed by this unit): `app/api/conversations/export/route.ts`
 * took the export subject from a `userId` query param (GET) or body field
 * (POST) and used it directly in SQL. There was no session resolution, no
 * ownership check, and no `accessMatrix` rule — and `ACCESS_CONTROL_MODE` is
 * unset in production (permissive Mode A), so unmapped routes pass through the
 * middleware. Any unauthenticated caller could name any member as the subject.
 *
 * No disclosure was observed, for a reason unrelated to the perimeter: the
 * route reads `conversation_messages`, which is absent from the witnessed
 * production state (2026-08-14 — HTTP 500, `relation "conversation_messages"
 * does not exist`), and no migration creating it was found in this repository.
 * The missing relation prevented this unauthenticated path from returning
 * conversation rows in that witnessed state. In the same state the real store,
 * `conversation_turns`, held ~40k turns across 212 distinct `user_id` values,
 * so renaming the table without first fixing the perimeter would have pointed
 * an unauthenticated path at populated member conversation text.
 *
 * WHAT THIS PROVES: both handlers resolve the subject from the verified session
 * before constructing any query; neither derives the subject from a
 * caller-supplied value; the route is mapped into the access matrix; and the
 * datasource cannot be silently re-bound without Sanctuary semantics.
 * WHAT IT DOES NOT PROVE: runtime behaviour (requires a deployed security
 * witness), middleware behaviour, or session issuance itself (covered by
 * getMemberFromRequest.test.ts).
 */
import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

const ROUTE_REL = 'app/api/conversations/export/route.ts';
const ROUTE_SRC = read(ROUTE_REL);

/**
 * Strip comments before any structural assertion.
 *
 * Lesson from #787: a structural assertion matched the explanatory comment
 * describing the bug rather than the code. This route's SECURITY PERIMETER and
 * DATASOURCE blocks quote the forbidden expressions verbatim
 * (`searchParams.get('userId')`, `conversation_turns`, `x-member-id`), so an
 * un-stripped scan would fail on its own documentation.
 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/** Comments AND string literals removed — for forbidden-source scans. */
function code(src: string): string {
  return stripComments(src)
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

/** Body of a single exported handler, comments stripped. */
function handlerBody(method: 'GET' | 'POST'): string {
  const src = stripComments(ROUTE_SRC);
  const start = src.search(new RegExp(`^export async function ${method}\\b`, 'm'));
  expect(start).toBeGreaterThanOrEqual(0);
  const rest = src.slice(start);
  const next = rest.slice(1).search(/^export (async function|const)\b/m);
  return next === -1 ? rest : rest.slice(0, next + 1);
}

const HANDLERS: Array<'GET' | 'POST'> = ['GET', 'POST'];

describe('conversation export — subject binding', () => {
  it('imports the verified-session resolver', () => {
    expect(stripComments(ROUTE_SRC)).toMatch(
      /import\s*\{[^}]*getMemberIdFromRequest[^}]*\}\s*from\s*['"]@\/lib\/auth\/getMemberFromRequest['"]/
    );
  });

  it.each(HANDLERS)('%s resolves the subject from the verified session', (method) => {
    expect(handlerBody(method)).toMatch(/await\s+getMemberIdFromRequest\(/);
  });

  it.each(HANDLERS)('%s refuses before touching the database when unauthenticated', (method) => {
    const body = handlerBody(method);
    const authIdx = body.search(/await\s+getMemberIdFromRequest\(/);
    const refusalIdx = body.search(/status:\s*401/);
    // The query is constructed via the dynamically-imported pg client.
    const queryIdx = body.search(/pgQuery|SELECT \* FROM/);

    expect(authIdx).toBeGreaterThanOrEqual(0);
    expect(refusalIdx).toBeGreaterThan(authIdx);
    expect(queryIdx).toBeGreaterThan(refusalIdx);
  });

  it.each(HANDLERS)('%s never derives the subject from a caller-supplied value', (method) => {
    const body = code(handlerBody(method));
    // The subject must be the awaited session result, not a request value.
    expect(body).toMatch(/const\s+userId\s*=\s*await\s+getMemberIdFromRequest\(/);
    // No assignment of `userId` from the request surface.
    expect(body).not.toMatch(/const\s+userId\s*=\s*searchParams\.get\(/);
    expect(body).not.toMatch(/\buserId\s*,[\s\S]{0,80}\}\s*=\s*body\b/);
  });

  it.each(HANDLERS)('%s refuses a subject-widening attempt rather than ignoring it', (method) => {
    const body = handlerBody(method);
    expect(body).toMatch(/claimedUserId\s*&&\s*claimedUserId\s*!==\s*userId/);
    expect(body).toMatch(/status:\s*403/);
  });

  it.each(HANDLERS)('%s scopes every query by the verified subject as $1', (method) => {
    const body = handlerBody(method);
    expect(body).toMatch(/WHERE user_id = \$1`?/);
    expect(body).toMatch(/const params:\s*any\[\]\s*=\s*\[userId\]/);
  });

  it('does not disclose whether a foreign sessionId exists', () => {
    // Ownership is by construction: sessionId is ANDed with the verified
    // subject, and the empty result is reported identically whether the session
    // belongs to someone else or does not exist at all.
    const body = handlerBody('GET');
    expect(body).toMatch(/AND session_id = \$\$\{paramIndex\}|AND session_id = \$/);
    const notFound = body.match(/error:\s*'No conversations found[^']*'/g) ?? [];
    expect(notFound).toHaveLength(1);
    expect(notFound[0]).not.toMatch(/permission|forbidden|belongs|another|other member/i);
  });
});

describe('conversation export — access matrix perimeter', () => {
  /**
   * Line-scoped on purpose — do NOT run stripComments() over accessMatrix.ts.
   *
   * That file has unbalanced `/*` sequences: one inside a string literal
   * (the '/relationships' rule) and one inside a `//` comment (the
   * 'dashboard/*' ordering note). 17 opens vs 15 closes means the naive
   * block-comment regex starts a "comment" mid-file and deletes every rule
   * after it, including this one. This is the #787 failure mode reappearing in
   * the stripper itself: the assertion silently scans a mutilated file and
   * reports a missing rule that is actually present.
   */
  it('maps /api/conversations rather than relying on the permissive default', () => {
    const active = read('config/accessMatrix.ts')
      .split('\n')
      .filter((l) => !l.trim().startsWith('//'));
    const rule = active.find((l) => /\{\s*prefix:\s*'\/api\/conversations'/.test(l));
    expect(rule).toBeDefined();
    // Must require auth. `public: true` here would restore the vulnerability.
    expect(rule!).toMatch(/minTier:\s*'free'/);
    expect(rule!).not.toMatch(/public:\s*true/);
  });
});

describe('conversation export — datasource binding guard', () => {
  const sourceTable = ROUTE_SRC.match(
    /export const EXPORT_SOURCE_TABLE\s*=\s*'([^']+)'/
  )?.[1];
  const sanctuaryExclusion = ROUTE_SRC.match(
    /export const EXPORT_SANCTUARY_EXCLUSION[^=]*=\s*([^;]+);/
  )?.[1]?.trim();

  it('declares both the bound source and its Sanctuary exclusion', () => {
    expect(sourceTable).toBeTruthy();
    expect(sanctuaryExclusion).toBeTruthy();
  });

  it('reads only the declared source — no second hardcoded relation', () => {
    const body = stripComments(ROUTE_SRC);
    const relations = [...body.matchAll(/FROM\s+([a-z_][a-z0-9_]*)/gi)].map((m) => m[1]);
    // Every FROM must be the interpolated constant, never a literal table name.
    expect(relations.every((r) => r === '${EXPORT_SOURCE_TABLE}')).toBe(true);
  });

  /**
   * THE GUARD THIS FILE EXISTS FOR.
   *
   * `conversation_messages` does not exist, so the export path returns nothing
   * and the Sanctuary boundary holds vacuously — the only reason a null
   * exclusion is tolerable. Binding a source that can actually return rows
   * (e.g. `conversation_turns`, which carries NO Sanctuary column) requires a
   * real exclusion predicate first.
   *
   * If this test fails, do not weaken it. It means someone re-bound the
   * datasource without establishing Sanctuary semantics — the exact "fix" that
   * turns a safely broken endpoint into a live one that cannot honour
   * Sanctuary Mode (Canon invariants 1 and 6).
   */
  it('cannot bind a live datasource without a Sanctuary exclusion predicate', () => {
    if (sourceTable !== 'conversation_messages') {
      expect(sanctuaryExclusion).not.toBe('null');
    } else {
      expect(sanctuaryExclusion).toBe('null');
    }
  });
});
