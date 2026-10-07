import type { ProposalPolicy } from '@/lib/manuscript/editorialScope/sequence';

// Inspect the writer's request, never system wrappers or quoted manuscript text.
function requestLanguage(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/"[^"\n]*"|“[^”\n]*”/g, ' ')
    .replace(/’/g, "'");
}

export function craftWordingWithheld(text: string): boolean {
  const request = requestLanguage(text);
  return /\b(?:do\s+not|don't|never|stop|avoid)\s+(?:(?:please|yet|just|ever|automatically)\s+)*(?:rewrit\w*|revis\w*|reword\w*|rephras\w*|edit\w*|draft\w*|suggest\w*|propos\w*)\b/i.test(request)
    || /\bno\s+(?:(?:new|more|further|replacement|edit|wording)\s+)*(?:wording|rewrites?|revisions?|suggestions?|proposals?|edits?)\b/i.test(request)
    || /\b(?:don't|do\s+not)\s+want\s+(?:(?:you\s+to|any|a|another)\s+)*(?:rewrit\w*|revis\w*|edit\w*|wording|suggestions?)\b/i.test(request);
}

/** Conservative request grammar; discussing the word "rewrite" is not permission. */
export function craftProposalRequested(text: string): boolean {
  if (craftWordingWithheld(text)) return false;
  const request = requestLanguage(text);
  const start = '(?:^|[.!?;,\\n]\\s*|\\b(?:and|then)\\s+)\\s*(?:(?:please|now|then)\\s+)*(?:(?:can|could|would|will)\\s+you\\s+(?:please\\s+)?)?';
  const act = '(?:revise|rewrite|reword|rephrase|copyedit|line[ -]edit|edit\\s+(?:this|these|the\\s+(?:sentence|paragraph|passage|words?))|(?:show|give)\\s+me\\s+(?:(?:a|an|another|one|two|three|some)\\s+)?(?:(?:small|light|bounded|specific)\\s+)?(?:change|edit|suggestion|wording|version|revision|rewrite|alternative)s?|try\\s+(?:(?:some|a)\\s+)?(?:wording|revision|rewrite)|offer\\s+(?:(?:an?|some)\\s+)?(?:edit|wording)\\s+(?:options?|suggestions?))\\b';
  return new RegExp(start + act, 'i').test(request)
    || /(?:^|[.!?;\n]\s*)\s*how\s+would\s+you\s+(?:write|word|phrase)\b/i.test(request)
    || /\bput\s+(?:the|your|a)\s+(?:suggestion|change|edit|wording)\s+directly\s+in(?:to)?\s+(?:the\s+)?(?:marked\s+)?copy\b/i.test(request);
}

export interface CraftSuggestionChoice {
  request: string;
  proactive: boolean;
  proposalPolicy?: ProposalPolicy;
  proposalRequested?: boolean;
}

/** The setting controls volunteering; an explicit local request controls this turn.
 * Neither edit strength, prior MAIA replies, nor a mode crossing supplies consent.
 * A reply-only action and an explicit refusal outrank permission to volunteer.
 */
export function resolveCraftSuggestionPolicy(choice: CraftSuggestionChoice): {
  proposalPolicy: ProposalPolicy;
  proposalRequested: boolean;
} {
  if (choice.proposalPolicy === 'reply_only' || craftWordingWithheld(choice.request)) {
    return { proposalPolicy: 'reply_only', proposalRequested: false };
  }
  const requested = choice.proposalRequested === true || craftProposalRequested(choice.request);
  return {
    proposalPolicy: requested ? 'require' : choice.proactive ? 'allow' : 'reply_only',
    proposalRequested: requested,
  };
}

/** An arrival carries intention, not an invented request for replacement prose. */
export function craftArrivalPolicy(settings: { resolved: boolean; proactive: boolean }): {
  proposalPolicy: ProposalPolicy;
  proposalRequested: false;
} | null {
  if (!settings.resolved) return null;
  return { proposalPolicy: settings.proactive ? 'allow' : 'reply_only', proposalRequested: false };
}
