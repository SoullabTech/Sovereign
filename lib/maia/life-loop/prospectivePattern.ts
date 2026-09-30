export type ProspectiveRelation =
  | 'supports'
  | 'contradicts'
  | 'complicates'
  | 'outside_scope'
  | 'insufficient'

export type ProspectiveEvidence = {
  id: string
  report: string
  relation: ProspectiveRelation
}

export const PROVISIONAL_PATTERN =
  'Some chapter transitions create continuity friction even when the core idea is clear.'

export const PROSPECTIVE_RELATION_GRAMMAR: Record<
  ProspectiveRelation,
  { label: string; statement: string; effect: string }
> = {
  supports: {
    label: 'Supports this proposition',
    statement: 'The returned report bears in support of the provisional transition-friction proposition.',
    effect:
      'Add this event to the evidence field. Do not promote the pattern automatically; re-evaluate maturity with all evidence.',
  },
  contradicts: {
    label: 'Contradicts this proposition',
    statement: 'The returned report directly counts against the provisional proposition as stated.',
    effect:
      'The proposition must remain open to weakening, narrowing, suspension, or abandonment.',
  },
  complicates: {
    label: 'Complicates this proposition',
    statement: 'The returned report bears on the proposition but does not fit a simple support/contradict relation.',
    effect:
      'Preserve the complication and reconsider scope before strengthening the proposition.',
  },
  outside_scope: {
    label: 'Outside this pattern',
    statement: 'The returned report may matter, but it does not bear on the provisional transition-friction proposition.',
    effect:
      'Keep the event without forcing it into this pattern. It may belong to another question or remain ungrouped.',
  },
  insufficient: {
    label: 'Insufficient to compare',
    statement: 'The returned report does not contain enough relevant information to test this proposition.',
    effect:
      'Do not update the proposition from this event.',
  },
}

export function governedProspectiveRelation(relation: ProspectiveRelation) {
  return PROSPECTIVE_RELATION_GRAMMAR[relation]
}
