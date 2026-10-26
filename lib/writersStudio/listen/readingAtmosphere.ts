/**
 * Writer-selected visual atmosphere for the reading paper, not a treatment or
 * a diagnosis. Choices never change the manuscript, recording or Studio theme.
 */
export const READING_ATMOSPHERES = [
  {
    id: 'parchment', label: 'Parchment', meaning: 'Quiet, classic paper',
    paper: '#FFFEFA', text: '#293941', heading: '#293F47', muted: '#58666B',
    rule: '#DEDCD1', accent: '#37675D', control: '#F1F4EF', glow: '104 151 129',
  },
  {
    id: 'earth', label: 'Earth', meaning: 'Natural, grounded warmth',
    paper: '#F0E9DA', text: '#263B31', heading: '#315040', muted: '#4B5D52',
    rule: '#CCC4B0', accent: '#3E6550', control: '#E5E7D8', glow: '107 147 92',
  },
  {
    id: 'water', label: 'Water', meaning: 'Fluid, spacious calm',
    paper: '#E7F2EF', text: '#233E47', heading: '#24515A', muted: '#47636B',
    rule: '#C4D8D5', accent: '#326B74', control: '#DCECE8', glow: '69 139 152',
  },
  {
    id: 'fire', label: 'Fire', meaning: 'Expressive, ember warmth',
    paper: '#F8EADB', text: '#45312B', heading: '#694330', muted: '#6D5548',
    rule: '#E2CBB4', accent: '#85523F', control: '#F1DDC8', glow: '190 125 75',
  },
  {
    id: 'air', label: 'Air', meaning: 'Open, clear sky',
    paper: '#EAF2FA', text: '#263C54', heading: '#344C67', muted: '#4E6378',
    rule: '#CDDBE8', accent: '#4B6A8E', control: '#DEEBF7', glow: '112 153 189',
  },
  {
    id: 'aether', label: 'Aether', meaning: 'Deep, contemplative night',
    paper: '#253945', text: '#F3F3EC', heading: '#F3DFB6', muted: '#CED7DC',
    rule: '#50616B', accent: '#D6E4D0', control: '#344B57', glow: '143 195 173',
  },
] as const;

export type ReadingAtmosphere = (typeof READING_ATMOSPHERES)[number]['id'];

export function isReadingAtmosphere(value: unknown): value is ReadingAtmosphere {
  return typeof value === 'string'
    && READING_ATMOSPHERES.some((atmosphere) => atmosphere.id === value);
}

export function readingAtmosphereById(id: ReadingAtmosphere) {
  return READING_ATMOSPHERES.find((atmosphere) => atmosphere.id === id)
    ?? READING_ATMOSPHERES[0];
}
