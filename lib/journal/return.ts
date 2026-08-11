/**
 * Return — how past writing comes back to the member (J-6A).
 *
 * THE DISTINCTION THIS MODULE EXISTS TO HOLD
 *
 * A journal that merely stores is a database. A journal that remembers is
 * something else. But "remembering" is exactly where systems start inventing
 * significance: relevance scores, recommended entries, memories selected for
 * you, patterns you didn't name. Every one of those tells the member what
 * mattered.
 *
 * So this module reports TIME, and nothing else. Every rule here is a calendar
 * fact that the member could verify with a wall calendar and their own entries.
 * Nothing is scored, ranked by content, embedded, or interpreted. The selection
 * carries the reason it was selected, so the question "why did you show me
 * this?" always has a checkable answer rather than a plausible one.
 *
 * THE SEAM (J-6B — designed, deliberately not implemented)
 *
 * Later strategies will want to return writing for reasons other than the
 * calendar. They are named in `ReturnStrategy` so that when one arrives it must
 * declare itself, and so the member-facing account can always say which kind of
 * claim is being made:
 *
 *   temporal          a date brought this back — a fact
 *   member_requested  the member asked to revisit something — their act
 *   thread            language the member repeated — a countable fact
 *   person            writing the member connected to someone — their link
 *   maia_synthesis    MAIA thinks this may be relevant — an interpretation
 *
 * The first four are facts of different kinds. The last is not, and when it
 * exists it must be labelled as MAIA's claim rather than the journal's. Only
 * `temporal` is implemented; `pickReturn` cannot currently produce any other.
 */

export type ReturnStrategy =
  | 'temporal'
  | 'member_requested'
  | 'thread'
  | 'person'
  | 'maia_synthesis';

export interface ReturnableEntry {
  id: string;
  content: string;
  createdAt: string;
}

export interface ReturnedEntry<T extends ReturnableEntry> {
  entry: T;
  /** Which kind of claim this return is making. */
  strategy: ReturnStrategy;
  /** One short factual line, shown with the entry. */
  why: string;
  /**
   * The full inspectable account — the rule, the dates it compared, how many
   * entries qualified, and what was NOT done. This is the answer to "why did
   * you show me this?", and it is written to survive scrutiny.
   */
  account: string;
}

/** Midnight-anchored day number, so comparisons are calendar days not hours. */
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
}

