import type { HousePlaceId } from './catalog';

export type OrientationEndpoint = HousePlaceId | 'maia';

export interface OrientationFacet {
  label: string;
  question: string;
  activity: string;
  relationToWhole: string;
}

export type CrossingMode =
  | 'navigation'
  | 'contained_presence'
  | 'embedded_presence'
  | 'contextual_memory'
  | 'persistence'
  | 'projection';

export type CrossingAuthority =
  | 'member_explicit'
  | 'member_standing_consent'
  | 'system_automatic'
  | 'read_only_projection';

export type CrossingStanding =
  | 'live'
  | 'partial'
  | 'needs_adjudication'
  | 'design_only';

export interface FacetCrossing {
  id: string;
  from: OrientationEndpoint;
  to: OrientationEndpoint;
  gesture: string | null;
  carries: readonly string[];
  mode: CrossingMode;
  authority: CrossingAuthority;
  standing: CrossingStanding;
  evidence: readonly string[];
  law: string;
}

export interface CrossCuttingLens {
  id: 'elemental' | 'spiralogic' | 'developmental' | 'relational' | 'temporal' | 'symbolic';
  question: string;
  protectsAgainst: string;
}

/**
 * Soullab Living Orientation System
 *
 * A facet is a distinct way of attending to one life. It is not a product silo,
 * a database table, or a claim that the system possesses the member.
 *
 * The member remains the irreducible center of orientation. These facets are
 * therefore deliberately keyed only by House place IDs; "member" is not a node.
 */
export const ORIENTATION_FACETS = {
  writing: {
    label: 'Writing',
    question: 'What wants to take form through me?',
    activity: 'Giving sustained form to work that wants to be written.',
    relationToWhole: 'Carries developing work without reducing the person to the work.',
  },
  relationships: {
    label: 'Relationships',
    question: 'What is alive between me and others?',
    activity: 'Attending to relationship, contact, tension, care, and what lives between.',
    relationToWhole: 'Keeps relational life visible without collapsing another person into a profile.',
  },
  practices: {
    label: 'Practices',
    question: 'What helps me return to body, breath, and attention?',
    activity: 'Entering embodied practices that help attention become inhabitable again.',
    relationToWhole: 'Provides ways of returning that do not require interpretation or productivity.',
  },
  community: {
    label: 'Community',
    question: 'Where am I participating in what we hold together?',
    activity: 'Participating in shared life, circles, gatherings, offerings, and common work.',
    relationToWhole: 'Places the member in collective life while preserving differentiation.',
  },
  studio: {
    label: 'Studio',
    question: 'What am I tending in my life and contribution?',
    activity: 'Stewarding personal life, professional contribution, and the work around them.',
    relationToWhole: 'Holds sustained stewardship without turning the whole House into a workbench.',
  },
  decisions: {
    label: 'Decisions',
    question: 'What am I choosing, and what perspective helps me choose?',
    activity: 'Thinking through a real choice without surrendering authorship of the decision.',
    relationToWhole: 'Makes choice visible as one movement in a life rather than an optimization problem.',
  },
  astrology: {
    label: 'Astrology',
    question: 'What patterns, timing, and symbolic ecology am I participating in?',
    activity: 'Meeting a calculated chart through symbolic tradition, whole-chart synthesis, and dialogue.',
    relationToWhole: 'Adds symbolic and temporal perspective without declaring what the member is.',
  },
  journal: {
    label: 'Journal',
    question: 'What have I lived, and what wants words?',
    activity: 'Putting lived experience into the member’s own words and returning to it later.',
    relationToWhole: 'Preserves authored experience as evidence before interpretation.',
  },
  reflections: {
    label: 'Reflections',
    question: 'What mattered enough to keep?',
    activity: 'Returning to moments, recognitions, words, and keeps the member chose not to lose.',
    relationToWhole: 'Holds personal gems without ranking or flattening them into a feed.',
  },
  ideas: {
    label: 'Ideas',
    question: 'What is beginning to take form?',
    activity: 'Developing a thought through notes, reflection, decisions, shifts, and conversation.',
    relationToWhole: 'Lets an emerging idea mature without forcing premature structure.',
  },
  changes: {
    label: 'Changes',
    question: 'What is changing, and how am I walking it?',
    activity: 'Naming and staying with a change over time.',
    relationToWhole: 'Makes transition visible without treating development as linear progress.',
  },
  wisdom: {
    label: 'Wisdom',
    question: 'What am I learning from teachings, sources, and living knowledge?',
    activity: 'Studying sources and bringing them into reflective relationship with lived experience.',
    relationToWhole: 'Keeps knowledge in dialogue with life rather than above it as authority.',
  },
  library: {
    label: 'Library',
    question: 'What have I gathered that I may need again?',
    activity: 'Returning to books, sources, references, and materials already gathered.',
    relationToWhole: 'Provides durable source custody without becoming the meaning-maker.',
  },
  divination: {
    label: 'Divination',
    question: 'What question am I willing to meet through symbolic practice?',
    activity: 'Meeting a live question through a chosen symbolic practice.',
    relationToWhole: 'Offers forms for recognition and dialogue, never deterministic instruction.',
  },
  'living-field': {
    label: 'Living Field',
    question: 'What is the larger configuration of my life right now?',
    activity: 'Seeing relationships among life-level recognitions, questions, people, work, and transitions.',
    relationToWhole: 'Projects relationships among distinct objects without claiming a complete portrait of the member.',
  },
  'co-lab': {
    label: 'Co-lab',
    question: 'What are we making or holding together?',
    activity: 'Working, deciding, and conversing with others inside shared custody.',
    relationToWhole: 'Adds collaborative relationship without absorbing private life into team space.',
  },
  anchor: {
    label: 'Daily Anchor',
    question: 'What do I want to remain connected to today?',
    activity: 'Choosing one small thread of continuity inside the actual day.',
    relationToWhole: 'Provides daily re-entry without streaks, scores, or self-development pressure.',
  },
} satisfies Record<HousePlaceId, OrientationFacet>;

