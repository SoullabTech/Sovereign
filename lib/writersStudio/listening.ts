/**
 * Listening (Studio Academy slice 4, founder 2026-11-19): the founder sees writers' journey answers as they arrive, without
 * emails or texts. Design: docs/programme/STUDIO_ACADEMY_EXPLORATION_2026-11-19.md §3 B, and the 2026-11-19 handoff R3:
 * on-demand refresh, and only if justified, low-rate polling of the founder's own authenticated view.
 *
 * ⛔ Founder side only. It re-reads the existing founder-only answers route; writers' screens send nothing new, and no
 *    background event, click or session record exists. Polling runs only while the founder has the view open, has switched
 *    it on, and the page is visible.
 * ⛔ Withdrawn answers are never shown (the route already drops them), so "new" never resurrects one.
 */
export const LISTEN_INTERVAL_MS = 60_000;

/** The answers that were not there when the founder last looked. */
export function newSince(seen: ReadonlySet<string>, answers: readonly { id: string }[]): Set<string> {
  return new Set(answers.filter((a) => !seen.has(a.id)).map((a) => a.id));
}

/** Newest first, so what just arrived is at the top of each question. */
export function newestFirst<T extends { createdAt: string }>(answers: readonly T[]): T[] {
  return [...answers].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Whether a check may run now: switched on, view open, page visible. */
export function mayListen(input: { on: boolean; viewOpen: boolean; visible: boolean }): boolean {
  return input.on && input.viewOpen && input.visible;
}
