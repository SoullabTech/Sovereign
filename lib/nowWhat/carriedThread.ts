/**
 * Now What? V1 — "where you left things".
 *
 * The Home's first viewport shows two things and derives both from the
 * member's own acts: what they were carrying, and what they chose. This module
 * is the entire selection rule, extracted so it can be stated exactly, tested
 * without a database, and read by anyone asking "why is THIS on my screen?"
 *
 * ── THE RULE ─────────────────────────────────────────────────────────────
 *
 *   WHAT YOU WERE CARRYING
 *     the member's most recent KEEPING GESTURE on a thread that is not a
 *     chosen move — questions, decisions and reflections compete only on the
 *     timestamp of the member's own keep.
 *
 *   WHAT YOU CHOSE
 *     the member's most recent KEEPING GESTURE on a thread they tagged as a
 *     move to live (`spiralogic_phase = 'practice'`). Absent when there is
 *     none; nothing is manufactured to fill the slot.
 *
 * ── WHY THIS RULE AND NOT ANOTHER ────────────────────────────────────────
 *
 * It is member-grounded: the only input is the timestamp of a gesture the
 * member made themselves (`member_decision_at`, falling back to `created_at`
 * only for rows that predate decision timestamping). It is deterministic and
 * explainable in one sentence: *the last thing you kept, and the last thing
 * you chose.* It is provenance-preserving: the selected rows carry their own
 * authorship and keep-time, so the screen can attribute rather than assert.
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
 * acts matters most today would be salience, and is refused.
 */

/**
 * The shape both the Home read and this rule share — deliberately the three
 * fields the rule is allowed to see. It cannot read content, and it cannot
 * read anything about the member's activity, because neither is in scope here.
 */
export interface SelectableThread {
  id: string;
  title: string;
  /** ISO timestamp of the member's own keeping gesture. */
  keptAt: string;
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

/** The most recently kept of a set of already-ordered heads. Ties keep the
 *  earlier argument, so the order below is the whole tie-break: it is fixed
 *  and stated, never a quality judgement between kinds. */
function mostRecent<T extends SelectableThread>(...candidates: (T | null | undefined)[]): T | null {
  let best: T | null = null;
  for (const c of candidates) {
    if (!c) continue;
    if (!best || keptTime(c) > keptTime(best)) best = c;
  }
  return best;
}

/**
 * WHAT YOU WERE CARRYING — the member's most recent keep that is not a chosen
 * move. Returns null when they have kept nothing; the Home then says so
 * plainly rather than inventing a thread.
 */
export function selectCarriedThread<T extends SelectableThread>(
  source: CarriedSource<T> | null | undefined,
): T | null {
  if (!source) return null;
  return mostRecent<T>(
    source.questions?.[0],
    source.decisions?.[0],
    source.reflections?.[0],
  );
}

/**
 * WHAT YOU CHOSE — the member's most recent keep on a move they chose to live.
 * Returns null when there is none. An absent choice is a valid, common state.
 */
export function selectChosenMove<T extends SelectableThread>(
  source: CarriedSource<T> | null | undefined,
): T | null {
  if (!source) return null;
  return source.commitments?.[0] ?? null;
}

/**
 * The prior act a lived return is answering.
 *
 * The member is coming back to say what happened. What happened to WHAT? To
 * the move they chose, when they chose one — that is the act a lived report
 * most directly answers. Otherwise to the thread they were carrying. Null when
 * neither exists, in which case the return carries no relation and the kept
 * update stands alone, which is correct rather than a gap to fill.
 */
export function selectPriorAct<T extends SelectableThread>(
  source: CarriedSource<T> | null | undefined,
): T | null {
  return selectChosenMove(source) ?? selectCarriedThread(source);
}
