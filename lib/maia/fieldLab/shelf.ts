/**
 * The Field Lab shelf — the validated read of the experiment registry.
 *
 * Ruling (2026-06-25): a malformed governance entry must not render quietly. CI
 * protects the repo; this protects the EPISTEMIC SURFACE. A room whose governing
 * uncertainty does not validate is EXCLUDED from the shelf — better an absent
 * experiment than a falsely governed one. The exclusion is loud for builders
 * (logged always; thrown in development) but never a member-facing broken UI: the
 * page still renders, the invalid room simply does not appear.
 *
 * See docs/canon/THE_GOVERNING_UNCERTAINTY.md §11.
 */
import type { Experiment } from '@/components/maia/field-lab/ExperimentCard';
import { EXPERIMENTS } from './experiments';
import { validateGoverningUncertainty } from './governance';

/** Split the registry into rooms with a valid governing uncertainty and rooms
 *  without. Pure — no logging, no throwing — so the decision is trivially testable. */
export function partitionShelf(experiments: Experiment[] = EXPERIMENTS): {
  valid: Experiment[];
  invalid: { slug: string; violations: string[] }[];
} {
  const valid: Experiment[] = [];
  const invalid: { slug: string; violations: string[] }[] = [];
  for (const exp of experiments) {
    const violations = validateGoverningUncertainty(exp.slug, exp.governingUncertainty);
    if (violations.length === 0) valid.push(exp);
    else invalid.push({ slug: exp.slug, violations });
  }
  return { valid, invalid };
}

/**
 * The experiments to render on the shelf. Invalid rooms are excluded, logged
 * loudly, and — outside production — throw, so a malformed registry cannot be
 * walked past during development. CI (the jest test) is the primary guard; this is
 * defense-in-depth so the surface cannot quietly lie even if CI were bypassed.
 */
export function getShelfExperiments(experiments: Experiment[] = EXPERIMENTS): Experiment[] {
  const { valid, invalid } = partitionShelf(experiments);
  for (const room of invalid) {
    // eslint-disable-next-line no-console
    console.error('[FieldLab] governance violation — room excluded from shelf', room);
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `[FieldLab] "${room.slug}" has an invalid governing uncertainty:\n  - ${room.violations.join('\n  - ')}`,
      );
    }
  }
  return valid;
}
