/**
 * Answer choices (founder direction 2026-11-05: "yes that would be good").
 *
 * When MAIA ends a reply with a question that has two or three clear answers, she may offer
 * them as short buttons so the writer can answer in one click instead of typing. MAIA carries
 * the complexity; the writer just picks.
 *
 * ⛔ A choice is only words. Clicking sends EXACTLY the button's text as the writer's reply —
 *    nothing hidden, nothing added. The writer can always type something else instead.
 * ⛔ At most three, each short; anything longer or beyond three is dropped, never shown.
 * ⛔ The markers are stripped from every surface that shows MAIA's words.
 */

export const ANSWER_MARKER = /\[\[answer:([^\]\n]{0,80})\]\]/g;
const MAX_CHOICES = 3;
const MAX_LENGTH = 48;

export type AnsweredReply = { readonly text: string; readonly choices: readonly string[] };

export function parseAnswerChoices(body: string): AnsweredReply {
  const choices: string[] = [];
  const text = body.replace(ANSWER_MARKER, (_m, raw: string) => {
    const choice = raw.replace(/\s+/g, ' ').trim();
    if (choice && choice.length <= MAX_LENGTH && choices.length < MAX_CHOICES && !choices.includes(choice)) {
      choices.push(choice);
    }
    return '';
  }).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return { text, choices };
}

export function stripAnswerChoices(body: string): string {
  return body.replace(ANSWER_MARKER, '');
}

/** What MAIA is told, on surfaces that show the buttons. */
export function answerChoicesInstruction(): string {
  return [
    'OFFERING ANSWER CHOICES',
    'When you end with a question that has two or three clear, distinct answers, you may add one marker per answer, each on its own line after your reply, like [[answer: Drop the label]].',
    'Write each as the writer would say it, in a few plain words (no more than six). The writer can click one to send exactly those words as their reply, or type their own.',
    'Use this only for a closed question; never for an open one, never more than three, and never put anything in a choice except the answer itself.',
  ].join('\n');
}
