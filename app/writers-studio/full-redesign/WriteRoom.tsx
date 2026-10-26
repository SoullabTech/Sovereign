'use client';

/**
 * PC3-S3 — Write Resting + Full Canvas, composed in the accepted Light Shell.
 *
 * Governing law (founder, CR1): Entering full canvas changes the field, not the
 * work. One editor. More room. No loss.
 *
 * What that means here, mechanically:
 *  - there is ONE editor. It lives in a memoised component whose props never
 *    change, so toggling Full Canvas never re-renders it, and the Shell keeps the
 *    Work region at the same place in the tree, so it is never remounted;
 *  - Full Canvas is a presentation state. The product bar, manuscript context and
 *    Previous/Next recede; the page, its place, its version and its save state
 *    stay exactly as they were;
 *  - Return and Escape are two mechanisms for ONE return action, and both land
 *    on the same state: same Work, place, passage, selection, cursor, version,
 *    save state, with focus back in the editor.
 *
 * Truth law carried from CR0 / PC2: manuscript first; no resident MAIA; no
 * formatting model or toolbar (plain-text editing only); `Saved · Draft v12` is
 * fixture truth, and an edit here reports "Unsaved" rather than pretending to
 * save — there is no save engine behind this room.
 *
 * This component fetches nothing, writes nothing and navigates nowhere. Acts
 * that would move the member (chapters, Previous/Next) are reported via `onAct`.
 */
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { WRITE_COPY } from './fixtures';
import { typesetManuscriptBody } from './manuscriptTypesetting';
import { projectRawBodyToDisplay } from './j7SourceDisplayProjection';

type Copy = typeof WRITE_COPY;

export type WriteChapterView = {
  id: string;
  label: string;
  title?: string;
  status?: 'conflict' | 'error';
  /** Navigation-only manuscript structure. Optional so fixture mode stays valid. */
  role?: 'part' | 'chapter' | 'section' | 'other';
  depth?: 1 | 2 | 3 | null;
};

export type WriteBlockKind = 'paragraph' | 'epigraph' | 'subhead' | 'list' | 'folio';

export type WriteBlock = {
  text: string;
  kind: WriteBlockKind;
};

export type WriteRoomData = {
  work: string;
  heading: string;
  chapters: ReadonlyArray<WriteChapterView>;
  currentChapterId: string;
  place: string;
  title: string;
  paragraphs: ReadonlyArray<string>;
  /** Presentation-only structure recovered from the manuscript's own whitespace/layout. */
  blocks?: ReadonlyArray<WriteBlock>;
  heldParagraph?: number;
  activeStatus?: 'conflict' | 'error';
  /** Fixture may name a version; live A1 must omit the internal draft counter. */
  version?: string;
  saveState: string;
  unsaved: string;
};

