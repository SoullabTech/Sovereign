/**
 * CMT-01 — STEP 3a CERTIFICATION: ROUTE B STRUCTURALLY RETIRED
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §2, §11
 *
 * `app/api/sovereign/app/maia/route.ts` assembled its own MAIA and reached
 * `getMaiaResponse()` at two call sites outside any governed construction. Its
 * disposition, on the user-supplied 30-day witness plus the source census, is
 * STRUCTURALLY RETIRED — an explicit 410 boundary that names the successor,
 * never a silent deletion.
 *
 * ── WHAT THIS SUITE PINS ────────────────────────────────────────────────────
 *
 *   1. B reaches no cognition, loads no memory, writes no relational material.
 *   2. B answers 410 — not 404 — with the successor in body and header.
 *   3. The cognition call-site closed set shrank from six to FOUR, and a new
 *      call site anywhere fails because it is new.
 *   4. The live ingress and the voice sibling are untouched.
 */

import * as fs from 'fs';
import * as path from 'path';

const REPO = path.resolve(__dirname, '..');
const B = 'app/api/sovereign/app/maia/route.ts';
const LIST = 'app/api/sovereign/app/maia/list/route.ts';
const MAP = 'docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md';
const read = (rel: string) => fs.readFileSync(path.join(REPO, rel), 'utf8');
/**
 * Executable text only: imports, block and line comments, AND string literals
 * removed. `lib/maia/maiaRuntimeContext.ts` describes the retired route in a
 * registry string — `'… code still calls getMaiaResponse()'` — and a scan that
 * kept strings counted that description as a cognition call. Text is not code
 * (R23); a string is text.
 */
const strip = (s: string) =>
  s
    .replace(/^import\s[\s\S]*?from\s+'[^']+';/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');

const SKIP = /__tests__|\.test\.ts|node_modules|\.next/;
function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (p: string): void => {
    let st: fs.Stats;
    try { st = fs.statSync(p); } catch { return; }
    if (st.isDirectory()) { for (const f of fs.readdirSync(p)) { const q = path.join(p, f); if (!SKIP.test(q)) walk(q); } return; }
    if (/\.tsx?$/.test(p) && !SKIP.test(p)) out.push(path.relative(REPO, p));
  };
  walk(path.join(REPO, 'lib')); walk(path.join(REPO, 'app'));
  return out;
}
const FILES = sourceFiles();

