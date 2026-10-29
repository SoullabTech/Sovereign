/**
 * Writer's Studio · a relational editorial turn, NOT a new editorial engine.
 *
 * The author's own words are always primary. These narrow, non-learning
 * request cues change the service's permitted RESPONSE shape, not the passage
 * identity, work identity, privacy posture, permission, memory or evidence.
 *
 * Responses remain governed by the existing exact-passage editorial thread,
 * proposal-policy gate, source revision and independent Apply/Undo mechanisms.
 */
import type { CraftSendOptions } from './craftDialogueR1';

export type WriterCraftIntention =
  | 'reader_reach' | 'preserve_voice' | 'teach_craft'
  | 'larger_work' | 'wording' | 'explore';

export type WriterCraftPlan = {
  intention: WriterCraftIntention;
  proposalPolicy: 'allow' | 'reply_only';
  displayText: string;
  /** Exactly what the author typed; never inferred or padded with a prompt. */
  authorText: string;
};

/** A single example, never a grid of editor-specialist choices. */
export const RELATIONAL_WRITING_INVITATIONS = [
  {
    label: 'Reach my readers',
    example: 'MAIA, could you help this paragraph reach my readers more deeply while keeping what I mean?',
  },
  {
    label: 'Keep my words',
    example: 'MAIA, keep this as much in my words as possible, and show me one or two ways to make it more effective.',
  },
  {
    label: 'Teach me the craft',
    example: 'MAIA, what writing convention could you teach me through this passage, using my own words?',
  },
  {
    label: 'Find its place',
    example: 'MAIA, how might this section relate to the larger manuscript? Tell me what we know and what else you would need to read.',
  },
] as const;

/**
 * If a member is exploring conventions or the larger manuscript, prohibit
 * draft proposals in this exact passage until they ASK for wording. Unknown,
 * ambiguous or negative instructions fall back to non-mutating conversation.
 *
 * The heuristic is not an inference about skill, identity, writer style or
 * actual reader effects. It is only an optional narrower proposal gate.
 */
