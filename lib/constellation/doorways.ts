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
    audiences: [
      {
        id: 'whole-chart',
        label: 'Whole-chart seekers',
        longing: 'I want more than placements and fragments. I want to understand how the chart speaks as a whole.',
        invitation: 'Meet your chart as a living pattern rather than a collection of isolated traits.',
      },
      {
        id: 'symbolic-inquiry',
        label: 'Symbolic self-inquiry',
        longing: 'I am interested in astrology, but I do not want an app telling me who I am or what will happen.',
        invitation: 'Use astrology as a symbolic language for inquiry — suggestive, relational, and never deterministic.',
      },
      {
        id: 'serious-astrology',
        label: 'Serious astrology learners',
        longing: 'I want the calculated chart, the tradition behind the symbols, and a conversation sophisticated enough to hold both.',
        invitation: 'Bring calculation, symbolic tradition, whole-chart synthesis, and your own lived meaning into one conversation.',
      },
      {
        id: 'astrology-practitioner',
        label: 'Astrology practitioners',
        longing: 'I want to see what becomes possible when a chart is held conversationally without giving interpretation authority over the person.',
        invitation: 'Explore a relational astrology environment built to keep the chart, the tradition, and the human being distinct.',
      },
    ],
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
