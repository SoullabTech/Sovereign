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
    // The room's single principal uncertainty (U1) — contact-reducible, still on the
    // shelf. No baton-pass has been declared, so transitions is empty and the room
    // remains 'admitted'. See docs/canon/THE_GOVERNING_UNCERTAINTY.md §9.
    governingUncertainty: {
      current:
        'Does this relational preparation surface reveal member pull without persistence?',
      transitionState: 'admitted',
      admittedAt: '2026-05-22',
      transitions: [],
      // When U1 resolves, the steward will declare the pass here (NOT before — that
      // would be telling tomorrow's story as today's). The anticipated shape:
      //   {
      //     leaving: 'Does this relational preparation surface reveal member pull without persistence?',
      //     entering: 'Can a relational preparation surface persist anything without representing non-consenting third parties?',
      //     enteringState: 'dwelling',
      //     evidenceCarry: {
      //       carries: 'Member pull may carry.',
      //       mustBeNewlyProven: 'Persistence safety cannot carry; it must be newly proven.',
      //     },
      //     basis: '<why U1 is declared resolved>',
      //     declaredAt: '<ISO date>',
      //   }
      // with a dwellBlocker of type 'architectural'/'governance' naming the persistence
      // layer + third-party-consent obligation.
    },
  },
];
