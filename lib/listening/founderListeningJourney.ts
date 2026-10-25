/** LISTEN-16: private founder listening score / chapter metadata only.
 * NOT a recording, streaming license, validated music master, member memory,
 * automatic emotional interpretation, or authority to fetch a file.
 *
 * This map only appears for a manually selected, correctly timed local file.
 * Filename/duration identify a review cue sheet, NOT verified ownership.
 */
export type ListeningChapter = {
  readonly id: string;
  readonly label: string;
  readonly startSeconds: number;
  readonly intention: string;
};

export const BETWEEN_TIDES_FOUNDER_STUDY = {
  id: 'listen15-between-tides-founder-private',
  title: 'Between the Tides — An Extended Listening Journey',
  durationSeconds: 1200,
  status: 'PRIVATE FOUNDER STUDY · NOT RELEASED',
  chapters: [
    { id: 'threshold', label: 'Threshold', startSeconds: 0,
      intention: 'A softer arrival—warm harmony and room to breathe.' },
    { id: 'velvet-current', label: 'Velvet Current', startSeconds: 210,
      intention: 'A gentle current of pulse, bass and plucked motifs.' },
    { id: 'unfolding', label: 'Unfolding', startSeconds: 540,
      intention: 'The harmony opens without demanding attention.' },
    { id: 'return', label: 'Return', startSeconds: 870,
      intention: 'The rhythm recedes and the listening begins to settle.' },
    { id: 'dissolve', label: 'Dissolve', startSeconds: 1110,
      intention: 'An intentional closing, making space for silence.' },
  ] as const satisfies readonly ListeningChapter[],
} as const;

const PRIVATE_STUDY_FILENAMES = new Set([
  'Between_the_Tides_Founder_Study_20min_AAC256.m4a',
  'Between_the_Tides_Founder_Study_20min_24bit48k.flac',
]);

export function isBetweenTidesFounderAudition(
  filename: string, durationSeconds: number | null,
): boolean {
  // Static private score recognition only. The founder must still decide
  // which actual file/rights were provided; no stream/source is exposed.
  return PRIVATE_STUDY_FILENAMES.has(filename) &&
    durationSeconds !== null &&
    Number.isFinite(durationSeconds) &&
    Math.abs(durationSeconds - BETWEEN_TIDES_FOUNDER_STUDY.durationSeconds) <= 1.2;
}

export function listeningTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function chapterAt(seconds: number): ListeningChapter {
  const chapters = BETWEEN_TIDES_FOUNDER_STUDY.chapters;
  let current: ListeningChapter = chapters[0];
  for (const chapter of chapters) if (Number.isFinite(seconds) &&
    seconds >= chapter.startSeconds) current = chapter;
  return current;
}
