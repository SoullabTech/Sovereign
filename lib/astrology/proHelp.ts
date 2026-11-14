/**
 * "How do I…?" — MAIA's chartless help inside Astrology Pro
 * (ASTRO-PRO-MAIA-GUIDE-R2; spec ASTRO-PRO-MAIA-GUIDE-01 §4 route H1,
 * founder ruling D-03 A, 2026-11-12).
 *
 * The help mode answers questions about the workstation itself: where a
 * control is, what a tool does, how saving and sharing work, how figures are
 * calculated and their declared limits, and techniques in general. Its privacy
 * property is structural: the request carries only the question and the
 * earlier Help turns of this visit. No chart, birth details or member memories
 * are automatically loaded. Typed questions can nevertheless contain personal
 * details; those details are sent to the AI provider as part of the question.
 *
 * ⛔ One guide: the controls come from `proGuideInstruction()` (proGuide.ts).
 * Do not keep a second list here.
 */
import { proGuideInstruction } from './proGuide';

/** The only fields the help endpoint accepts. Anything else is refused. */
export const PRO_HELP_KEYS = ['question', 'history'] as const;
/** The only fields of one earlier turn. */
export const PRO_HELP_TURN_KEYS = ['q', 'a'] as const;

/** The system prompt for a help question. It takes no chart, no facts and no memory, by signature. */
export function proHelpSystemPrompt(where: { continuing?: boolean } = {}): string {
  const memory = where.continuing
    ? '- Earlier Help turns were supplied by the browser with this request. Build on them without repeating yourself. This endpoint does not write MAIA member memory; do not claim the AI provider has zero retention.'
    : '- No earlier Help turns were supplied. This endpoint does not write MAIA member memory; do not claim the AI provider has zero retention.';
  return `You are MAIA, an AI companion in Soullab, speaking with a professional astrologer in their own workspace. They have asked how something here works. You are MAIA, not the astrologer and not a person.

THIS MODE READS NO CHART:
- In this mode no chart, structured chart facts or stored MAIA memories are automatically loaded. A user may type personal details into the question; do not mistake these for authorized chart access or claim to read a chart.
- If they ask about a particular chart (theirs or a client's), say that in this mode you read no chart, and that with a chart open they can choose Ask to read it together or Mentor to learn a technique with the chart as an example.
- Never ask for, repeat or infer a client's name or birth details.
- You may teach astrology in general (what a technique is, how it is calculated, how schools differ) without reference to any one chart.
- Astrology Pro is a restricted preview by invitation. Never suggest that anyone can sign up for it, buy it, or will receive it, and do not promise features that are not in the list below.

HOW YOU SPEAK:
- Plain text only — no headings, bullet lists or markdown. Keep to a few short paragraphs (under about 200 words). When the answer is a path, give it as the astrologer will click it, for example: Timing, then the Progressions tab.
- Do not give medical, psychological, legal or financial advice.
- If the question shows distress about a real person's safety, say you are not a crisis service and encourage reaching a person who can help.
${memory}

${proGuideInstruction()}`;
}

/** Scope identity used as a React key: changing member, chart, close or method resets Help. */
export function helpConversationScope(input: {
  memberId: string | null;
  chartOpen: boolean;
  subjectId: string | null;
  sourceRevision: string | null;
  houseSystem: string;
}): string {
  return JSON.stringify([
    input.memberId, input.chartOpen,
    input.chartOpen ? (input.subjectId ?? 'own') : null,
    input.chartOpen ? input.sourceRevision : null,
    input.houseSystem,
  ]);
}

/** Only the current mounted request can append a reply. */
export class HelpRequestGate {
  private epoch = 0;
  private mounted = true;
  begin(): number { this.epoch += 1; return this.epoch; }
  invalidate(): void { this.epoch += 1; }
  close(): void { this.mounted = false; this.invalidate(); }
  reset(): void { this.mounted = true; }
  accepts(requestId: number): boolean { return this.mounted && requestId === this.epoch; }
}

export const PRO_HELP_PRIVACY_NOTICE =
  'MAIA does not automatically load a chart or saved MAIA memories in this mode. ' +
  'Your question and up to eight previous Help exchanges are sent to the AI provider. ' +
  'Anything you type, including names or birth details, is included. ' +
  'This feature does not save Help exchanges as MAIA memory. Clear removes them from this page, ' +
  'but cannot undo AI-provider processing already completed. MAIA is an AI, not the astrologer.';
