import {
  RELATIONSHIP_FIRST_DIRECTIVE,
  RELATIONAL_UPDATE_DIRECTIVE,
  engagementInstruction,
  explanationInstruction,
  paceInstruction,
} from '@/lib/writersStudio/workingStyle';
import {
  renderChapterConversationContext,
  type ChapterConversationContext,
} from './chapterConversationContext';

export const R8M_FIRST_TURN = [
  'I want to think with you about what may need strengthening in Chapter 10.',
  'We are in Witness posture, Intimate pace, Plain language.',
  'Begin by reflecting what is already carrying this chapter, then ask me ONE genuine question before suggesting any change.',
  'Use the book context you actually have. Do not ask me to explain an intention that the writer-established context already states.',
  'Do not give me a checklist, scorecard, or report.',
].join('\n');

export const R8M_WRITER_CLARIFICATION = [
  'Yes. The recurrence is intentional. I want the elements to return as living movements, almost ceremonially, because a spiral returns without returning to exactly the same place.',
  'What I care about is not eliminating repetition. I want to know where the return deepens the reader’s experience and where it merely repeats explanation.',
].join('\n');

export function r8mSystemFor(packet: ChapterConversationContext): string {
  return [
    'You are being qualified as a possible cognitive engine inside MAIA, Writer’s Studio.',
    'This is a controlled editorial/relational test. The packet below is the entire lawful context for this test.',
    'Never pretend you read prose that is not in the packet. Never discard context the packet does establish.',
    '',
    RELATIONSHIP_FIRST_DIRECTIVE,
    engagementInstruction('witness'),
    paceInstruction('intimate'),
    explanationInstruction('plain'),
    RELATIONAL_UPDATE_DIRECTIVE,
    '',
    'SPECIAL QUALIFICATION LAW:',
    'This is the final numbered chapter before the Conclusion. Whole-book position matters.',
    'The writer has already declared that intentional spiral return matters. Do not ask whether repetition was intentional as though that were unknown.',
    'A useful question should arise from a real unresolved tradeoff in the packet.',
    'Do not use headings, bullets, score language, or multiple recommendations. A few sentences is enough.',
    '',
    renderChapterConversationContext(packet),
  ].join('\n');
}

export const r8mMechanicalSignals = (text: string) => ({
  chars: text.length,
  questionMarks: (text.match(/\?/g) ?? []).length,
  hasBullets: /(^|\n)\s*[-*•]\s+/m.test(text),
  mentionsFinalPosition: /final (numbered )?chapter|before the conclusion|conclusion/i.test(text),
  recognizesIntentionalReturn: /intentional|ceremon|spiral return|return.*deepen|recurrence/i.test(text),
  reportLanguage: /scorecard|minimal path|recommendations|diagnostic|finding(s)?\b/i.test(text),
});
