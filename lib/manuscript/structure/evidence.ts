/**
 * WS2-05B step 1 — StructureEvidence. Mechanics only.
 *
 * THIS TIER OBSERVES. IT DOES NOT INTERPRET. There are no divisions here, no
 * names, no hierarchy and no confidence. `86bab2094` is the cautionary
 * predecessor: it produced proposals, missed every element of Elemental
 * Alchemy, and offered `Healing 75–84` instead — because a mechanical layer
 * asked to name divisions will name the wrong ones with a straight face.
 *
 * EVERY OBSERVATION DECLARES ITS OWN LIMITS. `doesNotEstablish` is a non-empty
 * tuple of closed values, so a new detector CANNOT COMPILE while claiming
 * "I observed X" without saying what X does not authorise a later reader to
 * conclude. That is the mechanism which stops evidence being upgraded into
 * ontology by someone who sees only the first three lines of a record.
 *
 * NO MEMBER PROSE. Observations carry headings, positions, ids and counts.
 * Bodies are never read here; that is the interpreter's tier, and it records
 * what it read.
 */

import { DEFAULT_READ_SCOPE as SCOPE } from './readScope';

export type EvidenceNonConclusion =
  | 'start-boundary'
  | 'end-boundary'
  | 'structural-kind'
  | 'hierarchy'
  | 'structural-vs-thematic'
  | 'whole-work-grammar';

export type EvidenceMethod =
  | 'label-match'
  | 'numbering-scan'
  | 'lexical-cluster'
  | 'title-template'
  | 'adjacency-run'
  | 'vocabulary-shift';

interface Base {
  id: string;
  method: EvidenceMethod;
  /** Stable draft-section ids. Positions travel alongside for reading. */
  sectionIds: readonly string[];
  positions: readonly number[];
  /** Non-empty by construction. */
  doesNotEstablish: readonly [EvidenceNonConclusion, ...EvidenceNonConclusion[]];
  /** For a human. The typed list above is what code reasons on. */
  note: string;
}

export interface StructuralLabelObservation extends Base {
  kind: 'structural-label';
  labels: readonly string[];
}
export interface NumberingPatternObservation extends Base {
  kind: 'numbering-pattern';
  word: string;
  seen: readonly number[];
  missing: readonly number[];
}
export interface LexicalDensityObservation extends Base {
  kind: 'lexical-density';
  token: string;
  core: { from: number; to: number };
  /** Occurrences inside the core, over the core's length. */
  density: number;
  outside: readonly number[];
}
export interface RepeatedFormObservation extends Base {
  kind: 'repeated-form';
  template: string;
}
export interface SuspectedScaffoldObservation extends Base {
  kind: 'suspected-scaffold';
  from: number;
  to: number;
}
export interface TransitionObservation extends Base {
  kind: 'transition';
  at: number;
  /** Shared vocabulary across the boundary, 0–1. Lower is a sharper shift. */
  overlap: number;
}

export type EvidenceObservation =
  | StructuralLabelObservation
  | NumberingPatternObservation
  | LexicalDensityObservation
  | RepeatedFormObservation
  | SuspectedScaffoldObservation
  | TransitionObservation;

/**
 * What was actually read, and under what policy.
 *
 * THE LIMITS ARE PART OF THE RECORD. "MAIA read six sections" means one thing
 * under a six-section ceiling and something else entirely under an unlimited
 * reader, and a member asking later what this reading rests on deserves the
 * second half of that sentence. Reconstructing the policy from whatever the code
 * says today would describe the CURRENT policy, which is exactly the one you
 * cannot trust it to have been.
 *
 * `truncated` is typed as the literal `false`. Truncation is not a setting this
 * system has: a partial section read as a whole one lets a surface say "MAIA
 * read section X" when she read an arbitrary prefix of X - and for a structural
 * boundary the END of a section is often the thing that decides it. Full section
 * or no section. The field exists so the row states the law rather than leaving
 * it to be assumed.
 */
export interface EvidenceCoverage {
  headings: 'all';
  bodies: {
    /** `requested-full` — whole sections, asked for by name. Never a prefix. */
    mode: 'none' | 'selected' | 'all' | 'requested-full';
    sectionIds: readonly string[];
    /** Characters of manuscript prose that left the machine. */
    totalChars: number;
    truncated: false;
    /** The ceilings in force when this reading was made. */
    sectionLimit: number;
    charLimit: number;
  };
  passes: 1 | 2 | 3;
}

