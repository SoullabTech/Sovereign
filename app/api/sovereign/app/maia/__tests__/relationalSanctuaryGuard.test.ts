/**
 * RELATIONAL SANCTUARY CONTAINMENT GUARD — RU-0 regression test.
 *
 * WHY THIS EXISTS: on 2026-08-10 the Functional Sovereignty Audit found that
 * the LIVE conversation route (`app/api/sovereign/app/maia/route.ts`, 3388
 * agent_runs/30d) called `observeRelationalContent` and `persistDetectedSignal`
 * with NO `!isSanctuary` guard, while its near-idle sibling
 * (`.../maia/list/route.ts`, 13 runs/30d) had the guard AND the explicit
 * comment: "a sanctuary turn must never feed relational observation or signal
 * persistence." The boundary was enforced on 0.4% of traffic.
 *
 * `observeRelationalContent` is not a logger — it auto-creates a
 * `member_relationships` row and writes `relationship_entries` whose content is
 * MAIA's own summary of the member's relational material. A sanctuary turn
 * reaching it is a containment failure, and the relational tables carry no
 * `posture_at_creation`, so such a row is not even identifiable afterwards.
 *
 * WHAT THIS ASSERTS: in every live MAIA conversation route, each relational
 * WRITE call site is lexically governed by a condition containing
 * `!isSanctuary`. Governance is determined by brace-depth containment against
 * the real source file — not by textual proximity, which a reordering could
 * silently defeat.
 *
 * SCOPE: containment only (RU-0). This test says nothing about relational read
 * behavior, provenance, correction, currentness, withdrawal, or continuity —
 * those are RU-1..RU-4 and remain open.
 */
import { readFileSync } from 'fs';
import path from 'path';

/**
 * Live MAIA conversation routes that perform relational observation.
 *
 * CMT-01 Step 3 (2026-09-03): `app/api/sovereign/app/maia/route.ts` — the route
 * this test was written FOR — is structurally retired. It performs no relational
 * observation, declares no sanctuary state, and reaches no cognition. It is
 * removed from this set because there is nothing left in it to contain, and
 * `RETIRED_ROUTES` below asserts that stays true. This does not weaken RU-0:
 * every relational write that still exists is still governed.
 */
const ROUTES = [
  'app/api/sovereign/app/maia/list/route.ts',
] as const;

/** Retired conversation routes: must contain NO relational write at all. */
const RETIRED_ROUTES = [
  'app/api/sovereign/app/maia/route.ts',
] as const;

/** Calls that PERSIST relational material derived from a conversation turn. */
const RELATIONAL_WRITES = ['observeRelationalContent(', 'persistDetectedSignal('] as const;

const repoRoot = path.resolve(__dirname, '../../../../../..');

function readRoute(rel: string): string[] {
  return readFileSync(path.join(repoRoot, rel), 'utf8').split('\n');
}

/** Count non-comment, non-string braces well enough for guard containment. */
function braceDelta(line: string): number {
  const code = line
    .replace(/\/\/.*$/, '')
    .replace(/\/\*.*?\*\//g, '')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
  let d = 0;
  for (const ch of code) {
    if (ch === '{') d++;
    else if (ch === '}') d--;
  }
  return d;
}

/**
 * Line ranges (inclusive) governed by an `if` whose condition mentions
 * `!isSanctuary`. A call inside one of these ranges is contained.
 */
function sanctuaryGuardedRanges(lines: string[]): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  lines.forEach((line, i) => {
    if (!/^\s*(\}\s*else\s+)?if\s*\(/.test(line)) return;
    if (!line.includes('!isSanctuary')) return;
    // Walk forward until the block this `if` opens closes again.
    let depth = 0;
    let opened = false;
    for (let j = i; j < lines.length; j++) {
      depth += braceDelta(lines[j]);
      if (!opened && depth > 0) opened = true;
      if (opened && depth <= 0) {
        ranges.push([i, j]);
        return;
      }
    }
    ranges.push([i, lines.length - 1]);
  });
  return ranges;
}

describe('relational sanctuary containment — retired routes', () => {
  it.each(RETIRED_ROUTES)('%s performs no relational observation', (rel) => {
    const writes = readRoute(rel).filter((l) => RELATIONAL_WRITES.some((w) => l.includes(w)));
    expect(writes).toEqual([]);
  });
});

describe('relational sanctuary containment — parsing sanity', () => {
  it.each(ROUTES)('%s declares isSanctuary', (rel) => {
    const src = readRoute(rel).join('\n');
    expect(src).toMatch(/const isSanctuary\s*=/);
  });

  it('at least one relational write call site exists to check', () => {
    const total = ROUTES.reduce(
      (n, rel) =>
        n +
        readRoute(rel).filter((l) => RELATIONAL_WRITES.some((w) => l.includes(w))).length,
      0,
    );
    expect(total).toBeGreaterThan(0);
  });
});

describe('relational sanctuary containment — every write is guarded', () => {
  for (const rel of ROUTES) {
    for (const write of RELATIONAL_WRITES) {
      it(`${rel} :: ${write.replace('(', '')} is inside a !isSanctuary guard`, () => {
        const lines = readRoute(rel);
        const ranges = sanctuaryGuardedRanges(lines);

        const callSites = lines
          .map((l, i) => ({ l, i }))
          .filter(({ l }) => l.includes(write) && !/^\s*(\*|\/\/)/.test(l) && !l.includes('import'));

        // Every route in ROUTES is expected to perform both writes today.
        expect(callSites.length).toBeGreaterThan(0);

        const unguarded = callSites
          .filter(({ i }) => !ranges.some(([start, end]) => i > start && i <= end))
          .map(({ i, l }) => `${rel}:${i + 1} — ${l.trim()}`);

        // Jest's expect() takes no message argument; surface the diagnosis by
        // asserting on the offending call sites themselves, so a failure names
        // the exact unguarded line rather than just "false !== true".
        expect(unguarded).toEqual([]);
      });
    }
  }
});
