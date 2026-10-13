import { getDoorwayAudience } from './doorways';

export const CONSTELLATION_ARRIVAL_PARAM = 'arrival';
export const CONSTELLATION_AUDIENCE_PARAM = 'audience';
export const CONSTELLATION_CAMPAIGN_PARAM = 'campaign';

export interface WriterArrivalContext {
  audienceId?: string;
  audienceLabel?: string;
  invitation?: string;
  opening?: string;
}

const OPENINGS: Record<string, string> = {
  'wisdom-carrier':
    'You came here with something worth carrying forward. Begin with the work itself; the Studio will not make assumptions about who you are beyond what you choose to bring.',
  'existing-author':
    'You came here with work that already exists. We can begin by understanding what the manuscript is trying to become before changing it.',
  'voice-first':
    'You came here because the intelligence may already be alive in how you speak. Begin wherever the work is most alive; the page can be shaped from there.',
  'editorially-wounded':
    'You came here wanting help without losing yourself in the process. Nothing changes without your choice, and every suggestion remains yours to accept, reject, or reshape.',
};

export function writerStudioArrivalPath(audienceId?: string | null): string {
  const params = new URLSearchParams();
  params.set(CONSTELLATION_ARRIVAL_PARAM, 'doorway');
  params.set(CONSTELLATION_CAMPAIGN_PARAM, 'writers-discover');

  const audience = getDoorwayAudience('writers-studio', audienceId);
  if (audience) params.set(CONSTELLATION_AUDIENCE_PARAM, audience.id);

  return `/writers-studio?${params.toString()}`;
}

export function writerArrivalContext(audienceId?: string | null): WriterArrivalContext {
  const audience = getDoorwayAudience('writers-studio', audienceId);

  if (!audience) {
    return {
      opening:
        'Welcome to Writer’s Studio. Begin with the work itself; you do not need to understand the rest of Soullab before you start.',
    };
  }

  return {
    audienceId: audience.id,
    audienceLabel: audience.label,
    invitation: audience.invitation,
    opening: OPENINGS[audience.id],
  };
}
