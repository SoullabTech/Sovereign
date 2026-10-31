import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { fullPrefaceReading } from './fullPrefaceReading';

export const COMPLETE_PREFACE_ID = 'listen:entire-preface';

/** An explicit reading address wins over arrival defaults; never substitute another section. */
export function resolveListenReading(
  sections: readonly RebuildSection[], requested: string | null,
): string | null {
  if (requested !== null) {
    if (requested === COMPLETE_PREFACE_ID) return fullPrefaceReading(sections) ? requested : null;
    return sections.some(section => section.draftSectionId === requested) ? requested : null;
  }
  return fullPrefaceReading(sections) ? COMPLETE_PREFACE_ID : sections[0]?.draftSectionId ?? null;
}

/** Downloads are requests, not proof of custody; leaving may discard either kind of local work. */
export function hasListenSessionWork(takes: number, notes: string, recording: boolean): boolean {
  return takes > 0 || notes.trim().length > 0 || recording;
}

export const LISTEN_LEAVE_WARNING =
  'Recordings and notes are kept only in this browser session. Download them before leaving Listen. Leave anyway?';
