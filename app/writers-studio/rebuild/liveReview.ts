/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1B — LIVE SINGLE-READING READ-ONLY REVIEW, AS DATA.
 *
 *   explicit URL reading identity (?reading=<id>)
 *        ↓ existing member-scoped GET seams, ledger first, then the exact reading
 *        ↓ R1-0 pure mapper (unchanged authority)
 *        ↓ context binding: every finding's return section must be in the current context
 *        ↓ ready | unavailable — never a fallback, never a substitute, never a commission
 *
 * ⛔ No `reading` parameter → idle: NOTHING is fetched. ⛔ Not listed → unavailable, the
 * exact reading is never requested (no existence probe). ⛔ Any non-`ready` mapping →
 * unavailable, one indistinguishable state for every reason. ⛔ No POST of any kind.
 * ⛔ A late result attaches only to the exact selection (reading id + generation) it
 * was commissioned for.
 */
import type { ReviewView, LensId } from '@/app/writers-studio/flagship/DevelopReview';
import type { ReviewScope } from '@/lib/writersStudio/studio/reading';
import { mapRealReview, type ReviewHostFacts, type StoredReadingSummary } from '@/lib/writersStudio/studio/realReview';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { chapterSpanFor } from '@/lib/writersStudio/rebuild/model';
import { toWriteFoot, toWriteHeading } from '@/lib/writersStudio/studio/adapters/writeView';

/** The bounded selected-reading query parameter (founder ruling, R1-1B §II). */
export const READING_PARAM = 'reading';

export function selectedReadingId(search: { get(name: string): string | null } | null): string | null {
  const v = search?.get(READING_PARAM) ?? null;
  return v && v.length > 0 ? v : null;
}

export interface PortReply { readonly ok: boolean; readonly status: number; readonly json: unknown }
export interface ReviewPorts {
  listReadings(manuscriptId: string): Promise<PortReply>;
  getReading(manuscriptId: string, readingId: string): Promise<PortReply>;
}
export type LoadResult =
  | { readonly kind: 'idle' }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'ready'; readonly view: ReviewView; readonly sourceReadingId: string };

export type LiveReviewState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading'; readonly readingId: string; readonly gen: number }
  | { readonly kind: 'unavailable'; readonly readingId: string; readonly gen: number }
  | { readonly kind: 'ready'; readonly readingId: string; readonly gen: number; readonly view: ReviewView };

/** ⭐ One calm sentence for every unavailable reason. ⛔ Never a refusal code, never existence. */
export const REVIEW_COPY = Object.freeze({
  loading: 'Opening MAIA’s reading…',
  unavailable: 'This reading isn’t available to show here. Nothing about your Work has changed.',
});

const summaries = (json: unknown): readonly StoredReadingSummary[] | null => {
  const list = (json as { readings?: unknown } | null)?.readings;
  if (!Array.isArray(list)) return null;
  return list.every((r) => r && typeof (r as { id?: unknown }).id === 'string') ? (list as StoredReadingSummary[]) : null;
};

/**
 * ⭐ Context binding (R1-1B §VII): the current manuscript context shown beside a finding must
 * actually contain that finding's exact return section. ⛔ No second-paragraph, nearest,
 * focus-section or first-available stand-in. Checked for EVERY finding so no lens filter can
 * surface an unbound one.
 */
export function bindContext(view: ReviewView): { ok: boolean } {
  const ids = new Set(view.context.paragraphs.map((p) => p.id));
  return { ok: view.findings.every((f) => ids.has(f.returnTo.sectionId)) };
}

export async function loadSelectedReading(readingId: string | null, host: ReviewHostFacts, ports: ReviewPorts): Promise<LoadResult> {
  if (!readingId) return { kind: 'idle' };
  const ledger = await ports.listReadings(host.manuscriptId);
  if (!ledger.ok) return { kind: 'unavailable' };
  const listed = summaries(ledger.json);
  if (!listed || !listed.some((s) => s.id === readingId)) return { kind: 'unavailable' };
  const one = await ports.getReading(host.manuscriptId, readingId);
  if (!one.ok) return { kind: 'unavailable' };
  const mapped = mapRealReview({ summaries: listed, selectedReadingId: readingId, payload: one.json, host });
  if (mapped.kind !== 'ready') return { kind: 'unavailable' };
  if (!bindContext(mapped.view).ok) return { kind: 'unavailable' };
  return { kind: 'ready', view: mapped.view, sourceReadingId: mapped.sourceReadingId };
}
export const load = loadSelectedReading;

/** ⭐ A result attaches only to the exact selection that commissioned it. */
export function attachReview(pending: { readonly gen: number; readonly readingId: string }, current: { readonly gen: number; readonly readingId: string | null }): boolean {
  return pending.gen === current.gen && current.readingId === pending.readingId;
}
export const attach = attachReview;

/** Host facts from what the host has ALREADY loaded — never fixture prose, never cognition. */
export function hostFactsFrom(input: {
  readonly manuscriptId: string; readonly workTitle: string | null; readonly workKind: string | null;
  readonly sections: readonly RebuildSection[]; readonly focusId: string | null;
}): ReviewHostFacts {
  const span = input.focusId ? chapterSpanFor(input.sections, input.focusId) : null;
  const heading = toWriteHeading(span);
  const foot = toWriteFoot({ span, bodies: [] });
  const scope: ReviewScope = span
    ? { kind: 'chapter', label: heading.chapterTitle ?? foot.chapterLabel ?? 'This chapter', sectionId: span.root.draftSectionId }
    : { kind: 'work' };
  return {
    manuscriptId: input.manuscriptId,
    work: input.workTitle ?? '',
    kind: input.workKind ?? 'manuscript',
    scope,
    context: {
      chapterLabel: foot.chapterLabel ?? '', chapterTitle: heading.chapterTitle ?? (input.workTitle ?? ''), page: '',
      /* ⭐ The already-loaded current sections, in the DRAFT-SECTION id space the frozen readings address. ⛔ Never fixture prose. */
      paragraphs: input.sections.map((s) => ({ id: s.draftSectionId, text: s.body })),
    },
  };
}
export type { LensId };
