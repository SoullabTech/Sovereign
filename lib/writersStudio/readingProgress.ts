/**
 * Honest progress for a long chapter reading (Nov 8 witness: "several minutes" with one unchanging line, so slow and stuck looked the same).
 * PURE. Elapsed time after the first few seconds; after a few minutes, say plainly that it can still finish and nothing is affected.
 * ⛔ Never claims a percentage or an estimate it cannot know.
 */
export const LONG_READ_MS = 180_000;

export function readingProgressText(stage: string, elapsedMs: number): string {
  if (elapsedMs < 10_000) return stage;
  const s = Math.floor(elapsedMs / 1000);
  const clock = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const base = `${stage} (${clock} so far)`;
  return elapsedMs >= LONG_READ_MS
    ? `${base}. This is taking longer than usual. It may still finish: keep this page open, or try again later. Your writing is not affected.`
    : base;
}
