/**
 * Active Theme Block — Oracle Prompt Injection
 *
 * Builds a subtle prompt block from the currently active weekly theme.
 * Injected into finalSystemPrompt when the promptLibrary flag is enabled.
 *
 * Design principles:
 * - Background orientation, not a script
 * - MAIA should feel more alive, not more programmatic
 * - Never mention "this week's theme" to the member
 * - Never force prompts — follow the conversation
 * - One prompt per response maximum, and only when organic
 */

import { getActiveTheme, type ThemeWithItems } from '@/lib/maia/prompt-library';

/**
 * Build the active theme prompt block for oracle injection.
 * Returns null if no active theme or if loading fails.
 *
 * Call this once per oracle request (the result is cached per request).
 */
export async function buildActiveThemeBlock(): Promise<{ block: string; theme: ThemeWithItems } | null> {
  const theme = await getActiveTheme();
  if (!theme || theme.items.length === 0) return null;

  const elementLabel = theme.element
    ? `${theme.element.charAt(0).toUpperCase() + theme.element.slice(1)}${theme.refinement_phase ? ` / ${theme.refinement_phase}` : ''}`
    : 'General';

  const promptLines = theme.items
    .map((item) => `- [${item.prompt_type}] ${item.prompt_text}`)
    .join('\n');

  const block = `
## Active Elemental Theme — ${theme.title}

Element: ${elementLabel}
${theme.chapter_ref ? `Source: ${theme.chapter_ref}\n` : ''}
Orientation: ${theme.orientation}

When the member's conversation naturally touches on themes related to this elemental territory, you may draw from one of these reflection prompts — but only when organically relevant:

${promptLines}

CRITICAL INSTRUCTIONS FOR THIS THEME:
1. This is a background orientation. Do NOT mention "this week's theme" or "the current activation" to the member.
2. Do NOT force these prompts into the conversation. If the member is talking about something else, follow them.
3. Use at most ONE prompt per response, and only when it genuinely serves what the member is exploring.
4. You may paraphrase or adapt a prompt to fit the conversational moment — these are not scripts.
5. The theme should make your responses feel subtly more alive and attuned, not more programmatic.
6. If the member is in crisis, distress, or acute difficulty — ignore this theme entirely. Presence first.
`.trim();

  return { block, theme };
}