export interface StructureEvidence {
  manuscriptId: string;
  /** The ordered stable ids these observations describe. */
  sectionTopologyHash: string;
  observations: EvidenceObservation[];
  coverage: EvidenceCoverage;
}

export interface HeadedSection {
  id: string;
  position: number;
  heading: string | null;
}

/* ── patterns ───────────────────────────────────────────────────────────── */

const CHAPTER_RE = /^CHAPTER\s+(\d+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[IVXLC]+)\b/i;
const PART_RE = /^PART\s+(\d+|ONE|TWO|THREE|FOUR|FIVE|[IVXLC]+)\b/i;
const MATTER_RE = /^(PREFACE|FOREWORD|INTRODUCTION|CONCLUSION|EPILOGUE|AFTERWORD|APPENDIX|BACK MATTER|FRONT MATTER|ACKNOWLEDG(E)?MENTS?|GLOSSARY|INDEX|NOTES|BIBLIOGRAPHY)\b/i;

const WORD_NUMBER: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
  SIX: 6, SEVEN: 7, EIGHT: 8, NINE: 9, TEN: 10,
};

export function isStructuralLabel(heading: string | null): boolean {
  const h = heading?.trim();
  if (!h) return false;
  return CHAPTER_RE.test(h) || PART_RE.test(h) || MATTER_RE.test(h);
}

const STOP = new Set([
  'THE', 'A', 'AN', 'AND', 'OR', 'OF', 'IN', 'ON', 'TO', 'FOR', 'WITH', 'AT',
  'BY', 'FROM', 'AS', 'IS', 'IT', 'ITS', 'THAT', 'THIS', 'YOUR', 'OUR', 'WE',
  'INTO', 'WITHIN', 'BEING', 'PART', 'CHAPTER',
]);

const wordsOf = (h: string): string[] =>
  h.toUpperCase().split(/[^A-Z]+/).filter((w) => w.length >= 3 && !STOP.has(w));

/* ── detectors ──────────────────────────────────────────────────────────── */

let seq = 0;
const nextId = (m: EvidenceMethod) => `${m}-${++seq}`;
/** Test seam: makes ids deterministic across runs. */
export function resetEvidenceIds(): void { seq = 0; }

/**
 * Headings that name a structural position.
 *
 * Establishes that the WORD is there. Establishes nothing about whether a
 * division begins at that section, what kind it is, or how the Work is
 * organised — a contents list says CHAPTER 6 too.
 */
export function observeStructuralLabels(sections: readonly HeadedSection[]): EvidenceObservation[] {
  const hits = sections.filter((s) => isStructuralLabel(s.heading));
  if (hits.length === 0) return [];
  return [{
    kind: 'structural-label',
    id: nextId('label-match'),
    method: 'label-match',
    sectionIds: hits.map((s) => s.id),
    positions: hits.map((s) => s.position),
    labels: hits.map((s) => s.heading!.trim()),
    doesNotEstablish: ['start-boundary', 'structural-kind', 'whole-work-grammar'],
    note: `${hits.length} headings use structural label language.`,
  }];
}

/**
 * A numbered run, and the numbers missing from it.
 *
 * The gaps matter as much as the hits: a sequence missing CHAPTER 3 is telling
 * you either that a chapter is unlabelled or that the segmenter took a
 * different line as the heading there.
 */
export function observeNumbering(sections: readonly HeadedSection[]): EvidenceObservation[] {
  const out: EvidenceObservation[] = [];
  for (const [word, re] of [['CHAPTER', CHAPTER_RE], ['PART', PART_RE]] as const) {
    const hits: { n: number; s: HeadedSection }[] = [];
    for (const s of sections) {
      const m = s.heading?.trim().match(re);
      if (!m) continue;
      const raw = m[1].toUpperCase();
      const n = /^\d+$/.test(raw) ? Number(raw) : WORD_NUMBER[raw];
      if (n) hits.push({ n, s });
    }
    if (hits.length < 2) continue;
    const seen = hits.map((h) => h.n).sort((a, b) => a - b);
    const missing: number[] = [];
    for (let n = seen[0]; n < seen[seen.length - 1]; n++) if (!seen.includes(n)) missing.push(n);
    out.push({
      kind: 'numbering-pattern',
      id: nextId('numbering-scan'),
      method: 'numbering-scan',
      sectionIds: hits.map((h) => h.s.id),
      positions: hits.map((h) => h.s.position),
      word, seen, missing,
      doesNotEstablish: ['start-boundary', 'hierarchy', 'whole-work-grammar'],
      note: `${word} numbering seen at ${seen.join(', ')}`
        + (missing.length ? `; missing ${missing.join(', ')}` : '')
        + '. A contents list carries the same words.',
    });
  }
  return out;
}

