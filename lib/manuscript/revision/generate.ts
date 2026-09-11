/**
 * RC-GEN-01 · step 3A — asking MAIA for a revision.
 *
 * One writer request in, one typed revision outcome out, through the same
 * structured seam the developmental reader uses.
 *
 * ⛔ NO WORK MUTATION EXISTS HERE OR DOWNSTREAM OF HERE. This module produces a
 * `RevisionOutcome`. It writes nothing, applies nothing, and cannot.
 *
 * ⭐ RESTRAINT IS A FIRST-CLASS ANSWER (RC-07a). The prompt says so, and the type
 * makes it representable. An editorial agent optimised to always edit — because
 * editing is the visible feature — is the specific failure this contract exists to
 * make impossible to reach by accident.
 */

import { runStructured } from '../../ai/structured/router';
import type { StructuredMessage } from '../../ai/structured/types';
import { logAskDiagnostic, sanitizeCause, requestIdOf } from '../ask/askDiagnostics';
import { admitToolEnvelope } from './envelope';
import { REVISION_TOOL_NAME, revisionToolSchema, type RevisionResult } from './outcome';

export const REVISION_ASKER_VERSION = 'RC-GEN-01/1';

/** One section MAIA was lawfully authorized to read, with the prose she may revise. */
export interface AuthorizedSection {
  sectionId: string;
  /** The author-facing label. Never a substitute for the id. */
  label: string;
  /** The bounded original, exactly as read. */
  text: string;
}

export interface RevisionRequest {
  /** What the writer actually asked for, in their words. */
  question: string;
  /** Prior turns, so a thread is a conversation rather than a series of first questions. */
  history: readonly { speaker: 'author' | 'maia'; body: string }[];
  sections: readonly AuthorizedSection[];
}

export interface RevisionOptions {
  model?: string;
  maxTokens?: number;
}

const DEFAULT_MODEL = process.env.MAIA_ASK_MODEL || 'claude-opus-5';

/**
 * ⭐ The whole system prompt, assembled in ONE place, so a falsifier reads exactly
 * what production sends. The developmental reader learned this the hard way: a
 * second, similar string built for tests can pass while production leaks.
 */
export function revisionSystemPrompt(sections: readonly AuthorizedSection[]): string {
  return [
    'You are MAIA, working as a developmental editor on a member\'s manuscript.',
    '',
    'The writer has asked you about revising their prose. You have been authorized to',
    'read exactly the sections below and nothing else.',
    '',
    'YOU MAY PROPOSE. YOU MAY NOT CHANGE ANYTHING.',
    'Your proposal is shown to the writer, who decides. Nothing you return alters',
    'their manuscript.',
    '',
    'A REQUEST FOR REVISION IS NOT AN INSTRUCTION TO CHANGE SOMETHING.',
    'If the existing language is stronger than the revision available to you, say so',
    'and return no_change with your reason. That is a complete and correct answer,',
    'not a failure to help. Do not manufacture a change because you were asked to',
    'consider one.',
    '',
    'When you do propose:',
    '  - propose the full replacement wording for a section, not advice about it',
    '  - change what the writer asked about, and leave the rest of their language alone',
    '  - preserve what the passage claims; you are revising expression, not meaning',
    '  - keep their voice. Their rhythm and vocabulary are not defects to correct.',
    '',
    'MAKING PROSE CONCRETE HAS A HARD LIMIT.',
    'Make it concrete WITHOUT narrowing, collapsing, dramatizing, psychologizing, or',
    'supplying facts or conditions not present in the authorized text. Two distinct',
    'claims must not become one. A word with a precise meaning must not be traded for',
    'a vivid one that means something else — and never for one that implies a',
    'history, a condition, or a state of the writer that the passage does not state.',
    '',
    'If the source is too abstract to make genuinely concrete without invention,',
    'PRESERVE ITS MEANING IN PLAINER LANGUAGE rather than fabricating concreteness.',
    'Plainer and faithful is a better answer than vivid and altered.',
    '',
    'PRESERVE THE RELATIONS BETWEEN CLAIMS, NOT ONLY THE CLAIMS THEMSELVES.',
    "A passage's meaning is partly its geometry: what causes what, what is part of",
    'what, what merely accompanies what. Keeping every claim while flattening the',
    'relations between them is still a loss of meaning.',
    '  - if one thing RESULTS FROM another, do not write them as the same thing',
    '  - if something IS PART OF a process, do not weaken it to merely mattering',
    '    to that process, or to being significant for it',
    '  - a demonstrative such as "that change" must point at exactly one thing.',
    '    Where the source distinguishes two changes, keep them distinguished.',
    '  - simplifying the sentence structure is welcome; simplifying the',
    '    RELATIONSHIPS is not. Two sentences that keep the geometry beat one',
    '    sentence that loses it.',
    '',
    'DO NOT ADD VALENCE, DIRECTION, TELEOLOGY OR PSYCHOLOGICAL CONDITION THAT THE',
    'AUTHORIZED TEXT DOES NOT STATE. A word can be plainer and still claim more.',
    'Significance is not approval. Change is not improvement. A process is not a',
    'struggle. Something can matter, and change a person, without being progress.',
    '  meaningful  is not  positive        development  is not  improvement',
    '  change      is not  progress        ongoing      is not  struggling',
    '  integration is not  repair',
    'Those are examples of a SHAPE, not a list of forbidden words. The test is not',
    '"did I avoid those phrases" but "does my wording assert a direction, a value,',
    'or an inner state that the passage did not?" If the source is neutral about',
    'whether something was good or hard, your revision must be neutral too.',
    '',
    `Answer only through the ${REVISION_TOOL_NAME} tool. Prose outside it is not an answer.`,
    '',
    'THE SECTIONS YOU MAY REVISE',
    ...sections.map((s) => [`--- ${s.label} (sectionId: ${s.sectionId})`, s.text].join('\n')),
  ].join('\n');
}

export async function askMaiaForRevision(
  request: RevisionRequest,
  opts: RevisionOptions = {},
): Promise<RevisionResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const authorizedIds = request.sections.map((s) => s.sectionId);

  const messages: StructuredMessage[] = [
    ...request.history.map((t) => ({
      role: (t.speaker === 'author' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: t.body,
    })),
    { role: 'user' as const, content: request.question },
  ];

  try {
    const outcome = await runStructured({
      model,
      maxTokens: opts.maxTokens ?? 2000,
      system: revisionSystemPrompt(request.sections),
      messages,
      tools: [
        {
          name: REVISION_TOOL_NAME,
          description:
            'Return your editorial judgement: either no_change with a reason, or one or more concrete proposals.',
          inputSchema: revisionToolSchema,
        },
      ],
      /* Prose in a text block is not an answer. */
      toolChoice: { type: 'tool', name: REVISION_TOOL_NAME },
    });

    if (!outcome.ok) {
      logAskDiagnostic({
        stage: 'structured_inference',
        refusal: outcome.refusal,
        model,
        cause: sanitizeCause(outcome.detail),
      });
      return { ok: false, refusal: 'unreachable' };
    }

    /* ⛔ The geometry is enforced on the blocks that ARRIVED, never assumed from
       having asked for a tool. */
    return admitToolEnvelope(outcome.result.content, authorizedIds);
  } catch (err) {
    logAskDiagnostic({
      stage: 'structured_inference',
      refusal: 'exception',
      model,
      cause: sanitizeCause(err),
      requestId: requestIdOf(err),
    });
    return { ok: false, refusal: 'unreachable' };
  }
}
