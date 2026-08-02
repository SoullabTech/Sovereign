/**
 * jsdom setup for the Writer's Field suite.
 *
 * CodeMirror measures layout. jsdom has no layout engine, so the geometry APIs
 * it calls either do not exist or return zeroes. The shims below exist ONLY to
 * let the view construct and accept transactions — they do not simulate
 * layout, and no test in this suite may assert anything about geometry.
 *
 * What this suite therefore CAN prove: document contents, selection offsets,
 * undo/redo history, programmatic replacement, and what the handle reports.
 * What it CANNOT prove: real focus behaviour, scrolling, keyboard shortcuts,
 * autosave under real typing, chapter-sized performance. Those stay with the
 * authenticated browser walk, on purpose — a green suite here is not a claim
 * about any of them.
 */

// React 19 requires this flag before `act` may be used.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof Range !== 'undefined') {
  if (!Range.prototype.getBoundingClientRect) {
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0 }) as DOMRect;
  }
  if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = () =>
      ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} }) as unknown as DOMRectList;
  }
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