function fullDate(d: Date): string {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function monthName(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long' });
}

const NOT_MEASURED =
  'Nothing about the content was measured — no relevance, theme, sentiment, or importance.';

/**
 * Choose at most one entry to return, by date alone.
 *
 * Rules are tried in order and the first that matches wins. Within a rule, ties
 * break toward the most recent qualifying entry, so the member meets a former
 * self rather than always the same oldest one.
 *
 * Returns null when nothing qualifies — an empty space is correct, and far
 * better than reaching for something to show.
 */
export function pickReturn<T extends ReturnableEntry>(
  entries: T[],
  now: Date = new Date(),
): ReturnedEntry<T> | null {
  const dated = entries
    .map((entry) => ({ entry, at: new Date(entry.createdAt) }))
    .filter((x) => !Number.isNaN(x.at.getTime()))
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  // A journal with almost nothing in it has no past to return.
  if (dated.length < 3) return null;

  const yearsBefore = (at: Date) => now.getFullYear() - at.getFullYear();
  const sameMonthAndDay = (at: Date) =>
    at.getMonth() === now.getMonth() && at.getDate() === now.getDate();

  // ── R1 — the same calendar day, an earlier year ────────────────────────────
  const anniversaries = dated.filter((x) => yearsBefore(x.at) >= 1 && sameMonthAndDay(x.at));
  if (anniversaries.length > 0) {
    const chosen = anniversaries[0];
    const years = yearsBefore(chosen.at);
    return {
      entry: chosen.entry,
      strategy: 'temporal',
      why: years === 1 ? 'Written one year ago today' : `Written ${years} years ago today`,
      account:
        `Selected by date only. You wrote this on ${fullDate(chosen.at)} — the same calendar day, ` +
        `${years} ${years === 1 ? 'year' : 'years'} before today (${fullDate(now)}). ` +
        `${anniversaries.length} ${anniversaries.length === 1 ? 'entry' : 'entries'} fell on that day; ` +
        `the most recent was chosen. ${NOT_MEASURED}`,
    };
  }

  // ── R2 — the same week, an earlier year ────────────────────────────────────
  const thisWeekLastYear = dated.filter((x) => {
    if (yearsBefore(x.at) < 1) return false;
    const shifted = new Date(x.at);
    shifted.setFullYear(now.getFullYear());
    return Math.abs(daysBetween(shifted, now)) <= 3;
  });
  if (thisWeekLastYear.length > 0) {
    const chosen = thisWeekLastYear[0];
    const years = yearsBefore(chosen.at);
    return {
      entry: chosen.entry,
      strategy: 'temporal',
      why: years === 1 ? 'Written a year ago this week' : `Written ${years} years ago this week`,
      account:
        `Selected by date only. You wrote this on ${fullDate(chosen.at)}, within three days of ` +
        `today's date ${years} ${years === 1 ? 'year' : 'years'} earlier. ` +
        `${thisWeekLastYear.length} ${thisWeekLastYear.length === 1 ? 'entry' : 'entries'} fell in ` +
        `that window; the most recent was chosen. ${NOT_MEASURED}`,
    };
  }

  // ── R3 — the same month, an earlier year ───────────────────────────────────
  const sameMonthEarlierYear = dated.filter(
    (x) => yearsBefore(x.at) >= 1 && x.at.getMonth() === now.getMonth(),
  );
  if (sameMonthEarlierYear.length > 0) {
    const chosen = sameMonthEarlierYear[0];
    const years = yearsBefore(chosen.at);
    return {
      entry: chosen.entry,
      strategy: 'temporal',
      why:
        years === 1
          ? `Written last ${monthName(chosen.at)}`
          : `Written in ${monthName(chosen.at)} ${chosen.at.getFullYear()}`,
      account:
        `Selected by date only. You wrote this on ${fullDate(chosen.at)} — the same month of the ` +
        `year, ${years} ${years === 1 ? 'year' : 'years'} ago. ` +
        `${sameMonthEarlierYear.length} ${sameMonthEarlierYear.length === 1 ? 'entry' : 'entries'} ` +
        `fell in that month; the most recent was chosen. ${NOT_MEASURED}`,
    };
  }

  // ── R4 — earlier this month, far enough back to have been forgotten ────────
  const earlierThisMonth = dated.filter((x) => {
    const age = daysBetween(now, x.at);
    return (
      age >= 7 &&
      x.at.getMonth() === now.getMonth() &&
      x.at.getFullYear() === now.getFullYear()
    );
  });
  if (earlierThisMonth.length > 0) {
    const chosen = earlierThisMonth[earlierThisMonth.length - 1]; // the earliest one this month
    return {
      entry: chosen.entry,
      strategy: 'temporal',
      why: 'Written earlier this month',
      account:
        `Selected by date only. You wrote this on ${fullDate(chosen.at)}, ` +
        `${daysBetween(now, chosen.at)} days ago — the earliest entry still inside this calendar ` +
        `month. ${NOT_MEASURED}`,
    };
  }

  // ── R5 — the beginning of this journal ─────────────────────────────────────
  const oldest = dated[dated.length - 1];
  if (daysBetween(now, oldest.at) >= 60) {
    return {
      entry: oldest.entry,
      strategy: 'temporal',
      why: 'Your earliest entry still here',
      account:
        `Selected by date only. You wrote this on ${fullDate(oldest.at)}, ` +
        `${daysBetween(now, oldest.at)} days ago. It is the oldest entry in your journal. ` +
        `${NOT_MEASURED}`,
    };
  }

  return null;
}

/**
 * A short passage of the member's own words, for the returned entry.
 *
 * Their sentences, cut at a sentence boundary where possible — never a summary,
 * never a generated description, never MAIA's words.
 */
export function passageOf(content: string, max = 220): string {
  const text = (content || '').trim().replace(/\s+/g, ' ');
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  if (sentenceEnd > max * 0.5) return cut.slice(0, sentenceEnd + 1);
  const space = cut.lastIndexOf(' ');
  return `${space > max * 0.5 ? cut.slice(0, space) : cut}…`;
}