export const MAIA_ORIENTATION = {
  label: 'MAIA',
  question: 'What wants to be met in relationship across all of this?',
  activity: 'Accompanying the member across facets while preserving provenance, consent, and authorship.',
  relationToWhole: 'MAIA is the host and relational intelligence, not the center and not a room that owns the others.',
} as const satisfies OrientationFacet;

/**
 * Cross-cutting lenses are not rooms. They are ways the same life may be
 * perceived across several facets. None has authority to define the member.
 */
export const CROSS_CUTTING_LENSES = [
  {
    id: 'elemental',
    question: 'What mode of participation is present here?',
    protectsAgainst: 'Turning Fire, Water, Earth, Air, or the Fifth into fixed personality identity.',
  },
  {
    id: 'spiralogic',
    question: 'What movement, differentiation, integration, or return is visible here?',
    protectsAgainst: 'Converting Spiralogic into a rigid ladder or assigning a person a totalizing stage.',
  },
  {
    id: 'developmental',
    question: 'What trajectory, threshold, or capacity is changing over time?',
    protectsAgainst: 'Treating development as score, rank, diagnosis, or inevitable linear progress.',
  },
  {
    id: 'relational',
    question: 'What exists between these people, objects, or facets that cannot be reduced to either one?',
    protectsAgainst: 'Collapsing relationship into individual traits or possession.',
  },
  {
    id: 'temporal',
    question: 'What changes when this is understood in the actual day, season, cycle, or life phase?',
    protectsAgainst: 'Stripping experience from lived time or imposing optimization tempo.',
  },
  {
    id: 'symbolic',
    question: 'What possibilities become visible through symbol without becoming determinations?',
    protectsAgainst: 'Presenting astrology, dream, oracle, or symbolic material as objective verdict.',
  },
] as const satisfies readonly CrossCuttingLens[];

/**
 * Crossings are explicit architectural seams. A crossing must say what travels,
 * how it travels, and who authorized it. A connection that cannot answer those
 * questions is not yet a governed flow.
 */