export type WriteRoomLivePorts = {
  /** A1 is the authority when supplied; fixture mode leaves this absent. */
  saveState?: string;
  /** Exact section body before presentation typesetting. Live editing authority only. */
  canonicalBody?: string;
  onEditBody?: (body: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onOpenChapter?: (chapterId: string) => void;
};

export type WriteRoomProps = {
  fixture: WriteRoomData;
  copy: Copy;
  /** Full Canvas is owned by the room's host so the Shell can recede with it. */
  canvas: boolean;
  onCanvasChange: (canvas: boolean) => void;
  onAct?: (act: string) => void;
  live?: WriteRoomLivePorts;
};

/** A saved selection, as live DOM positions inside the editor. */
type Held = { anchorNode: Node; anchorOffset: number; focusNode: Node; focusOffset: number };

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function WriteRoom({ fixture, copy, canvas, onCanvasChange, onAct, live }: WriteRoomProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const held = useRef<Held | null>(null);
  const liveRef = useRef<WriteRoomLivePorts | undefined>(live);
  liveRef.current = live;
  const [localSaveState, setLocalSaveState] = useState<string>(fixture.saveState);
  const [words, setWords] = useState<number>(() => countWords(fixture.paragraphs.join(' ')));
  const saveState = live?.saveState ?? localSaveState;

  // The editor's selection is remembered whenever it changes inside the editor.
  useEffect(() => {
    const remember = () => {
      const ed = editorRef.current;
      const sel = typeof window === 'undefined' ? null : window.getSelection();
      if (!ed || !sel || sel.rangeCount === 0 || !sel.anchorNode || !sel.focusNode) return;
      if (!ed.contains(sel.anchorNode) || !ed.contains(sel.focusNode)) return;
      held.current = { anchorNode: sel.anchorNode, anchorOffset: sel.anchorOffset, focusNode: sel.focusNode, focusOffset: sel.focusOffset };
    };
    document.addEventListener('selectionchange', remember);
    return () => document.removeEventListener('selectionchange', remember);
  }, []);

  /** Focus the editor and put the remembered selection (and so the cursor) back. */
  const restore = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus({ preventScroll: true });
    const h = held.current;
    const sel = window.getSelection();
    if (h && sel && ed.contains(h.anchorNode) && ed.contains(h.focusNode)) {
      sel.setBaseAndExtent(h.anchorNode, h.anchorOffset, h.focusNode, h.focusOffset);
      const el = h.focusNode instanceof Element ? h.focusNode : h.focusNode.parentElement;
      el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, []);

  // Opening state: the held passage is selected, the cursor at its end, focus in the editor.
  useLayoutEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const p = ed.querySelector<HTMLElement>('[data-held]');
    const text = p?.firstChild;
    if (!p || !text) {
      ed.focus({ preventScroll: true });
      return;
    }
    held.current = { anchorNode: text, anchorOffset: 0, focusNode: text, focusOffset: (text.textContent ?? '').length };
    restore();
  }, [restore]);

  // After every change of field, the editor gets its focus and selection back.
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    restore();
  }, [canvas, restore]);

  const enter = useCallback(() => onCanvasChange(true), [onCanvasChange]);
  const leave = useCallback(() => onCanvasChange(false), [onCanvasChange]);

  // Escape is the keyboard route to the SAME return action as the Return control.
  useEffect(() => {
    if (!canvas) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      leave();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canvas, leave]);

  const onEdited = useCallback((body: string) => {
    if (liveRef.current?.onEditBody) liveRef.current.onEditBody(body);
    else setLocalSaveState(fixture.unsaved);
    setWords(countWords(body));
  }, [fixture.unsaved]);

  // Keep the editor's focus when a control is pressed with the pointer.
  const keepFocus = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="fr-write" data-write-room="" data-canvas={canvas ? 'full' : 'resting'}>
      <div className="fr-write-top">
        <div className="fr-write-lead">
          {canvas ? (
            <button type="button" className="fr-write-return" data-return="" aria-label={copy.returnLabel} onMouseDown={keepFocus} onClick={leave}>
              <Arrow dir="left" />
              {copy.ret}
            </button>
          ) : null}
        </div>
        <nav className="fr-write-crumb" aria-label="Place in the Work">
          <span>{fixture.work}</span>
          <Chevron />
          <span aria-current="location">{fixture.place}</span>
        </nav>
        <div className="fr-write-right">
          <div className="fr-write-state" data-write-state="" role="status" aria-live="polite">
            <span className="fr-write-saved" data-save-state="">
              <i aria-hidden="true" data-dirty={saveState === 'Saved' ? undefined : ''} />
              {saveState}
            </span>
            {fixture.version ? (
              <span className="fr-write-version" data-version="">
                {fixture.version}
              </span>
            ) : null}
          </div>
          <div className="fr-write-trail">
            {canvas ? null : (
              <button type="button" className="fr-write-fc" data-full-canvas="" aria-label={copy.fullCanvasLabel} onMouseDown={keepFocus} onClick={enter}>
                {copy.fullCanvas}
                <ExpandIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fr-write-scroll">
        <div className="fr-write-page">
          <h1 className="fr-write-title">{fixture.title}</h1>
          {fixture.activeStatus === 'conflict' ? (
            <p className="fr-write-ch-title" data-conflict-marker-section role="note">
              Needs attention — this section was changed elsewhere. What you wrote here is kept on this page and has not been saved.
            </p>
          ) : null}
          <Editor
            key={fixture.currentChapterId}
            editorRef={editorRef}
            sectionId={fixture.currentChapterId}
            paragraphs={fixture.paragraphs}
            blocks={fixture.blocks}
            heldParagraph={fixture.heldParagraph}
            label={copy.editorLabel}
            canonicalBody={live?.canonicalBody}
            onEdited={onEdited}
          />
        </div>
      </div>

      <div className="fr-write-foot">
        <span className="fr-write-words" data-word-count="">
          {words} words
        </span>
        {canvas ? null : (
          <nav className="fr-write-move" aria-label="Move through the manuscript">
            <button
              type="button"
              data-move="previous"
              onMouseDown={keepFocus}
              onClick={() => liveRef.current?.onPrevious ? liveRef.current.onPrevious() : onAct?.(`${copy.previous} section`)}
            >
              <Arrow dir="left" />
              {copy.previous}
            </button>
            <span aria-hidden="true" className="fr-write-move-sep" />
            <button
              type="button"
              data-move="next"
              onMouseDown={keepFocus}
              onClick={() => liveRef.current?.onNext ? liveRef.current.onNext() : onAct?.(`${copy.next} section`)}
            >
              {copy.next}
              <Arrow dir="right" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

/**
 * The ONE editor. Plain-text only (`plaintext-only`): the browser offers no
 * bold/italic/list commands, so no formatting model can arrive by keystroke.
 * Its props never change across Full Canvas, so it never re-renders there.
 */
/**
 * Disposable J7 experiment only: canonical source string + lossless projection
 * segments. Existing product source must remain untouched until full acceptance.
 */
const Editor = memo(function Editor({
  editorRef,
  sectionId,
  paragraphs,
  blocks,
  heldParagraph,
  label,
  canonicalBody,
  onEdited,
}: {
  editorRef: React.RefObject<HTMLDivElement>;
  sectionId: string;
  paragraphs: ReadonlyArray<string>;
  blocks?: ReadonlyArray<WriteBlock>;
  heldParagraph?: number;
  label: string;
  canonicalBody?: string;
  onEdited: (body: string) => void;
}) {
  const [initial] = useState(() => ({
    body: canonicalBody ?? paragraphs.join('\n\n'),
    blocks: blocks ?? paragraphs.map((text) => ({ text, kind: 'paragraph' as const })),
    heldParagraph,
  }));
  const canonicalRef = useRef(initial.body);
  const projectionRef = useRef<ReturnType<typeof projectRawBodyToDisplay> | null>(null);
  const pendingRef = useRef<{ body: string; caret: number; inputType: string } | null>(null);

  const currentProjection = (body: string) => {
    const normalized = body.replace(/\r\n?/g, '\n');
    let displayBlocks = typesetManuscriptBody(normalized);
    let projection = projectRawBodyToDisplay(body, displayBlocks);
    // The typesetter returns one empty display block for whitespace-only source.
    // In the editable view, show those authored characters rather than losing them.
    if (!projection.ok && normalized.trim() === '' && normalized.length > 0) {
      displayBlocks = [{ text: normalized, kind: 'paragraph' }];
      projection = projectRawBodyToDisplay(body, displayBlocks);
    }
    return { projection, displayBlocks };
  };

  const nodeLength = (node: Node): number => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent?.length ?? 0;
    if (node instanceof HTMLBRElement) return 1;
    return Array.from(node.childNodes).reduce((n, child) => n + nodeLength(child), 0);
  };

  const domPointToNormalized = (root: HTMLElement, target: Node, offset: number): number | null => {
    if (target !== root && !root.contains(target)) return null;
    const pointInside = (node: Node, localOffset: number): number => {
      if (node.nodeType === Node.TEXT_NODE) return Math.max(0, Math.min(localOffset, node.textContent?.length ?? 0));
      if (node instanceof HTMLBRElement) return localOffset > 0 ? 1 : 0;
      return Array.from(node.childNodes).slice(0, Math.max(0, Math.min(localOffset, node.childNodes.length))).reduce((sum, c) => sum + nodeLength(c), 0);
    };
    const walk = (node: Node, base: number): { found: boolean; value: number } => {
      if (node === target) return { found: true, value: base + pointInside(node, offset) };
      let cursor = base;
      for (const child of Array.from(node.childNodes)) {
        const result = walk(child, cursor);
        if (result.found) return result;
        cursor += nodeLength(child);
      }
      return { found: false, value: -1 };
    };
    const result = walk(root, 0);
    return result.found ? result.value : null;
  };

  const normalizedToDomPoint = (root: HTMLElement, wanted: number): [Node, number] | null => {
    const walk = (node: Node, base: number): [Node, number] | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.textContent?.length ?? 0;
        return wanted >= base && wanted <= base + len ? [node, wanted - base] : null;
      }
      if (node instanceof HTMLBRElement) {
        const parent = node.parentNode;
        if (!parent) return null;
        const index = Array.prototype.indexOf.call(parent.childNodes, node) as number;
        if (wanted === base) return [parent, index];
        if (wanted === base + 1) return [parent, index + 1];
        return null;
      }
      if (node.childNodes.length === 0) {
        return wanted === base ? [node, 0] : null;
      }
      let cursor = base;
      for (const child of Array.from(node.childNodes)) {
        const found = walk(child, cursor);
        if (found) return found;
        cursor += nodeLength(child);
      }
      if (wanted === cursor) return [node, node.childNodes.length];
      return null;
    };
    return walk(root, 0);
  };

  const renderCanonical = useCallback((body: string, caretRaw: number): boolean => {
    const root = editorRef.current;
    if (!root) return false;
    const { projection, displayBlocks } = currentProjection(body);
    root.replaceChildren();
    projectionRef.current = projection;
    canonicalRef.current = body;
    root.dataset.j7Canonical = body;
    root.dataset.j7Reconcile = projection.ok ? '' : 'projection:' + (projection.reason ?? 'unknown');
    if (!projection.ok) {
      // Keep source safe. This display is intentionally read-only/unqualified.
      const fallback = document.createElement('p');
      fallback.dataset.j7ProjectionRefused = '';
      fallback.style.whiteSpace = 'pre-wrap';
      fallback.textContent = body.replace(/\r\n?/g, '\n');
      root.appendChild(fallback);
      root.setAttribute('contenteditable', 'false');
      return false;
    }
    root.setAttribute('contenteditable', 'plaintext-only');
    const normToRaw = projection.normalizedBoundaryToRaw;
    const appendVisibleGap = (holder: HTMLElement, text: string, normStart: number) => {
      let cursor = 0;
      for (const match of text.matchAll(/\n/g)) {
        const index = match.index ?? 0;
        if (index > cursor) {
          const chunk = document.createElement('span');
          chunk.dataset.j7NormalizedStart = String(normStart + cursor);
          chunk.dataset.j7NormalizedEnd = String(normStart + index);
          chunk.style.whiteSpace = 'pre-wrap';
          chunk.textContent = text.slice(cursor, index);
          holder.appendChild(chunk);
        }
        const br = document.createElement('br');
        br.dataset.j7GapBreak = '';
        br.dataset.j7NormalizedStart = String(normStart + index);
        br.dataset.j7NormalizedEnd = String(normStart + index + 1);
        holder.appendChild(br);
        cursor = index + 1;
      }
      if (cursor < text.length) {
        const chunk = document.createElement('span');
        chunk.dataset.j7NormalizedStart = String(normStart + cursor);
        chunk.dataset.j7NormalizedEnd = String(normStart + text.length);
        chunk.style.whiteSpace = 'pre-wrap';
        chunk.textContent = text.slice(cursor);
        holder.appendChild(chunk);
      }
    };

    for (const segment of projection.segments) {
      const text = projection.normalizedBody.slice(segment.normalizedStart, segment.normalizedEnd);
      if (segment.kind === 'block') {
        const p = document.createElement('p');
        p.dataset.writeBlock = displayBlocks[segment.blockIndex]?.kind ?? 'paragraph';
        p.dataset.j7Segment = 'block';
        p.dataset.j7BlockIndex = String(segment.blockIndex);
        p.dataset.j7NormalizedStart = String(segment.normalizedStart);
        p.dataset.j7NormalizedEnd = String(segment.normalizedEnd);
        p.style.whiteSpace = 'pre-wrap';
        p.style.fontSize = '21px';
        p.style.lineHeight = '1.72';
        p.style.fontFamily = 'Georgia, "Times New Roman", serif';
        p.style.margin = '0 0 30px 0';
        p.textContent = text;
        root.appendChild(p);
        continue;
      }

      const gap = document.createElement('span');
      gap.dataset.j7Segment = 'gap';
      gap.dataset.j7NormalizedStart = String(segment.normalizedStart);
      gap.dataset.j7NormalizedEnd = String(segment.normalizedEnd);
      gap.style.whiteSpace = 'pre-wrap';
      gap.style.display = 'contents';
      const previousBlock = projection.segments.some(s => s.kind === 'block' && s.normalizedEnd === segment.normalizedStart);
      const nextBlock = projection.segments.some(s => s.kind === 'block' && s.normalizedStart === segment.normalizedEnd);
      const delimiterMatch = previousBlock && nextBlock ? /\n[ \t]*\n/.exec(text) : null;
      if (!delimiterMatch) {
        appendVisibleGap(gap, text, segment.normalizedStart);
      } else {
        const delimiterStart = delimiterMatch.index;
        const delimiterEnd = delimiterStart + delimiterMatch[0].length;
        appendVisibleGap(gap, text.slice(0, delimiterStart), segment.normalizedStart);
        const hidden = document.createElement('span');
        hidden.dataset.j7GapBase = '';
        hidden.dataset.j7NormalizedStart = String(segment.normalizedStart + delimiterStart);
        hidden.dataset.j7NormalizedEnd = String(segment.normalizedStart + delimiterEnd);
        hidden.style.display = 'inline-block';
        hidden.style.width = '0';
        hidden.style.height = '0';
        hidden.style.overflow = 'hidden';
        hidden.style.fontSize = '0';
        hidden.style.lineHeight = '0';
        hidden.style.whiteSpace = 'pre';
        hidden.textContent = delimiterMatch[0];
        gap.appendChild(hidden);
        appendVisibleGap(gap, text.slice(delimiterEnd), segment.normalizedStart + delimiterEnd);
      }
      root.appendChild(gap);
    }
    // A truly empty source still needs a focusable caret target, but that
    // scaffold has zero canonical length and is not confused with an authored P.
    if (projection.normalizedBody.length === 0 && root.childNodes.length === 0) {
      const empty = document.createElement('p');
      empty.dataset.j7EmptyStart = '';
      empty.style.minHeight = '1.72em';
      empty.style.margin = '0 0 30px 0';
      root.appendChild(empty);
    }

    const normalizedWanted = normToRaw.indexOf(caretRaw);
    if (normalizedWanted < 0) {
      root.dataset.j7Reconcile = 'caret-not-on-source-boundary';
      return false;
    }
    const point = normalizedToDomPoint(root, normalizedWanted);
    const selection = window.getSelection();
    if (point && selection) {
      selection.removeAllRanges();
      const range = document.createRange();
      range.setStart(point[0], point[1]);
      range.collapse(true);
      selection.addRange(range);
    } else {
      root.dataset.j7Reconcile = 'caret-unmapped';
      return false;
    }
    root.dataset.j7Caret = String(caretRaw);
    return true;
  }, [editorRef]);

  useLayoutEffect(() => {
    renderCanonical(initial.body, initial.body.length);
  }, [initial.body, renderCanonical]);

  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;
    const selected = (): [number, number] | null => {
      const selection = window.getSelection();
      const projection = projectionRef.current;
      if (!selection || selection.rangeCount === 0 || !projection?.ok) return null;
      const range = selection.getRangeAt(0);
      if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
      const startNorm = domPointToNormalized(root, range.startContainer, range.startOffset);
      const endNorm = domPointToNormalized(root, range.endContainer, range.endOffset);
      if (startNorm === null || endNorm === null) return null;
      const startRaw = projection.normalizedBoundaryToRaw[startNorm];
      const endRaw = projection.normalizedBoundaryToRaw[endNorm];
      if (startRaw === undefined || endRaw === undefined) return null;
      return [Math.min(startRaw, endRaw), Math.max(startRaw, endRaw)];
    };
    const dominantEol = (body: string) => {
      const matches = body.match(/\r\n|\r|\n/g) ?? [];
      if (!matches.length) return '\n';
      const counts: Record<string, number> = {};
      for (const eol of matches) counts[eol] = (counts[eol] ?? 0) + 1;
      return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]![0];
    };
    const normalizeInsertedEols = (value: string) => value.replace(/\r\n?/g, '\n').replace(/\n/g, dominantEol(canonicalRef.current));
    const commit = (type: string, data: string | null) => {
      const range = selected();
      if (!range) { root.dataset.j7Reconcile = 'unmapped-selection'; return false; }
      let [start, end] = range;
      let insert = '';
      const raw = canonicalRef.current;
      switch (type) {
        case 'insertText':
        case 'insertReplacementText':
        case 'insertFromPaste':
        case 'insertFromDrop':
          if (typeof data !== 'string') return false;
          insert = normalizeInsertedEols(data); break;
        case 'insertLineBreak':
        case 'insertParagraph':
          insert = dominantEol(raw); break;
        case 'deleteContentBackward':
          if (start === end && start > 0) {
            if (raw.slice(start-2,start) === '\r\n') start -= 2;
            else start -= 1;
          }
          break;
        case 'deleteContentForward':
          if (start === end && end < raw.length) {
            if (raw.slice(end,end+2) === '\r\n') end += 2;
            else end += 1;
          }
          break;
        case 'deleteByCut':
        case 'deleteContent':
          break;
        default:
          return false;
      }
      const next = raw.slice(0, start) + insert + raw.slice(end);
      const caret = start + insert.length;
      // Render the new projection first. The raw value is not committed and no
      // save is issued if the caret has no unambiguous visible/source position.
      const ok = renderCanonical(next, caret);
      if (!ok) { renderCanonical(raw, start); root.dataset.j7Reconcile = 'edit-refused-projection-or-caret'; return false; }
      canonicalRef.current = next;
      onEdited(next);
      return true;
    };
    const before = (event: InputEvent) => {
      if (event.isComposing || event.inputType.startsWith('insertComposition') || event.inputType.startsWith('history')) {
        root.dataset.j7Reconcile = 'unsupported:' + event.inputType;
        if (event.cancelable) event.preventDefault();
        else {
          const current = selected();
          pendingRef.current = { body: canonicalRef.current, caret: current?.[1] ?? canonicalRef.current.length, inputType: event.inputType };
        }
        return;
      }
      if (!event.cancelable) {
        const current = selected();
        pendingRef.current = { body: canonicalRef.current, caret: current?.[1] ?? canonicalRef.current.length, inputType: event.inputType };
        root.dataset.j7Reconcile = 'noncancelable:' + event.inputType;
        return;
      }
      if (event.inputType === 'insertFromPaste') return;
      const committed = commit(event.inputType, event.data);
      // Unsupported operations are refused rather than allowed to mutate a
      // DOM model that cannot be reconciled to canonical source.
      event.preventDefault();
      if (!committed) root.dataset.j7Reconcile = 'unsupported-or-unmapped:' + event.inputType;
    };
    const onInput = () => {
      const pending = pendingRef.current;
      if (!pending) return;
      pendingRef.current = null;
      renderCanonical(pending.body, pending.caret);
      root.dataset.j7Reconcile = 'refused-and-restored:' + pending.inputType;
    };
    const paste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text/plain');
      if (typeof text !== 'string') return;
      event.preventDefault();
      commit('insertFromPaste', text);
    };
    root.addEventListener('beforeinput', before);
    root.addEventListener('input', onInput);
    root.addEventListener('paste', paste);
    return () => {
      root.removeEventListener('beforeinput', before);
      root.removeEventListener('input', onInput);
      root.removeEventListener('paste', paste);
    };
  }, [editorRef, onEdited, renderCanonical]);

  return (
    <div
      ref={editorRef}
      className="fr-write-editor"
      data-write-editor=""
      data-section-id={sectionId}
      role="textbox"
      aria-multiline="true"
      aria-label={label}
      tabIndex={0}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
    />
  );
});

