/**
 * WS2-05B GROUND MATERIAL — NOT AUTHORIZED, NOT WIRED, NOT SHIPPED.
 *
 * This file is imported by nothing. It exists because it was written ahead of
 * the Jarvis flow that governs WS2-05B, and it is committed only because the
 * repository does not keep untracked files. It changes no behaviour, and it
 * must not be wired to a route or a surface until the flow's MODEL stage has
 * ruled on what a detector is allowed to be.
 *
 * ITS FIRST RUN ON A REAL BOOK FAILED, INSTRUCTIVELY. Against Elemental
 * Alchemy's 174 headings it proposed "Healing 75-84", "Grades 148-150" and
 * "Astrology 158-160", and missed Fire, Water, Earth, Air and Aether entirely.
 * The `detectKeywordRuns` rule below — a word appearing nowhere outside its run
 * — is WRONG for a book that revisits its own themes: FIRE recurs at 132, 151
 * and 167, so its span covers most of the manuscript and the run is discarded.
 *
 * Measured on the same headings, the signal is real but differently shaped:
 *
 *     FIRE    18 headings, densest 57-68 at 83%, recurring at 44 45 48 53 55 132 151 167
 *     WATER    9 headings, densest 70-78 at 56%, recurring at 133 148 152 168
 *     EARTH   14 headings, densest 88-96 at 78%, recurring at 82 83 86 134 149 153 169
 *     AIR     11 headings, densest 97-108 at 58%, recurring at 135 150 154 170
 *     AETHER   7 headings, densest 109-115 at 57%, recurring at 121 155 171
 *
 * So density is the right signal and exclusivity is not — and even density
 * UNDER-REACHES the true boundaries: Fire's dense core is 57-68 while the
 * chapter is 42-69, and it opens at "THE SACRED FLAME", a heading containing no
 * element word at all. No lexical rule can see that start. A reader sees it
 * instantly. That gap is the question the flow has to answer, and it is a
 * question about authority rather than about code.
 *
 * ---
 *
 * WS2-05B — proposing a Work's structure, from evidence a member can check.
 *
 * THE CONSTITUTIONAL LINE. The system may infer likely structure. It may not
 * declare that inference to be the member's book. So nothing here writes; this
 * module returns a PROPOSAL, and a proposal becomes structure only through an
 * explicit member act on a surface that showed them the whole of it first.
 *
 * MECHANICAL, NOT MODEL. Every proposal carries the evidence that produced it,
 * in words the member can verify against their own outline — "11 of these 28
 * headings contain FIRE, and no heading outside this run does". A model's
 * hunch cannot be checked that way, and this programme has refused fuzzy
 * matching, similarity and guessed attribution at every previous step. If MAIA
 * is ever given a say here it must arrive as an ADDITIONAL, separately
 * labelled tier, never merged into these.
 *
 * CONFIDENCE IS REPORTED, NOT AVERAGED. A boundary the heading literally
 * states is not the same kind of fact as a boundary inferred from vocabulary,
 * and collapsing them into one score would hide exactly the distinction the
 * member needs in order to correct the proposal.
 *
 * WHAT IT REFUSES TO PROPOSE. A run of consecutive sections whose headings are
 * ALL structural labels — PART ONE, CHAPTER 4, PREFACE, CONCLUSION — is not a
 * structure; it is almost certainly a table of contents that the import cut
 * into sections. Parts cannot be adjacent and hold nothing. Those regions are
 * returned as UNCERTAIN, for the member to identify, because deciding whether
 * they are front matter, a duplicate outline, or real manuscript is an
 * authorial judgement and not a detection problem.
 */

export interface HeadedSection {
  position: number;
  heading: string | null;
}

export type Confidence =
  /** The heading states it. "CHAPTER 6: WATER" begins a chapter. */
  | 'stated'
  /** Strong convergent evidence, but the system inferred it. */
  | 'strong'
  /** Suggestive only. Shown, never pre-selected. */
  | 'weak';

export interface Proposal {
  /** Taken from the member's own headings. Never invented prose. */
  title: string;
  fromPosition: number;
  toPosition: number;
  confidence: Confidence;
  /** Why, in terms the member can check against their outline. */
  evidence: string;
  detector: string;
}

export interface UncertainRegion {
  fromPosition: number;
  toPosition: number;
  note: string;
}

export interface ProposalSet {
  proposals: Proposal[];
  uncertain: UncertainRegion[];
  /** Positions covered by neither. Left plainly unplaced. */
  unaccounted: number[];
}

/* ── structural labels ──────────────────────────────────────────────────── */

