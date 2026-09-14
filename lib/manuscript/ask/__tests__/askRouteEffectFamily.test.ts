/**
 * S3 · ROUTE INTEGRATION — the sibling guard to `askRuntimeCannotWrite`.
 *
 * ⭐⭐ WHY A SECOND GUARD RATHER THAN A WIDER FIRST ONE.
 *
 * `askRuntimeCannotWrite` asserts, over `lib/manuscript/ask`, that the Ask
 * LIBRARY writes `ask_threads` and `ask_turns` and nothing else. That claim is
 * true, load-bearing, and unchanged — and weakening a constitutional instrument
 * so that a new change can pass it is precisely the move this lane exists to
 * refuse. It is therefore NOT modified, not even by one allowlist entry.
 *
 * But the ROUTE is no longer as narrow as the library. Under S3 it also causes
 * writes to the authorization opportunity, its consumption, the runtime consent
 * state and the disclosure receipts. Those writes are real and they need a law
 * of their own, at their own address.
 *
 * ⭐ THE LAW: the developmental Ask route may write CONVERSATION and explicit
 * records of AUTHORITY and ACCOUNTABILITY. It may never mutate the Work.
 *
 * Every table below is a record of what was authorized, what was consumed, what
 * crossed, and what was said. ⛔ None of them is authored prose, structure, a
 * draft, a revision, or a reading. The Work is reachable from this route for
 * READING only, and after this guard it still is.
 *
 * ⚠️ SCOPE, SAID PLAINLY. This walks the route's transitive module graph over
 * VALUE imports and scans the SQL it can reach. It is a statement about what the
 * program can do, not about what a database owner can do, and not a substitute
 * for the database-level custody the migrations carry.
 *
 * Comments are stripped before every scan — the modules deliberately DISCUSS the
 * tables they must not write, and a check that counted prose would fail because
 * a file documented its own compliance (the C21 lesson).
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const ROUTE = join(ROOT, 'app', 'api', 'sovereign', 'manuscripts', '[id]', 'ask', 'route.ts');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** `@/x` and relative specifiers only. A package import leaves the repo graph. */
function resolveLocal(spec: string, from: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = join(ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(dirname(from), spec);
  else return null;
  for (const candidate of [
    `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx'),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/**
 * The route's reachable program. ⛔ `import type` is excluded deliberately: a
 * type import erases at compile time and can reach no statement at runtime.
 */
function routeGraph(): { path: string; code: string }[] {
  const seen = new Set<string>();
  const out: { path: string; code: string }[] = [];
  const stack = [ROUTE];
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const code = stripComments(readFileSync(file, 'utf8'));
    out.push({ path: file.slice(ROOT.length + 1), code });
    for (const m of code.matchAll(/import\s+(type\s+)?[\s\S]*?\s+from\s+'([^']+)'/g)) {
      if (m[1]) continue;
      const resolved = resolveLocal(m[2], file);
      if (resolved) stack.push(resolved);
    }
  }
  return out;
}

/** `DO UPDATE SET` is an upsert's conflict clause, not a second target table. */
function writeTargets(code: string): string[] {
  const normalized = code.replace(/DO\s+UPDATE\s+SET/gi, 'DO_UPDATE_SET');
  return [...normalized.matchAll(
    /\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+([a-z_][a-z0-9_]*)/gi)]
    .map((m) => m[1].toLowerCase());
}

describe('the developmental Ask route writes conversation and authority — never the Work', () => {
  /* ⭐ THE WHOLE PERMITTED EFFECT FAMILY, ONE LINE EACH, WITH ITS REASON. A new
     entry here is a governed act: it asserts that some new table is a record of
     authority or conversation and not a piece of the Work. */
  const ALLOWED: Record<string, string> = {
    ask_threads: 'the conversation',
    ask_turns: 'the conversation, append-only',
    ask_authorization_acts: 'the identity of one single-use authorization opportunity',
    ask_authorization_consumptions: 'the first durable fact that a human acted, and its completion',
    runtime_consent_state: 'the consent state the crossing was evaluated against',
    context_disclosure_receipts: 'the accountability record of a crossing',
  };

  /* ⛔ THE WORK. Named explicitly rather than left to the allowlist's silence, so
     that a guard accidentally reduced to a tautology still fails on these. */
  const WORK_TABLES = [
    'manuscripts', 'manuscript_sections', 'manuscript_draft_sections',
    'manuscript_working_drafts', 'working_draft_revisions',
    'manuscript_structure_units', 'manuscript_structure_members',
    'manuscript_structure_proposals', 'manuscript_source_arrivals',
    'developmental_readings', 'developmental_observation_standing_events',
  ];

  it('reaches the modules it is supposed to reach', () => {
    /* A walk that silently resolved nothing would pass every check below. */
    const paths = routeGraph().map((f) => f.path);
    expect(paths).toContain('lib/manuscript/ask/threadStore.ts');
    expect(paths).toContain('lib/disclosure/authorizationAct.ts');
    expect(paths).toContain('lib/disclosure/contextDisclosureReceipt.ts');
    expect(paths.length).toBeGreaterThan(10);
  });

  it('writes no table outside the permitted effect family', () => {
    for (const { path, code } of routeGraph()) {
      for (const table of writeTargets(code)) {
        expect(`${path} writes ${table}: ${table in ALLOWED}`)
          .toBe(`${path} writes ${table}: true`);
      }
    }
  });

  it('mutates no table of the Work', () => {
    for (const { path, code } of routeGraph()) {
      const targets = new Set(writeTargets(code));
      for (const work of WORK_TABLES) {
        expect(`${path} mutates ${work}: ${targets.has(work)}`)
          .toBe(`${path} mutates ${work}: false`);
      }
    }
  });

  it('the permitted family and the Work do not overlap', () => {
    /* If they ever did, the two checks above would contradict each other and the
       weaker one would win silently. */
    for (const work of WORK_TABLES) expect(work in ALLOWED).toBe(false);
  });

  it('the body read is a read — the one revision-content path selects and never writes', () => {
    const capture = stripComments(
      readFileSync(join(ROOT, 'lib', 'manuscript', 'development', 'capture.ts'), 'utf8'));
    expect(writeTargets(capture)).toEqual([]);
  });
});
