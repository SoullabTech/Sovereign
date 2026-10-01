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

export type WriteRoomData = {
  work: string;
  heading: string;
  chapters: ReadonlyArray<WriteChapterView>;
  currentChapterId: string;
  place: string;
  title: string;
  paragraphs: ReadonlyArray<string>;
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

  const onEdited = useCallback(() => {
    const body = editorRef.current?.innerText ?? '';
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
            heldParagraph={fixture.heldParagraph}
            label={copy.editorLabel}
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
const Editor = memo(function Editor({
  editorRef,
  sectionId,
  paragraphs,
  heldParagraph,
  label,
  onEdited,
}: {
  editorRef: React.RefObject<HTMLDivElement>;
  sectionId: string;
  paragraphs: ReadonlyArray<string>;
  heldParagraph?: number;
  label: string;
  onEdited: () => void;
}) {
  /* The editor owns the visible DOM for the lifetime of one section. Parent
     rerenders from A1 status changes must never rewrite text under the cursor.
     A section change remounts this component via its key and receives that
     section's newest A1 body as the new initial snapshot. */
  const initial = useRef({ paragraphs, heldParagraph }).current;
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
      onInput={onEdited}
    >
      {initial.paragraphs.map((text, i) => (
        <p key={i} data-held={i === initial.heldParagraph ? '' : undefined}>
          {text}
        </p>
      ))}
    </div>
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
