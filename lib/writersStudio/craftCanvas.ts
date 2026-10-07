export const CRAFT_CANVAS_ACTIONS = {
  enter: 'Work this into the writing →',
  choosePassage: 'Choose the passage you want to shape',
  examples: 'Examples to spark your own version',
  working: 'Your working version',
} as const;

export function craftPrimerPrompt(): string {
  return [
    'We are moving from understanding into making.',
    'Use the carried Work conversation as context for what the writer is trying to accomplish.',
    'Begin with a brief craft primer: name two or three genuinely different ways the move we discussed could work in this exact passage.',
    'Then create ONE provisional demonstration version of this exact passage so the writer can see the craft move directly on the marked manuscript.',
    'The demonstration is an example, not a recommendation and not finished prose. Say that plainly in the reply.',
    'Keep the demonstration close to the writer’s voice, meaning, imagery, rhythm, and established intentions. Use the smallest sufficient intervention.',
    'Do not apply anything. The writer may take some changes, reject all of them, alter them, or write something entirely different.',
  ].join('\n');
}

export function craftRefinementPrompt(workingText: string, request: string): string {
  return [
    'This is my current working version. Treat these words as the authority now:',
    workingText,
    '',
    'What I want from you:',
    request,
    '',
    'Help this version carry my meaning more cleanly. Do not pull it back toward an earlier MAIA example simply because you wrote that example.',
    'If you offer wording, keep it bounded and explain what it changes. Nothing is applied automatically.',
  ].join('\n');
}
