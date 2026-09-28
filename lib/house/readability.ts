/**
 * Soullab House Readability Standard
 *
 * Human factors baseline: Soullab should be comfortable to read without
 * requiring zoom. Hierarchy comes primarily from family, weight, contrast,
 * spacing, measure, and placement — not from making meaningful text tiny.
 *
 * Decorative markers may be smaller only when they carry no unique information.
 */
export const readability = {
  /** Meaning-bearing prose uses the literary House register. */
  meaningFont: 'font-serif',

  /** Interface/orientation language uses the quieter utility register. */
  interfaceFont: 'font-sans',

  /** Long-form member or system prose. 17–19px. */
  reading: 'font-serif text-[17px] sm:text-[18px] leading-[1.65]',

  /** Ordinary interface copy and meaningful supporting text. 16–17px. */
  body: 'font-sans text-[16px] sm:text-[17px] leading-[1.55]',

  /** Buttons, tabs, navigation, and member actions. Never micro-sized. */
  action: 'font-sans text-[16px] leading-[1.35]',

  /** Titles within cards/rows. */
  itemTitle: 'font-serif text-[18px] sm:text-[19px] leading-[1.4]',

  /** Section heading inside a room. */
  sectionTitle: 'font-serif text-[24px] sm:text-[28px] leading-[1.15]',

  /** Primary room/page heading. */
  roomTitle: 'font-serif text-[28px] sm:text-[32px] leading-[1.12]',

  /** Meaningful metadata: dates, provenance, source names. 14px floor. */
  metadata: 'font-sans text-[14px] sm:text-[15px] leading-[1.45]',

  /**
   * Decorative/category marker only. May never be the sole carrier of
   * instructions, provenance, dates, actions, status, or member content.
   */
  marker: 'font-sans text-[12px] leading-[1.4] tracking-[0.14em] uppercase',
} as const;

export const readabilityLaw = {
  meaningfulTextFloorPx: 14,
  ordinaryCopyFloorPx: 16,
  readingCopyFloorPx: 17,
  actionFloorPx: 16,
  touchTargetPx: 44,
  preferredReadingMeasureCh: [45, 75] as const,
} as const;
