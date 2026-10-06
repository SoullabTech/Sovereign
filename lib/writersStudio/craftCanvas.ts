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
    'Show me two or three illustrative ways the craft move we discussed could work in this exact passage.',
    'Treat these as examples to spark my own version — not recommendations, not finished prose, and not something to apply.',
    'Make each example genuinely different in craft approach, and explain briefly what it demonstrates.',
    'Stay close to my voice, meaning, imagery, rhythm, and writer-established intentions.',
    'Do not silently turn an example into a proposal. I will write or choose the actual wording.',
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