const CHAPTER_RE = /^CHAPTER\s+(\d+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[IVXLC]+)\b[\s:.\-—]*(.*)$/i;
const PART_RE = /^PART\s+(\d+|ONE|TWO|THREE|FOUR|FIVE|[IVXLC]+)\b[\s:.\-—]*(.*)$/i;
const MATTER_RE = /^(PREFACE|FOREWORD|INTRODUCTION|CONCLUSION|EPILOGUE|AFTERWORD|APPENDIX|BACK MATTER|FRONT MATTER|ACKNOWLEDG(E)?MENTS?|GLOSSARY|INDEX|NOTES|BIBLIOGRAPHY)\b/i;

/** Does this heading name a structural position rather than describe content? */
export function isStructuralLabel(heading: string | null): boolean {
  const h = heading?.trim();
  if (!h) return false;
  return CHAPTER_RE.test(h) || PART_RE.test(h) || MATTER_RE.test(h);
}

/**
 * Runs of ≥3 consecutive structural labels.
 *
 * Three PARTs and a BACK MATTER standing next to each other are not three
 * parts and a back matter; nothing can be inside them. The same shape at the
 * end of a manuscript — PREFACE, INTRODUCTION, CHAPTER 1 … CONCLUSION, all
 * adjacent — is a contents list the segmenter turned into sections.
 *
 * Three is the threshold because two adjacent labels are ordinary (a PREFACE
 * followed by an INTRODUCTION), while three or more adjacent with no content
 * between them cannot be the thing they name.
 */
export function tableOfContentsRuns(
  sections: readonly HeadedSection[],
  minRun = 3,
): UncertainRegion[] {
  const out: UncertainRegion[] = [];
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  let start: number | null = null;
  let count = 0;

  const close = (endIdx: number) => {
    if (start !== null && count >= minRun) {
      out.push({
        fromPosition: ordered[start].position,
        toPosition: ordered[endIdx].position,
        note:
          `${count} consecutive sections whose headings are all structural labels. ` +
          `Sections that name parts or chapters cannot sit adjacent with nothing between ` +
          `them — this is most likely an outline or contents list that the import cut ` +
          `into sections. What it actually is, is yours to say.`,
      });
    }
    start = null;
    count = 0;
  };

  for (let i = 0; i < ordered.length; i++) {
    if (isStructuralLabel(ordered[i].heading)) {
      if (start === null) start = i;
      count++;
    } else if (start !== null) {
      close(i - 1);
    }
  }
  if (start !== null) close(ordered.length - 1);
  return out;
}

/* ── detector: explicit chapter numbering ───────────────────────────────── */

/**
 * Headings that literally say "CHAPTER N".
 *
 * The START of each is `stated` — the member wrote the word. The EXTENT is
 * inferred (it runs to the next such heading), and the evidence says so rather
 * than letting the stated start lend its certainty to the guessed end.
 *
 * Chapter headings inside a contents run are skipped: a line saying "CHAPTER 6"
 * in a table of contents states that a chapter six exists, not that one begins
 * at that position.
 */
export function detectNumberedChapters(
  sections: readonly HeadedSection[],
  excluded: readonly UncertainRegion[] = [],
): Proposal[] {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const inExcluded = (p: number) =>
    excluded.some((r) => p >= r.fromPosition && p <= r.toPosition);

  const marks = ordered
    .filter((s) => s.heading && CHAPTER_RE.test(s.heading.trim()) && !inExcluded(s.position));
  if (marks.length === 0) return [];

  const last = ordered[ordered.length - 1].position;
  return marks.map((m, i) => {
    const next = marks[i + 1];
    const to = next ? next.position - 1 : last;
    return {
      title: m.heading!.trim(),
      fromPosition: m.position,
      toPosition: to,
      confidence: 'stated' as const,
      evidence:
        `The heading at ${m.position} states this chapter. Its extent (through ${to}) ` +
        `is inferred from where the next chapter heading begins, and is the part of ` +
        `this proposal to check.`,
      detector: 'numbered-chapters',
    };
  });
}

/* ── detector: a word that owns a stretch of the book ───────────────────── */

const STOP = new Set([
  'THE', 'A', 'AN', 'AND', 'OR', 'OF', 'IN', 'ON', 'TO', 'FOR', 'WITH', 'AT',
  'BY', 'FROM', 'AS', 'IS', 'IT', 'ITS', 'THAT', 'THIS', 'YOUR', 'OUR', 'WE',
  'INTO', 'WITHIN', 'BEING', 'LIFE', 'PART', 'CHAPTER', 'INTRODUCTION',
  'CONCLUSION', 'SUMMARY', 'OVERVIEW',
]);

const words = (h: string): string[] =>
  h.toUpperCase().split(/[^A-Z]+/).filter((w) => w.length >= 3 && !STOP.has(w));