/** The manuscript context at rest: the whole Work, hierarchically navigable. */
export function WriteManuscriptRail({
  fixture,
  onAct,
  onOpenChapter,
}: {
  fixture: WriteRoomData;
  onAct?: (act: string) => void;
  onOpenChapter?: (chapterId: string) => void;
}) {
  const chapterOwnerOf = (sectionId: string): string | null => {
    let owner: string | null = null;
    for (const item of fixture.chapters) {
      if (item.role === 'part' || (item.depth === 1 && item.role === 'other')) owner = null;
      if (item.role === 'chapter') owner = item.id;
      if (item.id === sectionId) return owner;
    }
    return null;
  };
  const currentOwner = chapterOwnerOf(fixture.currentChapterId);
  const [openChapters, setOpenChapters] = useState<ReadonlySet<string>>(
    () => new Set(currentOwner ? [currentOwner] : []),
  );

  useEffect(() => {
    if (!currentOwner) return;
    setOpenChapters((previous) => {
      if (previous.has(currentOwner)) return previous;
      const next = new Set(previous);
      next.add(currentOwner);
      return next;
    });
  }, [currentOwner]);

  const navigate = (c: WriteChapterView) => {
    /* In live Studio the rail choice itself has relational meaning: selecting
       the place already open should still orient contextual support. Fixture
       mode keeps the old no-op behavior when there is no live navigation port. */
    if (onOpenChapter) {
      onOpenChapter(c.id);
      return;
    }
    if (c.id === fixture.currentChapterId) return;
    onAct?.(`Open ${c.label}${c.title ? ` — ${c.title}` : ''}`);
  };

  const navButton = (c: WriteChapterView, className?: string) => {
    const current = c.id === fixture.currentChapterId;
    return (
      <button
        type="button"
        className={className}
        data-chapter={c.id}
        data-outline-role={c.role}
        data-section-status={c.status}
        aria-current={current ? 'true' : undefined}
        aria-label={c.status === 'conflict' ? `${c.label} — Needs attention: changed elsewhere` : c.status === 'error' ? `${c.label} — Save unavailable` : undefined}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => navigate(c)}
      >
        <span className="fr-write-ch-no">{c.label}</span>
        {c.title ? <span className="fr-write-ch-title">{c.title}</span> : null}
        {c.status === 'conflict' ? <span className="fr-write-ch-title" data-conflict-marker>Needs attention</span> : null}
        {c.status === 'error' ? <span className="fr-write-ch-title" data-error-marker>Save unavailable</span> : null}
      </button>
    );
  };

  const structured = fixture.chapters.some((c) => c.role === 'part' || c.role === 'chapter');
  if (!structured) {
    return (
      <div className="fr-write-rail">
        <p className="fr-write-rail-head">{fixture.heading}</p>
        <ol className="fr-write-chapters">
          {fixture.chapters.map((c) => <li key={c.id}>{navButton(c)}</li>)}
        </ol>
      </div>
    );
  }

  const rows: JSX.Element[] = [];
  for (let i = 0; i < fixture.chapters.length;) {
    const item = fixture.chapters[i]!;
    if (item.role === 'part') {
      rows.push(<li key={item.id} className="fr-write-part-row">{navButton(item, 'fr-write-part-nav')}</li>);
      i += 1;
      continue;
    }
    if (item.role === 'chapter') {
      let end = i + 1;
      while (end < fixture.chapters.length) {
        const next = fixture.chapters[end]!;
        if (next.role === 'part' || next.role === 'chapter' || next.depth === 1) break;
        end += 1;
      }
      const children = fixture.chapters.slice(i + 1, end);
      const open = openChapters.has(item.id);
      rows.push(
        <li key={item.id} className="fr-write-chapter-group" data-open={open ? 'true' : 'false'}>
          <div className="fr-write-chapter-row">
            <button
              type="button"
              className="fr-write-chapter-toggle"
              aria-label={`${open ? 'Collapse' : 'Expand'} ${item.label}${item.title ? ` — ${item.title}` : ''}`}
              aria-expanded={open}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpenChapters((previous) => {
                const next = new Set(previous);
                if (next.has(item.id)) next.delete(item.id);
                else next.add(item.id);
                return next;
              })}
            >
              <span aria-hidden="true">{open ? '⌄' : '›'}</span>
            </button>
            {navButton(item, 'fr-write-chapter-nav')}
          </div>
          {open && children.length > 0 ? (
            <ol className="fr-write-section-children">
              {children.map((child) => <li key={child.id}>{navButton(child, 'fr-write-section-nav')}</li>)}
            </ol>
          ) : null}
        </li>,
      );
      i = end;
      continue;
    }
    rows.push(<li key={item.id} className={item.depth === 1 ? 'fr-write-region-row' : undefined}>{navButton(item)}</li>);
    i += 1;
  }

  return (
    <div className="fr-write-rail" data-manuscript-hierarchy="parts-chapters-sections">
      <p className="fr-write-rail-head">{fixture.heading}</p>
      <ol className="fr-write-chapters">{rows}</ol>
    </div>
  );
}

// ── icons ───────────────────────────────────────────────────────────────────
function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      {dir === 'left' ? <path d="M13 8H3M7 4L3 8l4 4" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M4.5 3l3 3-3 3" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <path d="M2.5 6.5v-4h4M14.5 6.5v-4h-4M2.5 10.5v4h4M14.5 10.5v4h-4M2.5 2.5l4 4M14.5 2.5l-4 4M2.5 14.5l4-4M14.5 14.5l-4-4" />
    </svg>
  );
}
