/**
 * "Show me where" (walk 2026-11-13): holding a passage did not bring it into view or mark it, so on a long section the writer was shown
 * the top of the section and nothing else. This brings the held words into the centre and marks them with a CSS Custom Highlight.
 *
 * ⛔ Nothing here changes the manuscript: no text, no attribute, no node of the editor is written. The mark is a highlight registered
 * on a DOM Range (it is not part of the document), cleared when another passage is revealed. Where the browser has no highlight support
 * the passage is still scrolled into view.
 */

export const HELD_HIGHLIGHT = 'ws-held-passage';

/** Pure: the first and last paragraphs of the held text, as short probes to find them in the rendered editor. */
export function paragraphProbes(text: string, size = 60): { first: string; last: string } | null {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paras.length === 0) return null;
  const head = (p: string) => Array.from(p).slice(0, size).join('');
  const tail = (p: string) => { const a = Array.from(p); return a.slice(Math.max(0, a.length - size)).join(''); };
  return { first: head(paras[0]!), last: tail(paras[paras.length - 1]!) };
}

/** Pure over the rendered blocks: the index range of the blocks holding the passage, or null. */
export function locateBlocks(blocks: readonly string[], text: string): { from: number; to: number } | null {
  const probes = paragraphProbes(text);
  if (!probes) return null;
  const from = blocks.findIndex((b) => b.includes(probes.first));
  if (from < 0) return null;
  for (let i = from; i < blocks.length; i += 1) if (blocks[i]!.includes(probes.last)) return { from, to: i };
  return { from, to: from };
}

type HighlightRegistry = { set: (name: string, h: unknown) => void; delete: (name: string) => void };

/** Bring the held words of this section into view and mark them. Retries briefly while the section's editor is being rendered. */
export function revealHeldPassage(sectionId: string, text: string, tries = 30): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const attempt = (left: number) => {
    const editor = document.querySelector<HTMLElement>(`[data-write-editor][data-section-id="${CSS.escape(sectionId)}"]`);
    const blocks = editor ? Array.from(editor.children).filter((c): c is HTMLElement => c.tagName === 'P') : [];
    const at = editor ? locateBlocks(blocks.map((b) => b.textContent ?? ''), text) : null;
    if (!editor || !at) { if (left > 0) window.setTimeout(() => attempt(left - 1), 100); return; }
    const first = blocks[at.from]!;
    const last = blocks[at.to]!;
    first.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights;
    const HighlightCtor = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight;
    if (registry && HighlightCtor) {
      const range = document.createRange();
      range.setStartBefore(first);
      range.setEndAfter(last);
      registry.delete(HELD_HIGHLIGHT);
      registry.set(HELD_HIGHLIGHT, new HighlightCtor(range));
      ensureHighlightStyle();
    }
  };
  attempt(tries);
}

function ensureHighlightStyle() {
  if (document.getElementById(HELD_HIGHLIGHT)) return;
  const style = document.createElement('style');
  style.id = HELD_HIGHLIGHT;
  style.append(`::highlight(${HELD_HIGHLIGHT}) { background-color: rgba(214, 178, 94, 0.28); }`);
  document.head.appendChild(style);
}
