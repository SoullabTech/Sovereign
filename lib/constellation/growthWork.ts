/** Saved founder workflow, not a claim that a worker is connected or running. */
export const GROWTH_WORK_TASKS = [
  { id: 'prepare-pilot', label: 'Prepare the Writer’s Studio pilot', instruction: 'Prepare the approved first-experience participation and withdrawal flow. Verify storage, expiry, replay and backup limits before proposing activation.' },
  { id: 'prepare-invitation', label: 'Develop an audience invitation', instruction: 'Draft one truthful audience invitation and its first-use experience. Tie product claims to verified capability; do not publish or spend.' },
  { id: 'review-evidence', label: 'Review what we have learned', instruction: 'Read only the admitted founder report and authorized source evidence. Separate submissions, subjective usefulness, unknowns and causal claims; do not inspect private member work.' },
] as const;
export type GrowthWorkTask = typeof GROWTH_WORK_TASKS[number]['id'];
export const GROWTH_DEFAULT_OUTCOME = 'Help people carrying meaningful work discover Writer’s Studio and find out whether their first experience helps them move that work forward.';

export function makeGrowthWorkingBrief(outcome: string, task: GrowthWorkTask): string {
  const chosen = GROWTH_WORK_TASKS.find(item => item.id === task);
  if (!chosen || typeof outcome !== 'string' || !outcome.trim() || outcome.length > 1200) {
    throw new Error('Choose a bounded outcome and an available task');
  }
  return [
    'SOULLAB CONSTELLATION — FOUNDER WORKING BRIEF',
    'This is orientation from the founder workspace, not a new execution grant.',
    '', 'Outcome:', outcome.trim(), '', 'Current task:', chosen.instruction,
    '', 'Approved pilot scope:',
    'One voluntary report about one experience; maximum 30-day retention; author-controlled withdrawal; optional invitation attribution; no return tracking or marketing follow-up.',
    '', 'Working method:',
    'Inspect the current source and distinguish live, candidate, and not measured. Work on one bounded outcome. Prepare inspectable drafts or code and evidence. Return only the decisions that need Kelly.',
    'Publication, sending, spending, production changes, new data use, and runtime execution still require the applicable explicit authority. A copied brief does not grant it.',
    '', 'Read the current records:',
    'docs/programme/SOULLAB-CONSTELLATION-01.md',
    'docs/programme/SOULLAB-CONSTELLATION-01_C7B2_FOUNDER_RULING_2026-10-03.md',
    '', 'Return:',
    'What is ready to inspect; what was actually verified; what is still unknown; and the smallest next decision or action.',
  ].join('\n');
}
