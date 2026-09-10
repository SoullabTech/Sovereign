/**
 * REVISION-COLLABORATION-01 · RC-GEN-01 — the typed revision outcome.
 *
 * What MAIA may return when a writer asks for a revision, and nothing else.
 *
 * ⭐ TWO LAWFUL OUTCOMES, NOT ONE (RC-07a). A request for revision authorizes
 * MAIA to CONSIDER changes; it does not establish that a change is warranted.
 * `no_change` is a successful editorial judgement — never a failure, never an
 * empty response, never a refusal. An editorial agent optimised to always edit,
 * because editing is the visible feature, is a specific and likely failure; this
 * type exists so that failure cannot be reached by accident.
 *
 * ⛔ A PROPOSAL IS NOT AN APPLICATION. Nothing here writes to a Work. RC-GEN-01
 * ships no Accept, no Modify, no candidate store and no application path at all.
 *
 * ⛔ NOTHING HERE AGGREGATES. No preference, tendency, style score or writer
 * trait is representable — the F boundary is enforced by the absence of any
 * field that could carry one, not by a convention about how to fill one in.
 */

/** One concrete revision, against one section the reader was authorized to read. */
export interface ProposedRevision {
  /** The exact section this replaces. Never a search string, never a range hint. */
  sectionId: string;
  /** The replacement wording. MAIA's own output; never a copy of the Work. */
  proposedText: string;
  /** Why, in the writer's terms. Shown beside the diff. */
  reason: string;
}

/**
 * ⭐ `no_change` carries a reason and NO proposals; `proposals` carries at least
 * one and no reason of its own (each proposal reasons for itself). The union
 * makes "a no_change that also proposed something" unrepresentable.
 */
export type RevisionOutcome =
  | { kind: 'no_change'; reason: string }
  | { kind: 'proposals'; proposals: readonly [ProposedRevision, ...ProposedRevision[]] };

/**
 * Why a revision outcome could not be obtained. Distinct from `no_change` in
 * every case: these mean MAIA did not answer, not that she judged restraint.
 */
export type RevisionRefusal =
  | 'unreachable'      // the provider path failed; the cause is in the logs
  | 'no_answer'        // the model returned nothing usable
  | 'malformed'        // an answer arrived that this contract cannot admit
  | 'unknown_section'; // a proposal named a section outside the authorized set

export type RevisionResult =
  | { ok: true; outcome: RevisionOutcome }
  | { ok: false; refusal: RevisionRefusal; detail?: string };

/** The tool MAIA answers through. Prose in a text block is not an answer. */
export const REVISION_TOOL_NAME = 'revision_outcome';

export const revisionToolSchema: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['kind'],
  properties: {
    kind: { type: 'string', enum: ['no_change', 'proposals'] },
    reason: {
      type: 'string',
      description:
        'Required when kind is no_change: why the existing language is stronger than the available revision.',
    },
    proposals: {
      type: 'array',
      minItems: 1,
      description: 'Required when kind is proposals. One entry per section you are changing.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['sectionId', 'proposedText', 'reason'],
        properties: {
          sectionId: { type: 'string', description: 'Exactly one of the section ids you were given.' },
          proposedText: { type: 'string', description: 'The full replacement wording for that section.' },
          reason: { type: 'string', description: 'One or two sentences. What the change does.' },
        },
      },
    },
  },
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/**
 * Admit a tool input, or refuse it. NEVER coerce.
 *
 * ⭐ `authorizedSectionIds` is passed in and checked here rather than trusted from
 * the model: a proposal naming a section the reader was not authorized to read is
 * `unknown_section`, not a proposal to be filtered quietly out of a list. The
 * caller learns the whole answer was unusable, which is the truth.
 */
export function admitRevisionOutcome(
  input: unknown,
  authorizedSectionIds: readonly string[],
): RevisionResult {
  if (!isRecord(input)) return { ok: false, refusal: 'malformed', detail: 'not an object' };

  if (input.kind === 'no_change') {
    if (!nonEmpty(input.reason)) {
      return { ok: false, refusal: 'malformed', detail: 'no_change without a reason' };
    }
    /* A no_change that also proposes is not a judgement, it is two answers. */
    if (input.proposals !== undefined) {
      return { ok: false, refusal: 'malformed', detail: 'no_change carrying proposals' };
    }
    return { ok: true, outcome: { kind: 'no_change', reason: input.reason.trim() } };
  }

  if (input.kind !== 'proposals') {
    return { ok: false, refusal: 'malformed', detail: `unknown kind: ${String(input.kind)}` };
  }

  const raw = input.proposals;
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, refusal: 'malformed', detail: 'proposals absent or empty' };
  }

  const allowed = new Set(authorizedSectionIds);
  const proposals: ProposedRevision[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) return { ok: false, refusal: 'malformed', detail: 'proposal is not an object' };
    if (!nonEmpty(entry.sectionId) || !nonEmpty(entry.proposedText) || !nonEmpty(entry.reason)) {
      return { ok: false, refusal: 'malformed', detail: 'proposal missing a required field' };
    }
    if (!allowed.has(entry.sectionId)) {
      return { ok: false, refusal: 'unknown_section', detail: 'a proposal named an unauthorized section' };
    }
    proposals.push({
      sectionId: entry.sectionId,
      proposedText: entry.proposedText,
      reason: entry.reason.trim(),
    });
  }

  return {
    ok: true,
    outcome: { kind: 'proposals', proposals: proposals as [ProposedRevision, ...ProposedRevision[]] },
  };
}
