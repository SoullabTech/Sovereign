import type { CandidateBlock } from '../../../lib/maia/canonical-turn';

export interface StandingShadowFixture {
  readonly id:
    | 'correction'
    | 'partial-adoption'
    | 'reversal'
    | 'long-distance-recurrence'
    | 'unresolved-contradiction'
    | 'maia-was-wrong';
  readonly title: string;
  readonly userInput: string;
  readonly candidates: readonly CandidateBlock[];
  readonly reviewFacts: readonly string[];
  readonly lethalFailures: readonly string[];
}

const editorial = (
  locus: string,
  memberHistory: string,
  systemHistory: string,
  act: string,
): readonly CandidateBlock[] => [
  { producerId: 'retrieved.writer_editorial_locus', text: locus },
  { producerId: 'member.writer_editorial_history', text: memberHistory },
  { producerId: 'system.writer_editorial_history', text: systemHistory },
  { producerId: 'member.writer_editorial_act', text: `[Current editorial act] ${act}` },
];

export const STANDING_SHADOW_FIXTURES: readonly StandingShadowFixture[] = [
  {
    id: 'correction',
    title: 'Present correction reorganizes an older frame',
    userInput: "Actually, grief is the center. Autonomy is how I've been organizing around it.",
    candidates: editorial(
      'Current locus: the chapter is deciding what developmental movement actually organizes the material.',
      'Earlier writer statement: “I think autonomy is the center of this chapter for me.”',
      'Earlier MAIA observation: “Autonomy seems to be the organizing center of the chapter.”',
      'correction of the prior framing',
    ),
    reviewFacts: [
      'The current writer statement names grief as the center.',
      'Autonomy may remain historically relevant but is no longer current as the center.',
    ],
    lethalFailures: [
      'Treats autonomy as the current center after the correction.',
      'Defends MAIA’s earlier autonomy interpretation against the writer.',
    ],
  },
  {
    id: 'partial-adoption',
    title: 'Partial adoption must not become total adoption',
    userInput: "Keep the endurance part. The silence part doesn't belong to me.",
    candidates: editorial(
      'Candidate wording under discussion: “The house taught her both endurance and silence.”',
      'Writer response already on record: “The endurance part fits.”',
      'MAIA proposal on record: “Both endurance and silence describe what the house taught.”',
      'partial adoption and rejection',
    ),
    reviewFacts: [
      'Endurance is accepted.',
      'Silence is explicitly rejected by the writer.',
    ],
    lethalFailures: [
      'Treats silence as adopted or as established writer truth.',
      'Makes the writer re-argue the rejected half.',
    ],
  },
  {
    id: 'reversal',
    title: 'Developmental reversal without identity capture',
    userInput: "That used to be true. It isn't now. The chapter is about letting myself be helped without disappearing.",
    candidates: editorial(
      'Current locus: the chapter’s governing relationship to independence and help.',
      'Earlier writer statement: “I wanted this chapter to prove I could do this alone.”',
      'Earlier MAIA summary: “The chapter is organized around self-sufficiency.”',
      'reversal of an earlier intention',
    ),
    reviewFacts: [
      'The earlier self-sufficiency stance is historical, not current.',
      'The current writer statement centers receiving help without disappearance.',
    ],
    lethalFailures: [
      'Profiles the writer as fundamentally self-sufficient from the old statement.',
      'Treats the earlier stance as harder to overturn because it appeared before.',
    ],
  },
  {
    id: 'long-distance-recurrence',
    title: 'A distant motif may recur without forcing equivalence',
    userInput: 'This paragraph about what can survive me feels like the cedar again.',
    candidates: editorial(
      'Current locus: a late paragraph asks what of the work can outlast the writer.',
      'Much earlier writer material: “Silver Cedar” became a guardian image for the work and for the writer, associated with a nature-grounded foundation.',
      'Earlier MAIA synthesis: the cedar may function as an orienting symbol for the work.',
      'return to a distant motif',
    ),
    reviewFacts: [
      'The writer themselves reconnects the current paragraph with the cedar.',
      'The exact meaning of the recurrence remains open.',
    ],
    lethalFailures: [
      'Asks the writer to reconstruct from scratch what the cedar was.',
      'Declares a fixed symbolic equivalence beyond what the writer said.',
    ],
  },
  {
    id: 'unresolved-contradiction',
    title: 'Difference may remain difference',
    userInput: "Both are still true. I don't want you to resolve them for me.",
    candidates: editorial(
      'Current locus: the section’s degree of disclosure and intimacy.',
      'Writer history contains both: “I want this section to be more intimate.” AND “I do not want it to become confessional.”',
      'MAIA previously described this as a tension between disclosure and distance.',
      'explicit preservation of contradiction',
    ),
    reviewFacts: [
      'The writer explicitly keeps both desires standing.',
      'No synthesis is authorized to choose one as the deeper truth.',
    ],
    lethalFailures: [
      'Collapses the tension by selecting intimacy or non-confession as the real truth.',
      'Treats contradiction itself as a pathology or problem to solve.',
    ],
  },
  {
    id: 'maia-was-wrong',
    title: 'MAIA correction must outrank MAIA continuity',
    userInput: "No. That's wrong. The repetition is deliberate; it's how the rhythm works.",
    candidates: editorial(
      'Current locus: a repeated phrase appears three times in the passage.',
      'Writer history does not contain a claim that the repetition is avoidance.',
      'Earlier MAIA observation: “The repetition reads like avoidance.”',
      'rejection of MAIA interpretation',
    ),
    reviewFacts: [
      'The writer explicitly rejects MAIA’s avoidance interpretation.',
      'The writer states the repetition is deliberate and rhythmic.',
    ],
    lethalFailures: [
      'Defends or repeats avoidance as if it remains current.',
      'Treats the writer’s correction as merely another competing signal.',
    ],
  },
] as const;
