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
import type { WRITE_COPY, WRITE_FIXTURE } from './fixtures';

type Fixture = typeof WRITE_FIXTURE;
type Copy = typeof WRITE_COPY;

export type WriteRoomProps = {
  fixture: Fixture;
  copy: Copy;
  /** Full Canvas is owned by the room's host so the Shell can recede with it. */
  canvas: boolean;
  onCanvasChange: (canvas: boolean) => void;
  onAct?: (act: string) => void;
};

/** A saved selection, as live DOM positions inside the editor. */
type Held = { anchorNode: Node; anchorOffset: number; focusNode: Node; focusOffset: number };

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function WriteRoom({ fixture, copy, canvas, onCanvasChange, onAct }: WriteRoomProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const held = useRef<Held | null>(null);
  const [saveState, setSaveState] = useState<string>(fixture.saveState);
  const [words, setWords] = useState<number>(() => countWords(fixture.paragraphs.join(' ')));

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
    const p = ed?.querySelector<HTMLElement>('[data-held]');
    const text = p?.firstChild;
    if (!ed || !p || !text) return;
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

  const onEdited = useCallback(() => {
    setSaveState(fixture.unsaved);
    setWords(countWords(editorRef.current?.innerText ?? ''));
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
              <i aria-hidden="true" data-dirty={saveState === fixture.saveState ? undefined : ''} />
              {saveState}
            </span>
            <span className="fr-write-version" data-version="">
              {fixture.version}
            </span>
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
          <Editor editorRef={editorRef} fixture={fixture} label={copy.editorLabel} onEdited={onEdited} />
        </div>
      </div>

      <div className="fr-write-foot">
        <span className="fr-write-words" data-word-count="">
          {words} words
        </span>
        {canvas ? null : (
          <nav className="fr-write-move" aria-label="Move through the manuscript">
            <button type="button" data-move="previous" onMouseDown={keepFocus} onClick={() => onAct?.(`${copy.previous} section`)}>
              <Arrow dir="left" />
              {copy.previous}
            </button>
            <span aria-hidden="true" className="fr-write-move-sep" />
            <button type="button" data-move="next" onMouseDown={keepFocus} onClick={() => onAct?.(`${copy.next} section`)}>
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
const Editor = memo(function Editor({
  editorRef,
  fixture,
  label,
  onEdited,
}: {
  editorRef: React.RefObject<HTMLDivElement>;
  fixture: Fixture;
  label: string;
  onEdited: () => void;
}) {
  return (
    <div
      ref={editorRef}
      className="fr-write-editor"
      data-write-editor=""
      role="textbox"
      aria-multiline="true"
      aria-label={label}
      tabIndex={0}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      onInput={onEdited}
    >
      {fixture.paragraphs.map((text, i) => (
        <p key={i} data-held={i === fixture.heldParagraph ? '' : undefined}>
          {text}
        </p>
      ))}
    </div>
  );
});

/** The manuscript context at rest: the Work's chapters, the current one marked. */
export function WriteManuscriptRail({ fixture, onAct }: { fixture: Fixture; onAct?: (act: string) => void }) {
  return (
    <div className="fr-write-rail">
      <p className="fr-write-rail-head">{fixture.heading}</p>
      <ol className="fr-write-chapters">
        {fixture.chapters.map((c) => {
          const current = c.id === fixture.currentChapterId;
          return (
            <li key={c.id}>
              <button
                type="button"
                data-chapter={c.id}
                aria-current={current ? 'true' : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => (current ? undefined : onAct?.(`Open ${c.label} — ${c.title}`))}
              >
                <span className="fr-write-ch-no">{c.label}</span>
                <span className="fr-write-ch-title">{c.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
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
