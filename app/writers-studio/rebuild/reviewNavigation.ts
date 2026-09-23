/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1C — REVIEW NAVIGATION SUCCESSION, AS DATA.
 *
 *   Write  ↕  Review          (visible flagship destinations; successor to the frozen C1B-L6 regime)
 *
 * Entry into a PARTICULAR Review still resolves only through:
 *
 *   explicit human selection of one durable reading
 *        ↓ reading=<id>            (the one URL state authority — R1-1B §II, unchanged)
 *        ↓ the existing R1-1B runtime (ledger → exact reading → R1-0 mapper → ready | unavailable)
 *
 * ⛔ Choosing `Review` with no reading selects NOTHING: it enters a bounded selection state that shows
 * the member-owned ledger's own metadata so the member can choose. ⛔ Never newest, first, latest,
 * best, nearest, latest-per-lens or "current". ⛔ A choice is a LOCATION, never a mount. ⛔ Returning
 * to Write removes only `reading` and preserves every other lawful same-route state. ⛔ Ordinary Write
 * fetches nothing until the member invokes Review. ⛔ The URL outranks every in-memory flag: an explicit
 * `reading` is Review, whatever the chooser flag says. ⛔ No POST exists here.
 */
import { READING_PARAM } from './liveReview';
import type { StoredReadingSummary } from '@/lib/writersStudio/studio/realReview';
import type { NavAction, NavActions } from '../flagship/flagshipTokens';
export type { NavAction, NavActions };

export type StudioMode = 'write' | 'review-choose' | 'review';
export interface NavRequest { readonly reading: string | null; readonly chooserOpen: boolean }
export interface Loc { readonly pathname: string; readonly search: string }

/** ⭐ URL first. An explicit `reading` is Review whatever the transient chooser flag says (single state authority). */
export function studioMode(req: NavRequest): StudioMode {
  if (req.reading) return 'review';
  return req.chooserOpen ? 'review-choose' : 'write';
}

export type ReviewEntry = { readonly kind: 'review'; readonly readingId: string } | { readonly kind: 'choose' };
/**
 * What choosing `Review` means. With an explicit reading: that reading. Without one: the selection state.
 * ⛔ The ledger is deliberately NOT consulted — no reading identity is ever inferred from it here.
 */
export function enterReview(reading: string | null): ReviewEntry {
  return reading ? { kind: 'review', readingId: reading } : { kind: 'choose' };
}

/** Same route, `reading` removed, everything else (m · s · dev-only params) preserved. */
export function locationForWrite(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  params.delete(READING_PARAM);
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}
/** Same route, `reading` set to exactly the chosen id, everything else preserved. */
export function locationForReading(pathname: string, search: string, readingId: string): string {
  const params = new URLSearchParams(search);
  params.set(READING_PARAM, readingId);
  return `${pathname}?${params.toString()}`;
}

export type ChoiceOutcome = { readonly kind: 'navigate'; readonly href: string };
/** ⭐ The human choice yields a location and nothing else; R1-1B takes over from the URL. */
export function chooseReading(readingId: string, loc: Loc): ChoiceOutcome {
  return { kind: 'navigate', href: locationForReading(loc.pathname, loc.search, readingId) };
}

export interface PortReply { readonly ok: boolean; readonly status: number; readonly json: unknown }
export interface ChoicePorts { listReadings(manuscriptId: string): Promise<PortReply> }
export type ChoicesResult = { readonly kind: 'choices'; readonly readings: readonly StoredReadingSummary[] } | { readonly kind: 'unavailable' };

const summaries = (json: unknown): readonly StoredReadingSummary[] | null => {
  const list = (json as { readings?: unknown } | null)?.readings;
  if (!Array.isArray(list)) return null;
  return list.every((r) => r && typeof (r as { id?: unknown }).id === 'string') ? (list as StoredReadingSummary[]) : null;
};
/** The member-owned ledger, in the ledger's own order. ⛔ Never a reading GET. ⛔ Never a selection. */
export async function loadReadingChoices(manuscriptId: string, ports: ChoicePorts): Promise<ChoicesResult> {
  const ledger = await ports.listReadings(manuscriptId);
  if (!ledger.ok) return { kind: 'unavailable' };
  const listed = summaries(ledger.json);
  return listed ? { kind: 'choices', readings: listed } : { kind: 'unavailable' };
}

/** Retrieval for the chooser happens ONLY in the selection state — never on an ordinary Write open, never beside an explicit reading. */
export function shouldLoadChoices(req: NavRequest): boolean {
  return studioMode(req) === 'review-choose';
}

/** ⭐ A late ledger result attaches only while the chooser is still open, nothing has been selected, and the generation matches. */
export function attachChoices(pending: { readonly gen: number }, current: { readonly gen: number; readonly chooserOpen: boolean; readonly reading: string | null }): boolean {
  return pending.gen === current.gen && current.chooserOpen && current.reading === null;
}

export type ChooserState =
  | { readonly kind: 'closed' }
  | { readonly kind: 'loading'; readonly gen: number }
  | { readonly kind: 'choices'; readonly gen: number; readonly readings: readonly StoredReadingSummary[] }
  | { readonly kind: 'unavailable'; readonly gen: number };

export interface NavActs { go(href: string): void; openChooser(): void; closeChooser(): void }
export interface StudioNav {
  readonly mode: StudioMode;
  readonly actions: NavActions;
  readonly choose?: { hrefFor(id: string): string; onChoose(id: string, href: string): void };
}

/**
 * The lawful action behind each visible destination, per mode. The CURRENT destination carries no action
 * (rendered as orientation). ⛔ Nothing here writes, commissions or fetches: a link is a location, an act
 * opens or closes the selection state.
 */
export function navActionsFor(mode: StudioMode, loc: Loc, act: NavActs): NavActions {
  if (mode === 'write') return { review: { kind: 'act', onAct: act.openChooser } };
  const href = locationForWrite(loc.pathname, loc.search);
  if (mode === 'review-choose') return { write: { kind: 'link', href, onSelect: (e) => { e.preventDefault(); act.closeChooser(); } } };
  return { write: { kind: 'link', href, onSelect: (e) => { e.preventDefault(); act.go(href); } } };
}

/** ⭐ One calm sentence each. ⛔ Nothing here names another member, another Work, or a reason. */
export const CHOOSER_COPY = Object.freeze({
  lead: 'Open one of MAIA’s readings of this Work. Nothing here is chosen for you.',
  loading: 'Finding MAIA’s readings of this Work…',
  empty: 'There are no readings of this Work to open.',
  unavailable: 'Your readings aren’t available to show here. Nothing about your Work has changed.',
  none: 'No reading was produced',
});
