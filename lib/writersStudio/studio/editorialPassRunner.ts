/**
 * The editorial pass, in one place, for every room that offers it (Write and Develop).
 *
 * MAIA reads the whole current manuscript through every lens (reusing any reading already frozen for this exact draft and
 * section set), then gathers what she found into an ordered set of places where an edit may help. Nothing in the manuscript is
 * changed by any of this. A refused reading is never repaired; it is tried once more, and a second refusal stops the pass.
 *
 * EA walk 2026-11-11 (production): the pass in Develop could never finish — overview had joined the review (9 readings) while
 * the pass still demanded 8, and the synthesis route accepts exactly the 8 deep lenses. Completeness is the review's own rule
 * here, and the overview reading is kept out of the synthesis set.
 */
import { runWholeManuscriptReview, wholeReviewComplete } from '@/lib/writersStudio/studio/wholeManuscriptReview';
import { requestAttentionMap } from '@/lib/writersStudio/attentionMapClient';
import type { WholeManuscriptAttentionMap } from '@/lib/writersStudio/studio/attentionMap';

export const EDITORIAL_PASS_REQUEST = 'Make an editorial pass through this whole manuscript from macro to micro. Identify the evidenced places where a concrete editorial move may help: clarification, compression, expansion, transition, reordering, repetition, voice, pacing, or another text-level change supported by the frozen readings. Do not rewrite the prose yet. Order the opportunities from Begin here through Next, Later, and Watch. For each item, say plainly what may be worth editing and why, while preserving the author’s intention, voice, subject, and intentional ambiguity. Ground every item in the frozen observations.';

export type EditorialPassOutcome =
  | { ok: true; map: WholeManuscriptAttentionMap }
  | { ok: false; stage: 'readings' | 'synthesis'; message: string };

export async function runEditorialPass(input: {
  manuscriptId: string;
  revisionNumber: number;
  sectionIds: readonly string[];
  onProgress?: (text: string) => void;
}): Promise<EditorialPassOutcome> {
  const runReview = () => runWholeManuscriptReview(
    input.manuscriptId,
    (done, total, lens) => input.onProgress?.(
      done >= total ? `${total} readings complete. Preparing edit suggestions…` : `Reading ${done + 1} of ${total}: ${lens}…`,
    ),
    { revisionNumber: input.revisionNumber, sectionIds: [...input.sectionIds] },
  );
  let bundle = await runReview();
  if (!wholeReviewComplete(bundle) && bundle.remaining.length === 0 && bundle.failures.length > 0) {
    bundle = await runReview();
  }
  if (!wholeReviewComplete(bundle)) {
    return { ok: false, stage: 'readings', message: 'MAIA did not finish reading the whole manuscript, so the editorial pass is incomplete. The readings she completed are still available.' };
  }
  const deepReadingIds = bundle.payloads
    .filter((payload) => payload.reading.scope.commissionedLens !== 'overview')
    .map((payload) => payload.reading.id);
  input.onProgress?.('Preparing the editorial pass…');
  const synthesized = await requestAttentionMap(input.manuscriptId, deepReadingIds, EDITORIAL_PASS_REQUEST);
  if (!synthesized.ok) {
    return { ok: false, stage: 'synthesis', message: 'MAIA finished the readings, but could not prepare the editorial pass just now. The readings remain available and nothing in the manuscript changed.' };
  }
  return { ok: true, map: synthesized.map };
}

/* ── keeping the pass for when the writer comes back ─────────────────────────────────────────────────────────────────────────
   Kept in this browser only (the writer's own device), keyed by manuscript. A pass of an earlier draft is kept and SAID to be of
   an earlier draft — never presented as a reading of the current text. */
const KEY = (manuscriptId: string) => `writers-studio:editorial-pass:v2:${manuscriptId}`;
export interface SavedPass { draftRevision: number; map: WholeManuscriptAttentionMap }

export function loadSavedPass(manuscriptId: string): SavedPass | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY(manuscriptId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedPass>;
    if (!Number.isInteger(parsed.draftRevision) || parsed.map?.manuscriptId !== manuscriptId || !Array.isArray(parsed.map?.items)) return null;
    return { draftRevision: parsed.draftRevision as number, map: parsed.map };
  } catch { return null; }
}

export function savePass(manuscriptId: string, pass: SavedPass): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY(manuscriptId), JSON.stringify(pass)); } catch { /* storage full or blocked: the pass still shows this visit */ }
}

/* ── the writer's own decisions on each place ─────────────────────────────────────────────────────────────────────────────────
   Only ever set by the writer's click; visible and changeable in the letter; never inferred. */
export type PassDecision = 'intended' | 'later';
const DKEY = (manuscriptId: string) => `writers-studio:editorial-pass-decisions:v1:${manuscriptId}`;

export function loadPassDecisions(manuscriptId: string): Record<string, PassDecision> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(DKEY(manuscriptId));
    const parsed = raw ? JSON.parse(raw) as Record<string, unknown> : {};
    const out: Record<string, PassDecision> = {};
    for (const [k, v] of Object.entries(parsed)) if (v === 'intended' || v === 'later') out[k] = v;
    return out;
  } catch { return {}; }
}

export function savePassDecisions(manuscriptId: string, decisions: Record<string, PassDecision>): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(DKEY(manuscriptId), JSON.stringify(decisions)); } catch { /* ignore */ }
}

/** The places in the order they come in the writer's book (the first section each one touches). Never ranked by importance. */
export function inBookOrder<T extends { sectionIds: readonly string[] }>(items: readonly T[], sectionOrder: readonly string[]): T[] {
  const pos = new Map(sectionOrder.map((id, i) => [id, i]));
  const first = (it: T) => Math.min(...it.sectionIds.map((id) => pos.get(id) ?? Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
  return items.map((it, i) => ({ it, i })).sort((a, b) => (first(a.it) - first(b.it)) || (a.i - b.i)).map((x) => x.it);
}
