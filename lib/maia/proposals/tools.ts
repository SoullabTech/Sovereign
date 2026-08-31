/**
 * MAIA action tools — Anthropic tool definitions.
 *
 * Per Art. 2 of docs/canon/MAIA_CONSENT_GATES.md, these tools may only
 * CONSTRUCT a Proposal. They have no write capability. Naming is `propose_*`,
 * never `create_*`, so the API surface itself encodes the vow: the model can
 * surface an intention, but only a member-confirmed proposal (via the executor)
 * changes the world.
 *
 * Inert until wired into the live member turn (front-half of the proof-of-loop).
 */

import type { Proposal, CalendarEventPayload } from './types';

/**
 * Anthropic tool schema. MAIA calls this to PROPOSE a calendar event — it does
 * not create one. The member edits and confirms before anything is written.
 *
 * Typed loosely on purpose (no Anthropic SDK import here) so this module stays
 * dependency-light and portable; cast to the SDK's Tool type at the wire site.
 */
export const PROPOSE_CALENDAR_EVENT_TOOL = {
  name: 'propose_calendar_event',
  description:
    'Propose a calendar event for the member to review, edit, and confirm. ' +
    'This does NOT create the event — it surfaces a proposal the member must ' +
    'explicitly confirm before anything is written. Use when the member asks to ' +
    'schedule something or to set time aside. Always include a clear title and ' +
    'start/end times. Infer the member’s local timezone from context; if ' +
    'unknown, state your assumption in the rationale so they can correct it.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Short title, e.g. "Lunch with Nathan".' },
      description: { type: 'string', description: 'Optional notes, agenda, or details.' },
      start: { type: 'string', description: 'Start, ISO 8601 with timezone offset, e.g. 2026-06-18T09:00:00-07:00.' },
      end: { type: 'string', description: 'End, ISO 8601 with timezone offset.' },
      allDay: { type: 'boolean', description: 'True for an all-day event.' },
      location: { type: 'string', description: 'Optional location.' },
      rationale: {
        type: 'string',
        description: 'One sentence: why you are proposing this, including any timezone assumption. Shown to the member.',
      },
    },
    required: ['title', 'start', 'end', 'rationale'],
  },
};

/** All MAIA action tools (one, for the proof-of-loop). */
export const MAIA_PROPOSAL_TOOLS = [PROPOSE_CALENDAR_EVENT_TOOL];

/** Shape of the `propose_calendar_event` tool_use input. */
export interface ProposeCalendarEventInput {
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  rationale: string;
}

/**
 * Convert a `propose_calendar_event` tool_use input into a Proposal.
 * The tool input carries `rationale`; `source` is supplied by the caller (the
 * member's request this turn — Art. 3 reactive source), never an inferred
 * observation of the person.
 */
export function calendarProposalFromToolInput(
  input: ProposeCalendarEventInput,
  source: string,
): Proposal<CalendarEventPayload> {
  return {
    actionType: 'calendar_event',
    payload: {
      title: input.title,
      description: input.description,
      start: input.start,
      end: input.end,
      allDay: input.allDay,
      location: input.location,
    },
    rationale: input.rationale,
    source,
  };
}

/**
 * Extract a calendar Proposal from a model's tool_use blocks, if present.
 * Returns undefined when no (valid) propose_calendar_event call was made.
 * `source` is the member's request this turn (Art. 3 — reactive source).
 */
export function extractCalendarProposal(
  toolUses: Array<{ name: string; input: Record<string, unknown> }> | undefined,
  source: string,
): Proposal<CalendarEventPayload> | undefined {
  const call = toolUses?.find((t) => t.name === PROPOSE_CALENDAR_EVENT_TOOL.name);
  if (!call) return undefined;
  const input = call.input as unknown as ProposeCalendarEventInput;
  if (!input?.title || !input?.start || !input?.end) return undefined;
  return calendarProposalFromToolInput(input, source);
}
