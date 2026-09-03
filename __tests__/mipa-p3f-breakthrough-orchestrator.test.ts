/**
 * MIPA PHASE 0 — P3f CERTIFICATION: BREAKTHROUGHSTORE / MEMORYORCHESTRATOR
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3f
 *
 * ── WHAT THIS REPAIR IS ─────────────────────────────────────────────────────
 *
 * P1c established a live composition path for a representation whose epistemic
 * status was already settled at R25:
 *
 *     breakthrough_moments → BreakthroughStore → lib/memory/MemoryOrchestrator.ts
 *         → "RECENT BREAKTHROUGHS" → MAIA cognition
 *
 * R25 was never wrong. It gated `MemoryBundle` and SCOPED its claim to that
 * reader. But a gate placed inside ONE reader can be walked around by opening a
 * second one, and this is the second one.
 *
 * The rule is unchanged and no new breakthrough policy is introduced: machine
 * detected · machine extracted · unendorsed system inference → EXCLUDED. What
 * moved is the rule's LOCATION — from inside a single reader to the
 * representation boundary that every reader consumes.
 *
 * ── THE DISTINCTION THIS SUITE EXISTS TO HOLD ───────────────────────────────
 *
 *     I CAN SEE THAT MAIA HOLDS THIS        ← P1  (breakthrough_moments: EXPORT)
 *                  ≠
 *     MAIA IS ENTITLED TO THINK WITH THIS   ← P3  (this suite: EXCLUDED)
 *
 * P1c made every recorded breakthrough visible to the member. That closed the
 * sovereignty covenant on the access side and conferred no participation
 * authority whatsoever.
 *
 * ── WHERE THE LOAD-BEARING GATE IS, AND WHY NOT IN THE COMPOSER ─────────────
 *
 * `lib/memory/MemoryOrchestrator.ts` carries `// @ts-nocheck`. A type-level gate
 * placed there would be decorative — the compiler is not reading it. So the gate
 * is at `lib/memory/breakthroughParticipation.ts`, which IS type-checked: the
 * excluded arm of the union has no `insight` field, so the string never leaves
 * the boundary and a downstream composer has nothing to render, rename,
 * reformat, cast or summarise.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  adjudicateBreakthroughRow,
  admittedBreakthroughs,
  excludedBreakthroughCount,
  type BreakthroughSnapshot,
} from '@/lib/memory/breakthroughParticipation';
import { adjudicateDerivation, adjudicateParticipation } from '@/lib/maia/participationGate';
import { memoryOrchestrator } from '@/lib/memory/MemoryOrchestrator';

const REPO = path.resolve(__dirname, '..');
const BOUNDARY = path.join(REPO, 'lib/memory/breakthroughParticipation.ts');
const STORE = path.join(REPO, 'lib/memory/stores/BreakthroughStore.ts');
const ORCH = path.join(REPO, 'lib/memory/MemoryOrchestrator.ts');
const BUNDLE = path.join(REPO, 'lib/memory/MemoryBundle.ts');

const SKIP = /__tests__|\.test\.ts|node_modules|\.next/;

/** Every lib/ and app/ module, for closed-set scans. */
function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (p: string): void => {
    let st: fs.Stats;
    try {
      st = fs.statSync(p);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      for (const f of fs.readdirSync(p)) {
        const q = path.join(p, f);
        if (!SKIP.test(q)) walk(q);
      }
      return;
    }
    if (/\.tsx?$/.test(p) && !SKIP.test(p)) out.push(path.relative(REPO, p));
  };
  walk(path.join(REPO, 'lib'));
  walk(path.join(REPO, 'app'));
  return out;
}

const FILES = sourceFiles();

/**
 * Files that USE a name — prose, declarations and import statements excluded.
 *
 * A REFERENCE scan, not a call scan. `rows.map(adjudicateBreakthroughRow)` is a
 * point-free reference with no `(` after the name, and a call-shaped detector
 * reported ZERO for it — every closed set below would have passed vacuously on
 * an empty result. Line numbers are deliberately not part of the assertion:
 * pinning them makes an unrelated edit above look like a sovereignty change.
 */
