/**
 * WS-EDITORIAL-SCOPE-01 · THE EDITING LATITUDE LAW.
 *
 * ⭐⭐ WHY THIS FILE EXISTS, STATED PLAINLY.
 *
 * On 2026-09-19 a writer asked MAIA to clarify one concept in one passage.
 * MAIA returned a `reply_with_proposal` whose `replacementText` removed most of
 * the author's opening — paragraphs, imagery, the elemental relationships — and
 * substituted her own prose. The surface rendered it faithfully, as
 * strike-through over the author's words, and asked him to decide.
 *
 * ⭐ NOTHING WAS APPLIED. The authorization substrate held: `resolveGuard`,
 * exact-text fit, single-use permission — all of it worked, and none of it was
 * reached. ⛔ **The harm was at the OFFER, and the offer had no scope law.**
 *
 *     admitEditorialToolInput   proved the ENVELOPE was well formed
 *     resolveGuard              proved the APPLICATION named exact characters
 *     ⛔ nothing whatsoever      proved the PROPOSAL was an edit rather than
 *                               a replacement of the work
 *
 * `replacementText: string` is a total function from MAIA's judgement to the
 * author's passage. This module is the missing middle term.
 *
 * ── ⭐⭐ THE FOUNDER'S RULING, 2026-09-20, AND ITS TWO SEPARATE CONTROLS ────
 *
 * *"I would like to have a slider of degree of editing from minimal to maximum
 * but not let MAIA decide to remove paragraphs before discussing them."*
 *
 * Two controls, because they are two different questions and collapsing them is
 * what made the surface unreadable:
 *
 *     LATITUDE (1–5)        how much rewording may one proposal carry?
 *                           ⭐ a slider the AUTHOR sets, per exchange
 *
 *     PARAGRAPH REMOVAL     may a proposal delete a whole paragraph at all?
 *                           ⭐ a separate, explicit permission, DEFAULT OFF,
 *                           ⛔ never implied by moving the slider to maximum
 *
 * ⛔⛔ THE SECOND IS NOT A DEGREE OF THE FIRST. Latitude 5 says *recast this
 * passage freely*. It does not say *decide my paragraph should not exist*. A
 * writer who wants wholesale rewriting has not thereby asked for silent
 * deletion, and the system must not read one as the other.
 *
 * ── ⭐ WHAT THIS MODULE IS NOT ────────────────────────────────────────────
 *
 * ⛔ NOT A PROMPT. The tool description does tell MAIA the latitude, as a
 * courtesy so she does not waste a turn — but the law is this function, and it
 * runs on what came back. A model that ignores the instruction is refused, not
 * trusted. *"This needs enforcement in the editing logic — not merely a prompt
 * asking MAIA to preserve your voice."*
 *
 * ⛔ NOT A QUALITY JUDGEMENT. Nothing here scores the proposal, ranks it, or
 * decides whether it is good. It measures ONE thing: how much of the author's
 * text a proposal would remove, against how much the author said it could.
 *
 * ⛔ NOT A REWRITE OF MAIA'S ACT. A refusal here refuses the WHOLE turn. It
 * never downgrades `reply_with_proposal` to `reply_only` and keeps the prose —
 * that would be the system authoring her act, which is the member-side
 * anti-classification law read from the other end.
 */

import { diff, type Op } from '@/lib/manuscript/sections/myers';

/* ══════════════════════════════════════════════════════════════════════════
   A · THE SLIDER
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ FIVE DETENTS, AUTHOR-SET, LOWEST BY DEFAULT.
 *
 * ⛔ Not a free number. A continuous control would invite the surface to invent
 * intermediate meanings and the runtime to interpolate thresholds nobody ruled.
 * Five named positions, each of which a writer can hold in mind.
 */
export const EDITORIAL_LATITUDES = [1, 2, 3, 4, 5] as const;
export type EditorialLatitude = (typeof EDITORIAL_LATITUDES)[number];

/**
 * ⭐⭐ THE DEFAULT IS THE SMALLEST USEFUL EDIT.
 *
 * ⛔ Absence of a choice is never read as permission. A client that forgets to
 * send the field gets latitude 1, which is the posture the writer would have
 * had to ask for under any honest reading of *"leave everything else
 * untouched"*.
 */
export const DEFAULT_EDITORIAL_LATITUDE: EditorialLatitude = 1;

export interface LatitudeBand {
  readonly latitude: EditorialLatitude;
  /** What the writer is choosing, in the writer's language. */
  readonly label: string;
  readonly description: string;
  /** The share of the author's words one proposal may remove. */
  readonly maxRemovedFraction: number;
  /**
   * ⭐⭐ THE LONGEST UNBROKEN STRETCH OF THE AUTHOR'S WORDS A PROPOSAL MAY DROP.
   *
   * ⛔ THIS IS THE RULE THAT CATCHES THE 2026-09-19 CASE IN A LONG PASSAGE. On a
   * 2,000-word locus a fraction bound alone would happily permit deleting an
   * entire 300-word paragraph — 15%, comfortably inside any reasonable share.
   * The two bounds fail differently on purpose, and neither subsumes the other.
   */
  readonly maxContiguousRemovedWords: number;
}

