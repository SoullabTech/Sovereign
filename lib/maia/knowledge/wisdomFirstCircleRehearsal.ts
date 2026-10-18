/**
 * First founder-hosted Wisdom Circle: fictional, read-only rehearsal cues.
 *
 * No booking, member data, recording, MAIA model, copyright corpus,
 * live private content, timer, or event state is represented here.
 * Matches STAGE-F_FIRST-GATHERING_PILOT-REHEARSAL_CANDIDATE_20261017.json.
 */
export type FirstWisdomCircleMovement = Readonly<{
  id: string;
  startMinute: number;
  endMinute: number;
  title: string;
  element: string;
  invitation: string;
  boundary: string;
}>;

export const FIRST_WISDOM_CIRCLE_DURATION_MINUTES = 75;

export const FIRST_WISDOM_CIRCLE_MOVEMENTS: readonly FirstWisdomCircleMovement[] = Object.freeze([
  {
    id:'arrival',
    startMinute:0,
    endMinute:10,
    title:'Arrive freely',
    element:'Arrival',
    invitation:'You may speak, listen, write privately, or pass. Nothing requires you to disclose your history.',
    boundary:'Confirm privacy and recording status; this is educational, not therapy.',
  },
  {
    id:'source',
    startMinute:10,
    endMinute:20,
    title:'Honor the source',
    element:'Lineage',
    invitation:'A symbol can invite meaning, but it cannot decide what happened to you or who you must become.',
    boundary:'Name Glenn Perry as an independent public reference, not as a participating host. No copyrighted reproduction.',
  },
  {
    id:'needs',
    startMinute:20,
    endMinute:35,
    title:'Two needs, one life',
    element:'Earth / Water / Air / Fire / Weather',
    invitation:'One part longs for closeness; another asks for space. Can both needs deserve a hearing?',
    boundary:'Use a fictional example and self-authored optional reflection; no natal charts or inferred trauma.',
  },
  {
    id:'witness',
    startMinute:35,
    endMinute:55,
    title:'Listen and respond',
    element:'Relationship',
    invitation:'What surprised you when neither need had to be wrong?',
    boundary:'No forced turn-taking, advice, group diagnosis, or mandatory disclosure.',
  },
  {
    id:'discern',
    startMinute:55,
    endMinute:65,
    title:'Allow different meanings',
    element:'Discernment',
    invitation:'Can two people carry different meanings from the same symbol and remain free?',
    boundary:'Facilitator holds procedure, not interpretation. Disagreement is allowed.',
  },
  {
    id:'close',
    startMinute:65,
    endMinute:75,
    title:'Keep what is yours',
    element:'Return',
    invitation:'What, if anything, would you like to carry privately from this time together?',
    boundary:'No automatic summary, sharing, AIN contribution, retention nudge, or obligation to return.',
  },
]);