function stripImportsAndProse(src: string): string {
  // Whole import STATEMENTS, including multiline ones — a line-oriented strip
  // leaves `  admittedBreakthroughs,` behind and counts an import as a use.
  return src
    .replace(/^import\s[\s\S]*?from\s+'[^']+';/gm, '')
    .replace(/^import\s+'[^']+';/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function referencingFiles(name: string): string[] {
  const hits = new Set<string>();
  const ref = new RegExp(`(?:^|[^A-Za-z0-9_.])${name}(?![A-Za-z0-9_])`);
  const decl = new RegExp(`(?:export\\s+)?function\\s+${name}\\b`);
  for (const f of FILES) {
    const body = stripImportsAndProse(fs.readFileSync(path.join(REPO, f), 'utf8'));
    // The module that DECLARES the rule is its sanctioned home, not a consumer
    // of it. `excludedBreakthroughCount` calls `admittedBreakthroughs` inside
    // the boundary; counting that would make the boundary look like a composer
    // and every closed set below would have to name it.
    if (decl.test(body)) continue;
    if (ref.test(body)) hits.add(f);
  }
  return [...hits].sort();
}

/** Reference lines inside ONE file, for the single-read-path assertions. */
function referenceLines(file: string, name: string): string[] {
  const ref = new RegExp(`(?:^|[^A-Za-z0-9_.])${name}(?![A-Za-z0-9_])`);
  return stripImportsAndProse(fs.readFileSync(path.join(REPO, file), 'utf8'))
    .split('\n')
    .filter((l) => ref.test(l));
}

/**
 * The body of a named function, by brace matching from its declaration.
 *
 * Not a "slice from A to the next B": R25 showed that an assumed file ordering
 * returns an empty slice one way and a too-large one the other, and the
 * too-large direction passes SPURIOUSLY.
 */