/**
 * A word that clusters in one stretch of the Work.
 *
 * Reports the DENSEST window holding at least half the occurrences, and every
 * occurrence outside it. `86bab2094` required a word to appear nowhere else and
 * so found nothing on a book that revisits its themes; density plus an explicit
 * outside-list is the honest form of the same signal.
 *
 * It cannot say where a division starts: Elemental Alchemy's Fire chapter opens
 * at THE SACRED FLAME, which contains no element word at all.
 */
export function observeLexicalDensity(
  sections: readonly HeadedSection[],
  minOccurrences = 3,
): EvidenceObservation[] {
  const at = new Map<string, HeadedSection[]>();
  for (const s of sections) {
    if (!s.heading) continue;
    for (const w of new Set(wordsOf(s.heading))) {
      const list = at.get(w);
      if (list) list.push(s);
      else at.set(w, [s]);
    }
  }

  const out: EvidenceObservation[] = [];
  for (const [token, hits] of at) {
    if (hits.length < minOccurrences) continue;
    const ps = hits.map((h) => h.position);
    /* On equal density prefer the LARGER window. Without that tie-break,
       occurrences at 0,1,2 report a core of 0–1: both windows are density 1.0
       and the first one found wins, which under-reports every evenly spaced
       cluster in the book. */
    let best = { i: 0, j: 0, density: 0, inside: 0 };
    for (let i = 0; i < ps.length; i++) {
      for (let j = i; j < ps.length; j++) {
        const inside = j - i + 1;
        if (inside < hits.length / 2) continue;
        const density = inside / (ps[j] - ps[i] + 1);
        if (density > best.density || (density === best.density && inside > best.inside)) {
          best = { i, j, density, inside };
        }
      }
    }
    const core = { from: ps[best.i], to: ps[best.j] };
    if (best.density < 0.25) continue;
    out.push({
      kind: 'lexical-density',
      id: nextId('lexical-cluster'),
      method: 'lexical-cluster',
      sectionIds: hits.map((h) => h.id),
      positions: ps,
      token, core, density: Number(best.density.toFixed(3)),
      outside: ps.filter((p) => p < core.from || p > core.to),
      doesNotEstablish: ['start-boundary', 'end-boundary', 'structural-vs-thematic'],
      note: `"${token}" appears in ${hits.length} headings, densest across ${core.from}–${core.to}.`,
    });
  }
  return out.sort((a, b) => a.positions[0] - b.positions[0]);
}

/**
 * A heading template used more than twice — "THE DARK SIDE OF ___".
 *
 * Recurrence of a form is often how a Work marks parallel divisions. It says
 * nothing about which of them is a division.
 */
export function observeRepeatedForms(
  sections: readonly HeadedSection[],
  minUses = 3,
): EvidenceObservation[] {
  const byTemplate = new Map<string, HeadedSection[]>();
  for (const s of sections) {
    const h = s.heading?.trim();
    if (!h || h.length < 8) continue;
    const words = h.toUpperCase().split(/\s+/);
    if (words.length < 3) continue;
    /* Drop the last word: the template is what the headings share. */
    const template = `${words.slice(0, -1).join(' ')} ___`;
    const list = byTemplate.get(template);
    if (list) list.push(s);
    else byTemplate.set(template, [s]);
  }
  const out: EvidenceObservation[] = [];
  for (const [template, hits] of byTemplate) {
    if (hits.length < minUses) continue;
    out.push({
      kind: 'repeated-form',
      id: nextId('title-template'),
      method: 'title-template',
      sectionIds: hits.map((h) => h.id),
      positions: hits.map((h) => h.position),
      template,
      doesNotEstablish: ['start-boundary', 'structural-kind', 'structural-vs-thematic'],
      note: `${hits.length} headings share the form "${template}".`,
    });
  }
  return out;
}

/**
 * Three or more adjacent sections whose headings are ALL structural labels.
 *
 * Parts cannot sit next to one another holding nothing. This shape is almost
 * always a contents list the import cut into sections — but WHAT it is remains
 * an authorial judgement, so the observation says "suspected" and stops.
 */
