/**
 * Response Thread Check
 *
 * Validates an assistant draft before it is sent. Catches the most common
 * thread-drop failure modes: re-asking answered questions, topic resets,
 * and missed correction signals.
 *
 * If validation fails, the caller should: log the failure, append a stricter
 * repair instruction to the system prompt, and regenerate once only.
 */

export type ThreadIssue = 'reask' | 'topic_reset' | 'generic_shift' | 'missed_correction';

export type ResponseThreadCheckResult = {
  passes: boolean;
  failureReasons: string[];
  detectedIssues: ThreadIssue[];
};

// Question patterns in assistant draft
const QUESTION_PATTERNS = [
  /what (?:is|are|was|were|do|does|did|has|have|had) (?:your|the|a|an)/i,
  /can you (?:tell|share|describe|explain)/i,
  /could you (?:tell|share|describe|explain)/i,
  /what (?:do|did|does) you (?:mean|think|feel|want|need)/i,
  /tell me (?:more about|about)/i,
  /how (?:do|did|does) you/i,
];

// Topic-reset language (MAIA switching frames without user request)
const TOPIC_RESET_PATTERNS = [
  /let(?:'s| us) (?:start|begin|try) (?:fresh|over|again|from)/i,
  /going back to basics/i,
  /starting from scratch/i,
  /let me ask you a different question/i,
];

// Generic non-responsive language (deflection without advancement)
const GENERIC_SHIFT_PATTERNS = [
  /^(?:interesting|fascinating|that's interesting|what an interesting)/i,
  /(?:there are many ways|it depends on|it's complicated|it's complex)/i,
];

/**
 * Extract the substance of questions in a text.
 * Returns an array of the noun/verb chunks that were asked about.
 */
function extractQuestionSubjects(text: string): string[] {
  const subjects: string[] = [];
  const lines = text.split(/[.!?]/);
  for (const line of lines) {
    for (const pattern of QUESTION_PATTERNS) {
      if (pattern.test(line)) {
        // Grab the question core (simplified: just log the line)
        subjects.push(line.trim().toLowerCase().slice(0, 60));
        break;
      }
    }
  }
  return subjects;
}

/**
 * Check whether a question was already answered in recent user turns.
 * Heuristic: if the question subject words appear in a prior user turn, it was answered.
 */
function questionAlreadyAnswered(
  questionSubject: string,
  recentUserTurns: string[]
): boolean {
  const subjectWords = questionSubject
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length >= 4);

  if (subjectWords.length === 0) return false;

  for (const turn of recentUserTurns) {
    const turnLower = turn.toLowerCase();
    // If 2+ significant words from the question appear in a prior turn, it was answered
    const matchCount = subjectWords.filter(w => turnLower.includes(w)).length;
    if (matchCount >= 2) return true;
  }
  return false;
}

/**
 * Validate an assistant draft against the active thread and recent conversation.
 *
 * @param args.activeThread - One-sentence description of the active thread
 * @param args.assistantDraft - The draft response to validate
 * @param args.latestUserMessage - The user's most recent message
 * @param args.recentTurns - Last 3–5 conversation turns
 * @param args.hadCorrectionSignal - Whether a correction signal was detected in user input
 */
export function validateResponseAgainstActiveThread(args: {
  activeThread: string;
  assistantDraft: string;
  latestUserMessage: string;
  recentTurns: Array<{ role: string; content: string }>;
  hadCorrectionSignal?: boolean;
}): ResponseThreadCheckResult {
  const { assistantDraft, recentTurns, hadCorrectionSignal } = args;

  const failureReasons: string[] = [];
  const detectedIssues: ThreadIssue[] = [];

  const recentUserTurns = recentTurns
    .filter(t => t.role === 'user')
    .slice(-3)
    .map(t => t.content);

  // --- Check 1: Re-ask ---
  // Draft asks something the user already answered
  const questionSubjects = extractQuestionSubjects(assistantDraft);
  for (const subject of questionSubjects) {
    if (questionAlreadyAnswered(subject, recentUserTurns)) {
      failureReasons.push(`Draft re-asks something already answered: "${subject}"`);
      if (!detectedIssues.includes('reask')) detectedIssues.push('reask');
    }
  }

  // --- Check 2: Topic reset ---
  for (const pattern of TOPIC_RESET_PATTERNS) {
    if (pattern.test(assistantDraft)) {
      failureReasons.push('Draft contains topic-reset language without user initiating it.');
      if (!detectedIssues.includes('topic_reset')) detectedIssues.push('topic_reset');
      break;
    }
  }

  // --- Check 3: Generic shift ---
  for (const pattern of GENERIC_SHIFT_PATTERNS) {
    if (pattern.test(assistantDraft)) {
      failureReasons.push('Draft opens with generic deflection instead of threading the active topic.');
      if (!detectedIssues.includes('generic_shift')) detectedIssues.push('generic_shift');
      break;
    }
  }

  // --- Check 4: Missed correction ---
  // If the user sent a correction signal, the draft must reference what was said
  if (hadCorrectionSignal) {
    const draftLower = assistantDraft.toLowerCase();
    const connectsToThread =
      draftLower.includes('you said') ||
      draftLower.includes('you mentioned') ||
      draftLower.includes('you were') ||
      draftLower.includes('going back') ||
      draftLower.includes('what you said') ||
      draftLower.includes('picking up') ||
      draftLower.includes('returning to');
    if (!connectsToThread) {
      failureReasons.push('Correction signal present but draft does not reconnect to the thread.');
      if (!detectedIssues.includes('missed_correction')) detectedIssues.push('missed_correction');
    }
  }

  return {
    passes: failureReasons.length === 0,
    failureReasons,
    detectedIssues,
  };
}

/** Build the stricter repair instruction to prepend on retry */
export function buildRepairInstruction(result: ResponseThreadCheckResult): string {
  const lines = [
    '\n\nRESPONSE REPAIR REQUIRED',
    'Your previous draft failed thread validation for these reasons:',
    ...result.failureReasons.map(r => `- ${r}`),
    '',
    'In your next response:',
    '- Do not ask any questions that have already been answered.',
    '- Do not reset the topic or open with deflection.',
    '- If a correction signal was detected, explicitly reconnect to what the user said.',
    '- Advance the conversation forward; do not start over.',
  ];
  return lines.join('\n');
}
