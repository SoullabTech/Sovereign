// backend: lib/consciousness/maiaFallbacks.ts

/**
 * Core conventions for MAIA's "something went wrong" moments:
 * - Calm, non-dramatic, no "consciousness system" language
 * - Reassure the member it's not their fault
 * - Invite a small, simple next move
 */
export function buildTimeoutFallback(_input: string): string {
  const variants = [
    // Simple, direct
    `I'm having trouble responding right now. Could you try asking that in a different way?`,

    // Slightly more conversational
    `Something isn't working on my end. You didn't do anything wrong. Want to try rephrasing what you shared?`,

    // Brief acknowledgment
    `I'm not able to respond to that right now. Could you share the main thing you want to explore?`
  ];

  const index = Math.floor(Math.random() * variants.length);
  return variants[index];
}

/**
 * Emergency fallback for total system failures - keeps MAIA's voice even in worst case
 */
export function buildEmergencyFallback(): string {
  const variants = [
    `I'm having technical issues right now and need to pause. You didn't do anything wrong. Please try again in a moment.`,

    `Something isn't working properly on my end right now. This isn't about anything you did. Could you try again in a minute?`,

    `I need to restart to keep our conversation working. You haven't done anything wrong. Give me a moment and then try again.`
  ];

  const index = Math.floor(Math.random() * variants.length);
  return variants[index];
}