export function observeSuspectedScaffold(
  sections: readonly HeadedSection[],
  minRun = 3,
): EvidenceObservation[] {
  const out: EvidenceObservation[] = [];
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  let start: number | null = null;

  const close = (endIdx: number) => {
    if (start === null) return;
    const run = ordered.slice(start, endIdx + 1);
    if (run.length >= minRun) {
      out.push({
        kind: 'suspected-scaffold',
        id: nextId('adjacency-run'),
        method: 'adjacency-run',
        sectionIds: run.map((s) => s.id),
        positions: run.map((s) => s.position),
        from: run[0].position,
        to: run[run.length - 1].position,
        doesNotEstablish: ['structural-kind', 'hierarchy', 'whole-work-grammar'],
        note: `${run.length} adjacent sections are all structural labels, `
          + 'which cannot be the thing they name. What it is remains yours to say.',
      });
    }
    start = null;
  };

  for (let i = 0; i < ordered.length; i++) {
    if (isStructuralLabel(ordered[i].heading)) { if (start === null) start = i; }
    else close(i - 1);
  }
  close(ordered.length - 1);
  return out;
}

/**
 * A sharp change of vocabulary between adjacent windows.
 *
 * NOT PART OF PASS 1, AND THE MEASUREMENT IS WHY. Run over headings alone on
 * Elemental Alchemy it fired at 103 of 174 boundaries, nearly all with overlap
 * exactly 0. Headings are short and varied, so almost any two windows of them
 * share no words — the signal does not discriminate, and 103 observations that
 * all say "sharp shift" say nothing at all while looking like a great deal.
 *
 * The signal is real; the input is wrong. A transition is a change of subject,
 * voice, time or place, and those live in the prose. So this belongs to PASS 2,
 * where the interpreter has read bodies and records that it did — not to a tier
 * that reads headings and must be honest about what headings can carry.
 *
 * Kept, unwired, for that pass. `gatherEvidence` does not call it.
 */
export function observeTransitions(
  sections: readonly HeadedSection[],
  window = 5,
  maxOverlap = 0.06,
): EvidenceObservation[] {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const vocab = ordered.map((s) => new Set(s.heading ? wordsOf(s.heading) : []));
  const out: EvidenceObservation[] = [];

  for (let i = window; i <= ordered.length - window; i++) {
    const before = new Set<string>();
    const after = new Set<string>();
    for (let k = i - window; k < i; k++) vocab[k].forEach((w) => before.add(w));
    for (let k = i; k < i + window; k++) vocab[k].forEach((w) => after.add(w));
    if (before.size < 3 || after.size < 3) continue;
    let shared = 0;
    before.forEach((w) => { if (after.has(w)) shared++; });
    const overlap = shared / new Set([...before, ...after]).size;
    if (overlap > maxOverlap) continue;
    out.push({
      kind: 'transition',
      id: nextId('vocabulary-shift'),
      method: 'vocabulary-shift',
      sectionIds: [ordered[i].id],
      positions: [ordered[i].position],
      at: ordered[i].position,
      overlap: Number(overlap.toFixed(3)),
      doesNotEstablish: ['start-boundary', 'end-boundary', 'structural-kind', 'structural-vs-thematic'],
      note: `Heading vocabulary either side of ${ordered[i].position} shares `
        + `${(overlap * 100).toFixed(0)}% of its words.`,
    });
  }
  return out;
}

/* ── the whole gathering ────────────────────────────────────────────────── */

/** Ordered stable ids, joined. Order is what structure depends on. */
export function sectionTopologyHash(sections: readonly HeadedSection[]): string {
  return [...sections].sort((a, b) => a.position - b.position).map((s) => s.id).join('|');
}

export function gatherEvidence(
  manuscriptId: string,
  sections: readonly HeadedSection[],
): StructureEvidence {
  return {
    manuscriptId,
    sectionTopologyHash: sectionTopologyHash(sections),
    observations: [
      ...observeStructuralLabels(sections),
      ...observeNumbering(sections),
      ...observeSuspectedScaffold(sections),
      ...observeLexicalDensity(sections),
      ...observeRepeatedForms(sections),
      /* observeTransitions is NOT here — see its comment. Headings cannot
         carry the signal, and a detector that fires at 59% of boundaries is
         noise wearing the costume of evidence. */
    ],
    /* This tier reads headings and nothing else, and says so - including the
       ceilings that would have governed prose, so a headings-only reading and a
       body-reading one are legible under the same policy. */
    coverage: {
      headings: 'all',
      bodies: {
        mode: 'none', sectionIds: [], totalChars: 0, truncated: false,
        sectionLimit: SCOPE.maxSections, charLimit: SCOPE.maxChars,
      },
      passes: 1,
    },
  };
}
