/**
 * Wisdom Keepers — Gather Together (founder review ONLY).
 *
 * These four waypoints describe the EXISTING architecture proposed for
 * source discovery → member intent → private Circle → video participation.
 * They are fictional navigation, not member access, consent, event enrolment,
 * keeper licensing or provider readiness.
 *
 * Authority remains with the actual Circle membership and a separately
 * approved, authenticated multi-person meeting door. The ordinary Wisdom
 * page has NO import of this file during Stage H.
 */
export type WisdomGatherStageId = 'source' | 'intention' | 'circle' | 'meeting';
export type WisdomGatherStage = Readonly<{
  id: WisdomGatherStageId;
  title: string;
  subtitle: string;
  why: string;
  memberExperience: string;
  currentStanding: string;
  boundary: string;
}>;

export const WISDOM_GATHER_STAGE_ORDER: readonly WisdomGatherStageId[] =
  ['source','intention','circle','meeting'];

export const WISDOM_GATHER_STAGES: readonly WisdomGatherStage[] = [
  {
    id:'source',
    title:'Encounter the wisdom',
    subtitle:'Discover original voices',
    why:'Begin with the real writer or teacher and their original work.',
    memberExperience:'Explore a named source and follow the author’s own links. Soullab’s commentary must be distinct and attributed.',
    currentStanding:'Public source reference · No keeper partnership implied',
    boundary:'An author’s public website does not grant book reproduction, AI training, or permission to contact the author automatically.',
  },
  {
    id:'intention',
    title:'Choose to gather',
    subtitle:'Interest is yours to declare',
    why:'A member may wish to explore an inquiry with others.',
    memberExperience:'See the purpose and boundaries of a future gathering before deciding whether to express interest.',
    currentStanding:'Proposed · No interest registration or enrolment',
    boundary:'Neither MAIA, a chart, private memory nor usage history can infer or publish a person’s interest in this Commons.',
  },
  {
    id:'circle',
    title:'Enter a Circle',
    subtitle:'Belong through consent',
    why:'A private, living field needs people who choose to meet and know how to leave.',
    memberExperience:'An invited member would review the real host, privacy and sharing rules, then deliberately join their specific Circle.',
    currentStanding:'Circle UI and API founder-restricted · Not open to this pilot cohort',
    boundary:'A founder allowlist is not a guest list. Group membership is not permission to read Sanctuary, publish stories, or record the meeting.',
  },
  {
    id:'meeting',
    title:'Meet together',
    subtitle:'Online first, hybrid later',
    why:'Human presence matters more than a platform demonstration.',
    memberExperience:'After independent approval, use the existing Soullab hybrid/video service to hold a small, private online gathering. Later, offer an equally participatory hybrid room.',
    currentStanding:'Video and recording safeguards not yet accepted for a 6–8-person Circle',
    boundary:'No room is running or scheduled. Multi-person media, invite rejection, recording controls and privacy notice must be verified before any real join.',
  },
];

export const WISDOM_GATHER_FICTIONAL_PILOT = Object.freeze({
  title:'Where Symbols Meet Life',
  durationMinutes:75,
  group:'6–8 consenting adults (facilitation target, not a Circle law)',
  humanHost:'Proposed Soullab founder/facilitator',
  date:'Not scheduled',
  room:'No room or joining link',
  recording:'Recording and AI transcription must be OFF; actual controls unverified',
  originalSource:'Glenn Perry, Ph.D. — independent public reference, not a guest or partner',
  authorWebsite:'https://aaperry.com/',
  academyWebsite:'https://astropsychology.org/',
});
