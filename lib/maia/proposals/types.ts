/**
 * Proposal primitive — types.
 *
 * Governed by docs/canon/MAIA_CONSENT_GATES.md.
 * A Proposal is a Field Note with a consented action attached (Art. 1):
 * attention + a latent action + a consent gate. MAIA *constructs* proposals;
 * nothing changes the world until a member confirms one (Art. 2).
 *
 * Status: Cat 2 → Cat 6 in progress. This is part of the calendar
 * proof-of-loop. Inert until the front-half (tool-use on the live member turn)
 * is wired.
 */

/** The only action type in the proof-of-loop. Fixed at creation; editing the
 *  payload never changes it (Art. 2 — editing a "schedule" never becomes a
 *  "message"; that would be a new Proposal). */
export type ProposalActionType = 'calendar_event';

/** Editable payload for a calendar-event proposal. Every field is amendable by
 *  the member before consent (Art. 2) — including description/notes, which the
 *  origin request explicitly required. */
export interface CalendarEventPayload {
  title: string;
  description?: string;
  /** ISO 8601, with timezone offset. */
  start: string;
  /** ISO 8601, with timezone offset. */
  end: string;
  allDay?: boolean;
  location?: string;
}

export interface Proposal<P = CalendarEventPayload> {
  /** Fixed at creation (Art. 2). */
  actionType: ProposalActionType;
  /** Editable by the member before consent (Art. 2). */
  payload: P;
  /**
   * Why MAIA proposed this — provenance, shown to the member (Art. 8, legibility).
   * Required: a proposal whose rationale is hidden cannot be meaningfully consented to.
   */
  rationale: string;
  /**
   * What MAIA read to form this — the externalized source (Art. 3). For the
   * reactive proof-of-loop the source is the member's own request in this turn,
   * never a continuous observation of the person.
   */
  source: string;
}

export function isCalendarEventProposal(
  p: Proposal,
): p is Proposal<CalendarEventPayload> {
  return p.actionType === 'calendar_event';
}