/**
 * ⭐⭐ THE FLOOR THAT IS NOT A LATITUDE, AND WHY IT IS NOT ONE.
 *
 * A handful of words is a small edit on any passage, so a proposal that removes
 * at most this many is lawful at every latitude. Without it the fraction bound
 * punishes SHORT passages: recasting six words of a ten-word line is a textbook
 * small edit and would fail an 8% bound.
 *
 * ⚠️ IT WAS A PER-BAND NUMBER FIRST, AND THAT WAS A DEFECT — caught by F3 on
 * 2026-09-20 before this shipped. Scaling the floor with the latitude made it
 * large enough at "Shape" to swallow a SHORT PASSAGE WHOLE: 30 free words
 * against a 34-word locus is not a floor protecting small edits, it is an
 * unbounded rewrite wearing one. ⭐ A floor protecting small edits has no reason
 * to grow when the writer allows larger ones — the fraction is what grows. One
 * number, one job, and the knob that created the hole is gone.
 */
export const ALWAYS_PERMITTED_REMOVED_WORDS = 8;

/**
 * ⭐ THE NUMBERS ARE DESCRIPTIVE; THE BANDS ARE THE LAW.
 *
 * Founder-rulable in place. What may NOT change without its own act is the
 * shape: five ascending bands, a floor that protects small edits, and two
 * independently-failing bounds at every latitude.
 */
export const LATITUDE_BANDS: Readonly<Record<EditorialLatitude, LatitudeBand>> = {
  1: {
    latitude: 1, label: 'Touch',
    description: 'Punctuation, a word, a small phrase. Your sentences stay yours.',
    maxRemovedFraction: 0.08, maxContiguousRemovedWords: 8,
  },
  2: {
    latitude: 2, label: 'Line',
    description: 'A sentence may be recast. The passage keeps its shape.',
    maxRemovedFraction: 0.18, maxContiguousRemovedWords: 25,
  },
  3: {
    latitude: 3, label: 'Passage',
    description: 'Sentences may be combined, split, or reordered within the passage.',
    maxRemovedFraction: 0.35, maxContiguousRemovedWords: 60,
  },
  4: {
    latitude: 4, label: 'Shape',
    description: 'The passage may be substantially recast, keeping its material.',
    maxRemovedFraction: 0.6, maxContiguousRemovedWords: 120,
  },
  5: {
    latitude: 5, label: 'Open',
    description: 'Rewrite freely. Whole paragraphs still need their own permission.',
    maxRemovedFraction: 1, maxContiguousRemovedWords: Number.MAX_SAFE_INTEGER,
  },
};

/**
 * ⭐⭐ THE SECOND CONTROL, AND ITS DEFAULT IS THE WHOLE POINT.
 *
 * ⛔ `false` means a proposal may not drop one of the author's paragraphs, AT
 * ANY LATITUDE INCLUDING 5. MAIA remains free to SAY the paragraph should go —
 * that is `reply`, that is discussion, and that is precisely what the founder
 * asked for. What she may not do is arrive with it already gone.
 */
export interface EditorialScopeDeclaration {
  readonly latitude: EditorialLatitude;
  /** ⭐ Author-granted, per exchange. ⛔ Never inferred, never defaulted true. */
  readonly mayRemoveParagraphs: boolean;
}

export const DEFAULT_SCOPE_DECLARATION: EditorialScopeDeclaration = {
  latitude: DEFAULT_EDITORIAL_LATITUDE,
  mayRemoveParagraphs: false,
};

export const isEditorialLatitude = (v: unknown): v is EditorialLatitude =>
  (EDITORIAL_LATITUDES as readonly number[]).includes(v as number);

/* ══════════════════════════════════════════════════════════════════════════
   B · THE MEASUREMENT — ONE DIFF, NO SCORING
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⛔ WHITESPACE-DELIMITED TOKENS, WITH PUNCTUATION ATTACHED AND NO NORMALISATION.
 *
 * ⭐ `"cycles."` and `"cycles"` are DIFFERENT words here, and that is deliberate:
 * every normalisation is a decision about which of the author's marks do not
 * matter, and this module has no standing to make one. The effect is to count
 * slightly MORE as changed, which errs toward protecting the author.
 */
export const words = (text: string): string[] => text.match(/\S+/g) ?? [];