export const FACET_CROSSINGS = [
  {
    id: 'journal-reflect-with-maia',
    from: 'journal',
    to: 'maia',
    gesture: 'Reflect with MAIA',
    carries: ['kept journal entry'],
    mode: 'embedded_presence',
    authority: 'member_explicit',
    standing: 'live',
    evidence: [
      'components/journal/room/EntryReader.tsx',
      'app/api/journal/reflect/route.ts',
    ],
    law: 'MAIA appears only after the member keeps writing; the entry remains primary.',
  },
  {
    id: 'maia-write-from-here-to-journal',
    from: 'maia',
    to: 'journal',
    gesture: 'Write from here',
    carries: ['MAIA question as provenance context'],
    mode: 'embedded_presence',
    authority: 'member_explicit',
    standing: 'live',
    evidence: [
      'components/journal/room/Reflection.tsx',
      'components/journal/room/WritingSurface.tsx',
    ],
    law: 'MAIA’s question may accompany the page but never becomes the member’s authored text.',
  },
  {
    id: 'reflection-discuss-with-maia',
    from: 'reflections',
    to: 'maia',
    gesture: 'Discuss with MAIA',
    carries: ['member-kept reflection context'],
    mode: 'contained_presence',
    authority: 'member_explicit',
    standing: 'live',
    evidence: [
      'components/reflections/DiscussWithMaia.tsx',
      'docs/design/contracts/reflections-maia-handoff.md',
    ],
    law: 'The Reflection remains the member-owned object; MAIA accompanies it rather than replacing the room.',
  },
  {
    id: 'anchor-consent-to-maia',
    from: 'anchor',
    to: 'maia',
    gesture: 'MAIA may remember this with me',
    carries: ['selected daily anchor'],
    mode: 'contextual_memory',
    authority: 'member_standing_consent',
    standing: 'live',
    evidence: [
      'app/maia/anchor/history/page.tsx',
      'lib/anchor/loadRecentAnchors.ts',
    ],
    law: 'Daily Anchor remains private by default; ambient MAIA context requires explicit standing consent.',
  },
  {
    id: 'divination-consult-with-maia',
    from: 'divination',
    to: 'maia',
    gesture: 'Consult with MAIA',
    carries: ['member question', 'chosen spread', 'drawn symbols', 'reading text'],
    mode: 'navigation',
    authority: 'member_explicit',
    standing: 'live',
    evidence: [
      'app/oracle/tarot/page.tsx',
      'app/oracle/runes/page.tsx',
    ],
    law: 'Symbolic material is carried because the member asks for dialogue; MAIA must keep interpretation provisional.',
  },
  {
    id: 'divination-save-to-reflections',
    from: 'divination',
    to: 'reflections',
    gesture: 'Save Reading',
    carries: ['chosen divination reading'],
    mode: 'persistence',
    authority: 'member_explicit',
    standing: 'live',
    evidence: [
      'app/oracle/tarot/page.tsx',
      'app/oracle/runes/page.tsx',
    ],
    law: 'A reading becomes a kept object only through the member’s explicit save gesture.',
  },
  {
    id: 'wisdom-reflect-with-maia',
    from: 'wisdom',
    to: 'maia',
    gesture: 'Reflect with MAIA',
    carries: ['chosen quote or source', 'source attribution', 'return doorway'],
    mode: 'navigation',
    authority: 'member_explicit',
    standing: 'live',
    evidence: [
      'app/wisdom-keepers/wisdom/page.tsx',
    ],
    law: 'The source travels with provenance and a return path; MAIA does not replace the source with its own authority.',
  },
  {
    id: 'ideas-ask-maia-in-thread',
    from: 'ideas',
    to: 'maia',
    gesture: 'Ask MAIA',
    carries: ['saved Idea title/framing', 'recent member-authored blocks'],
    mode: 'embedded_presence',
    authority: 'member_explicit',
    standing: 'live',
    evidence: [
      'app/maia/ideas/[id]/page.tsx',
      'app/api/ideas/[id]/ask-maia/route.ts',
    ],
    law: 'Pending member text is saved as the member’s block before MAIA reflects; MAIA reflection remains a distinct block.',
  },
  {
    id: 'journal-keep-as-reflection',
    from: 'journal',
    to: 'reflections',
    gesture: 'Keep as a reflection',
    carries: ['kept journal entry'],
    mode: 'persistence',
    authority: 'member_explicit',
    standing: 'live',
    evidence: [
      'components/journal/room/EntryReader.tsx',
      'app/api/journal/quick/[id]/reflection/route.ts',
    ],
    law: 'A Journal entry remains Journal unless the member explicitly carries that kept entry into Reflections.',
  },
  {
    id: 'writers-studio-discuss-with-maia',
    from: 'writing',
    to: 'maia',
    gesture: 'Discuss with MAIA',
    carries: ['manuscript-scoped context'],
    mode: 'contained_presence',
    authority: 'member_explicit',
    standing: 'partial',
    evidence: [
      'app/writers-studio/rebuild/RebuildStudioClient.tsx',
    ],
    law: 'The manuscript remains the place; MAIA conversation must carry explicit scope without displacing the writing surface.',
  },
  {
    id: 'astrology-discuss-with-maia',
    from: 'astrology',
    to: 'maia',
    gesture: 'Discuss with MAIA',
    carries: ['calculated chart facts', 'selected symbolic context'],
    mode: 'navigation',
    authority: 'member_explicit',
    standing: 'partial',
    evidence: [
      'components/astrology/ChineseAstrologyDiscussion.tsx',
    ],
    law: 'Calculated facts, symbolic tradition, synthesis, and lived meaning remain distinguishable across the handoff.',
  },
] as const satisfies readonly FacetCrossing[];

export function orientationFacet(id: HousePlaceId): OrientationFacet {
  return ORIENTATION_FACETS[id];
}

export function crossingsFrom(id: OrientationEndpoint): readonly FacetCrossing[] {
  return FACET_CROSSINGS.filter((crossing) => crossing.from === id);
}

export function crossingsTo(id: OrientationEndpoint): readonly FacetCrossing[] {
  return FACET_CROSSINGS.filter((crossing) => crossing.to === id);
}

export function liveCrossings(): readonly FacetCrossing[] {
  return FACET_CROSSINGS.filter((crossing) => crossing.standing === 'live');
}
