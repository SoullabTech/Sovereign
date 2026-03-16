// @ts-nocheck - lightweight resolver, permissive types intentional
/**
 * Conversation State Resolver
 *
 * Runs before prompt assembly to answer:
 *   - what question did the assistant just ask?
 *   - did the user answer it?
 *   - what option was selected?
 *   - what does "it/that/yes/both/design" refer to?
 *   - should the next move advance or clarify?
 *
 * This layer explicitly handles thread coherence so the model only
 * has to handle response quality.
 *
 * v1 — four rules only:
 *   1. Short answer to yes/no question    → shouldAdvanceThread
 *   2. Short answer to either/or question → selectedOption + shouldAdvanceThread
 *   3. Pronoun/referential resolution     → localReferent
 *   4. Block clarification when answered  → shouldClarify = false
 */

export type QuestionType = 'yes_no' | 'either_or' | 'multi_choice' | 'open';

export type ConversationState = {
  lastAssistantQuestionType?: QuestionType | null;
  lastAssistantOptions?: string[];
  userLikelyAnsweredPriorQuestion: boolean;
  selectedOption?: string | null;
  localReferent?: string | null;
  shouldAdvanceThread: boolean;
  shouldClarify: boolean;
};

export type Turn = { role: 'user' | 'assistant'; content: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findLastQuestion(text: string): string | null {
  // Returns the last sentence ending in '?' from the assistant text.
  // Scan backwards through sentence-boundary splits.
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (let i = sentences.length - 1; i >= 0; i--) {
    const s = sentences[i].trim();
    if (s.endsWith('?')) return s;
  }
  return null;
}

function detectQuestionType(question: string): { type: QuestionType; options: string[] } {
  // Multi-choice: numbered or lettered options (1) 2) / A) B) / 1. 2.)
  const multiRe = /\b[1-9A-D][).]\s+\S+/g;
  const multiMatches = question.match(multiRe);
  if (multiMatches && multiMatches.length >= 2) {
    const opts = multiMatches.map((m) => m.replace(/^[1-9A-D][).]\s+/, '').trim());
    return { type: 'multi_choice', options: opts };
  }

  // Either/or: "X or Y?" structure
  // Looks for "or" between two non-trivial spans, near end of question
  const orRe = /\b([\w][\w ,'\-]{1,50})\s+or\s+([\w][\w ,'\-]{1,50})\??$/i;
  const orMatch = question.match(orRe);
  if (orMatch) {
    const clean = (s: string) =>
      s
        .replace(/^(is\s+this|is\s+it|it'?s|a|an|the)\s+/i, '')
        .replace(/\?$/, '')
        .trim();
    return { type: 'either_or', options: [clean(orMatch[1]), clean(orMatch[2])] };
  }

  // Yes/no: starts with a modal/auxiliary verb
  if (/^(is|was|were|are|do|does|did|would|will|can|could|should|have|has|had|shall|might|may|does)\b/i.test(question)) {
    return { type: 'yes_no', options: [] };
  }

  return { type: 'open', options: [] };
}

const AFFIRMATIVE_RE =
  /^(yes|yeah|yep|yup|sure|absolutely|definitely|please|of course|totally|right|correct|exactly|indeed|agreed|it\s+would|that\s+would|that'?s\s+(right|correct|it)|i\s+would|sounds\s+good|let'?s\s+do|go\s+ahead|let\s+me|please\s+do|that\s+helps|it\s+would\s+help|works\s+for\s+me)/i;

const NEGATIVE_RE =
  /^(no|nope|nah|not\s+really|not\s+yet|i\s+don'?t|i\s+wouldn'?t|no\s+thanks|not\s+right\s+now)/i;

const REFERENTIAL_RE =
  /\b(it|that|this|both|either|them|those|the\s+former|the\s+latter|the\s+first|the\s+second|the\s+same)\b/i;

function isShortReply(text: string): boolean {
  return text.trim().split(/\s+/).length <= 8;
}

function matchesOption(userText: string, options: string[]): string | null {
  const norm = userText.toLowerCase().trim();
  for (const opt of options) {
    const optNorm = opt.toLowerCase().trim();
    if (norm === optNorm || norm.includes(optNorm) || optNorm.includes(norm)) {
      return opt;
    }
  }
  return null;
}

function extractReferentFromQuestion(question: string): string | null {
  // "Would it help to walk through one real example?" → "walk through one real example"
  const actionRe =
    /\b(walk through|explore|look at|discuss|go deeper into|examine|try|do)\s+([\w\s]{3,50})/i;
  const actionMatch = question.match(actionRe);
  if (actionMatch) return actionMatch[0].trim();

  // "Is this about the design?" → "the design"
  const nounRe = /(the|a|an|this|that|your|our|these)\s+([\w\s]{2,30})\??$/i;
  const nounMatch = question.match(nounRe);
  if (nounMatch) return nounMatch[0].replace(/\??$/, '').trim();

  return null;
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Resolves turn state from the last 2–4 turns + the current user message.
 * Pass in recentTurns in chronological order (oldest first).
 */
export function resolveConversationState(
  recentTurns: Turn[],
  currentUserMessage: string,
): ConversationState {
  const state: ConversationState = {
    userLikelyAnsweredPriorQuestion: false,
    shouldAdvanceThread: false,
    shouldClarify: false,
    selectedOption: null,
    localReferent: null,
  };

  if (!currentUserMessage?.trim()) return state;

  const userText = currentUserMessage.trim();
  const short = isShortReply(userText);

  // Find the most recent assistant turn
  const lastAssistant = [...recentTurns].reverse().find((t) => t.role === 'assistant');
  if (!lastAssistant) return state;

  const lastQuestion = findLastQuestion(lastAssistant.content);

  // ── Rule 3 (pronoun resolution) — works even if no prior question ──────────
  if (short && REFERENTIAL_RE.test(userText)) {
    const ref = lastQuestion
      ? extractReferentFromQuestion(lastQuestion)
      : null;
    if (ref) {
      state.localReferent = ref;
      state.userLikelyAnsweredPriorQuestion = true;
      state.shouldAdvanceThread = true;
      state.shouldClarify = false;
    }
  }

  if (!lastQuestion) return state;

  const { type, options } = detectQuestionType(lastQuestion);
  state.lastAssistantQuestionType = type;
  state.lastAssistantOptions = options;

  // ── Rule 1: yes/no question + affirmative/negative reply ──────────────────
  if (type === 'yes_no' && short) {
    if (AFFIRMATIVE_RE.test(userText)) {
      state.userLikelyAnsweredPriorQuestion = true;
      state.shouldAdvanceThread = true;
      state.shouldClarify = false;
      if (!state.localReferent) {
        state.localReferent = extractReferentFromQuestion(lastQuestion);
      }
    } else if (NEGATIVE_RE.test(userText)) {
      state.userLikelyAnsweredPriorQuestion = true;
      state.shouldAdvanceThread = true;
      state.shouldClarify = false;
    }
  }

  // ── Rule 2: either/or question + user picks an option ────────────────────
  if (type === 'either_or' && short) {
    const match = matchesOption(userText, options);
    if (match) {
      state.userLikelyAnsweredPriorQuestion = true;
      state.selectedOption = match;
      state.shouldAdvanceThread = true;
      state.shouldClarify = false;
    } else if (/\bboth\b/i.test(userText)) {
      state.userLikelyAnsweredPriorQuestion = true;
      state.selectedOption = 'both';
      state.shouldAdvanceThread = true;
      state.shouldClarify = false;
    } else if (AFFIRMATIVE_RE.test(userText)) {
      // "yes" to an either/or — ambiguous but treat as answered
      state.userLikelyAnsweredPriorQuestion = true;
      state.shouldAdvanceThread = true;
      state.shouldClarify = false;
    }
  }

  // ── Rule 4: if answered → block unnecessary clarification ────────────────
  if (state.userLikelyAnsweredPriorQuestion) {
    state.shouldClarify = false;
  }

  return state;
}

// ─── Prompt hint builder ─────────────────────────────────────────────────────

/**
 * Produces a small injection block for the system prompt.
 * Returns null if there is nothing structurally notable about this turn.
 */
export function buildStateHint(state: ConversationState): string | null {
  if (
    !state.userLikelyAnsweredPriorQuestion &&
    !state.selectedOption &&
    !state.localReferent
  ) {
    return null;
  }

  const lines: string[] = ['# Turn Context'];

  if (state.selectedOption && state.selectedOption !== 'both') {
    lines.push(
      `The user selected: "${state.selectedOption}". Advance the conversation from that choice. Do not ask what they meant.`,
    );
  } else if (state.selectedOption === 'both') {
    lines.push(
      `The user chose both options. Address both threads. Do not ask which they meant.`,
    );
  } else if (state.lastAssistantQuestionType === 'yes_no' && state.userLikelyAnsweredPriorQuestion) {
    if (state.localReferent) {
      lines.push(
        `The user agreed to: "${state.localReferent}". Proceed directly — do not re-ask or restate the question.`,
      );
    } else {
      lines.push(
        `The user answered your question. Proceed — do not re-ask or wonder what they meant.`,
      );
    }
  } else if (state.localReferent) {
    lines.push(
      `"${state.localReferent}" is the active referent in this turn. Treat it as already established context.`,
    );
  }

  if (state.shouldAdvanceThread) {
    lines.push(`Advance the thread. Do not loop back to ask what was just confirmed.`);
  }

  return lines.join('\n');
}
