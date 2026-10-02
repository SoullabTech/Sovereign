/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-2 — EXACT REVIEW → MANUSCRIPT SECTION NAVIGATION, AS DATA.
 *
 *   mounted Review finding
 *        ↓ its durable `returnTo.sectionId` (the DRAFT-SECTION id the R1-0 mapper carried; R1-1B has
 *          already proved it is present in the current manuscript context before anything mounted)
 *        ↓ locationForWrite   — `reading` removed, `m` kept           (the R1-1C composer)
 *        ↓ locationForSection — `s=<exactly that id>`                (the WS2-05A composer)
 *        ↓ the existing Write runtime, at that section
 *
 * ⛔ The address is the durable identity and nothing else: never a displayed position, an array index,
 * the nearest paragraph, the section in focus, a heading, the finding's text or any similarity. ⛔ A
 * control whose address is not an exact durable section present in the mounted context is ABSENT,
 * never a guess. ⛔ A return is a LOCATION: no held passage, no selection, no highlight, no member
 * write, no cognition, no new URL vocabulary. ⛔ Nothing here fetches or posts.
 */
import { locationForSection } from '@/lib/writersStudio/placeInWork';
import { locationForWrite, type Loc } from './reviewNavigation';
import type { ReviewNavigation, ReviewView } from '../flagship/DevelopReview';

export interface ReturnContext { readonly paragraphs: readonly { readonly id: string }[] }
/** Offered so an unlawful resolver can be BUILT and killed; the reference never reads it. */
export interface ReturnHints { readonly focusSectionId?: string | null; readonly index?: number; readonly text?: string }
export type ReturnTarget = { readonly kind: 'section'; readonly sectionId: string } | { readonly kind: 'unaddressable' };
export type ReturnGesture = { readonly kind: 'navigate'; readonly href: string };
export interface ReturnActs { go(href: string): void }
export type { Loc };

/** ⭐ Exact, or nothing. The durable address must itself be a section of the mounted context. */
export function returnTargetFor(address: string | null | undefined, ctx: ReturnContext, _hints?: ReturnHints): ReturnTarget {
  return address && ctx.paragraphs.some((p) => p.id === address) ? { kind: 'section', sectionId: address } : { kind: 'unaddressable' };
}

/** `reading` removed by the R1-1C composer, then `s` set by the WS2-05A composer. ⛔ No third composer. */
export function locationForReturn(loc: Loc, sectionId: string): string {
  const write = locationForWrite(loc.pathname, loc.search);
  const cut = write.indexOf('?');
  const pathname = cut >= 0 ? write.slice(0, cut) : write;
  const search = cut >= 0 ? write.slice(cut) : '';
  return locationForSection(pathname, search, sectionId);
}

/** ⭐ The gesture yields a location and performs the navigation — nothing else. */
export function returnGesture(sectionId: string, loc: Loc, act: ReturnActs): ReturnGesture {
  const href = locationForReturn(loc, sectionId);
  act.go(href);
  return { kind: 'navigate', href };
}

/** The live host's return navigation over ONE mounted view: `hrefFor` answers only for exact addresses present in that view's context. */
export function navigationFor(view: ReviewView, loc: Loc, act: ReturnActs): ReviewNavigation {
  const ctx: ReturnContext = view.context;
  return {
    hrefFor: (sectionId) => (returnTargetFor(sectionId, ctx).kind === 'section' ? locationForReturn(loc, sectionId) : null),
    onGo: (sectionId) => { if (returnTargetFor(sectionId, ctx).kind === 'section') returnGesture(sectionId, loc, act); },
  };
}
