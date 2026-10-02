import { readability } from '@/lib/house/readability';

/**
 * Shared semantic typography for Divination rooms.
 *
 * I Ching, Tarot, and Runes may keep distinct color/palette treatments, but
 * equivalent information carries the same size/family/line-height everywhere.
 */
export const divinationType = {
  roomTitle: readability.roomTitle,
  sectionTitle: readability.sectionTitle,
  itemTitle: readability.itemTitle,
  fieldLabel: readability.metadata + ' font-semibold',
  fieldBody: readability.reading,
  support: readability.body,
  metadata: readability.metadata,
  action: readability.action,
  marker: readability.marker,
  tag: readability.metadata,
} as const;