/**
 * A word that appears repeatedly inside one stretch of the manuscript and
 * nowhere outside it.
 *
 * This is what finds Fire, Water, Earth, Air and Aether in a book whose
 * chapter headings never say "chapter". It is inference, not statement — so
 * the strongest it can ever be is `strong`, and the evidence names the counts
 * so the member can check the claim against their own outline in seconds.
 *
 * `minOccurrences` guards against a word appearing twice by chance.
 * `purity` is the share of the word's occurrences that must fall inside the
 * proposed run; below 1.0 the run is `weak`, because the word also lives
 * elsewhere in the book and may be a theme rather than a division.
 */
export function detectKeywordRuns(
  sections: readonly HeadedSection[],
  opts: { minOccurrences?: number; excluded?: readonly UncertainRegion[] } = {},
): Proposal[] {
  const minOcc = opts.minOccurrences ?? 3;
  const excluded = opts.excluded ?? [];
  const inExcluded = (p: number) =>
    excluded.some((r) => p >= r.fromPosition && p <= r.toPosition);

  const ordered = [...sections]
    .sort((a, b) => a.position - b.position)
    .filter((s) => !inExcluded(s.position));

  const where = new Map<string, number[]>();
  for (const s of ordered) {
    if (!s.heading) continue;
    for (const w of new Set(words(s.heading))) {
      const list = where.get(w);
      if (list) list.push(s.position);
      else where.set(w, [s.position]);
    }
  }

  const out: Proposal[] = [];
  for (const [word, positions] of where) {
    if (positions.length < minOcc) continue;
    const lo = positions[0];
    const hi = positions[positions.length - 1];
    const span = hi - lo + 1;
    /* A word scattered across the whole book is a theme, not a division. */
    if (span > ordered.length * 0.6) continue;
    /* Density: the occurrences must cluster, not merely both exist. */
    const density = positions.length / span;
    if (density < 0.25) continue;

    out.push({
      title: word.charAt(0) + word.slice(1).toLowerCase(),
      fromPosition: lo,
      toPosition: hi,
      confidence: 'strong',
      evidence:
        `${positions.length} headings between ${lo} and ${hi} contain "${word}", ` +
        `and none outside that stretch do. The name and the boundaries are inferred ` +
        `from that pattern, not stated by the book.`,
      detector: 'keyword-run',
    });
  }
  return out.sort((a, b) => a.fromPosition - b.fromPosition);
}

/* ── reconciliation ─────────────────────────────────────────────────────── */

const RANK: Record<Confidence, number> = { stated: 3, strong: 2, weak: 1 };

/**
 * Resolve overlapping proposals into a set the member can read as a book.
 *
 * Overlap is resolved by confidence, then by length: a stated chapter beats an
 * inferred keyword run, and among equals the longer stretch wins because the
 * member can always split a division and cannot as easily discover a missing
 * one. Nothing is merged or averaged — a losing proposal is DROPPED, and the
 * region it wanted becomes unaccounted, which is visible.
 */
export function reconcile(
  candidates: readonly Proposal[],
  sections: readonly HeadedSection[],
  uncertain: readonly UncertainRegion[],
): ProposalSet {
  const ranked = [...candidates].sort((a, b) => {
    const r = RANK[b.confidence] - RANK[a.confidence];
    if (r !== 0) return r;
    return (b.toPosition - b.fromPosition) - (a.toPosition - a.fromPosition);
  });

  const taken: Proposal[] = [];
  const overlaps = (p: Proposal) =>
    taken.some((t) => p.fromPosition <= t.toPosition && t.fromPosition <= p.toPosition);
  for (const p of ranked) if (!overlaps(p)) taken.push(p);

  taken.sort((a, b) => a.fromPosition - b.fromPosition);

  const covered = new Set<number>();
  for (const p of taken) {
    for (let i = p.fromPosition; i <= p.toPosition; i++) covered.add(i);
  }
  for (const u of uncertain) {
    for (let i = u.fromPosition; i <= u.toPosition; i++) covered.add(i);
  }

  const unaccounted = [...sections]
    .map((s) => s.position)
    .filter((p) => !covered.has(p))
    .sort((a, b) => a - b);

  return { proposals: taken, uncertain: [...uncertain], unaccounted };
}

/** The whole proposal for a Work. Pure; reads nothing and writes nothing. */
export function proposeStructure(sections: readonly HeadedSection[]): ProposalSet {
  const uncertain = tableOfContentsRuns(sections);
  const candidates = [
    ...detectNumberedChapters(sections, uncertain),
    ...detectKeywordRuns(sections, { excluded: uncertain }),
  ];
  return reconcile(candidates, sections, uncertain);
}
