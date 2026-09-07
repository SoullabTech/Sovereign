/**
 * THE ELEMENT THAT ACTUALLY SCROLLS.
 *
 * The Canvas does not scroll the document. `<main>` carries `overflow: auto`,
 * so it is the scrollport and `window.scrollY` is 0 for the whole session.
 *
 * ⚠️ THIS IS THE CORRECTION THAT MADE THE FOUNDER-REPORTED JUMP SURVIVE ITS
 * FIRST FIX. That fix captured and restored `window.scrollY` around the field's
 * remeasurement, which is the right SHAPE and the wrong AXIS: the value it
 * guarded never changed, so the guard was a no-op and the panel it was meant to
 * protect went on being clamped. A guard on the wrong axis reads exactly like a
 * guard that works — it throws no error and passes any test that measures the
 * axis it guards. It is only falsifiable against the axis that actually moves.
 *
 * Founder report, 2026-09-07, after that fix shipped: *"screen still jumps on
 * Manuscript item selection."*
 *
 * ⛔ Deliberately excludes the document. A reveal or a remeasure inside a column
 * may move that column and nothing else — which is also why `scrollIntoView` is
 * not used anywhere in this room: it scrolls EVERY scrollable ancestor and
 * cannot express the constraint.
 */

/** The nearest ancestor that actually scrolls, or null. */
export function scrollportOf(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    const scrolls = /(auto|scroll|overlay)/.test(style.overflowY);
    if (scrolls && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * Run a layout-forcing measurement without letting the page move under the
 * writer.
 *
 * Collapsing a field to `height: auto` to read `scrollHeight` briefly makes the
 * content far shorter than the scrollport, and the browser clamps a scroll
 * position that is now past the end. Restoring the height does not restore the
 * clamped scroll.
 *
 * Both axes are captured because which one moves is a fact about CSS several
 * components away, and a guard that assumes the answer is how this defect
 * survived its first repair. Each is restored ONLY if it actually changed, so a
 * scroll the writer performed themselves is never overwritten.
 */
export function preservingScroll(el: HTMLElement, measure: () => void): void {
  const port = scrollportOf(el);
  const portTop = port?.scrollTop ?? 0;
  const winTop = window.scrollY;
  measure();
  if (port && port.scrollTop !== portTop) port.scrollTop = portTop;
  if (window.scrollY !== winTop) window.scrollTo({ top: winTop });
}
