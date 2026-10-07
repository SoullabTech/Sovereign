export const CRAFT_CANVAS_ACTIONS = {
  enter: 'Work this into the writing →',
  choosePassage: 'Choose the passage you want to shape',
  examples: 'Examples to spark your own version',
  working: 'Your working version',
} as const;

/**
 * Canonical first act on the Craftsman's Table.
 *
 * This is patterned on the Elemental Alchemy case study: understand what the
 * writer is trying to accomplish, protect what is already carrying it, offer a
 * small field of possibilities, and demonstrate one bounded move in the copy.
 * The demonstration teaches craft; it does not replace authorship.
 */
export function craftPrimerPrompt(suggestWording = true): string {
  if (!suggestWording) {
    return [
      'We have arrived at the exact passage from our conversation.',
      'Keep the carried writer intention, question, and protected language in view; do not ask the writer to explain them again.',
      'The writer has chosen to receive wording suggestions only when requested.',
      'Briefly connect the passage to what we just discovered and describe one useful craft move in ordinary language, without supplying replacement wording.',
      'Stay ready to help the writer compose, request examples, or ask for a suggestion here. Nothing is applied automatically.',
    ].join('\n');
  }
  return [
    'We are moving from understanding into making on the Craftsman’s Table.',
    'Use the carried conversation as context for what the writer is trying to accomplish. Do not make the writer explain it again.',
    '',
    'Begin in ordinary language with three brief things:',
    '1. What you understand the writer is trying to make the reader experience here.',
    '2. What is already working in this exact passage and should be protected.',
    '3. The smallest place where the current wording may be keeping that intention from fully landing.',
    '',
    'Then name two or three genuinely different craft moves that could address that local friction. Describe the intention of each move before showing wording. Do not rank them.',
    '',
    'After that, create ONE provisional demonstration version of this exact passage so the writer can see one move directly on the marked manuscript.',
    'The demonstration is an example, not a recommendation and not finished prose. Say that plainly.',
    '',
    'Use the smallest sufficient intervention. Preserve the writer’s voice, meaning, worldview, rhythm, imagery, vocabulary, established metaphors, and intentional ambiguity unless the writer explicitly asks to change one of them.',
    'Do not standardize, flatten, professionalize, or smooth merely because an alternative is more conventional.',
    'If the best editorial judgment is to leave a sentence alone, say so.',
    '',
    'For the demonstrated move, explain briefly:',
    '- what changed;',
    '- why you tried it;',
    '- what it may gain;',
    '- what it could cost;',
    '- what you deliberately protected.',
    '',
    'Treat any reader effect as a hypothesis. Do not claim what a reader will feel.',
    'Nothing is to be applied automatically. The writer may take one change, reject another, ask for alternatives, write a hybrid, or keep the original.',
  ].join('\n');
}

export function craftRefinementPrompt(workingText: string, request: string): string {
  return [
    'This is the writer’s current working version. It may combine original wording, selected MAIA moves, and the writer’s own new language. Treat these words as the authority now:',
    workingText,
    '',
    'What the writer wants from you:',
    request,
    '',
    'Respond to the writer’s intention before editing.',
    'Preserve what is already working. Use the smallest useful intervention first.',
    'Do not pull the passage back toward an earlier MAIA proposal simply because MAIA wrote that proposal.',
    'If more than one path is plausible, offer two or three genuinely different possibilities rather than presenting one answer as inevitable.',
    'If you offer wording, keep it bounded to the active locus and explain what it changes, what it protects, and what might be lost.',
    'Treat reader effects as hypotheses. Nothing is applied automatically.',
  ].join('\n');
}
