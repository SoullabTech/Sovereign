/**
 * Show something inside its own scroller, and move nothing else.
 *
 * ⛔ `Element.scrollIntoView()` scrolls EVERY scrollable ancestor, the document
 * included. In the canvas the room scrolls in <main>, but the page itself can
 * also scroll — so a reveal inside the manuscript dragged the whole window and
 * took the Studio header and the left rail off the top of the screen.
 * Founder-witnessed 2026-09-11, on switching to Whole manuscript and on
 * selecting a section from the outline.
 *
 * This is the same law `SectionWritingSurface` already applies to `.focus()`
 * with `preventScroll` (founder-witnessed 2026-09-07), arrived at from the
 * other direction: a writing room that moves under you while you are reading is
 * worse than one that makes you look for your place. The scroll a member did
 * not ask for is the defect, wherever it comes from.
 *
 * Here the reveal IS asked for, so it happens — but confined to the one
 * container that owns the content, by writing that container's `scrollTop` and
 * nothing else. No ancestor can be moved by an assignment it never sees.
 */

export type RevealBlock = 'start' | 'center' | 'end';

/**
 * How far the scroller must move. Pure, so the arithmetic can be falsified
 * without a browser — jsdom performs no layout and every rect it returns is
 * zero, which would make a DOM-level test of this assert nothing.
 */
export function scrollDelta(
  node: { top: number; height: number },
  scroller: { top: number; height: number },
  block: RevealBlock,
): number {
  const fromTop = node.top - scroller.top;
  if (block === 'start') return fromTop;
  if (block === 'end') return fromTop - (scroller.height - node.height);
  return fromTop - (scroller.height - node.height) / 2;
}

/**
 * The nearest ancestor that actually scrolls. Found by computed style rather
 * than by selector: the canvas has several scrollers — the room, the outline,
 * the drawers — and a reveal belongs to whichever one holds the thing.
 *
 * Returns null when nothing between the node and the document scrolls. The
 * caller then does NOTHING: with no container to move, the only way to obey
 * would be to scroll the document, which is the defect.
 */
export function nearestScroller(node: Element): HTMLElement | null {
  let el = node.parentElement;
  while (el) {
    const style = getComputedStyle(el);
    const y = style.overflowY;
    if ((y === 'auto' || y === 'scroll') && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return null;
}

export function revealWithin(
  node: HTMLElement, block: RevealBlock = 'start',
  behavior: ScrollBehavior = 'auto',
): void {
  const scroller = nearestScroller(node);
  if (!scroller) return;
  const n = node.getBoundingClientRect();
  const s = scroller.getBoundingClientRect();
  const delta = scrollDelta(
    { top: n.top, height: n.height }, { top: s.top, height: s.height }, block,
  );
  if (behavior === 'smooth' && typeof scroller.scrollTo === 'function') {
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: 'smooth' });
    return;
  }
  scroller.scrollTop += delta;
}
