/**
 * WS2-04A — DRAFT CLASSIFICATION. The single definition, READ ONLY.
 *
 * Two instruments ask this question — the per-manuscript proof and the
 * population census — and if each carried its own copy of the rule they could
 * drift apart silently, one calling a book legacy while the other called it
 * edited. So the rule lives here once and both import it.
 *
 * THE RULE. Only WHOLE-DRAFT byte equality against a named composer may place
 * a draft in a composer class:
 *
 *     current composer, exact   → PRISTINE
 *     legacy composer, exact    → LEGACY_COMPOSER_VARIANT
 *     no source sections        → NO_SOURCE
 *     anything else             → EDITED
 *     the two passes disagree   → WITHHELD
 *
 * The per-line pass explains WHY a draft matches; it never elects a class. A
 * draft with some headings in the legacy `# ` form and some in the current
 * plain form is a partially edited draft — no composer ever emitted that
 * hybrid — and admitting it would discard a member's edits as scaffolding.
 *
 * WITHHELD exists because a decisive match the line pass cannot fully explain
 * is a fault in this instrument, not a finding about someone's book. It must
 * not resolve into either class by default.
 *
 * Structural facts only. No member prose is produced or printed.
 */

import { diff, type Op } from './myers';
import { composeCurrent, composeLegacyHashHeadings, type SourceSection } from './composers';

/**
 * The current composer, instrumented to report — from inside the composition,
 * not from inspecting the output — which line index carries each section's
 * heading and where each section boundary falls.
 */
export function composeCurrentWithMarks(sections: SourceSection[]) {
  const lines: string[] = [];
  /** line index of section i's heading line, or null when the section has none */
  const headingLineOf: (number | null)[] = [];
  /** line index where section i begins */
  const boundaryLineOf: number[] = [];

  for (const s of sections) {
    boundaryLineOf.push(lines.length);
    const h = s.heading?.trim();
    if (h) {
      headingLineOf.push(lines.length);
      lines.push(h);
      lines.push('');
    } else {
      headingLineOf.push(null);
    }
    lines.push(...s.body.split('\n'));
    lines.push('');
  }
  return { lines, headingLineOf, boundaryLineOf };
}

export interface LineProof {
  headedCount: number;
  exactLegacy: number;
  otherHeadingDiff: number;
  bodyDiff: number;
  resolved: number;
  boundaries: number;
  unresolved: number[];
}

/**
 * The per-line pass, over an already-composed pair of texts. Extracted so it
 * can be exercised on synthetic manuscripts without a database — an
 * instrument that has never been run against a known answer is not evidence.
 */
export function proveLines(
  aLines: string[],
  bLines: string[],
  headingLineOf: (number | null)[],
  boundaryLineOf: number[],
): LineProof {
  const headedCount = headingLineOf.filter((l) => l !== null).length;
  const headingLineSet = new Map<number, number>(); // source line -> section index
  headingLineOf.forEach((l, i) => { if (l !== null) headingLineSet.set(l, i); });

  /* ── Per-line proof against the current composer. Every difference must be
     accounted for by the known historical transform, or it is a real edit. */
  const ops = diff(aLines, bLines);

  let exactLegacy = 0;          // heading line, current === "# " + source
  let otherHeadingDiff = 0;     // heading line, but NOT the legacy form
  let bodyDiff = 0;             // any changed line that is not a heading line
  const changedHeadingSections = new Set<number>();

  /* Walk the ops. A heading rewritten in place shows as a deletion run
     immediately followed by an insertion run; the k-th deleted line and the
     k-th inserted line are the same line before and after. Any surplus on
     either side is text that appeared or vanished outright. */
  for (let i = 0; i < ops.length; i++) {
    const o = ops[i];
    if (o.type === 'eq') continue;

    const del = o.type === 'del' ? o : null;
    const next = ops[i + 1];
    const ins = o.type === 'ins'
      ? o
      : (next && next.type === 'ins' ? next : null);
    if (del && ins) i++; // the paired insertion is consumed here

    const dCount = del ? del.aEnd - del.aStart : 0;
    const iCount = ins ? ins.bEnd - ins.bStart : 0;
    const paired = Math.min(dCount, iCount);

    for (let k = 0; k < paired; k++) {
      const aLine = del!.aStart + k;
      const bLine = ins!.bStart + k;
      const sectionIdx = headingLineSet.get(aLine);
      if (sectionIdx === undefined) { bodyDiff++; continue; }
      changedHeadingSections.add(sectionIdx);
      if (bLines[bLine] === `# ${aLines[aLine]}`) exactLegacy++;
      else otherHeadingDiff++;
    }
    for (let k = paired; k < dCount; k++) {
      const aLine = del!.aStart + k;
      if (headingLineSet.has(aLine)) otherHeadingDiff++; else bodyDiff++;
    }
    bodyDiff += Math.max(0, iCount - paired);
  }

  /* ── Boundary resolution. A boundary is uniquely located when its source
     line sits in an unchanged run, or is a heading line rewritten 1:1 between
     two unchanged runs — in both cases exactly one position corresponds. */
  const eqRuns = ops.filter((o): o is Extract<Op, { type: 'eq' }> => o.type === 'eq');
  const inEq = (aLine: number) => eqRuns.some((r) => aLine >= r.aStart && aLine < r.aEnd);
  let resolved = 0;
  const unresolved: number[] = [];
  boundaryLineOf.forEach((aLine, i) => {
    const headingLine = headingLineOf[i];
    if (inEq(aLine)) { resolved++; return; }
    /* the section's first line changed — resolved iff it is its own heading
       line and that heading is accounted for by the legacy transform */
    if (headingLine === aLine && changedHeadingSections.has(i) && otherHeadingDiff === 0) { resolved++; return; }
    unresolved.push(i);
  });

  return { headedCount, exactLegacy, otherHeadingDiff, bodyDiff, resolved, boundaries: boundaryLineOf.length, unresolved };
}

export type Classification =
  | 'PRISTINE'
  | 'LEGACY_COMPOSER_VARIANT'
  | 'NO_SOURCE'
  | 'EDITED'
  | 'WITHHELD';

export interface DraftVerdict {
  classification: Classification;
  /** whole-draft byte equality, per named composer */
  wholeText: { current: boolean; legacy: boolean };
  proof: LineProof;
  /** true when the line pass corroborates a decisive legacy match */
  perLineAgrees: boolean;
}

/**
 * Classify one draft against its source sections. The only place the rule is
 * written down.
 */
export function classifyDraft(sections: SourceSection[], draft: string): DraftVerdict {
  const { lines, headingLineOf, boundaryLineOf } = composeCurrentWithMarks(sections);
  const proof = proveLines(lines, draft.split('\n'), headingLineOf, boundaryLineOf);

  const wholeText = {
    current: composeCurrent(sections) === draft,
    legacy: composeLegacyHashHeadings(sections) === draft,
  };

  /* Independent corroboration — a check that the two passes tell the same
     story, never evidence for the class itself. */
  const perLineAgrees =
    proof.exactLegacy === proof.headedCount &&
    proof.otherHeadingDiff === 0 &&
    proof.bodyDiff === 0 &&
    proof.resolved === proof.boundaries;

  let classification: Classification;
  if (wholeText.current) classification = 'PRISTINE';
  else if (wholeText.legacy) classification = perLineAgrees ? 'LEGACY_COMPOSER_VARIANT' : 'WITHHELD';
  else if (sections.length === 0) classification = 'NO_SOURCE';
  else classification = 'EDITED';

  return { classification, wholeText, proof, perLineAgrees };
}
