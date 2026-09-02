/**
 * MIPA PHASE 0 — P3c CERTIFICATION: THE ALTERNATE-READER BYPASS
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3c
 *
 * ── TOPOLOGY, ESTABLISHED FROM SOURCE BEFORE ANY CHANGE ─────────────────────
 *
 * STORAGE      `developmental_memories` — the SAME table as P3a
 * COLUMN       `content_text`           — the SAME column as P3a's cue
 * READER       `MemoryBundle.getSemanticMemories`, sole caller `build()` (:172)
 * LIVE?        YES — `build()` runs on /api/sovereign/app/maia/list, and its
 *              `formatForPrompt` output reaches the FAST tier as `memoryContext`
 * COMPOSITION  `• [developmental] <content_text truncated to 150>` — VERBATIM,
 *              which is more direct than the `directional_cue` prime R24 removed
 * PROVENANCE   none at write time, none at read time — no authorship column
 * CLASS        NOT a second inference class. An ALTERNATE READER to material
 *              already excluded by R24.
 *
 * So R24's capability contraction was partially undone by a second reader on
 * the same rows. That is the finding P3c exists to close, and it is why
 * "certify the detector's scope" and "certify the prerequisite's property" had
 * to stay distinct.
 *
 * ── CONVERGENCE, NOT A PARALLEL MECHANISM ───────────────────────────────────
 *
 * Per adjudication: an alternate reader must reach the SAME participation
 * boundary. `adjudicateDevelopmentalRow` calls `adjudicateParticipation` — the
 * one gate P3a and P3b use. No second provenance model, no second adjudicator.
 *
 * ── WHY THE INVARIANT IS ENFORCED AT COMPOSITION, NOT AT READ ───────────────
 *
 * The tempting form of "no composer may bypass the certified representation and
 * reread the backing store" is a closed set over READERS of
 * `developmental_memories`. There are ~32 SQL touch-points across 13 files, most
 * of them legitimate non-composing readers: export, the patterns UI, feedback
 * routes, stale-preference review. Gating all of them is the overbroad-detector
 * failure that ends in a disabled gate.
 *
 * The enforceable boundary is COMPOSITION: the set of sites that turn a
 * developmental row into prompt-bound content. That set is small, and §4 pins it.
 *
 * ── OUT OF CLASS, AND WHY ───────────────────────────────────────────────────
 *
 * `turnsToCandidate` filters `role === 'user'` — the member's own words.
 * Authorship there is structurally certifiable from the schema's `role` column,
 * not guessed. Member testimony is S2 under the lattice and legitimately
 * composes. It is not P3 exposure, and §5 pins that boundary so a future
 * over-correction does not sweep the member's own speech into the exclusion.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  MemoryBundleService,
  type DevelopmentalRowSnapshot,
} from '@/lib/memory/MemoryBundle';

const REPO = path.resolve(__dirname, '..');
const BUNDLE = path.join(REPO, 'lib/memory/MemoryBundle.ts');
const src = () => fs.readFileSync(BUNDLE, 'utf8');

function methodBody(source: string, name: string): string {
  // Matches an optional `async` modifier. Without it, `async getSemanticMemories(`
  // never matches and the helper silently misses the method — the FOURTH
  // instrument defect in this program, and one the boundary controls below did
  // not catch because every method they exercised was synchronous. A helper
  // that fails to find its target is a false-green generator, which is the more
  // dangerous half of the detector rule.
  const decl = new RegExp('\\n  (?:async )?' + name + '\\(');
  const m = decl.exec(source);
  expect({ method: name, found: m !== null }).toEqual({ method: name, found: true });
  const start = m!.index;
  const end = source.indexOf('\n  },', start);
  expect({ method: name, terminated: end > start }).toEqual({ method: name, terminated: true });
  return source.slice(start, end);
}

const row = (id: string, content: string | null) => ({
  id,
  content_text: content,
  significance: 0.8,
  formed_at: new Date('2026-01-01'),
  facet_code: 'water-2',
  similarity: 0,
  score: 0.7,
});

// ── §1 — no uncertified developmental material reaches formatForPrompt ───────

describe('P3c §1 — uncertified developmental material does not compose', () => {
  it('every real row adjudicates to excluded, because the table records no authorship', () => {
    const r = MemoryBundleService.adjudicateDevelopmentalRow(row('a', 'the distilled signal'));
    expect(r.participation).toBe('excluded');
    if (r.participation === 'excluded') expect(r.exclusionReason).toBe('uncertified_provenance');
  });

  it('excluded rows produce no candidates', () => {
    const rows = [row('a', 'x'), row('b', 'y')].map(r =>
      MemoryBundleService.adjudicateDevelopmentalRow(r),
    );
    expect(MemoryBundleService.developmentalToCandidates(rows)).toEqual([]);
  });

  it('the excluded arm carries no content at runtime either', () => {
    const r = MemoryBundleService.adjudicateDevelopmentalRow(row('a', 'secret'));
    expect(Object.prototype.hasOwnProperty.call(r, 'content')).toBe(false);
  });

  it('nothing composed means no RELEVANT MEMORIES section', () => {
    const text = MemoryBundleService.formatForPrompt({
      recentContinuity: '',
      memoryBullets: [],
      relationshipSnapshot: {
        encounterCount: 12, firstSeen: new Date(), lastSeen: new Date(),
        breakthroughCount: 0, recentBreakthroughs: [], integrationRate: 0,
      },
      selectionTrace: [],
      retrievalStats: {
        turnsRetrieved: 0, turnsSameSession: 0, turnsCrossSession: 0,
        semanticHits: 0, developmentalExcluded: 12,
        breakthroughsFound: 0, breakthroughsExcluded: 0,
        totalCandidates: 0, afterRanking: 0,
      },
    });
    expect(text).not.toMatch(/RELEVANT MEMORIES/);
    expect(text).not.toMatch(/\[developmental\]/);
  });
});

// ── §2 — convergence onto the one certified boundary ─────────────────────────

describe('P3c §2 — the alternate reader converges on the SAME gate', () => {
  it('calls adjudicateParticipation, not a parallel adjudicator', () => {
    expect(methodBody(src(), 'adjudicateDevelopmentalRow'))
      .toMatch(/adjudicateParticipation\(\{ provenance, endorsement: 'none' \}\)/);
  });

  it('declares exactly one adjudicator import for the whole module', () => {
    // Multiline-aware. A line-oriented scan (`split('\n').filter(/^import /)`)
    // reported ZERO gate imports the moment the import was reformatted across
    // lines — a formatting change altering the verdict, which is precisely the
    // boundary-control class. The property never changed; the instrument did.
    const gateImports = [...src().matchAll(/^import\s[\s\S]*?from\s+'[^']+';/gm)]
      .map((m) => m[0])
      .filter((decl) => /participationGate/.test(decl));
    expect(gateImports).toHaveLength(1);
  });

  it('the import scan is format-independent (boundary control)', () => {
    const single = "import { a } from '../maia/participationGate';";
    const multi = "import {\n  a,\n  b,\n} from '../maia/participationGate';";
    const scan = (t: string) =>
      [...t.matchAll(/^import\s[\s\S]*?from\s+'[^']+';/gm)]
        .filter((m) => /participationGate/.test(m[0])).length;
    expect(scan(single)).toBe(1);
    expect(scan(multi)).toBe(1);
  });

  it('defines no second provenance model in this module', () => {
    const code = src().split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
    expect(code).not.toMatch(/type\s+\w*Provenance\w*\s*=/);
    expect(code).not.toMatch(/function\s+adjudicate(?!ParticipationCall)\w*\s*\(/);
  });
});

// ── §3 — unknown provenance never defaults to member ─────────────────────────

describe('P3c §3 — no heuristic or default provenance', () => {
  it('the claim is null and never member', () => {
    const body = methodBody(src(), 'adjudicateDevelopmentalRow');
    expect(body).toMatch(/const provenance: ProvenanceClaim = null;/);
    const code = body.split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n');
    expect(code).not.toMatch(/authoredBy:\s*'member'/);
    expect(code).not.toMatch(/authorityClass:\s*'testimony'/);
  });

  it('provenance is not derived from content', () => {
    const body = methodBody(src(), 'adjudicateDevelopmentalRow');
    const gateRegion = body.slice(0, body.indexOf('adjudicateParticipation'));
    for (const h of ['content_text.', 'includes(', 'match(', '.test(']) {
      expect({ heuristic: h, present: gateRegion.includes(h) })
        .toEqual({ heuristic: h, present: false });
    }
  });
});

// ── §4 — the composition boundary is a closed set ────────────────────────────

describe('P3c §4 — no composer obtains developmental content off-boundary', () => {
  it('every developmental-source candidate is built in exactly one place', () => {
    const skip = /node_modules|\.next|__tests__|\.test\.tsx?$/;
    const sites: string[] = [];
    const walk = (p: string) => {
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        for (const f of fs.readdirSync(p)) {
          const q = path.join(p, f);
          if (!skip.test(q)) walk(q);
        }
        return;
      }
      if (!/\.tsx?$/.test(p)) return;
      const rel = path.relative(REPO, p);
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        if (/^\s*(\/\/|\*)/.test(l)) return;
        if (/source:\s*'developmental'/.test(l)) sites.push(`${rel}:${i + 1}`);
      });
    };
    for (const r of ['lib', 'app', 'components']) walk(path.join(REPO, r));
    // Exactly one — inside developmentalToCandidates, which only receives
    // admitted rows. A second construction site is a new composer and fails
    // BECAUSE IT IS NEW, whatever it does.
    expect(sites).toHaveLength(1);
    expect(sites[0]).toMatch(/^lib\/memory\/MemoryBundle\.ts:/);
  });

  it('developmentalToCandidates narrows before reading content', () => {
    expect(methodBody(src(), 'developmentalToCandidates'))
      .toMatch(/participation === 'admitted'/);
  });

  it('the excluded arm of the union declares no content', () => {
    const s = src();
    const start = s.indexOf('export interface ExcludedDevelopmentalRow');
    const body = s.slice(start, s.indexOf('\n}', start));
    expect(body).not.toMatch(/content/);
  });

  it('both branches of getSemanticMemories are gated, including the dead vector one', () => {
    const body = methodBody(src(), 'getSemanticMemories');
    const calls = body.match(/adjudicateDevelopmentalRow/g) ?? [];
    expect(calls.length).toBe(2);
  });

  it('an admitted row still composes — the gate excludes, it does not disable', () => {
    const admitted: DevelopmentalRowSnapshot = {
      id: 'a', significance: 0.8, timestamp: new Date(), facet: 'fire-1',
      similarity: 0, compositeScore: 0.9,
      participation: 'admitted', content: 'certified signal',
    };
    const c = MemoryBundleService.developmentalToCandidates([admitted]);
    expect(c).toHaveLength(1);
    expect(c[0].content).toBe('certified signal');
    expect(c[0].source).toBe('developmental');
  });
});

// ── §5 — the contraction cannot be restored by an alternate reader ───────────

describe('P3c §5 — R24/R25 contractions hold against alternate readers', () => {
  it('the developmental bucket reports what it withheld', () => {
    // Distinguishes "no developmental memory" from "it did not participate".
    expect(src()).toMatch(/developmentalExcluded: developmentalBucket\.excludedCount/);
  });

  it('member testimony is NOT swept into the exclusion', () => {
    // turnsToCandidate keeps role === 'user'. Authorship is structurally
    // certifiable from the schema's role column — S2 testimony, legitimately
    // composing. An over-correction that excluded the member's own words would
    // be a different constitutional failure, in the opposite direction.
    expect(methodBody(src(), 'turnsToCandidate')).toMatch(/role === 'user'/);
  });

  it('the member-marked atoms path remains untouched', () => {
    const atoms = fs.readFileSync(path.join(REPO, 'lib/maia/memoryAtomsLoader.ts'), 'utf8');
    expect(atoms).toMatch(/ORDER BY is_breakthrough DESC/);
    expect(atoms).not.toMatch(/participationGate/);
  });
});

// ── §6 — NEGATIVE CONTROLS: innocent lookalikes must pass ────────────────────

describe('P3c §6 — innocent negative controls', () => {
  it('non-composing readers of developmental_memories are untouched', () => {
    // ~32 SQL touch-points exist across 13 files. Export, the patterns UI,
    // feedback and stale-preference routes read the table legitimately and do
    // not compose into a prompt. Gating them would be the overbroad-detector
    // failure that ends in a disabled gate.
    const exportRoute = fs.readFileSync(
      path.join(REPO, 'app/api/members/export-data/route.ts'), 'utf8');
    expect(exportRoute).toMatch(/FROM developmental_memories/);
    expect(exportRoute).not.toMatch(/participationGate/);
  });

  it('reading non-composing fields from an excluded row is legitimate', () => {
    const r = MemoryBundleService.adjudicateDevelopmentalRow(row('a', 'x'));
    expect(r.significance).toBe(0.8);
    expect(r.facet).toBe('water-2');
  });

  it('prose naming a forbidden construct is not the construct', () => {
    // The module docblock explains why `content` is absent from the excluded
    // arm, and says the word. The check reads the interface body, not the prose.
    expect(src()).toMatch(/content` exists only on the admitted arm/);
  });
});

// ── §7 — BOUNDARY NEGATIVE CONTROLS ──────────────────────────────────────────
//
// Founder rule, 2026-09-02, promoted after three instrument failures — the
// third of which (a body slice on assumed file ordering) could have produced a
// FALSE GREEN rather than noise. Boundary controls prove the verdict does not
// depend on comments, documentation, source ordering, unrelated methods, or
// naming coincidence.

describe('P3c §7 — boundary negative controls: the verdict is order- and prose-independent', () => {
  it('methodBody is position-independent, not "from A to B"', () => {
    const s = src();
    // These three appear in an order the test must not depend on.
    const names = ['developmentalToCandidates', 'adjudicateDevelopmentalRow', 'turnsToCandidate'];
    const positions = names.map(n => s.indexOf(`\n  ${n}(`));
    expect(positions.every(p => p > 0)).toBe(true);
    for (const n of names) {
      const body = methodBody(s, n);
      expect(body.length).toBeGreaterThan(0);
      // each body terminates before the NEXT method begins, whatever the order
      for (const other of names.filter(o => o !== n)) {
        expect(body).not.toMatch(new RegExp(`\\n  ${other}\\(`));
      }
    }
  });

  it('an `async` modifier does not hide a method from the extractor', () => {
    // The fourth instrument defect, pinned. `getSemanticMemories` is declared
    // `async`; a helper matching only `\\n  name(` misses it entirely and every
    // assertion about its body passes vacuously.
    const body = methodBody(src(), 'getSemanticMemories');
    expect(body.length).toBeGreaterThan(0);
    expect(body).toMatch(/async getSemanticMemories\(/);
  });

  it('a comment containing the forbidden construct does not trip the composer scan', () => {
    const line = "    // e.g. source: 'developmental' would be built here";
    expect(/^\s*(\/\/|\*)/.test(line)).toBe(true);
  });

  it('an unrelated method naming a gated field is not a composition site', () => {
    // `compress()` handles `candidate.content` generically for every bucket.
    // It is not a developmental construction site and must not be flagged.
    const body = methodBody(src(), 'compress');
    expect(body).toMatch(/candidate\.content/);
    expect(body).not.toMatch(/source:\s*'developmental'/);
  });

  it('a naming coincidence is not a gate', () => {
    expect(/source:\s*'developmental'/.test("const developmentalNotes = 'x'")).toBe(false);
    expect(/source:\s*'developmental'/.test("source: 'developmental' as const")).toBe(true);
  });
});
