/**
 * MIPA PHASE 0 — P3e CERTIFICATION: FIELD-LEVEL PROVENANCE IN A COMPOSED LINE
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3e
 *
 * `buildContinuitySummary` composed ONE bullet holding TWO representations of
 * different authorship:
 *
 *     • User: "<verbatim>" → MAIA responded about <extractTopicHint(...)>
 *       └─ member testimony ─┘  └─ machine-derived label ─┘
 *
 * The ratified rule:
 *
 *     Authority follows the smallest representation whose authorship can
 *     actually be certified. The container does not confer authorship on
 *     everything inside it.
 *
 * ── WHAT THIS REPAIR IS AND IS NOT ──────────────────────────────────────────
 *
 * The verbatim member quotation KEEPS its MEMBER_AUTHORED standing and still
 * composes. Excluding it because it once shared a container with a derivation
 * would discard the member's own words — the over-correction, and a
 * constitutional failure in the opposite direction.
 *
 * The derivation is adjudicated through the SHARED `adjudicateDerivation`
 * boundary, not a P3e-specific exception.
 *
 * `extractTopicHint` is deliberately LEFT INTACT. It was never the defect;
 * composing its output without adjudication was. Deleting it would hide the
 * derivation rather than govern it, and would make a future reintroduction look
 * like new work instead of a restoration the gate must refuse.
 */

import * as fs from 'fs';
import * as path from 'path';

import { MemoryBundleService } from '@/lib/memory/MemoryBundle';
import { adjudicateDerivation, adjudicateParticipation } from '@/lib/maia/participationGate';

const REPO = path.resolve(__dirname, '..');
const BUNDLE = path.join(REPO, 'lib/memory/MemoryBundle.ts');
const src = () => fs.readFileSync(BUNDLE, 'utf8');

function methodBody(source: string, name: string): string {
  const decl = new RegExp('\\n  (?:async )?' + name + '\\(');
  const m = decl.exec(source);
  expect({ method: name, found: m !== null }).toEqual({ method: name, found: true });
  const start = m!.index;
  const end = source.indexOf('\n  },', start);
  expect({ method: name, terminated: end > start }).toEqual({ method: name, terminated: true });
  return source.slice(start, end);
}

const MEMBER_WORDS = 'I keep circling the same decision about leaving';
const turns = [
  { role: 'user', content: MEMBER_WORDS, createdAt: '2026-06-01T10:00:00Z' },
  { role: 'assistant', content: 'It sounds like the question underneath is about belonging and safety.', createdAt: '2026-06-01T10:00:05Z' },
];

// ── §0 — META-INVARIANT ──────────────────────────────────────────────────────

describe('P3e §0 — the instrument found its subject', () => {
  it('the target methods exist and are non-empty', () => {
    expect(methodBody(src(), 'buildContinuitySummary').length).toBeGreaterThan(50);
    expect(methodBody(src(), 'adjudicateTopicHint').length).toBeGreaterThan(50);
    expect(methodBody(src(), 'extractTopicHint').length).toBeGreaterThan(20);
  });

  it('the summary under test actually produces output', () => {
    // Zero output would make every "does not contain" assertion vacuous.
    expect(MemoryBundleService.buildContinuitySummary(turns).length).toBeGreaterThan(20);
  });
});

// ── §1 — the derivation does not compose ─────────────────────────────────────

