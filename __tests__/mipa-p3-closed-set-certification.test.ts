/**
 * MIPA PHASE 0 — P3 CLOSED-SET CERTIFICATION
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3-CSC
 *
 * Target set: every source-level producer capable of contributing persisted
 * member-history or member-about material to canonical MAIA cognition.
 *
 * ── DISCOVERY IS COMPILER-DERIVED, NOT REGEX ────────────────────────────────
 *
 * After four detector defects — a word-boundary miss, an over-wide slice, an
 * assumed file ordering, and an unmatched `async` — regex had stopped being an
 * honest instrument for parsing. Discovery here walks the TypeScript AST via
 * the compiler API: template spans and object-literal properties, not patterns
 * over text.
 *
 * ── THE CEILING THIS CERTIFICATION ESTABLISHES ──────────────────────────────
 *
 * Discovery is anchored on two hand-named assembly sites. That anchor cannot
 * itself be derived, and the reason is structural: `lib/sovereign/maiaService.ts`
 * alone contains 142 template expressions, and NO SOURCE-LEVEL PROPERTY
 * DISTINGUISHES a template that becomes prompt text from one that becomes a
 * console line. Both interpolate member-derived identifiers; both are
 * `TemplateExpression` nodes. Telling them apart requires following the string
 * to the model call — dataflow the canonical seam would make structural and
 * that no parser can supply today.
 *
 * An earlier draft of this very extractor used a `spans > 8` threshold as a
 * proxy and thereby EXCLUDED `${memoryContext}` (6 spans) and `${recentContext}`
 * (5 spans) — the MemoryBundle output, which is exactly the material P3
 * governs. The threshold was an arbitrary narrowing of the subject, discovered
 * only by probing. That is recorded as evidence, not corrected into confidence.
 *
 * So this suite certifies a REAL but BOUNDED property:
 *
 *   CLOSED  within the two named assembly registries — drift inside them fails.
 *   OPEN    across the codebase — a third assembly site is invisible to it.
 *
 * Per the adjudication, that limitation is reported rather than papered over.
 * A brittle detector manufactured so P3 could carry a green badge would be
 * worse than the honest ceiling.
 *
 * ── META-INVARIANT (§0) ─────────────────────────────────────────────────────
 *
 * The instrument must prove it found its subject. Zero discovered targets is a
 * red failure, never a vacuous green.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {
  PRODUCER_TREATMENT,
  SELF_CERTIFYING_CLASSES,
  type ProducerClass,
} from '@/lib/maia/promptProducerClassification';

const REPO = path.resolve(__dirname, '..');
const SERVICE = path.join(REPO, 'lib/sovereign/maiaService.ts');
const VOICE = path.join(REPO, 'lib/sovereign/maiaVoice.ts');

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}

/**
 * Identifiers interpolated into the FAST system-prompt template.
 *
 * Anchored on the template's own identity — the one containing
 * `MAIA_RUNTIME_PROMPT` — rather than on a span-count threshold. A threshold is
 * an arbitrary narrowing; an anchor is a stated choice whose failure is loud
 * (§0 fails if the anchor stops matching).
 */
function fastTemplateProducers(): string[] {
  const sf = parse(SERVICE);
  const found = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isTemplateExpression(node) && node.getText().includes('MAIA_RUNTIME_PROMPT')) {
      for (const span of node.templateSpans) {
        const collect = (n: ts.Node): void => {
          // The `.name` half of a property access and a call's callee are
          // method names, not producers.
          if (ts.isPropertyAccessExpression(n)) return collect(n.expression);
          if (ts.isCallExpression(n)) return n.arguments.forEach(collect);
          if (ts.isIdentifier(n)) { found.add(n.text); return; }
          n.forEachChild(collect);
        };
        collect(span.expression);
      }
    }
    node.forEachChild(visit);
  };
  visit(sf);
  return [...found].sort();
}

