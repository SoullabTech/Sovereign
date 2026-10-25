export const READER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const READER_MOMENT_TYPES = [
  'highlight',
  'note',
  'question',
  'insight',
] as const;

export const READER_RITUAL_MODES = [
  'earth',
  'water',
  'fire',
  'air',
  'aether',
] as const;

export type ReaderMomentType = typeof READER_MOMENT_TYPES[number];
export type ReaderRitualMode = typeof READER_RITUAL_MODES[number];

export function readerUuid(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return READER_UUID.test(normalized) ? normalized : null;
}

export function readerMomentType(value: unknown): ReaderMomentType | null {
  return typeof value === 'string' &&
    (READER_MOMENT_TYPES as readonly string[]).includes(value)
      ? value as ReaderMomentType : null;
}

export function readerRitualMode(value: unknown): ReaderRitualMode | null {
  if (value == null || value === '') return null;
  return typeof value === 'string' &&
    (READER_RITUAL_MODES as readonly string[]).includes(value)
      ? value as ReaderRitualMode : null;
}

export function readerText(value: unknown, max: number): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > max) return null;
  return normalized;
}

export interface ReadingMomentRow {
  id: string;
  segment_id: string;
  moment_type: string;
  content: string | null;
  ritual_mode: string | null;
  created_at: Date | string;
  segment_text?: string;
  segment_index?: number;
}

export function presentReadingMoment(row: ReadingMomentRow) {
  return {
    id: row.id,
    segmentId: row.segment_id,
    type: row.moment_type,
    content: row.content ?? undefined,
    ritualMode: row.ritual_mode ?? undefined,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
    segmentText: row.segment_text,
    segmentIndex: row.segment_index,
  };
}
