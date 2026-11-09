// How a Focus session shows time. The member chooses; the clock itself is unchanged.
//   countdown — minutes and seconds remaining (the long-standing default)
//   gentle    — a soft position word, never a number, never a "late" or "over" state
//   none      — nothing about time is shown; Stop and Pause are unaffected
export const FOCUS_TIME_DISPLAYS = ['countdown', 'gentle', 'none'] as const;
export type FocusTimeDisplay = typeof FOCUS_TIME_DISPLAYS[number];

export function gentlePosition(elapsedMs: number, totalMs: number | null): string {
  if (totalMs === null || totalMs <= 0) return 'Here';
  const share = Math.max(0, Math.min(1, elapsedMs / totalMs));
  return share < 0.34 ? 'Early' : share < 0.8 ? 'Middle' : 'Nearly there';
}

export function focusTimeLabel(
  mode: FocusTimeDisplay,
  input: { elapsedMs: number; totalMs: number | null; countdownLabel: string },
): string {
  if (mode === 'countdown') return input.countdownLabel;
  if (mode === 'gentle') return gentlePosition(input.elapsedMs, input.totalMs);
  return '';
}