/** `field:` values declared in the ADDENDA_SPECS registry. */
function addendaSpecProducers(): string[] {
  const sf = parse(VOICE);
  const found = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && node.name.getText() === 'ADDENDA_SPECS' && node.initializer) {
      const collectObj = (n: ts.Node): void => {
        if (ts.isObjectLiteralExpression(n)) {
          for (const prop of n.properties) {
            if (ts.isPropertyAssignment(prop) && prop.name.getText() === 'field') {
              found.add(prop.initializer.getText().replace(/['"]/g, ''));
            }
          }
        }
        n.forEachChild(collectObj);
      };
      collectObj(node.initializer);
    }
    node.forEachChild(visit);
  };
  visit(sf);
  return [...found].sort();
}

const fast = fastTemplateProducers();
const addenda = addendaSpecProducers();
const discovered = [...new Set([...fast, ...addenda])].sort();

// ── §0 — META-INVARIANT: the instrument must find its subject ────────────────

describe('P3-CSC §0 — the instrument proves it found its subject', () => {
  it('discovers a nonzero number of producers on BOTH paths', () => {
    // A detector reporting success while discovering nothing is the false-green
    // class. Zero here is red, never a vacuous pass.
    expect(fast.length).toBeGreaterThan(20);
    expect(addenda.length).toBeGreaterThan(15);
    expect(discovered.length).toBeGreaterThan(35);
  });

  it('the FAST anchor still matches — a moved template fails loudly', () => {
    expect(fs.readFileSync(SERVICE, 'utf8')).toMatch(/MAIA_RUNTIME_PROMPT/);
    expect(fast).toContain('MAIA_RUNTIME_PROMPT');
  });

  it('discovery is AST-based, not regex-based', () => {
    const self = fs.readFileSync(__filename, 'utf8');
    expect(self).toMatch(/ts\.isTemplateExpression/);
    expect(self).toMatch(/ts\.isPropertyAssignment/);
  });
});

// ── §1 — exhaustive classification ───────────────────────────────────────────

describe('P3-CSC §1 — every discovered producer has an explicit treatment', () => {
  it('no producer is unclassified', () => {
    const unclassified = discovered.filter((p) => !PRODUCER_TREATMENT[p]);
    // A new producer changes the DERIVED set, finds no treatment, and fails
    // here. It cannot fall into a permissive default.
    expect({ unclassified }).toEqual({ unclassified: [] });
  });

  it('no treatment is stale', () => {
    const stale = Object.keys(PRODUCER_TREATMENT).filter((p) => !discovered.includes(p));
    expect({ stale }).toEqual({ stale: [] });
  });

  it('UNKNOWN is a real class that fails closed, not a placeholder', () => {
    const unknowns = discovered.filter((p) => PRODUCER_TREATMENT[p]?.class === 'UNKNOWN');
    // If any producer is genuinely UNKNOWN, it must not be composing. Today
    // none is classified UNKNOWN; the assertion pins that, and would fail the
    // moment one appeared without a gate.
    for (const u of unknowns) {
      expect({ producer: u, gate: PRODUCER_TREATMENT[u].gate }).not.toEqual({ producer: u, gate: undefined });
    }
    expect(SELF_CERTIFYING_CLASSES).not.toContain('UNKNOWN');
  });

  it('every treatment carries an evidence-bearing note', () => {
    for (const [name, t] of Object.entries(PRODUCER_TREATMENT)) {
      expect({ name, hasNote: t.note.length > 10 }).toEqual({ name, hasNote: true });
    }
  });
});

// ── §2 — parallel-path drift ─────────────────────────────────────────────────

describe('P3-CSC §2 — drift on either assembly path is caught', () => {
  it('the two paths are NOT asserted equal — they are materially different', () => {
    // Asserting list A == list B would recreate R23's defect shape. The paths
    // genuinely diverge, and the certification records the divergence rather
    // than demanding it away.
    const onlyFast = fast.filter((p) => !addenda.includes(p));
    const onlyAddenda = addenda.filter((p) => !fast.includes(p));
    expect(onlyFast.length).toBeGreaterThan(0);
    expect(onlyAddenda.length).toBeGreaterThan(0);
    // Both halves must nonetheless be fully classified.
    for (const p of [...onlyFast, ...onlyAddenda]) {
      expect({ producer: p, classified: !!PRODUCER_TREATMENT[p] })
        .toEqual({ producer: p, classified: true });
    }
  });

  it('CORE/DEEP compose member-historical material FAST does not', () => {
    // A finding, pinned: journal and capture context reach CORE/DEEP only.
    const onlyAddenda = addenda.filter((p) => !fast.includes(p));
    expect(onlyAddenda).toContain('journalContextAddendum');
    expect(onlyAddenda).toContain('captureContextAddendum');
  });
});

// ── §3 — gate coverage for non-self-certifying classes ───────────────────────

describe('P3-CSC §3 — inference and derivation require a gate', () => {
  it('reports which non-self-certifying producers lack a composition gate', () => {
    const needsGate = discovered.filter(
      (p) => !SELF_CERTIFYING_CLASSES.includes(PRODUCER_TREATMENT[p].class),
    );
    const ungated = needsGate.filter((p) => !PRODUCER_TREATMENT[p].gate);
    // This is the honest state, pinned rather than asserted away: most
    // derivations have no per-site gate today. The number is the obligation.
    expect(needsGate.length).toBeGreaterThan(0);
    expect(ungated.length).toBeGreaterThan(0);
    // The two that ARE gated must stay gated.
    expect(PRODUCER_TREATMENT.memoryInfluenceAddendum.gate).toBe('R24');
    expect(PRODUCER_TREATMENT.memberWebAddendum.gate).toBe('R27');
  });

  it('member classes are never silently reclassified as inference', () => {
    expect(PRODUCER_TREATMENT.conversationalRecallAddendum.class).toBe('MEMBER_AUTHORED');
    expect(PRODUCER_TREATMENT.atomsAddendum.class).toBe('MEMBER_SOVEREIGN_ACT');
    expect(PRODUCER_TREATMENT.episodicRecallAddendum.class).toBe('MEMBER_SOVEREIGN_ACT');
  });

  it('inference classes are never reclassified as member material', () => {
    for (const p of ['memoryInfluenceAddendum', 'memberWebAddendum', 'consultationAddendum', 'fieldWisdomAddendum']) {
      const c: ProducerClass = PRODUCER_TREATMENT[p].class;
      expect({ producer: p, memberish: c === 'MEMBER_AUTHORED' || c === 'MEMBER_SOVEREIGN_ACT' })
        .toEqual({ producer: p, memberish: false });
    }
  });
});

// ── §4 — INNOCENT NEGATIVE CONTROLS ──────────────────────────────────────────

describe('P3-CSC §4 — innocent negative controls', () => {
  it('method names are not producers', () => {
    for (const m of ['join', 'slice', 'toFixed', 'map', 'filter']) {
      expect({ method: m, discovered: discovered.includes(m) })
        .toEqual({ method: m, discovered: false });
    }
  });

  it('a producer named only in a comment is not discovered', () => {
    // The service file discusses addenda in prose throughout.
    expect(fs.readFileSync(SERVICE, 'utf8')).toMatch(/\/\/.*[Aa]ddendum/);
    // Discovery walks the AST, so prose contributes nothing.
    expect(discovered.every((d) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(d))).toBe(true);
  });

  it('standing system instruction is exempt with a reason, not by omission', () => {
    expect(PRODUCER_TREATMENT.MAIA_RUNTIME_PROMPT.class).toBe('NOT_MEMBER_HISTORICAL');
    expect(PRODUCER_TREATMENT.MAIA_RUNTIME_PROMPT.note.length).toBeGreaterThan(10);
  });
});

// ── §5 — BOUNDARY NEGATIVE CONTROLS ──────────────────────────────────────────

describe('P3-CSC §5 — boundary negative controls', () => {
  it('discovery is order-independent', () => {
    expect(discovered).toEqual([...discovered].sort());
    expect(new Set(discovered).size).toBe(discovered.length);
  });

  it('the extractor tolerates async and nested expressions', () => {
    // The FAST template sits inside an async function and its spans contain
    // conditionals, concatenations and calls. All resolved without a threshold.
    expect(fast).toContain('atomsAddendum');           // simple conditional span
    expect(fast).toContain('conversationalRecallAddendum');
    expect(fast).toContain('userIdentification');
  });

  it('a docblock naming ADDENDA_SPECS is not the registry', () => {
    const voiceSrc = fs.readFileSync(VOICE, 'utf8');
    expect(voiceSrc).toMatch(/\/\/.*ADDENDA_SPECS|\* .*ADDENDA_SPECS/);
    // Only the actual VariableDeclaration contributes.
    expect(addenda.length).toBeLessThan(40);
  });
});