function functionBody(source: string, name: string): string {
  const decl = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`);
  const m = decl.exec(source);
  expect({ fn: name, found: m !== null }).toEqual({ fn: name, found: true });
  // Balance the PARAMETER list first. `indexOf('{')` from the declaration finds
  // the brace of an inline parameter object type, and the "body" then starts
  // inside the signature — a slicer artifact that reads a type annotation as
  // executable code.
  let i = source.indexOf('(', m!.index);
  let paren = 0;
  for (; i < source.length; i++) {
    if (source[i] === '(') paren++;
    else if (source[i] === ')') {
      paren--;
      if (paren === 0) break;
    }
  }
  const open = source.indexOf('{', i);
  expect({ fn: name, opened: open > i }).toEqual({ fn: name, opened: true });
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`unterminated function ${name}`);
}

/**
 * Assert that a composer touches its RAW breakthrough array in exactly one
 * place: as the argument to `admittedBreakthroughs`.
 *
 * This is the assertion that was written for the orchestrator and NOT for the
 * other two composers, and mutation N10 walked straight through the gap: it
 * left the `admittedBreakthroughs(...)` line standing and simply read the raw
 * array beside it. A proximity check would have passed. Only a single-read-path
 * check refuses it.
 */
function assertSingleRawReadPath(file: string, fnName: string, rawName: string): void {
  const body = functionBody(fs.readFileSync(path.join(REPO, file), 'utf8'), fnName);
  const ident = new RegExp(`(?:^|[^A-Za-z0-9_.])${rawName.replace(/\./g, '\\.')}(?![A-Za-z0-9_])`);
  const reads = body
    .split('\n')
    .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
    .filter((l) => ident.test(l))
    .filter((l) => !new RegExp(`admittedBreakthroughs\\(\\s*${rawName.replace(/\./g, '\\.')}`).test(l))
    // A destructuring BINDING is not a read of the array's contents.
    .filter((l) => !/^\s*const \{[^}]*\} = \w+;/.test(l));
  expect({ file, fn: fnName, raw: rawName, unsanctionedReads: reads.map((l) => l.trim()) }).toEqual({
    file,
    fn: fnName,
    raw: rawName,
    unsanctionedReads: [],
  });
}

/** The declared body of an exported interface. */
function interfaceBody(source: string, name: string): string {
  const m = new RegExp(`export interface ${name}[^{]*\\{([\\s\\S]*?)\\n\\}`).exec(source);
  expect({ iface: name, found: m !== null }).toEqual({ iface: name, found: true });
  return m![1];
}

const excludedRow = (id: string): BreakthroughSnapshot =>
  adjudicateBreakthroughRow({
    id,
    insight: 'THE MACHINE WROTE THIS SENTENCE ABOUT THE MEMBER',
    element: 'fire',
    integrated: false,
    timestamp: '2026-06-01T10:00:00Z',
    related_themes: ['belonging'],
  });

const MACHINE_SENTENCE = 'THE MACHINE WROTE THIS SENTENCE ABOUT THE MEMBER';
const MEMBER_WORDS = 'I keep circling the same decision about leaving';

const recall = {
  recentBreakthroughs: [excludedRow('b1'), excludedRow('b2')],
  recentTurns: [
    { role: 'user' as const, content: MEMBER_WORDS, createdAt: '2026-06-01T10:00:00Z' },
    { role: 'assistant' as const, content: 'What is underneath that?', createdAt: '2026-06-01T10:00:05Z' },
  ],
};

// ── §0 — META-INVARIANT ──────────────────────────────────────────────────────

describe('P3f §0 — the instrument found its subject', () => {
  it('the source scan reaches a real module set', () => {
    expect(FILES.length).toBeGreaterThan(1000);
    expect(FILES).toContain('lib/memory/MemoryOrchestrator.ts');
    expect(FILES).toContain('lib/memory/stores/BreakthroughStore.ts');
  });

  it('the composer under test actually produces output', () => {
    // Zero output would make every "does not contain" assertion vacuous.
    expect(memoryOrchestrator.formatRecallForPrompt(recall as never).length).toBeGreaterThan(20);
  });

  it('the adjudicator is exercised, and the fixture is a real machine row', () => {
    expect(recall.recentBreakthroughs).toHaveLength(2);
    expect(recall.recentBreakthroughs[0].participation).toBe('excluded');
  });
});

// ── §1 — PROOF 1: raw insight cannot compose ─────────────────────────────────

describe('P3f §1 — the machine-extracted insight does not reach the prompt', () => {
  it('the composed block contains no insight text and no breakthroughs section', () => {
    const out = memoryOrchestrator.formatRecallForPrompt(recall as never);
    expect(out).not.toContain(MACHINE_SENTENCE);
    expect(out).not.toMatch(/RECENT BREAKTHROUGHS/);
  });

  it('the excluded arm carries no insight to compose, by TYPE not by filter', () => {
    const body = interfaceBody(fs.readFileSync(BOUNDARY, 'utf8'), 'ExcludedBreakthrough');
    for (const field of ['insight', 'element']) {
      expect({ field, declared: new RegExp(`\\n\\s+${field}[?:]`).test(body) }).toEqual({
        field,
        declared: false,
      });
    }
    // …and at runtime the property is genuinely absent, not undefined-valued.
    const row = excludedRow('b1');
    expect(Object.prototype.hasOwnProperty.call(row, 'insight')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(row, 'element')).toBe(false);
  });

  it('the excluded row still reports WHY, so the exclusion is auditable', () => {
    const row = excludedRow('b1');
    expect(row.participation).toBe('excluded');
    expect(row).toHaveProperty('exclusionReason', 'uncertified_provenance');
  });

  it('an admitted row WOULD compose — the block is gated, not dead', () => {
    // Without this, §1 would pass on a composer that can never emit anything,
    // and the gate would be indistinguishable from a deletion.
    const admitted: BreakthroughSnapshot = {
      id: 'a1',
      participation: 'admitted',
      insight: 'A MEMBER-ENDORSED INSIGHT',
      element: 'water',
      integrated: false,
      timestamp: new Date('2026-06-01T10:00:00Z'),
      relatedThemes: [],
    };
    const out = memoryOrchestrator.formatRecallForPrompt({
      ...recall,
      recentBreakthroughs: [admitted],
    } as never);
    expect(out).toMatch(/RECENT BREAKTHROUGHS/);
    expect(out).toContain('A MEMBER-ENDORSED INSIGHT');
    expect(out).toContain('(still integrating)');
  });
});

// ── §2 — PROOF 2: no alternate reader can reconstruct it ─────────────────────

describe('P3f §2 — every reader of the representation shares one boundary', () => {
  it('all three store read methods return the certified union', () => {
    const src = fs.readFileSync(STORE, 'utf8');
    for (const m of ['getRecentBreakthroughs', 'getUnintegratedBreakthroughs', 'getByElement']) {
      const decl = new RegExp(`async ${m}\\(([\\s\\S]*?)\\): Promise<BreakthroughSnapshot\\[\\]>`);
      expect({ method: m, certified: decl.test(src) }).toEqual({ method: m, certified: true });
    }
    // Including the two with no caller today. A gate that covers only the reader
    // someone happened to notice is the defect being repaired.
    expect((src.match(/adjudicateBreakthroughRow/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });

  it('the union is produced in exactly one place — the shared adjudicator', () => {
    // The structural invariant that generalizes. Wording checks lose to
    // rewording (P3e); a producer closed set does not care how a caller phrases
    // things, and a NEW producer fails BECAUSE IT IS NEW.
    expect(referencingFiles('adjudicateBreakthroughRow')).toEqual([
      'lib/memory/MemoryBundle.ts',
      'lib/memory/RelationshipMemoryService.ts',
      'lib/memory/SignificantMomentsService.ts',
      'lib/memory/stores/BreakthroughStore.ts',
    ]);
  });

  it('no module outside the boundary SELECTs the raw insight column', () => {
    const offenders: string[] = [];
    for (const f of FILES) {
      const src = fs.readFileSync(path.join(REPO, f), 'utf8');
      if (!/FROM\s+breakthrough_moments\b/i.test(src)) continue;
      if (!/\binsight\b/.test(src)) continue;
      // Adjudicated readers, and the export builder (P1c: ACCESS, not
      // participation — the member may read what MAIA may not think with).
      offenders.push(f);
    }
    // Two categories, and nothing else.
    //
    // ADJUDICATED — every one of these routes its rows through the shared
    // boundary, so what leaves carries no insight unless admitted.
    const adjudicated = [
      'lib/memory/MemoryBundle.ts',
      'lib/memory/RelationshipMemoryService.ts',
      'lib/memory/SignificantMomentsService.ts',
      'lib/memory/stores/BreakthroughStore.ts',
    ];
    // ACCESS-ONLY — P1, not P3. The member reading an inference about
    // themselves is not MAIA thinking with it.
    //
    // CORRECTION (founder, 2026-09-03): "nothing imports it" is NOT evidence
    // that an API route is unreachable. Routes are externally addressable by
    // construction, and import analysis says nothing about that. What the
    // absence of importers DOES establish is narrower and is all this needs:
    // no source module consumes this route's output, so its output does not
    // re-enter MAIA cognition through any in-tree path. Participation would
    // require evidence that it does. Its truthfulness and provenance framing
    // belong to P1/access governance, and P3 is not reopened on it without
    // participation evidence.
    const accessOnly = ['app/api/maia/field/route.ts'];
    expect(offenders.sort()).toEqual([...adjudicated, ...accessOnly].sort());
    for (const f of adjudicated) {
      expect({ f, adjudicates: referencingFiles('adjudicateBreakthroughRow').includes(f) }).toEqual({
        f,
        adjudicates: true,
      });
    }
    for (const f of accessOnly) {
      // Not "is it reachable" — an HTTP route always is. This asks whether any
      // SOURCE MODULE consumes its output, which is the only question
      // participation depends on.
      const importers = FILES.filter((g) => {
        if (g === f) return false;
        const spec = f.replace(/\.tsx?$/, '');
        return new RegExp(`from '(?:@/)?(?:\\.\\./)*${spec.replace(/\//g, '\\/')}'`).test(
          fs.readFileSync(path.join(REPO, g), 'utf8'),
        );
      });
      expect({ f, importers }).toEqual({ f, importers: [] });
    }
  });

  it('R25 and P3f now share one rule, not two copies of it', () => {
    const bundle = fs.readFileSync(BUNDLE, 'utf8');
    // MemoryBundle re-exports the boundary rather than declaring a rival union.
    expect(bundle).toMatch(/from '\.\/breakthroughParticipation'/);
    expect(/export interface AdmittedBreakthrough\b/.test(bundle)).toBe(false);
    expect(/export interface ExcludedBreakthrough\b/.test(bundle)).toBe(false);
    // And the shared adjudicator converges on the shared participation gate.
    const boundary = fs.readFileSync(BOUNDARY, 'utf8');
    expect(boundary).toMatch(/adjudicateParticipation\(/);
    expect(boundary).toMatch(/const provenance: ProvenanceClaim = null;/);
  });
});

// ── §3 — PROOFS 3 & 4: rename, reformat and cast bypasses ────────────────────

describe('P3f §3 — a rename, a reformat or a cast does not open the gate', () => {
  it('a renamed insight field on an excluded row composes nothing', () => {
    // The row is adjudicated from whatever the SQL produced. Renaming the column
    // or the property does not create an admitted arm.
    const renamed = adjudicateBreakthroughRow({
      id: 'r1',
      // deliberately NOT `insight`
      ...({ summary_text: MACHINE_SENTENCE } as Record<string, unknown>),
      integrated: true,
      timestamp: '2026-06-01T10:00:00Z',
    });
    expect(renamed.participation).toBe('excluded');
    const out = memoryOrchestrator.formatRecallForPrompt({
      ...recall,
      recentBreakthroughs: [renamed],
    } as never);
    expect(out).not.toContain(MACHINE_SENTENCE);
    expect(out).not.toMatch(/RECENT BREAKTHROUGHS/);
  });

  it('the composer reads breakthroughs ONLY through the sanctioned accessor', () => {
    // A cast-based bypass (`recall.recentBreakthroughs as any`) is defeated by
    // denying the composer any other route to the array, rather than by denying
    // one SPELLING of the cast — R27 showed a spelling check loses.
    const src = fs.readFileSync(ORCH, 'utf8');
    const reads = src
      .split('\n')
      .map((l, i) => [l, i + 1] as const)
      .filter(([l]) => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .filter(([l]) => /recall\.recentBreakthroughs/.test(l));
    expect(reads).toHaveLength(1);
    expect(reads[0][0]).toMatch(/admittedBreakthroughs\(recall\.recentBreakthroughs \?\? \[\]\)/);
  });

  it('EVERY composer touches its raw array only through the accessor', () => {
    // One assertion per composer. Writing it for the orchestrator alone was the
    // gap N10 exploited — the other two composers were repaired but never
    // certified, and a repair without a gate is a state, not a property.
    assertSingleRawReadPath(
      'lib/memory/SignificantMomentsService.ts',
      'formatSignificantMomentsAddendum',
      'moments.breakthroughs',
    );
    assertSingleRawReadPath(
      'lib/memory/RelationshipMemoryService.ts',
      'generateRelationshipSummary',
      'breakthroughs',
    );
  });

  it('the relationship SUMMARY cannot carry the insight it excluded elsewhere', () => {
    // P1c kept `summary` composition-eligible on the 2026-08-14 ruling, and
    // `generateRelationshipSummary` BUILDS it. Interpolating a machine-extracted
    // insight there moved the excluded representation into the prompt inside a
    // field P1c had admitted.
    const body = functionBody(
      fs.readFileSync(path.join(REPO, 'lib/memory/RelationshipMemoryService.ts'), 'utf8'),
      'generateRelationshipSummary',
    );
    const insightReads = body
      .split('\n')
      .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .filter((l) => /\.insight\b/.test(l));
    expect(insightReads).toHaveLength(1);
    // …and the object it reads from must be bound off the accessor.
    expect(body).toMatch(/const admittedRecent = admittedBreakthroughs\(breakthroughs\);/);
    expect(body).toMatch(/const recent = admittedRecent\[0\];/);
    expect(body).toMatch(/if \(admittedRecent\.length > 0\)/);
  });

  it('`admittedBreakthroughs` is the ONLY composition entry point', () => {
    // Every module that composes a breakthrough must come through here. A new
    // composer that reads the array directly fails BECAUSE IT IS NEW.
    expect(referencingFiles('admittedBreakthroughs')).toEqual([
      // CMT-01 Step 2: the provider registry passes ADMITTED breakthroughs
      // through as upstream-certified candidates (gate P3f) and carries the
      // excluded ones as excluded. It composes nothing itself; the constructor
      // does, and only from admitted material. Classified here deliberately —
      // this closed set is exactly what noticed it.
      'lib/maia/turn/providers.ts',
      'lib/memory/MemoryOrchestrator.ts',
      'lib/memory/RelationshipMemoryService.ts',
      'lib/memory/SignificantMomentsService.ts',
    ]);
    expect(referenceLines('lib/memory/MemoryOrchestrator.ts', 'admittedBreakthroughs')).toHaveLength(1);
  });

  it('no cast reintroduces the excluded arm as admitted anywhere', () => {
    const offenders: string[] = [];
    for (const f of FILES) {
      const src = fs.readFileSync(path.join(REPO, f), 'utf8');
      src.split('\n').forEach((l, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(l)) return;
        if (/\bas\s+(?:unknown\s+as\s+)?AdmittedBreakthrough\b/.test(l)) offenders.push(`${f}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});

// ── §4 — PROOF 5: derivations over the excluded material stay excluded ───────

describe('P3f §4 — a summary, a count or a category is still the inference', () => {
  it('the shared derivation rule independently yields exclusion', () => {
    const derived = adjudicateParticipation({
      provenance: { authoredBy: 'maia', authorityClass: 'inference' },
      endorsement: 'none',
    });
    expect(adjudicateDerivation([derived]).admitted).toBe(false);
  });

  it('a count of excluded breakthroughs does not become a composed claim', () => {
    // "3 breakthroughs recently" is a derivation over the excluded material and
    // would smuggle the inference back as a quantity.
    const out = memoryOrchestrator.formatRecallForPrompt(recall as never);
    expect(out).not.toMatch(/breakthrough/i);
    expect(out).not.toMatch(/\b2\b/);
  });

  it('the exclusion count exists as OBSERVABILITY and is not in the prompt', () => {
    expect(excludedBreakthroughCount(recall.recentBreakthroughs)).toBe(2);
    const src = fs.readFileSync(ORCH, 'utf8');
    // Reported on the recall context…
    expect(src).toMatch(/breakthroughsExcluded: excludedBreakthroughCount\(/);
    // …and never pushed into a prompt section.
    const composed = src.split('formatRecallForPrompt')[1] ?? '';
    expect(/sections\.push\([^)]*breakthroughsExcluded/.test(composed)).toBe(false);
  });

  it('an element or theme derived from an excluded row composes nothing', () => {
    const out = memoryOrchestrator.formatRecallForPrompt(recall as never);
    expect(out).not.toContain('fire');
    expect(out).not.toContain('belonging');
  });
});

// ── §5 — PROOF 6: the member's own material survives the partition ───────────

describe('P3f §5 — member testimony is not swept away with the inference', () => {
  it('the member’s own words still compose', () => {
    const out = memoryOrchestrator.formatRecallForPrompt(recall as never);
    expect(out).toMatch(/RECENT CONVERSATION/);
    expect(out).toContain(MEMBER_WORDS);
  });

  it('the composer is partitioned, not emptied', () => {
    const out = memoryOrchestrator.formatRecallForPrompt(recall as never);
    expect(out.length).toBeGreaterThan(30);
  });

  it('the breakthrough path is GOVERNED, not deleted', () => {
    // Deleting the block would hide the composition rather than gate it, and
    // would make a future reintroduction look like new work instead of a
    // restoration the gate must refuse.
    const src = fs.readFileSync(ORCH, 'utf8');
    expect(src).toMatch(/RECENT BREAKTHROUGHS/);
    expect(src).toMatch(/admittedBreakthroughs\(/);
  });
});

// ── §6 — INNOCENT NEGATIVE CONTROLS ──────────────────────────────────────────

describe('P3f §6 — innocent negative controls', () => {
  it('writes are untouched: exclusion governs participation, not storage', () => {
    const src = fs.readFileSync(STORE, 'utf8');
    expect(src).toMatch(/INSERT INTO breakthrough_moments/);
    expect(src).toMatch(/UPDATE breakthrough_moments/);
  });

  it('the member can still SEE these — P1 access is untouched by P3 exclusion', () => {
    const disp = fs.readFileSync(path.join(REPO, 'lib/maia/sovereignDisposition.ts'), 'utf8');
    const entry = /breakthrough_moments: \{([\s\S]*?)\n  \},/.exec(disp);
    expect(entry).not.toBeNull();
    expect(entry![1]).toMatch(/dispositions: \['EXPORT'\]/);
    expect(entry![1]).toMatch(/'insight'/);
  });

  it('an empty breakthrough list is silence, not an empty scaffold', () => {
    const out = memoryOrchestrator.formatRecallForPrompt({
      recentBreakthroughs: [],
      recentTurns: recall.recentTurns,
    } as never);
    expect(out).not.toMatch(/RECENT BREAKTHROUGHS/);
    expect(out).toContain(MEMBER_WORDS);
  });

  it('prose in the composer naming the removed block is not a composition of it', () => {
    // The module comment quotes `RECENT BREAKTHROUGHS` to explain the gate.
    expect(fs.readFileSync(ORCH, 'utf8')).toMatch(/RECENT BREAKTHROUGHS/);
    expect(memoryOrchestrator.formatRecallForPrompt(recall as never)).not.toMatch(
      /RECENT BREAKTHROUGHS/,
    );
  });

  it('the adjudicator tolerates a row missing every optional field', () => {
    const row = adjudicateBreakthroughRow({});
    expect(row.participation).toBe('excluded');
    expect(row.relatedThemes).toEqual([]);
  });
});

// ── §7 — BOUNDARY NEGATIVE CONTROLS ──────────────────────────────────────────

describe('P3f §7 — boundary negative controls', () => {
  it('the call-site scan ignores prose, imports and the declaration itself', () => {
    const boundary = fs.readFileSync(BOUNDARY, 'utf8');
    // The boundary DECLARES both functions and mentions them in prose; neither
    // may count as a call, or every closed set above would be self-falsifying.
    expect(boundary).toMatch(/export function adjudicateBreakthroughRow\(/);
    expect(referencingFiles('adjudicateBreakthroughRow')).not.toContain(
      'lib/memory/breakthroughParticipation.ts',
    );
    expect(referencingFiles('admittedBreakthroughs')).not.toContain(
      'lib/memory/breakthroughParticipation.ts',
    );
  });

  it('the interface reader takes the BODY, not the docblock that describes it', () => {
    // R24: a slice to the next export swept in the comment explaining the
    // property, and the assertion failed on its own explanation.
    const body = interfaceBody(fs.readFileSync(BOUNDARY, 'utf8'), 'AdmittedBreakthrough');
    expect(body).toMatch(/\n\s+insight: string;/);
    expect(body).not.toMatch(/\*/);
  });

  it('the timestamp field is accepted under either spelling', () => {
    // The store selects `timestamp`; the old orchestrator shape used
    // `createdAt`. A boundary that silently produced Invalid Date for one of
    // them would corrupt ordering without failing anything.
    const a = adjudicateBreakthroughRow({ id: '1', timestamp: '2026-06-01T10:00:00Z' });
    const b = adjudicateBreakthroughRow({ id: '1', createdAt: '2026-06-01T10:00:00Z' });
    expect(a.timestamp.toISOString()).toBe(b.timestamp.toISOString());
    expect(Number.isNaN(a.timestamp.getTime())).toBe(false);
  });

  it('`related_themes` and `relatedThemes` both resolve, and neither composes', () => {
    expect(adjudicateBreakthroughRow({ related_themes: ['x'] }).relatedThemes).toEqual(['x']);
    expect(adjudicateBreakthroughRow({ relatedThemes: ['x'] }).relatedThemes).toEqual(['x']);
    expect(memoryOrchestrator.formatRecallForPrompt({
      recentBreakthroughs: [adjudicateBreakthroughRow({ related_themes: ['SECRETTHEME'] })],
      recentTurns: recall.recentTurns,
    } as never)).not.toContain('SECRETTHEME');
  });

  it('a reformatted multiline import is still seen by the closed-set scans', () => {
    // P3e: a line-oriented import scan reported ZERO the moment an import was
    // reformatted, letting formatting decide a sovereignty verdict.
    const orch = fs.readFileSync(ORCH, 'utf8');
    const decls = [...orch.matchAll(/^import\s[\s\S]*?from\s+'[^']+';/gm)]
      .map((m) => m[0])
      .filter((d) => /breakthroughParticipation/.test(d));
    expect(decls).toHaveLength(1);
    expect(decls[0]).toMatch(/admittedBreakthroughs/);
    expect(decls[0].split('\n').length).toBeGreaterThan(1);
  });
});