export function writerCraftIntention(request: string): WriterCraftIntention {
  // Normalize only for conservative request cues; original wording, punctuation
  // and Unicode always stay untouched in display and network text.
  const text = request.trim().toLowerCase().replace(/[’‘]/g, "'");
  const noRewrite = /\b(?:do\s+not|don't|without|never|not\s+yet|rather\s+than|instead\s+of)\s+(?:\w+\s+){0,4}(?:rewrit\w*|revis\w*|edit\w*|chang\w*|suggest\w*|rephras\w*|reword\w*)\b/.test(text);
  // A whole-manuscript question cannot authorize whole-book reading.
  if (/\b(?:larger|whole|overall|overarching|entire)\s+(?:manuscript|book|work|story|structure|arc)\b|\b(?:integrat\w*|fit\w*|connect\w*)\b.{0,65}\b(?:manuscript|book|larger\s+work|whole\s+work)\b/.test(text)) {
    return 'larger_work';
  }
  if (/\b(?:teach|explain|learn|writing\s+conventions?|writing\s+techniques?|craft\s+conventions?)\b/.test(text)
    && !/\b(?:please|can you|could you)\s+(?:rewrit\w*|revis\w*)\b/.test(text)) {
    return 'teach_craft';
  }
  if (noRewrite) return 'explore';
  const writerVoice = /\b(?:keep|preserv\w*|stay\s+close|as\s+much\s+in|original)\b.{0,85}\b(?:my\s+(?:words|wording|voice|rhythm|cadence|imagery)|what\s+i\s+(?:mean|say))\b/.test(text);
  if (writerVoice && /\b(?:options?|alternatives?|versions?|suggestions?|rewrite|reword|revise|edit|effective|improve|refine|try)\b/.test(text)) {
    return 'preserve_voice';
  }
  if (/\b(?:readers?|audience|landing|resonat\w*|reach|moving|more\s+deeply|connect\s+emotionally)\b/.test(text)
    && /\b(?:help|make|rewrite|edit|change|say|express|reach|land|resonat\w*|connect)\b/.test(text)) {
    return 'reader_reach';
  }
  if (/\b(?:rewrite|reword|rephrase|revise|polish|line\s*edit|wording\s+options?|alternate\s+phrasing|different\s+versions?|another\s+(?:wording\s+)?options?|different\s+(?:wording\s+)?options?|(?:one|two|more)\s+alternatives?)\b/.test(text)) {
    return 'wording';
  }
  return 'explore';
}

const COMMON = [
  'This is a continuing conversation with the writer about the exact currently authorized passage, not an instruction to change the manuscript.',
  'Begin by meeting what the writer is reaching for in their own terms. If that intention is uncertain, ask ONE useful question instead of inventing it.',
  'Notice what is alive or distinctive in the existing wording. Protect the author’s voice, imagery, cultural context, rhythm, meaning, and intentional ambiguity.',
  'Reader effects are hypotheses, not facts. A technically polished rewrite is not automatically more truthful or more moving.',
  'Keep the response human-scale: one point of attention first. Offer further depth conversationally if wanted, not as a long prebuilt dashboard.',
  'The writer may keep the original, ask for another possibility, or refine an option. Never apply, save, overwrite, or broaden the passage focus automatically.',
].join(' ');

const MOVES: Record<WriterCraftIntention, string> = {
  reader_reach: [
    'The member is explicitly interested in how the current passage might meet its readers. Say what already carries emotional or intellectual force.',
    'If a bounded rewrite seems useful, offer at most TWO meaningfully distinct possibilities grounded only in these exact words, each with a brief artistic purpose and an honest tradeoff.',
    'Show the strongest reason to keep the original. Never assert that any actual reader will feel a particular way.',
  ].join(' '),
  preserve_voice: [
    'The member explicitly prizes keeping their wording. Their present sentence is a valid outcome.',
    'If wording is needed, offer one very light possibility first, with at most one distinctly different alternative if requested. Highlight what is preserved and what might be lost.',
    'Never quietly substitute a polished professional-sounding voice for this writer’s way of speaking.',
  ].join(' '),
  teach_craft: [
    'The member wants understanding, NOT a replacement paragraph.',
    'Teach ONE relevant writing convention using their actual words. Explain what it can do, when not to use it, and offer the writer a small voluntary experiment.',
    'Do not generate a proposed manuscript version or ask for Apply.',
  ].join(' '),
  larger_work: [
    'The member asks how the passage belongs to the larger manuscript. A selected passage is not evidence of the entire book.',
    'Discuss only relationships actually supported by authorized Work context and existing explicitly approved readings. Identify what remains unknown.',
    'If whole-book reading or developmental comparison is needed, ask the writer to initiate the appropriate Read/Develop action; do not retrieve or infer other chapters, expand scope, or propose an exact replacement yet.',
  ].join(' '),
  wording: [
    'A bounded wording experiment has been explicitly requested. Begin with what should be preserved.',
    'Offer no more than TWO distinct options unless the member requested more. Explain each option’s purpose and cost, and keep the original on equal footing.',
    'These are working possibilities, not accepted edits; never Apply.',
  ].join(' '),
  explore: [
    'The request has not clearly authorized rewritten words. Converse first about the specific passage and ask one useful question as needed.',
    'Do not propose a replacement paragraph in this turn unless the member explicitly asks for it.',
  ].join(' '),
};

export function composeRelationalCraftRequest(raw: string): WriterCraftPlan | null {
  if (!raw.trim()) return null;
  const intention = writerCraftIntention(raw);
  const proposalPolicy: WriterCraftPlan['proposalPolicy'] =
    intention === 'wording' || intention === 'preserve_voice' || intention === 'reader_reach'
      ? 'allow' : 'reply_only';
  return {
    intention,
    proposalPolicy,
    displayText: raw,
    authorText: raw,
  };
}

export function optionsForRelationalCraftPlan(plan: WriterCraftPlan): CraftSendOptions {
  return {
    proposalPolicy: plan.proposalPolicy,
    // Existing server only supports allow/reply_only; never invent require.
    displayText: plan.displayText,
  };
}

/**
 * The paper-boat writer can correct the reading, protect an exact chosen
 * phrase, or STOP. These are deliberate interaction gestures. Do not
 * classify manuscript prose, infer personality, or persist new memory.
 */
export type RelationalAuthorBoundary =
  | { kind: 'stop' }
  | { kind: 'resume' }
  | { kind: 'keep_phrase'; phrase: string }
  | { kind: 'correction'; words: string };

export function authorRelationalBoundary(raw: string): RelationalAuthorBoundary | null {
  const statement = raw.trim();
  if (!statement || statement.length > 550) return null;
  const plain = statement.toLowerCase().replace(/[’‘]/g, "'");
  if (/^(?:(?:please|maia[,.:!]?)\s+)?(?:stop(?:\s+(?:(?:all|any|new)\s+)?(?:revisions?|editing|edits?|rewrites?|suggestions?|changes?))?|no\s+(?:more\s+)?(?:revisions?|edits?|rewrites?|suggestions?))(?:[.!\s]*|[.!]?\s+no\s+(?:more\s+)?(?:revisions?|rewrites?|edits?|suggestions?)[.!\s]*)$/.test(plain)) {
    return {kind:'stop'};
  }
  if (/^(?:please\s+)?(?:resume|restart|continue)\s+(?:revisions?|rewrites?|editing|suggestions?)(?:\s+now)?[.!\s]*$/.test(plain)) {
    return {kind:'resume'};
  }
  // The writer must explicitly choose the phrase, not accept an inference.
  const literal = /^(?:(?:maia[,.:!]?)\s+)?(?:please\s+)?(?:keep|protect|preserve|do\s+not\s+change|don't\s+change)\s+(?:the\s+(?:exact\s+)?(?:words?|phrase|image|wording)\s+)?["“‘]([^"”’\n]{2,100})["”’](?:\s+(?:exactly|as\s+(?:is|written)|unchanged|in\s+my\s+words))?[.!\s]*$/iu.exec(statement);
  if (literal) {
    // Use original, case- and diacritic-exact Unicode, never the normalized
    // inspection string when passing to Craft's unique-span owner guard.
    const quote=/["“‘]([^"”’\n]{2,100})["”’]/u.exec(statement)?.[1];
    if (quote && quote.trim()===quote) return {kind:'keep_phrase',phrase:quote};
  }
  // Corrections are author's assertions about THEIR intended meaning. They
  // are not independent evidence that anything in the fiction actually is so.
  if (/^(?:(?:maia[,.:!]?)\s+)?(?:no[,!.]?\s*(?:it'?s|it\s+is|i\s+meant|this\s+is|the\s+scene\s+is)|that'?s\s+not\s+(?:what\s+i\s+meant|about)|i\s+meant\b)/.test(plain)
    && statement.length <= 320) {
    return {kind:'correction',words:statement};
  }
  return null;
}


/**
 * SERVER-ONLY: derive a FIXED editorial response convention from the single
 * stored exact member utterance. Never append it to the member's words, never
 * store this scaffold as their turn, and never treat it as permission to read
 * more Work, generate a draft or Apply.
 *
 * This is a narrow, conservative register preference, not skill inference.
 */
export function relationalCraftSystemGuidance(authorUtterance: string): string {
  if (!authorUtterance.trim()) return COMMON + '\n\n' + MOVES.explore;
  const intention = writerCraftIntention(authorUtterance);
  return [
    COMMON,
    MOVES[intention],
    'If a bounded direction is lawful under the existing server proposal and scope gates, keep it exact to the selected passage. Never expand authorized reading and never Apply on the writer’s behalf.',
    'If the writer corrected your earlier reading within the currently authorized history, follow their stated intention without claiming hidden knowledge. If a protected phrase has no verified current working-copy custody, do not claim permanent protection.',
  ].join('\n\n');
}
