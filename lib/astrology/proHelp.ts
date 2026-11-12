/**
 * "How do I…?" — MAIA's chartless help inside Astrology Pro
 * (ASTRO-PRO-MAIA-GUIDE-R2; spec ASTRO-PRO-MAIA-GUIDE-01 §4 route H1,
 * founder ruling D-03 A, 2026-11-12).
 *
 * The help mode answers questions about the workstation itself: where a
 * control is, what a tool does, how saving and sharing work, how figures are
 * calculated and their declared limits, and techniques in general. Its privacy
 * property is structural: the request carries only the question and the
 * earlier turns of this visit, so there is no field that can carry a chart, a
 * name, birth details or anything kept with MAIA, and this prompt is built from
 * the guide alone.
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
    ? '- The earlier questions and answers of this visit are in the conversation: build on them and do not repeat yourself. Nothing is kept after the visit.'
    : '- Nothing is remembered between visits.';
  return `You are MAIA, an AI companion in Soullab, speaking with a professional astrologer in their own workspace. They have asked how something here works. You are MAIA, not the astrologer and not a person.

THIS MODE READS NO CHART:
- In this mode you are given no chart, no chart facts, no names, no birth details and nothing the astrologer has kept with you. Do not describe, guess at or read any chart.
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
