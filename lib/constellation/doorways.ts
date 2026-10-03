export type DoorwayId = 'writers-studio' | 'astrology' | 'relationships' | 'practitioner';

export interface DoorwayAudience {
  id: string;
  label: string;
  longing: string;
  invitation: string;
}

export interface DoorwayDefinition {
  id: DoorwayId;
  name: string;
  path: string;
  promise: string;
  difference: string;
  audiences: readonly DoorwayAudience[];
  bridges: readonly DoorwayId[];
}

export const DOORWAYS: Record<DoorwayId, DoorwayDefinition> = {
  'writers-studio': {
    id: 'writers-studio',
    name: 'Writer’s Studio',
    path: '/writers-studio',
    promise: 'Bring the work only you can write into its fullest form.',
    difference: 'Strengthen the writing without replacing the person behind it.',
    audiences: [
      {
        id: 'wisdom-carrier',
        label: 'Wisdom carriers',
        longing: 'I have a lifetime of experience that deserves a form that can travel.',
        invitation: 'Bring your wisdom into form without sanding away the life inside it.',
      },
      {
        id: 'existing-author',
        label: 'Existing authors',
        longing: 'The manuscript is real, but I know it has not reached its fullest expression.',
        invitation: 'Refine the book while preserving the voice, lineage, and intention that made it yours.',
      },
      {
        id: 'voice-first',
        label: 'People who speak better than they write',
        longing: 'I know what I mean when I speak, but the page loses something.',
        invitation: 'Let the page learn to carry the intelligence already present in your voice.',
      },
      {
        id: 'editorially-wounded',
        label: 'Writers protecting their voice',
        longing: 'I want help, but I do not want to disappear inside someone else’s idea of good writing.',
        invitation: 'Work with an editorial intelligence that treats authorship as something to protect.',
      },
    ],
    bridges: ['relationships', 'astrology', 'practitioner'],
  },
  astrology: {
    id: 'astrology',
    name: 'Astrology',
    path: '/astrology',
    promise: 'Meet your chart as a living whole rather than a personality report.',
    difference: 'Whole-chart, non-deterministic synthesis held in conversation with MAIA.',
    audiences: [],
    bridges: ['relationships', 'writers-studio'],
  },
  relationships: {
    id: 'relationships',
    name: 'Relationships',
    path: '/relationships',
    promise: 'Explore the living field between people without reducing either person to a type.',
    difference: 'Relationship is treated as a field of meaning, pattern, choice, and mutual becoming.',
    audiences: [],
    bridges: ['writers-studio', 'astrology', 'practitioner'],
  },
  practitioner: {
    id: 'practitioner',
    name: 'Practitioner',
    path: '/practitioner',
    promise: 'Support the practitioner’s intelligence rather than replacing it.',
    difference: 'MAIA serves reflection, preparation, continuity, and discernment while preserving human authority.',
    audiences: [],
    bridges: ['writers-studio', 'relationships'],
  },
};

export function getDoorway(id: DoorwayId): DoorwayDefinition {
  return DOORWAYS[id];
}

export function getDoorwayAudience(doorway: DoorwayId, audienceId?: string | null) {
  if (!audienceId) return undefined;
  return DOORWAYS[doorway].audiences.find((audience) => audience.id === audienceId);
}
