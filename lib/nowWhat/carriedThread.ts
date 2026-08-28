/**
 * Now What? V1 — "where you left things": THE RETURN ANCHOR.
 *
 * The Home's first viewport shows the member ONE act of their own and asks
 * what happened since. This module is the entire selection rule, extracted so
 * it can be stated exactly, tested without a database, and read by anyone
 * asking "why is THIS on my screen?"
 *
 * ── THE RULE ─────────────────────────────────────────────────────────────
 *
 *   RETURN ANCHOR
 *     the member's most recent KEEPING GESTURE across the eligible
 *     categories — one act, not two. It is labelled by what it actually is:
 *
 *       a question / decision / reflection  →  YOU WERE CARRYING
 *       a move they chose to live           →  YOU CHOSE
 *
 *     "What happened since?" refers to that same visible act, and the lived
 *     return is sent against that same act. What she sees and what the room
 *     is told are the same thing by construction, not by two rules agreeing.
 *
 *   A SECOND ACT
 *     is shown beside it ONLY when the record already establishes their
 *     relationship — that is, when one act's `respondsToThreadId` points at
 *     the other. Nothing else qualifies.
 *
 * ── WHY IT IS ONE ACT AND NOT TWO (the defect this closes) ───────────────
 *
 * An earlier cut of this module chose the carried thread and the chosen move
 * INDEPENDENTLY, and the Home stacked them:
 *
 *     YOU WERE CARRYING   "Should I leave my role?"        (kept Tuesday)
 *     YOU CHOSE           "Call my sister this weekend."   (kept Thursday)
 *     What happened since?
 *
 * Both lines are true. Their juxtaposition is not: it implies the choice
 * answers the question when the record contains no such relationship. That is
 * the relational form of the "bracing for" failure — the interface authoring
 * a connection the member never made, and it is more dangerous than the
 * sentence-level version because each half survives inspection on its own.
 *
 * **Provenance of the parts does not guarantee provenance of the composition.**
 *
 * So relationship is never inferred from recency, category, textual
 * similarity, sequence, or MAIA's judgement. It is read from the record or it
 * is not shown.
 *
 * ── WHY THIS SELECTION AND NOT ANOTHER ───────────────────────────────────
 *
 * The only input is the timestamp of a gesture the member made themselves
 * (`member_decision_at`, falling back to `created_at` only for rows that
 * predate decision timestamping). It is deterministic and explainable in one
 * sentence: *the last thing you kept.* It is provenance-preserving: the
 * selected row carries its own authorship and keep-time, so the screen can
 * attribute rather than assert.
 *
 * What it deliberately is NOT:
 *   - not a ranking, score, or relevance model — recency of the member's act
 *     is not a claim about importance, and the surface must never present it
 *     as one ("You kept this on Tuesday", never "This matters most")
 *   - not inference over content — nothing reads what the thread SAYS
 *   - not derived from calendar, telemetry, session counts, visit frequency,
 *     or any activity signal
 *   - not MAIA's opinion of what the member should work on next
 *
 * Continuity may be system-carried; salience stays member-grounded. Carrying
 * forward the last act the member made is continuity. Deciding which of their
 * acts matters most today would be salience, and is refused — as is deciding
 * which of their acts belong together.
 */

/**
 * The shape both the Home read and this rule share — deliberately the fields
 * the rule is allowed to see. It cannot read content, and it cannot read
 * anything about the member's activity, because neither is in scope here.
 */
export interface SelectableThread {
  id: string;
  title: string;
  /** ISO timestamp of the member's own keeping gesture. */
  keptAt: string;
  /**
   * The prior act this one was explicitly written in answer to, when the
   * member returned through the lived doorway. The ONLY basis on which two
   * acts may be shown as related.
   */
  respondsToThreadId?: string | null;
}

/**
 * How the anchor is labelled — and it is labelled by what the act IS, never
 * by what slot it landed in.
 */
export type AnchorKind = 'carried' | 'chose';

export interface ReturnAnchor<T extends SelectableThread> {
  act: T;
  kind: AnchorKind;
}

/**
 * The categorized arrays returned by `GET /api/now-what/home`. Each is already
 * ordered by the member's keeping gesture, newest keep first (E-2′), so the
 * rule below only ever compares heads.
 */
export interface CarriedSource<T extends SelectableThread> {
  questions?: T[];
  decisions?: T[];
  reflections?: T[];
  commitments?: T[];
}

const keptTime = (t: SelectableThread | null | undefined): number => {
  if (!t?.keptAt) return Number.NEGATIVE_INFINITY;
  const ms = new Date(t.keptAt).getTime();
  return Number.isNaN(ms) ? Number.NEGATIVE_INFINITY : ms;
};

/**
 * THE RETURN ANCHOR — the member's most recent keep, and what it is.
 *
 * Ties go to the chosen move, and that is a stated rule rather than an
 * accident of ordering: a room session that ends with both a reflection and a
 * commitment writes both keeps at the same instant, and of those two acts the
 * move she chose to live is the one a "what happened since?" is actually
 * asking about. It is a fixed tie-break, not a judgement about which of her
 * acts matters more.
 *
 * Returns null when she has kept nothing. The Home then says so plainly
 * rather than inventing a thread.
 */
export function selectReturnAnchor<T extends SelectableThread>(
  source: CarriedSource<T> | null | undefined,
): ReturnAnchor<T> | null {
  if (!source) return null;

  const candidates: { act: T | undefined; kind: AnchorKind }[] = [
    { act: source.commitments?.[0], kind: 'chose' },
    { act: source.questions?.[0], kind: 'carried' },
    { act: source.decisions?.[0], kind: 'carried' },
    { act: source.reflections?.[0], kind: 'carried' },
  ];

  let best: ReturnAnchor<T> | null = null;
  for (const c of candidates) {
    if (!c.act) continue;
    // Strict `>` keeps the first listed candidate on a tie — see the
    // tie-break note above.
    if (!best || keptTime(c.act) > keptTime(best.act)) best = { act: c.act, kind: c.kind };
  }
  return best;
}

/**
 * The act the anchor was EXPLICITLY written in answer to, if any.
 *
 * The only qualifying basis is a recorded `respondsToThreadId` — the relation
 * the member created by returning through the lived doorway and keeping what
 * she said. Adjacency, recency, category, similarity and sequence are all
 * refused, because none of them is a relationship the member made.
 *
 * Returns null when the anchor answers nothing, when the answered act is not
 * among the member's own live threads (released, discarded, or never theirs),
 * or when the id points at the anchor itself. In every one of those cases the
 * honest screen shows one act.
 */
export function selectRecordedRelation<T extends SelectableThread>(
  anchor: ReturnAnchor<T> | null | undefined,
  source: CarriedSource<T> | null | undefined,
): T | null {
  const target = anchor?.act?.respondsToThreadId;
  if (!target || !source) return null;
  if (target === anchor?.act.id) return null;

  for (const group of [source.commitments, source.questions, source.decisions, source.reflections]) {
    const found = group?.find((t) => t.id === target);
    if (found) return found;
  }
  return null;
}

/**
 * What the lived return is answering: the anchor itself, always.
 *
 * This is a one-line function on purpose. The room must be told about the act
 * the member can SEE — if this ever computed its own answer, the screen and
 * the record could disagree about what she came back to, which is the defect
 * this whole module was rewritten to make impossible.
 */
export function selectPriorAct<T extends SelectableThread>(
  source: CarriedSource<T> | null | undefined,
): T | null {
  return selectReturnAnchor(source)?.act ?? null;
}
