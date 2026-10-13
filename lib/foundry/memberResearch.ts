/**
 * Member-visible, immutable public-source research snapshot.
 *
 * Compiled from the exactly accepted AIN-CAPABILITY-FOUNDRY-01 research
 * catalogue. No internal founder decisions, paths, WU controls, model tools
 * or executable skills are bundled in the member presentation.
 *
 * Source custody and eligibility are independently checked in tests.
 */
import snapshot from './memberResearchSnapshot.json';

export type MemberResearchEntry = (typeof snapshot.entries)[number];

export const MEMBER_FOUNDRY_ORIGIN = {
  catalogueCommit: snapshot.accepted_research_catalogue_commit,
  catalogueSha256: snapshot.origin_catalogue_sha256,
  sourceCount: snapshot.source_count,
  installedCount: snapshot.installed_capabilities,
  researchOnly: snapshot.presentation === 'MEMBER_INFORMATION_ONLY',
  allLicensesPending: snapshot.license_clearance === 'PENDING_FOR_ALL_CANDIDATES',
} as const;

export const MEMBER_FOUNDRY_ENTRIES: readonly MemberResearchEntry[] = snapshot.entries;

/** Member-friendly labels for research areas, not feature entitlements. */
export const MEMBER_FOUNDRY_FOCUS = [
  {
    title: 'Better writing and creative work',
    description:
      'Methods that could help us evaluate editorial suggestions while protecting an author’s voice and decisions.',
    keyword: 'Writer’s Studio',
  },
  {
    title: 'Thoughtful practitioner support',
    description:
      'Research into clearer evidence, careful reasoning and professional boundaries—not automated diagnosis or treatment.',
    keyword: 'Pro Studio',
  },
  {
    title: 'Clearer symbolic and scientific distinctions',
    description:
      'Ways to test calculations and explanations without confusing symbolic interpretation with measured fact.',
    keyword: 'Astrology Pro',
  },
  {
    title: 'More sovereign intelligence',
    description:
      'Local models, reproducible testing and safer research infrastructure that might improve MAIA and AIN OS over time.',
    keyword: 'Sovereign AI',
  },
] as const;