describe('P3e §1 — the machine-derived topic label is excluded', () => {
  it('adjudicateTopicHint excludes, and carries no hint on that arm', () => {
    const v = MemoryBundleService.adjudicateTopicHint('some assistant response text here');
    expect(v.participation).toBe('excluded');
    expect(Object.prototype.hasOwnProperty.call(v, 'hint')).toBe(false);
  });

  it('the composed line contains no derived topic', () => {
    const out = MemoryBundleService.buildContinuitySummary(turns);
    expect(out).not.toMatch(/MAIA responded about/);
    // Compare against the hint for the SAME input the composer sees — the
    // assistant snippet is truncated to 60 chars, and comparing against the
    // hint of the untruncated content let mutation E2 walk through.
    const snippet = turns[1].content.substring(0, 60);
    const hint = MemoryBundleService.extractTopicHint(snippet);
    expect(hint.length).toBeGreaterThan(0);
    expect(out).not.toContain(hint);
  });

  it('extractTopicHint is CALLED from exactly one place — the adjudicator', () => {
    // The structural invariant, and the one that generalizes. Checking output
    // WORDING is wording-dependent: mutations E2 (`[subject: <hint>]`) and E6
    // (`category: <hint.split(" ")[0]}, confidence 0.8`) both restored the same
    // derived object under different phrasing and passed every string check.
    //
    // A call-site closed set does not care how the result is worded. Any
    // invocation outside `adjudicateTopicHint` is a bypass, and a new one fails
    // BECAUSE IT IS NEW.
    const body = src();
    const callSites: number[] = [];
    body.split('\n').forEach((l, i) => {
      if (/^\s*(\/\/|\*)/.test(l)) return;              // prose, not a call
      if (/\bextractTopicHint\s*\(text\s*:/.test(l)) return; // the declaration
      if (/\bextractTopicHint\s*\(/.test(l)) callSites.push(i + 1);
    });
    expect(callSites).toHaveLength(1);

    // ...and that one call site must sit inside the adjudicator.
    const adjudicator = methodBody(body, 'adjudicateTopicHint');
    expect(adjudicator).toMatch(/this\.extractTopicHint\(/);
  });
});

// ── §2 — member testimony survives ───────────────────────────────────────────

describe('P3e §2 — the member’s own words are NOT swept away', () => {
  it('the verbatim quotation still composes', () => {
    const out = MemoryBundleService.buildContinuitySummary(turns);
    expect(out).toContain(MEMBER_WORDS.slice(0, 40));
    expect(out).toMatch(/Prior member words:/);
  });

  it('the container is relabelled, not emptied', () => {
    const out = MemoryBundleService.buildContinuitySummary(turns);
    expect(out).toMatch(/Recent conversation:/);
    expect(out.split('\n').length).toBeGreaterThan(1);
  });
});

// ── §3 — convergence on the shared boundary ──────────────────────────────────

describe('P3e §3 — the shared derivation rule governs, not a local exception', () => {
  it('adjudicateTopicHint routes through adjudicateDerivation', () => {
    const body = methodBody(src(), 'adjudicateTopicHint');
    expect(body).toMatch(/adjudicateDerivation\(\[/);
    expect(body).toMatch(/adjudicateParticipation\(/);
  });

  it('no P3e-specific exception is introduced', () => {
    const body = methodBody(src(), 'adjudicateTopicHint');
    // No bespoke allowlist, threshold or override.
    for (const bespoke of ['allow', 'override', 'threshold', 'bypass', 'force']) {
      expect({ bespoke, present: body.toLowerCase().includes(bespoke) })
        .toEqual({ bespoke, present: false });
    }
  });

  it('the shared rule independently yields exclusion for this input', () => {
    const derived = adjudicateParticipation({
      provenance: { authoredBy: 'maia', authorityClass: 'inference' },
      endorsement: 'none',
    });
    expect(adjudicateDerivation([derived]).admitted).toBe(false);
  });
});

// ── §4 — INNOCENT NEGATIVE CONTROLS ──────────────────────────────────────────

describe('P3e §4 — innocent negative controls', () => {
  it('extractTopicHint still exists and still works', () => {
    // Governed, not deleted. Deleting it would hide the derivation and make a
    // future reintroduction look like new work rather than a restoration.
    expect(MemoryBundleService.extractTopicHint('a response about belonging').length)
      .toBeGreaterThan(0);
  });

  it('prose naming the removed phrase is not the phrase', () => {
    // The module docblock quotes the old composed form to explain the defect.
    expect(src()).toMatch(/MAIA responded about/);
    // But the composed output does not contain it.
    expect(MemoryBundleService.buildContinuitySummary(turns)).not.toMatch(/MAIA responded about/);
  });

  it('an empty turn list yields empty output, not a scaffold', () => {
    expect(MemoryBundleService.buildContinuitySummary([])).toBe('');
  });

  it('an assistant-only pair does not fabricate a member quotation', () => {
    const out = MemoryBundleService.buildContinuitySummary([
      { role: 'assistant', content: 'only MAIA spoke', createdAt: '2026-06-01T10:00:00Z' },
    ]);
    expect(out).toBe('');
  });
});

// ── §5 — BOUNDARY NEGATIVE CONTROLS ──────────────────────────────────────────

describe('P3e §5 — boundary negative controls', () => {
  it('the method extractor is format- and modifier-independent', () => {
    for (const n of ['buildContinuitySummary', 'adjudicateTopicHint', 'extractTopicHint', 'compress']) {
      expect(methodBody(src(), n).length).toBeGreaterThan(10);
    }
  });

  it('the adjudicator import scan is multiline-tolerant', () => {
    // A line-oriented scan reported ZERO gate imports the moment the import was
    // reformatted across lines — a formatting change altering a verdict.
    const decls = [...src().matchAll(/^import\s[\s\S]*?from\s+'[^']+';/gm)]
      .map((m) => m[0]) // RegExpMatchArray, not a string — mapping first is not optional
      .filter((d) => /participationGate/.test(d));
    expect(decls).toHaveLength(1);
    expect(decls[0]).toMatch(/adjudicateDerivation/);
  });

  it('a comment mentioning the derived call is not a composition of it', () => {
    const line = '    // P3e — the derived half: extractTopicHint(assistantSnippet)';
    expect(/^\s*(\/\/|\*)/.test(line)).toBe(true);
  });
});
