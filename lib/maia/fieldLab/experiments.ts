/**
 * Registry of experiments currently offered in Field Lab.
 *
 * Add a new experiment by:
 *   1. Building its page at /maia/field-lab/[slug]
 *   2. Wrapping it in <FieldLabFrame /> with its own "what is being explored"
 *   3. Adding an entry here
 *
 * Do NOT add an experiment here before its page exists. The shelf reflects
 * what is actually walkable.
 */

import type { Experiment } from '@/components/maia/field-lab/ExperimentCard';

export const EXPERIMENTS: Experiment[] = [
  {
    slug: 'relational-navigation',
    name: 'Relational Navigation Room',
    oneLiner:
      'Reflective preparation and integration around important conversations.',
    status: ['Experimental', 'Observation phase', 'No persistence yet'],
    exploring:
      'Whether MAIA can support relational discernment without becoming an interpretive authority over human relationships.',
    phase: 'phase-1',
  },
];
