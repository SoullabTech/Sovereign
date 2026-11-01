/**
 * WRITERS-STUDIO-SEMANTIC-FIELD-01 — tester journey field (client-safe).
 *
 * Founder ruling 2026-11-01: the first wave is the five experience questions of
 * the design note §3.1, as written. Questions live here, versioned by git; the
 * table stores only a prompt key. Retire a prompt by setting `retiredAt`, never
 * by deleting it — earlier answers must stay readable to the writer.
 */

export interface JourneyPrompt {
  key: string;
  wave: number;
  text: string;
  /** Optional closed choices; the writer may always answer in their own words. */
  choices?: readonly { key: string; label: string }[];
  retiredAt?: string;
}

export const JOURNEY_PROMPTS: readonly JourneyPrompt[] = [
  {
    key: 'edit_felt_like_mine',
    wave: 1,
    text: 'When you asked MAIA to change something in your own words, did what came back feel like your writing?',
    choices: [
      { key: 'yes', label: 'Yes' },
      { key: 'partly', label: 'Partly' },
      { key: 'no', label: 'No' },
      { key: 'not_tried', label: 'I haven’t tried yet' },
    ],
  },
  {
    key: 'navigation_asked',
    wave: 1,
    text: 'Could you ask MAIA to take you somewhere in your book — and did she?',
    choices: [
      { key: 'yes', label: 'Yes' },
      { key: 'partly', label: 'Partly' },
      { key: 'no', label: 'No' },
      { key: 'not_tried', label: 'I haven’t tried yet' },
    ],
  },
  {
    key: 'learning_understood',
    wave: 1,
    text: 'Did MAIA help you understand something about your writing that you didn’t before?',
    choices: [
      { key: 'yes', label: 'Yes' },
      { key: 'partly', label: 'Partly' },
      { key: 'no', label: 'No' },
      { key: 'not_tried', label: 'I haven’t tried yet' },
    ],
  },
  {
    key: 'studio_method_asked',
    wave: 1,
    text: 'When you weren’t sure how to do something in the Studio, did you ask MAIA? What happened?',
  },
  {
    key: 'stuck_learning_machine',
    wave: 1,
    text: 'Where did you get stuck, or stop, or feel you had to learn the machine instead of write?',
  },
];

export const JOURNEY_ANSWER_MAX = 2000;

export const COLAB_KINDS = ['problem', 'question', 'suggestion'] as const;
export type ColabKind = typeof COLAB_KINDS[number];
export const COLAB_KIND_LABEL: Record<ColabKind, string> = {
  problem: 'Problem',
  question: 'Question',
  suggestion: 'Suggestion',
};

export function isColabKind(value: unknown): value is ColabKind {
  return typeof value === 'string' && (COLAB_KINDS as readonly string[]).includes(value);
}

export function activePrompt(key: unknown): JourneyPrompt | null {
  if (typeof key !== 'string') return null;
  const prompt = JOURNEY_PROMPTS.find((p) => p.key === key);
  return prompt && !prompt.retiredAt ? prompt : null;
}

export function promptByKey(key: string): JourneyPrompt | null {
  return JOURNEY_PROMPTS.find((p) => p.key === key) ?? null;
}

export type AnswerInputRefusal = 'unknown_prompt' | 'bad_choice' | 'empty' | 'too_long';

/** Validates a writer's answer. A choice alone is not an answer: words are required. */
export function validateAnswerInput(input: {
  promptKey: unknown; choice?: unknown; answer: unknown;
}): { ok: true; promptKey: string; choice: string | null; answer: string }
  | { ok: false; refusal: AnswerInputRefusal } {
  const prompt = activePrompt(input.promptKey);
  if (!prompt) return { ok: false, refusal: 'unknown_prompt' };
  let choice: string | null = null;
  if (input.choice !== undefined && input.choice !== null && input.choice !== '') {
    if (!prompt.choices?.some((c) => c.key === input.choice)) return { ok: false, refusal: 'bad_choice' };
    choice = input.choice as string;
  }
  const answer = typeof input.answer === 'string' ? input.answer.trim() : '';
  if (!answer) return { ok: false, refusal: 'empty' };
  if (answer.length > JOURNEY_ANSWER_MAX) return { ok: false, refusal: 'too_long' };
  return { ok: true, promptKey: prompt.key, choice, answer };
}

/** What a writer's own answer looks like on the wire. */
export interface JourneyAnswer {
  id: string;
  promptKey: string;
  choice: string | null;
  answer: string;
  supersedes: string | null;
  withdrawnAt: string | null;
  colabKind: ColabKind | null;
  colabSharedAt: string | null;
  colabStillShared: boolean;
  createdAt: string;
}

/** The founder's view adds who wrote it (founder ruling: answers are attributed). */
export interface JourneyAnswerForFounder extends JourneyAnswer {
  memberName: string;
}

/** The text posted to the Beta Co-Lab: the writer's chosen kind and words, nothing else. */
export function colabMessageBody(kind: ColabKind, promptKey: string, answer: string): string {
  const prompt = promptByKey(promptKey);
  const heading = `${COLAB_KIND_LABEL[kind]} · from the Writer’s Studio beta journey`;
  return prompt ? `${heading}\n“${prompt.text}”\n\n${answer}` : `${heading}\n\n${answer}`;
}
