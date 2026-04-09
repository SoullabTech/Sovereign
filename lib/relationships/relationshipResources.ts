/**
 * Relationship Resources — Sources & Theoretical Grounding
 *
 * MAIA does not invent relational psychology. It stands on the shoulders
 * of decades of family therapy, attachment research, parts work, nervous
 * system science, and systemic practice.
 *
 * This module names those sources so members know where the ideas in
 * the Relational Field labtools come from — and where they can go for
 * deeper study.
 *
 * These are resources, NOT prescriptions. Nothing here is offered as
 * diagnosis or treatment. The goal is recognition and orientation, not
 * classification.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SOURCES — the traditions we draw from
// ─────────────────────────────────────────────────────────────────────────────

export interface RelationshipSource {
  /** Stable identifier used by labtools to reference this source */
  id: string;
  /** Tradition or school */
  tradition: string;
  /** Key figures (not an exhaustive list) */
  people: string[];
  /** One-sentence summary of what the tradition offers */
  summary: string;
  /** What aspects of relational life this tradition illuminates */
  illuminates: string[];
  /** Starting texts for further exploration */
  keyTexts?: string[];
  /** Short note on lineage / history */
  lineage?: string;
}

export const RELATIONSHIP_SOURCES: RelationshipSource[] = [
  {
    id: 'ifs',
    tradition: 'Internal Family Systems (IFS)',
    people: ['Richard Schwartz'],
    summary:
      'Every person holds an inner system of parts — protectors, managers, exiles — and a core Self that can lead with curiosity, compassion, and calm.',
    illuminates: [
      'inner conflict',
      'protective patterns',
      'the part of you that is reacting vs. the Self underneath',
    ],
    keyTexts: [
      'No Bad Parts — Richard Schwartz',
      'Internal Family Systems Therapy — Richard Schwartz',
    ],
    lineage:
      'Developed in the 1980s out of family therapy; now widely used in trauma work.',
  },
  {
    id: 'bowen',
    tradition: 'Bowen Family Systems Theory',
    people: ['Murray Bowen'],
    summary:
      'Families operate as emotional systems. Differentiation — the capacity to be close without losing yourself — is the core work.',
    illuminates: [
      'differentiation vs. fusion',
      'triangulation',
      'multigenerational patterns',
      'emotional cutoff',
    ],
    keyTexts: [
      'Family Therapy in Clinical Practice — Murray Bowen',
      'Extraordinary Relationships — Roberta Gilbert',
    ],
    lineage:
      'Psychiatrist Murray Bowen, 1960s–70s. Still foundational in systemic family therapy.',
  },
  {
    id: 'attachment',
    tradition: 'Attachment Theory',
    people: ['John Bowlby', 'Mary Ainsworth', 'Mary Main'],
    summary:
      'Early bonds shape a template — secure, anxious, avoidant, disorganized — that continues to shape how we seek and avoid closeness as adults.',
    illuminates: [
      'the pull toward and away from closeness',
      'adult attachment styles',
      'why rupture hurts the way it does',
    ],
    keyTexts: [
      'Attachment — John Bowlby',
      'Attached — Amir Levine & Rachel Heller (accessible intro)',
      'A Secure Base — John Bowlby',
    ],
    lineage:
      'Bowlby observed in the 1950s that infants need reliable bonds to develop; Ainsworth\'s "Strange Situation" gave it empirical grounding.',
  },
  {
    id: 'gottman',
    tradition: 'The Gottman Method',
    people: ['John Gottman', 'Julie Gottman'],
    summary:
      'Decades of observational research on what actually predicts whether couples thrive — including the "Four Horsemen" that corrode connection and the repair attempts that restore it.',
    illuminates: [
      'criticism, contempt, defensiveness, stonewalling',
      'repair attempts',
      'bids for connection',
      'ratio of positive to negative interactions',
    ],
    keyTexts: [
      'The Seven Principles for Making Marriage Work — John Gottman',
      'What Makes Love Last? — John & Julie Gottman',
    ],
    lineage:
      'The Gottmans ran "love labs" observing thousands of couples starting in the 1970s; their work is among the most evidence-based in the field.',
  },
  {
    id: 'nvc',
    tradition: 'Nonviolent Communication (NVC)',
    people: ['Marshall Rosenberg'],
    summary:
      'A structure for speaking honestly without blame: observation, feeling, need, request. Not a script — a grammar for clean speech.',
    illuminates: [
      'separating observation from evaluation',
      'naming feelings and needs without attack',
      'asking for what you actually want',
    ],
    keyTexts: [
      'Nonviolent Communication: A Language of Life — Marshall Rosenberg',
    ],
    lineage:
      'Rosenberg developed NVC in the 1960s–70s out of his work in civil rights mediation and conflict resolution.',
  },
  {
    id: 'eft',
    tradition: 'Emotionally Focused Therapy (EFT)',
    people: ['Sue Johnson'],
    summary:
      'An attachment-based approach to couples that treats relational distress as a protest against lost connection — and repair as reaching for each other again.',
    illuminates: [
      'the attachment cry underneath conflict',
      'pursue/withdraw cycles',
      'how to reach for a partner safely',
    ],
    keyTexts: [
      'Hold Me Tight — Sue Johnson',
      'Love Sense — Sue Johnson',
    ],
    lineage:
      'Sue Johnson developed EFT in the 1980s; now one of the most empirically supported couple therapies.',
  },
  {
    id: 'imago',
    tradition: 'Imago Relationship Therapy',
    people: ['Harville Hendrix', 'Helen LaKelly Hunt'],
    summary:
      'Partners often unconsciously choose each other to finish unfinished childhood work. The "Imago Dialogue" is a slow, mirrored way of being heard.',
    illuminates: [
      'childhood templates in adult love',
      'mirroring, validation, empathy as a practice',
      'reactivity as information',
    ],
    keyTexts: [
      'Getting the Love You Want — Harville Hendrix',
    ],
    lineage:
      'Developed by Hendrix and Hunt in the 1980s; integrates depth psychology with behavioral practice.',
  },
  {
    id: 'polyvagal',
    tradition: 'Polyvagal Theory',
    people: ['Stephen Porges', 'Deb Dana'],
    summary:
      'The nervous system has three modes — ventral (connected), sympathetic (fight/flight), dorsal (shutdown). Connection is a biological state, not just an attitude.',
    illuminates: [
      'why you cannot repair from a dysregulated state',
      'co-regulation between bodies',
      'cues of safety and cues of danger',
    ],
    keyTexts: [
      'The Polyvagal Theory — Stephen Porges',
      'The Polyvagal Theory in Therapy — Deb Dana',
    ],
    lineage:
      'Porges proposed the theory in 1994; Deb Dana translated it into accessible clinical practice.',
  },
  {
    id: 'family_constellations',
    tradition: 'Family Constellations',
    people: ['Bert Hellinger'],
    summary:
      'A phenomenological approach that senses the field of a family system — what has been excluded, unresolved, or inherited across generations — and the "orders of love" that hold systems in balance.',
    illuminates: [
      'systemic loyalties and entanglements',
      'who has been excluded from the family',
      'love that crosses generations as burden or as blessing',
    ],
    keyTexts: [
      'Love\'s Hidden Symmetry — Bert Hellinger',
      'Ancestral Medicine — Daniel Foor',
    ],
    lineage:
      'Hellinger, formerly a Catholic priest and missionary, developed the work starting in the 1990s drawing on systemic therapy and Zulu traditional practice.',
  },
  {
    id: 'satir',
    tradition: 'Satir Transformational Systemic Therapy',
    people: ['Virginia Satir'],
    summary:
      'Under stress, people fall into survival stances — blaming, placating, computing, distracting — instead of congruent speech. Therapy is helping them find the leveler.',
    illuminates: [
      'communication stances under stress',
      'congruence: matching inside and outside',
      'family roles and rules',
    ],
    keyTexts: [
      'The New Peoplemaking — Virginia Satir',
      'Conjoint Family Therapy — Virginia Satir',
    ],
    lineage:
      'Satir was one of the pioneers of family therapy in the 1960s; her work shaped generations of systemic practitioners.',
  },
  {
    id: 'perel',
    tradition: 'Relational Paradox (Erotic & Secure)',
    people: ['Esther Perel'],
    summary:
      'Modern love asks one relationship to deliver both safety and mystery — the very conditions that tend to pull against each other. The work is holding both.',
    illuminates: [
      'desire and closeness in tension',
      'the erotic need for space',
      'infidelity as a symptom, not just a betrayal',
    ],
    keyTexts: [
      'Mating in Captivity — Esther Perel',
      'The State of Affairs — Esther Perel',
    ],
    lineage:
      'Perel, a Belgian psychotherapist, writes at the intersection of sexuality, culture, and couple therapy.',
  },
  {
    id: 'narrative',
    tradition: 'Narrative Therapy',
    people: ['Michael White', 'David Epston'],
    summary:
      'People are not their problems. By externalizing the problem and re-authoring the story, new possibilities become visible.',
    illuminates: [
      'the story being told about the relationship',
      'problem as something between you, not inside you',
      'preferred stories and unique outcomes',
    ],
    keyTexts: [
      'Narrative Means to Therapeutic Ends — Michael White & David Epston',
      'Maps of Narrative Practice — Michael White',
    ],
    lineage:
      'Developed in Australia and New Zealand in the 1980s; draws on post-structuralist philosophy and indigenous story practices.',
  },
  {
    id: 'welwood',
    tradition: 'Conscious Relationship / Spiritual Bypassing',
    people: ['John Welwood'],
    summary:
      'Relationship as a spiritual path that refuses to bypass the wound. The work is meeting each other and yourself without using awakening as an escape.',
    illuminates: [
      'spiritual bypassing',
      'intimacy as a path of awakening',
      'the "refugee from love" pattern',
    ],
    keyTexts: [
      'Journey of the Heart — John Welwood',
      'Perfect Love, Imperfect Relationships — John Welwood',
    ],
    lineage:
      'Welwood, a student of Chögyam Trungpa and depth psychologist, coined the term "spiritual bypassing" in 1984.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PATTERNS — common relational patterns, each grounded in sources
//
// These are descriptive, not prescriptive. They are things people
// sometimes notice in themselves, not identities to live inside.
// ─────────────────────────────────────────────────────────────────────────────

export interface RelationshipPattern {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  sources: string[]; // source ids
  /** A reframe that keeps the pattern descriptive, not diagnostic */
  reframe?: string;
}

export const RELATIONSHIP_PATTERNS: RelationshipPattern[] = [
  {
    id: 'pursue-withdraw',
    name: 'Pursue / Withdraw',
    shortDescription: 'One reaches, the other retreats — and each move amplifies the other.',
    description:
      'One partner moves toward connection under stress; the other moves away. The pursuer feels abandoned and reaches harder. The withdrawer feels overwhelmed and pulls further. Neither is the cause — the cycle is.',
    sources: ['eft', 'gottman', 'attachment'],
    reframe:
      'Both moves are attachment moves. The pursuer is protesting disconnection; the withdrawer is protecting the relationship from what they fear they\'d do if they stayed.',
  },
  {
    id: 'over-under-function',
    name: 'Over-function / Under-function',
    shortDescription: 'One takes on too much, the other takes on too little.',
    description:
      'One person manages, plans, remembers, worries for both. The other relaxes into being managed, or shuts down under the weight of expectation. The over-functioner grows resentful; the under-functioner grows diminished. Both lose access to their full self.',
    sources: ['bowen', 'satir'],
    reframe:
      'This is a fusion pattern, not a character flaw. Each is holding a part of something that could belong to both.',
  },
  {
    id: 'projection-loop',
    name: 'Projection Loop',
    shortDescription: 'You are seeing in them what you cannot yet see in yourself.',
    description:
      'A disowned quality — anger, neediness, control, helplessness — shows up in how you experience the other person. Whatever you most want to get away from in them is often what you have not been able to meet in yourself.',
    sources: ['ifs', 'welwood'],
    reframe:
      'Projection is not a failure. It is the psyche showing you the exact material it is ready to integrate, through the relationship.',
  },
  {
    id: 'triangulation',
    name: 'Triangulation',
    shortDescription: 'A third person, problem, or topic absorbs the tension between two.',
    description:
      'When tension between two people becomes unbearable, a third element enters — a child, a friend, a work crisis, an affair — and stabilizes the system by absorbing the pressure. The original tension goes underground.',
    sources: ['bowen', 'family_constellations'],
    reframe:
      'The third party is rarely the real issue. They are holding the weight of something that belongs between the original two.',
  },
  {
    id: 'parts-polarization',
    name: 'Parts in Conflict',
    shortDescription: 'Different parts of you want different things from this bond.',
    description:
      'One part of you wants closeness. Another part is wary of it. The conflict inside you plays out between you and the other person as if they were causing it. Unblending from either part clears the field.',
    sources: ['ifs'],
    reframe:
      'Both parts have good reasons. The work is not picking a side — it is getting enough Self-energy to hear both.',
  },
  {
    id: 'protest-withdrawal',
    name: 'Protest, Then Withdrawal',
    shortDescription: 'The push for connection, then the collapse away from it.',
    description:
      'First comes protest — the reach, the text, the accusation, the bid. When it fails, withdrawal. The withdrawal is sometimes read as "not caring," but it is the opposite: it is the attachment system giving up hope for now.',
    sources: ['attachment', 'eft'],
    reframe:
      'Withdrawal after protest is the visible edge of an invisible longing. It is protection, not indifference.',
  },
  {
    id: 'differentiation-crisis',
    name: 'Differentiation Pressure',
    shortDescription: 'Becoming more yourself feels like leaving them.',
    description:
      'You are changing, choosing, or wanting differently. The system responds as if this is a betrayal. Old roles and agreements feel threatened. The pressure to return to the familiar can be strong enough to look like love.',
    sources: ['bowen', 'family_constellations'],
    reframe:
      'Differentiation is not abandonment. It is the only way two people can actually meet instead of fuse.',
  },
  {
    id: 'nervous-system-mismatch',
    name: 'Nervous System Mismatch',
    shortDescription: 'Two bodies in different states, trying to connect anyway.',
    description:
      'One person is in ventral calm, the other in sympathetic activation or dorsal shutdown. Connection will not land until both bodies find the same shore. This is biology, not unwillingness.',
    sources: ['polyvagal'],
    reframe:
      'You cannot repair from a dysregulated state. Regulation is not avoidance — it is the prerequisite.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LABTOOL MAPPING — which sources are most relevant to each tool
// ─────────────────────────────────────────────────────────────────────────────

export const LABTOOL_SOURCE_MAP: Record<string, string[]> = {
  'relational-field': ['polyvagal', 'attachment', 'ifs', 'welwood'],
  'dynamics-map': ['bowen', 'ifs', 'gottman', 'eft', 'satir', 'attachment'],
  'repair-path': ['gottman', 'nvc', 'eft', 'imago', 'perel', 'welwood'],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getSourcesForLabtool(labtoolId: string): RelationshipSource[] {
  const ids = LABTOOL_SOURCE_MAP[labtoolId] || [];
  return ids
    .map((id) => RELATIONSHIP_SOURCES.find((s) => s.id === id))
    .filter((s): s is RelationshipSource => !!s);
}

export function getSourceById(id: string): RelationshipSource | undefined {
  return RELATIONSHIP_SOURCES.find((s) => s.id === id);
}

export function getPatternSources(pattern: RelationshipPattern): RelationshipSource[] {
  return pattern.sources
    .map((id) => RELATIONSHIP_SOURCES.find((s) => s.id === id))
    .filter((s): s is RelationshipSource => !!s);
}
