import type { StudioActKind } from '@/app/api/sovereign/studio/history/route';

/**
 * HISTORY — turning recorded acts into the writer's own language.
 *
 * The API returns FACTS: what kind of act, when, in which work, with which
 * recorded particular. This module turns a fact into a sentence. The split is
 * deliberate — phrasing is presentation and belongs where it can be read and
 * argued with, not welded into SQL.
 *
 * ── The one law here (founder, 2026-09-07) ────────────────────────────────
 *
 *   A date may gather acts. It may not explain what those acts amounted to.
 *
 * So: no daily headline, no "a productive day revising Fire", no "you focused
 * on structure", and no adjective anywhere in this file that the member did
 * not write themselves. Grouping is presentation. Summarizing is
 * interpretation. Every sentence below names an act and stops.
 */

export interface StudioAct {
  id: string;
  kind: StudioActKind;
  at: string;
  workTitle: string | null;
  manuscriptTitle: string | null;
  manuscriptId: string | null;
  detail: string | null;
  note: string | null;
}

/**
 * What to call the writing an act happened in.
 *
 * FOUNDER RULING 2026-09-07 — *a source filename is provenance, not a Work
 * name.* Where a declared Work claims this writing, the member-authored Work
 * title wins. The manuscript title is the fallback, not the authority, and it
 * is the fallback precisely because it may have been derived from an upload
 * filename that no one chose as a name.
 */
export function subjectOf(act: StudioAct): string | null {
  return act.workTitle ?? act.manuscriptTitle ?? null;
}

/**
 * The act, said plainly. Returns null for an act that cannot be stated without
 * guessing — a silent omission is better than a confident invention.
 */
export function sentenceFor(act: StudioAct): string | null {
  const subject = subjectOf(act);
  switch (act.kind) {
    case 'work_begun':
      return subject ? `Began ${subject}` : 'Began a work';

    case 'writing_arrived':
      /* The filename appears HERE and only here: this is the act custody is
         about. It is named as what arrived, never as what the work is called. */
      return act.detail
        ? `Brought ${act.detail} into the Studio`
        : subject
          ? `Brought ${subject} into the Studio`
          : 'Brought writing into the Studio';

    case 'expression_declared':
      return subject ? `Made this writing part of ${subject}` : null;

    case 'material_declared':
      return subject ? `Placed something in ${subject}` : null;

    case 'version_kept':
      /* "Kept version 12" — the number is recorded, not computed for display. */
      return act.detail
        ? subject
          ? `Kept version ${act.detail} of ${subject}`
          : `Kept version ${act.detail}`
        : subject
          ? `Kept a version of ${subject}`
          : 'Kept a version';

    case 'line_marked':
      return subject ? `Marked a line in ${subject}` : 'Marked a line';

    default:
      return null;
  }
}

/**
 * The second line: a recorded particular, or the member's own sentence.
 *
 * ⛔ Never a characterization of the act. If there is nothing recorded, there
 * is no second line — an act with nothing beneath it is complete as it stands.
 */
export function beneath(act: StudioAct): string | null {
  /* The member's own words come first and are quoted so they read as theirs. */
  if (act.note && act.note.trim().length > 0) return `“${act.note.trim()}”`;
  if (act.kind === 'line_marked' && act.detail) return act.detail;
  if (act.kind === 'expression_declared' && act.manuscriptTitle) return act.manuscriptTitle;
  return null;
}

/**
 * Acts under date headers, newest day first, in the order they happened.
 *
 * Grouping only. The returned day carries its acts and says nothing about
 * them: there is no count, no headline, no "busiest day", and deliberately no
 * field into which one could later be added without editing this type.
 */
export interface HistoryDay {
  /** Stable key — the local calendar day the acts fall on. */
  key: string;
  /** "September 7" / "September 7, 2025" — a date, never a duration. */
  label: string;
  acts: StudioAct[];
}

export function byDay(acts: StudioAct[], now: Date = new Date()): HistoryDay[] {
  const days: HistoryDay[] = [];
  const index = new Map<string, HistoryDay>();

  for (const act of acts) {
    const when = new Date(act.at);
    if (Number.isNaN(when.getTime())) continue; // an unreadable date is not a day
    const key = when.toDateString();
    let day = index.get(key);
    if (!day) {
      const sameYear = when.getFullYear() === now.getFullYear();
      day = {
        key,
        label: when.toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          ...(sameYear ? {} : { year: 'numeric' }),
        }),
        acts: [],
      };
      index.set(key, day);
      days.push(day);
    }
    day.acts.push(act);
  }

  return days;
}
