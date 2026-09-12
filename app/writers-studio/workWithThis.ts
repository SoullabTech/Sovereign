/**
 * WORK WITH THIS — the door from a frozen developmental finding into the living
 * Work, and the ONE definition of what travels through it.
 *
 * ── What the gesture means ─────────────────────────────────────────────────
 *
 *   Take this historical developmental finding into the living Work so I can
 *   work on it now.
 *
 * ⛔ AND NOTHING ELSE. It does not reread, does not call a model, does not
 * change the manuscript, does not accept MAIA's interpretation, does not widen
 * the evidence, and does not choose an edit target for the writer. It is a
 * navigation carrying identities. Develop stays frozen behind it.
 *
 * ── Why this file, and why it looks like canvasIdentity.ts ─────────────────
 *
 * Same lesson, same shape: the producer's parameter names and the consumer's
 * must not be able to drift apart, so the names, the builder and the reader
 * live together and are imported by both sides. A link is not a binding.
 *
 * ── ⛔ NO AUTHORED PROSE TRAVELS ───────────────────────────────────────────
 *
 * Identities only: the Work, the reading, the observation, the revision that
 * reading froze, and the section/range identities it cited. No manuscript text,
 * no observation text, no heading. Two reasons, and the second is the one that
 * bites: prose in a route is a second copy of the member's words in a place
 * with its own retention answer — and a destination handed text would be able
 * to show a passage it had never actually read from the Work.
 *
 * The one non-identity value carried is the PHENOMENON, and only because it is
 * a closed ratified vocabulary token validated by `isPhenomenon` on arrival —
 * `recurrence`, not "the campfire keeps coming back". An unrecognised value is
 * dropped rather than displayed.
 *
 * ── ⭐ TWO ANCHORS, NEVER COLLAPSED ────────────────────────────────────────
 *
 *   ORIGIN         reading id · observation key · revision · cited anchors
 *                  — true about what MAIA read THEN, forever.
 *
 *   CURRENT FOCUS  resolved here, against the Work as it is NOW.
 *
 * The coordinates in this URL are HISTORICAL EVIDENCE. They are never treated
 * as current manuscript coordinates on arrival; focusSet.ts resolves them and
 * says, per member, whether the claim still holds. An old range that no longer
 * fits is marked, never relocated and never widened.
 */

import { isPhenomenon, type DevelopmentalPhenomenon } from '@/lib/manuscript/developmentalReading/contract';
import type { FocusAnchor } from '@/lib/writersStudio/focusAnchors';
import { CANVAS_MANUSCRIPT_PARAM } from './canvasIdentity';

/** The parameters this door writes and the destination reads. Never inlined. */
export const WORK_WITH_THIS_PARAM = {
  /** The developmental reading the finding came from. */
  reading: 'from',
  /** The observation within it, by its reading-internal key (`o1`). */
  observation: 'o',
  /** The revision that reading froze — what makes a range's currency decidable. */
  revision: 'rev',
  /** The cited anchors, encoded below. */
  anchors: 'at',
  /** Closed-vocabulary phenomenon token, for the set's name. Optional. */
  phenomenon: 'p',
} as const;

export interface WorkWithThisOrigin {
  manuscriptId: string;
  readingId: string;
  observationKey: string;
  /** The revision the reading froze. */
  revisionNumber: number;
  anchors: FocusAnchor[];
  phenomenon: DevelopmentalPhenomenon | null;
}

/**
 * `<sectionId>` for a whole section, `<sectionId>@<start>-<end>` for a passage,
 * joined by `,`. Section ids are UUIDs, which contain `-` but never `@` or `,`,
 * so the grammar is unambiguous without escaping. Offsets stay in CODE POINTS.
 */
export function encodeAnchors(anchors: readonly FocusAnchor[]): string {
  return anchors
    .map((a) => (a.kind === 'section'
      ? a.sectionId
      : `${a.sectionId}@${a.range.start}-${a.range.end}`))
    .join(',');
}

