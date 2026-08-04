/**
 * Lab intent grouping
 *
 * My Lab's primary organisation is the member's moment ("I need to feel
 * different"), not the builder's taxonomy ("somatic"). The intent vocabulary
 * is NOT invented here -- it is the SimpleMode layer already authored in
 * config/toolRegistry.ts, which the dashboard previously never surfaced.
 *
 * Domain (somatic / cognitive / ...) remains available as a secondary browse
 * view. It is a way to look, not the way in.
 */

import {
  SIMPLE_MODE_MAP,
  SIMPLE_MODE_META,
  type LabTool,
  type SimpleMode,
} from '@/config/toolRegistry';

/** Order the doors are presented in. */
export const INTENT_ORDER: SimpleMode[] = ['shift', 'notice', 'act-group'];

/**
 * Member-facing question each door answers.
 *
 * SIMPLE_MODE_META already carries first-person descriptions; these are the
 * short door labels that sit above them. Kept here rather than in the
 * registry so copy changes to the Lab surface do not edit the tool registry.
 */
export const INTENT_PROMPT: Record<SimpleMode, string> = {
  shift: 'Settle or shift how I feel',
  notice: 'Understand what is going on',
  'act-group': 'Do something or reach someone',
};

/** Does this tool belong behind the given intent door? */
export function toolMatchesIntent(
  tool: Pick<LabTool, 'modes'>,
  intent: SimpleMode
): boolean {
  if (!tool.modes || tool.modes.length === 0) return false;
  const modes = SIMPLE_MODE_MAP[intent];
  return tool.modes.some((m) => modes.includes(m));
}

/** Tools behind a given door, preserving input order. */
export function toolsForIntent<T extends Pick<LabTool, 'modes'>>(
  tools: T[],
  intent: SimpleMode
): T[] {
  return tools.filter((t) => toolMatchesIntent(t, intent));
}

/** How many of these tools sit behind each door. */
export function intentCounts<T extends Pick<LabTool, 'modes'>>(
  tools: T[]
): Record<SimpleMode, number> {
  return {
    shift: toolsForIntent(tools, 'shift').length,
    notice: toolsForIntent(tools, 'notice').length,
    'act-group': toolsForIntent(tools, 'act-group').length,
  };
}

export { SIMPLE_MODE_META };
export type { SimpleMode };