/** Executable `getMaiaResponse(` call sites, as `file:line`, excluding the definition. */
function cognitionCallSites(): string[] {
  const hits: string[] = [];
  for (const f of FILES) {
    const lines = strip(read(f)).split('\n');
    lines.forEach((l, i) => {
      if (/export async function getMaiaResponse\(/.test(l)) return;
      if (/getMaiaResponseTemplate/.test(l)) return;
      if (/\bgetMaiaResponse\s*\(/.test(l)) hits.push(`${f}:${i + 1}`);
    });
  }
  return hits.sort();
}

// ── §0 — META-INVARIANT ──────────────────────────────────────────────────────

describe('CMT-01 step 3a §0 — the instrument found its subject', () => {
  it('B exists — retirement is a 410 boundary, not a deleted file', () => {
    expect(fs.existsSync(path.join(REPO, B))).toBe(true);
  });

  it('the cognition call-site scan finds a nonzero, bounded set', () => {
    const sites = cognitionCallSites();
    expect(sites.length).toBeGreaterThan(0);
    expect(sites.length).toBeLessThan(10);
  });
});

// ── §1 — B REACHES NOTHING ───────────────────────────────────────────────────

describe('CMT-01 step 3a §1 — B reaches no cognition and no memory', () => {
  const src = read(B);
  const body = strip(src);

  it('makes no cognition call', () => {
    expect(body).not.toMatch(/getMaiaResponse\s*\(/);
    expect(src).not.toMatch(/from '@\/lib\/sovereign\/maiaService'/);
  });

  it('imports no intelligence loader, orchestrator or session machinery', () => {
    for (const forbidden of [
      'memoryOrchestrator', 'memoryLoaders', 'memoryAtomsLoader', 'MemoryBundle', 'MemberLiveContext',
      'RelationshipMemoryService', 'sessionManager', 'cognitiveProfileService', 'forwardReadiness',
      'relationalObserver', 'relationshipSignalService', 'detectRelationalSignal', 'lib/maia/turn',
    ]) {
      expect({ forbidden, present: src.includes(forbidden) }).toEqual({ forbidden, present: false });
    }
  });

  it('performs no relational write and declares no sanctuary state (nothing to contain)', () => {
    expect(body).not.toMatch(/observeRelationalContent\(|persistDetectedSignal\(/);
    expect(body).not.toMatch(/const isSanctuary\s*=/);
  });

  it('carries no @ts-nocheck — a 70-line boundary has nothing to hide from the compiler', () => {
    expect(src).not.toMatch(/@ts-nocheck/);
  });
});

// ── §2 — THE 410 BOUNDARY ────────────────────────────────────────────────────

describe('CMT-01 step 3a §2 — an intelligible refusal, never a 404', () => {
  it('answers 410 with the successor in body and header, on POST and GET', async () => {
    const mod = await import('@/app/api/sovereign/app/maia/route');
    for (const handler of [mod.POST, mod.GET]) {
      const res = await handler();
      expect(res.status).toBe(410);
      expect(res.headers.get('X-Recommended-Endpoint')).toBe('/api/sovereign/app/maia/list');
      expect(res.headers.get('X-Route-Retired')).toBe('2026-09-03');
      const json = await res.json();
      expect(json.code).toBe('ROUTE_RETIRED');
      expect(json.successor).toBe('/api/sovereign/app/maia/list');
      expect(json.authority).toMatch(/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC/);
    }
  });

  it('the status is 410 by literal, not by a computed value a refactor could change', () => {
    expect(strip(read(B))).toMatch(/status: 410/);
    expect(strip(read(B))).not.toMatch(/status: 404/);
  });

  it('the successor is the live ingress, and the live ingress exists', () => {
    expect(fs.existsSync(path.join(REPO, LIST))).toBe(true);
    expect(read(B)).toMatch(/const SUCCESSOR = '\/api\/sovereign\/app\/maia\/list';/);
  });
});

// ── §3 — THE COGNITION CALL-SITE CLOSED SET ──────────────────────────────────

describe('CMT-01 step 3a §3 — six call sites became four', () => {
  it('exactly four executable cognition call sites remain, and each is classified', () => {
    const sites = cognitionCallSites().map((s) => s.replace(/:\d+$/, ''));
    const byFile = sites.reduce<Record<string, number>>((m, f) => ({ ...m, [f]: (m[f] ?? 0) + 1 }), {});
    expect(byFile).toEqual({
      // A — canonical-live ingress: CONVERGE (Step 3b, shadow first)
      'app/api/sovereign/app/maia/list/route.ts': 1,
      // C — generateMaiaTurn, generateSimpleMaiaResponse: CONVERGE (Step 3c);
      //     consciousnessHealthCheck: SYSTEM_COGNITION_PROBE
      'lib/consciousness/maiaOrchestrator.ts': 3,
    });
  });

  it('the SECOND cognition entry in source is unreached, and a new reacher fails', () => {
    // Topology correction found during this step: `getMaiaResponse` is defined
    // TWICE. lib/learning/enhanced-maia-service.ts exports its own, wrapping
    // getEnhancedMaiaResponse → learningOrchestrator.generateMaiaResponse — a
    // distinct cognition path. The name-matching call-site scan above cannot
    // see a caller that imports getEnhancedMaiaResponse instead, so the
    // importer set is pinned here. Today: one importer, which nothing imports.
    // Static `from '…'` AND dynamic `import('…')`. The deep path reaches the
    // second entry through `await import('../learning/enhanced-maia-service')`;
    // a static-only detector reported ZERO importers and the pin would have
    // certified "unreached" on an instrument that could not see the reach.
    const importersOf = (mod: string) => {
      const re = new RegExp(`(?:from\\s+|import\\(\\s*)'[^']*${mod}'`);
      return FILES.filter((f) => re.test(read(f))).sort();
    };
    expect(importersOf('learning/enhanced-maia-service')).toEqual([
      'lib/consultation/deep-path-with-consultation.ts',
    ]);
    expect(importersOf('consultation/deep-path-with-consultation')).toEqual([]);
  });

  it('B is not among them', () => {
    expect(cognitionCallSites().some((s) => s.startsWith(B))).toBe(false);
  });
});

// ── §4 — THE RECORD ──────────────────────────────────────────────────────────

describe('CMT-01 step 3a §4 — the retirement is recorded where routes are governed', () => {
  it('the authority map says retired, cites the witness, and its retention caveat', () => {
    const map = read(MAP);
    const entry = /### `\/api\/sovereign\/app\/maia`\n([\s\S]*?)\n### /.exec(map);
    expect(entry).not.toBeNull();
    expect(entry![1]).toMatch(/\*\*`retired`\*\*/);
    expect(entry![1]).toMatch(/HTTP 410/);
    expect(entry![1]).toMatch(/720h/);
    expect(entry![1]).toMatch(/retained logs/);
    expect(entry![1]).toMatch(/Calls getMaiaResponse\(\)\*\* \| ❌ \*\*NO\*\*/);
  });

  it('B names its own authority and successor in its header', () => {
    const src = read(B);
    expect(src).toMatch(/STRUCTURALLY RETIRED/);
    expect(src).toMatch(/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0\.1\.md §2/);
  });
});

// ── §5 — INNOCENT AND BOUNDARY CONTROLS ─────────────────────────────────────

describe('CMT-01 step 3a §5 — controls', () => {
  it('the live ingress is untouched: still calls cognition, still declares sanctuary, still guards writes', () => {
    const list = strip(read(LIST));
    expect(list).toMatch(/getMaiaResponse\s*\(/);
    expect(list).toMatch(/const isSanctuary\s*=/);
    expect(list).toMatch(/observeRelationalContent\(/);
  });

  it('the voice sibling is untouched', () => {
    expect(fs.existsSync(path.join(REPO, 'app/api/sovereign/app/maia/voice/route.ts'))).toBe(true);
  });

  it('prose in B naming getMaiaResponse is not a call', () => {
    // The header explains what was removed by naming it.
    expect(read(B)).toMatch(/getMaiaResponse\(\)/);
    expect(strip(read(B))).not.toMatch(/getMaiaResponse\s*\(/);
  });

  it('a string literal naming the call is not a call', () => {
    // The registry's description of B is prose inside a string. Before string
    // stripping it was counted as a fifth call site.
    const reg = read('lib/maia/maiaRuntimeContext.ts');
    expect(reg).toMatch(/still calls getMaiaResponse\(\)/);
    expect(cognitionCallSites().some((s) => s.startsWith('lib/maia/maiaRuntimeContext.ts'))).toBe(false);
  });

  it('the call-site scan ignores the definition and the template helper', () => {
    const sites = cognitionCallSites();
    expect(sites.some((s) => s.startsWith('lib/sovereign/maiaService.ts'))).toBe(false);
    expect(sites.some((s) => s.startsWith('lib/consciousness/spiralogic-core.ts'))).toBe(false);
  });
});