/**
 * ⛔ A malformed anchor list yields NULL for the whole list, never a partial
 * one. Silently dropping the member it could not parse would produce a Focus
 * Set that looks complete and is not — the writer would be told MAIA cited four
 * places when it cited five.
 */
export function decodeAnchors(raw: string): FocusAnchor[] | null {
  if (!raw) return null;
  const out: FocusAnchor[] = [];
  for (const part of raw.split(',')) {
    const at = part.indexOf('@');
    if (at < 0) {
      if (!part) return null;
      out.push({ kind: 'section', sectionId: part });
      continue;
    }
    const sectionId = part.slice(0, at);
    const span = part.slice(at + 1);
    const dash = span.indexOf('-');
    if (!sectionId || dash <= 0) return null;
    const start = Number(span.slice(0, dash));
    const end = Number(span.slice(dash + 1));
    if (!Number.isInteger(start) || !Number.isInteger(end)) return null;
    if (start < 0 || end <= start) return null;
    out.push({ kind: 'passage', sectionId, range: { start, end } });
  }
  return out.length ? out : null;
}

/** The Canvas, opened on this Work with this finding carried in. */
export function workWithThisHref(base: string, origin: WorkWithThisOrigin): string {
  const q = new URLSearchParams();
  q.set(CANVAS_MANUSCRIPT_PARAM, origin.manuscriptId);
  q.set(WORK_WITH_THIS_PARAM.reading, origin.readingId);
  q.set(WORK_WITH_THIS_PARAM.observation, origin.observationKey);
  q.set(WORK_WITH_THIS_PARAM.revision, String(origin.revisionNumber));
  q.set(WORK_WITH_THIS_PARAM.anchors, encodeAnchors(origin.anchors));
  if (origin.phenomenon) q.set(WORK_WITH_THIS_PARAM.phenomenon, origin.phenomenon);
  return `${base}${base.includes('?') ? '&' : '?'}${q.toString()}`;
}

/**
 * What the destination was asked for.
 *
 * ⭐ THREE OUTCOMES, NOT TWO. Absence is not an error — most visits to the
 * Canvas carry no origin at all and must be untouched by this. A BROKEN origin
 * is an error and says so: "unknown or missing origin refuses honestly rather
 * than inventing a Focus" is only possible if the destination can tell the two
 * apart.
 */
export type OriginRequest =
  | { kind: 'none' }
  | { kind: 'malformed'; why: string }
  | { kind: 'origin'; origin: WorkWithThisOrigin };

export function requestedOrigin(
  params: { get(name: string): string | null },
): OriginRequest {
  const readingId = params.get(WORK_WITH_THIS_PARAM.reading);
  const observationKey = params.get(WORK_WITH_THIS_PARAM.observation);
  const rev = params.get(WORK_WITH_THIS_PARAM.revision);
  const at = params.get(WORK_WITH_THIS_PARAM.anchors);
  const manuscriptId = params.get(CANVAS_MANUSCRIPT_PARAM);

  const any = readingId ?? observationKey ?? rev ?? at;
  if (any === null) return { kind: 'none' };

  if (!manuscriptId) return { kind: 'malformed', why: 'no work was named' };
  if (!readingId) return { kind: 'malformed', why: 'no reading was named' };
  if (!observationKey) return { kind: 'malformed', why: 'no observation was named' };

  const revisionNumber = Number(rev);
  if (!rev || !Number.isInteger(revisionNumber) || revisionNumber < 0) {
    return { kind: 'malformed', why: 'the version it was read at is missing or unreadable' };
  }

  const anchors = at === null ? null : decodeAnchors(at);
  if (!anchors) return { kind: 'malformed', why: 'the places it cited could not be read' };

  const p = params.get(WORK_WITH_THIS_PARAM.phenomenon);
  return {
    kind: 'origin',
    origin: {
      manuscriptId, readingId, observationKey, revisionNumber, anchors,
      phenomenon: isPhenomenon(p) ? p : null,
    },
  };
}
