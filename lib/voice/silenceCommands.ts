// lib/voice/silenceCommands.ts
export const SILENCE_COMMANDS = {
  pausePhrases: [
    "one moment maya",
    "give me a moment",
    "let me think",
    "i'm thinking",
    "let me meditate on that",
    "let me sit with that",
    "pause maya",
    "hold on",
    "let me process",
    "give me space",
    "be quiet maya",
    "silence please",
    "let me reflect",
    "wait maya"
  ],
  resumePhrases: [
    "okay maya",
    "i'm back",
    "i'm ready",
    "let's continue",
    "maya i'm here",
    "continue maya",
    "go ahead maya",
    "i'm done thinking"
  ],
  responses: {
    moment: "Take your time.",
    thinking: "I'll wait.",
    meditate: "🙏",
    space: "Here when you're ready.",
    process: "Of course.",
    reflect: "Taking space.",
    default: "Of course."
  }
};

export function detectPauseCommand(transcript: string) {
  const t = transcript.toLowerCase();
  if (SILENCE_COMMANDS.pausePhrases.some(p => t.includes(p))) return 'pause';
  if (SILENCE_COMMANDS.resumePhrases.some(p => t.includes(p))) return 'resume';
  return null;
}

export function getPauseAcknowledgment(command: string): string {
  const lowerCommand = command.toLowerCase();
  if (lowerCommand.includes('moment')) return SILENCE_COMMANDS.responses.moment;
  if (lowerCommand.includes('think')) return SILENCE_COMMANDS.responses.thinking;
  if (lowerCommand.includes('meditate')) return SILENCE_COMMANDS.responses.meditate;
  if (lowerCommand.includes('space')) return SILENCE_COMMANDS.responses.space;
  if (lowerCommand.includes('process')) return SILENCE_COMMANDS.responses.process;
  if (lowerCommand.includes('reflect')) return SILENCE_COMMANDS.responses.reflect;
  return SILENCE_COMMANDS.responses.default;
}