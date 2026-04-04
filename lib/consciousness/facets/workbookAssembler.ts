/**
 * Workbook Assembler — generates structured workbook pages from facet data
 *
 * Internal utility, callable from the MAIA flow.
 * Not a separate API — just a formatter for the canonical facet registry.
 */

import type { Facet } from './types';

export interface WorkbookPage {
  title: string;
  prompts: string[];
  practice: string;
  integration: string[];
}

/**
 * Build a workbook page from a facet definition.
 */
export function buildWorkbookPage(facet: Facet): WorkbookPage {
  return {
    title: `${facet.element} ${facet.phase} — ${facet.title}`,
    prompts: [
      `Core theme: ${facet.coreTheme}`,
      `Primary task: ${facet.developmentalTask}`,
      ...facet.dialoguePrompts.slice(0, 3),
    ],
    practice: facet.meditationPrompt,
    integration: [
      ...facet.integration.actions,
      ...facet.integration.grounding,
    ],
  };
}