/** Author-word index ranges of each paragraph, blank-line delimited. */
export interface ParagraphSpan {
  readonly index: number;
  readonly start: number;
  readonly end: number;
}

export function paragraphSpans(text: string): ParagraphSpan[] {
  const spans: ParagraphSpan[] = [];
  let cursor = 0;
  let index = 0;
  for (const block of text.split(/\n[ \t]*\n/)) {
    const n = words(block).length;
    if (n > 0) {
      spans.push({ index: index++, start: cursor, end: cursor + n });
      cursor += n;
    }
  }
  return spans;
}

export interface DroppedParagraph {
  readonly index: number;
  readonly words: number;
  readonly keptWords: number;
}

export interface ScopeMeasure {
  readonly authorWords: number;
  readonly keptWords: number;
  readonly removedWords: number;
  /** ⛔ `0` when the passage is empty — never `NaN`, which compares false everywhere. */
  readonly removedFraction: number;
  readonly longestContiguousRemoved: number;
  /** ⭐ Paragraphs of the AUTHOR's text a proposal would effectively delete. */
  readonly droppedParagraphs: readonly DroppedParagraph[];
}

/**
 * ⭐ A paragraph counts as DROPPED when almost none of it survives.
 *
 * ⛔ Not "any word removed" — that would call every ordinary edit a deletion and
 * the law would be noise within a day. A paragraph that keeps a quarter of its
 * words has been rewritten; one that keeps less has been removed, whatever the
 * replacement happens to say instead.
 */
export const PARAGRAPH_SURVIVAL_FLOOR = 0.25;
/** ⛔ Below this a "paragraph" is a fragment or a heading; the rule stays off it. */
export const PARAGRAPH_MIN_WORDS = 12;

/**
 * ⭐⭐ THE ONLY MEASUREMENT, AND IT REUSES THE EXISTING DIFF.
 *
 * ⛔ A second diff implementation is a second thing that can drift, and this
 * programme has already paid once for one definition with two divergent
 * implementations. `sections/myers` is exact-equality, no similarity, no
 * scoring — exactly the semantics this law needs.
 */
export function measureProposalScope(
  authorText: string, replacementText: string,
): ScopeMeasure {
  const a = words(authorText);
  const b = words(replacementText);
  const ops: Op[] = diff(a, b);

  const kept = new Uint8Array(a.length);
  for (const op of ops) {
    if (op.type !== 'eq') continue;
    for (let i = op.aStart; i < op.aEnd; i++) kept[i] = 1;
  }

  let keptWords = 0;
  let longest = 0;
  let run = 0;
  for (let i = 0; i < a.length; i++) {
    if (kept[i]) { keptWords++; run = 0; continue; }
    run++;
    if (run > longest) longest = run;
  }
  const removedWords = a.length - keptWords;

  const droppedParagraphs: DroppedParagraph[] = [];
  for (const span of paragraphSpans(authorText)) {
    const size = span.end - span.start;
    if (size < PARAGRAPH_MIN_WORDS) continue;
    let k = 0;
    for (let i = span.start; i < span.end && i < a.length; i++) if (kept[i]) k++;
    if (k / size < PARAGRAPH_SURVIVAL_FLOOR) {
      droppedParagraphs.push({ index: span.index, words: size, keptWords: k });
    }
  }

  return {
    authorWords: a.length,
    keptWords,
    removedWords,
    removedFraction: a.length === 0 ? 0 : removedWords / a.length,
    longestContiguousRemoved: longest,
    droppedParagraphs,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   C · THE VERDICT
   ══════════════════════════════════════════════════════════════════════════ */

export type ScopeRefusal =
  /** More of the author's words than this latitude permits. */
  | 'scope_removes_too_much'
  /** One unbroken stretch longer than this latitude permits. */
  | 'scope_removes_contiguous_passage'
  /** ⭐⭐ Whole paragraphs, without the separate permission. */
  | 'scope_removes_paragraphs';

export type ScopeVerdict =
  | { readonly ok: true; readonly measure: ScopeMeasure }
  | {
      readonly ok: false;
      readonly reason: ScopeRefusal;
      readonly measure: ScopeMeasure;
      /**
       * ⭐ WHAT THE WRITER IS TOLD — counts, never prose to be argued with.
       * ⛔ The refusal is not an occasion to show the rejected wording.
       */
      readonly detail: string;
      /** ⭐ The lowest latitude at which the wording bound would have passed,
       *  or `null` when only the paragraph permission is missing. */
      readonly wouldPassAtLatitude: EditorialLatitude | null;
    };

function withinBand(m: ScopeMeasure, band: LatitudeBand): boolean {
  if (m.removedWords <= ALWAYS_PERMITTED_REMOVED_WORDS) return true;
  return m.removedFraction <= band.maxRemovedFraction
    && m.longestContiguousRemoved <= band.maxContiguousRemovedWords;
}

/**
 * ⭐⭐ THE LAW. Pure, total, and falsifiable without a database.
 *
 * ⛔ ORDER MATTERS AND IS PART OF THE RULING: the paragraph question is decided
 * FIRST and independently. A proposal that deletes a paragraph is refused for
 * deleting a paragraph even when the author has the slider at maximum, and the
 * writer is told that — rather than being told to slide further right, which
 * would not have helped and would have taught them the wrong control.
 */
export function judgeProposalScope(
  authorText: string,
  replacementText: string,
  declared: EditorialScopeDeclaration,
): ScopeVerdict {
  const measure = measureProposalScope(authorText, replacementText);

  if (!declared.mayRemoveParagraphs && measure.droppedParagraphs.length > 0) {
    const n = measure.droppedParagraphs.length;
    return {
      ok: false, reason: 'scope_removes_paragraphs', measure,
      detail: `This would remove ${n} whole paragraph${n === 1 ? '' : 's'} of your text. `
        + 'MAIA can say why a paragraph should go, and you can decide — but she cannot '
        + 'arrive with it already gone. Turn on paragraph removal if you want her to propose it.',
      wouldPassAtLatitude: null,
    };
  }

  const band = LATITUDE_BANDS[declared.latitude];
  if (withinBand(measure, band)) return { ok: true, measure };

  const wouldPassAtLatitude =
    EDITORIAL_LATITUDES.find((l) => withinBand(measure, LATITUDE_BANDS[l])) ?? null;
  const higher = wouldPassAtLatitude !== null && wouldPassAtLatitude > declared.latitude
    ? ` At "${LATITUDE_BANDS[wouldPassAtLatitude].label}" it would be allowed.` : '';

  /* ⭐ The two bounds fail differently, and the writer is told WHICH — otherwise
     the slider is a mystery dial. */
  if (measure.longestContiguousRemoved > band.maxContiguousRemovedWords) {
    return {
      ok: false, reason: 'scope_removes_contiguous_passage', measure,
      detail: `This would cut ${measure.longestContiguousRemoved} of your words in one unbroken `
        + `stretch. "${band.label}" allows up to ${band.maxContiguousRemovedWords}.${higher}`,
      wouldPassAtLatitude,
    };
  }
  return {
    ok: false, reason: 'scope_removes_too_much', measure,
    detail: `This would remove ${measure.removedWords} of your ${measure.authorWords} words `
      + `(${Math.round(measure.removedFraction * 100)}%). "${band.label}" allows up to `
      + `${Math.round(band.maxRemovedFraction * 100)}%.${higher}`,
    wouldPassAtLatitude,
  };
}

/**
 * ⭐ WHAT MAIA IS TOLD, so a refusal is the exception rather than the routine.
 *
 * ⛔ COURTESY, NOT ENFORCEMENT. Every sentence here is also enforced above, and
 * nothing is enforced here that is not enforced above. If this string were
 * deleted the law would be unchanged; that is the test of whether a prompt is
 * carrying weight it should not.
 */
export function latitudeInstruction(declared: EditorialScopeDeclaration): string {
  const band = LATITUDE_BANDS[declared.latitude];
  return [
    `EDITING LATITUDE — the writer has set this exchange to "${band.label}": ${band.description}`,
    `A proposal may remove at most ${ALWAYS_PERMITTED_REMOVED_WORDS} of the writer's words `
      + `outright, and beyond that no more than ${Math.round(band.maxRemovedFraction * 100)}% of `
      + `them, with no single unbroken cut longer than ${band.maxContiguousRemovedWords} words.`,
    declared.mayRemoveParagraphs
      ? 'The writer has allowed proposals that remove a whole paragraph.'
      : 'The writer has NOT allowed removing whole paragraphs. If you believe one should go, '
        + 'say so in your reply and let them decide. If they explicitly ask you to remove one, '
        + 'tell them paragraph removal is off and that they can turn on paragraph removal if '
        + 'they want you to propose wording with it removed. Do not return wording with it removed.',
    'Work with the writer\'s existing words, rhythm and imagery. Propose the smallest change that '
      + 'answers what they asked. If what you want to do exceeds this latitude, say that in your '
      + 'reply instead of proposing it — a proposal beyond the latitude is refused and the writer '
      + 'sees nothing.',
    /* ⭐ The vocabulary clause, added when the voice measurement landed. ⛔ Still
       courtesy: `measureVoiceIntrusion` counts what comes back either way. */
    'Write in THEIR vocabulary. Every word you introduce that they have not used nearby is '
      + 'counted and shown to them. That is not a prohibition — a good editor hands a writer a '
      + 'word they did not have — but a passage rebuilt in your vocabulary is not their book, '
      + 'and they are the one who has to stand behind it.',
  ].join('\n');
}
