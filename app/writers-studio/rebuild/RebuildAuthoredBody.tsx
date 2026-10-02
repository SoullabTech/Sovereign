'use client';

import { useEffect, useRef, useState } from 'react';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

export interface HeldPassage {
  start: number;
  end: number;
}

export interface RebuildAuthoredBodyProps {
  section: RebuildSection;
  body: string;
  held: HeldPassage | null;
  onEdit: (body: string) => void;
  onEditingBegan: () => void;
  onFocusPlace: () => void;
  onCaptureBeforeBlur: (body: string) => void;
  onSelectPassage: (start: number, end: number, text: string) => void;
  /** A1-LS1 · R5 — the editor's exact selection (UTF-16 offsets) as it loses
      focus. Reported only for an editor the writer actually engaged — clicked,
      typed or selected in — so a section that keyboard focus merely passes
      through never replaces the writer's place. */
  onEditorBlur?: (start: number, end: number) => void;
  /** A1-LS1 · R5 — reopen this editor with exactly this selection. */
  restore?: { start: number; end: number; nonce: number } | null;
}

const cp = (text: string, unitOffset: number) => [...text.slice(0, unitOffset)].length;

export default function RebuildAuthoredBody({
  section, body, held, onEdit, onEditingBegan, onFocusPlace,
  onCaptureBeforeBlur, onSelectPassage, onEditorBlur, restore,
}: RebuildAuthoredBodyProps) {
  const [editing, setEditing] = useState(false);
  const field = useRef<HTMLTextAreaElement | null>(null);
  const began = useRef(false);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);
  /* A1-LS1 · R5 — true once the writer has worked in this editor. Opening by
     keyboard focus alone does not engage it. */
  const engaged = useRef(false);
  const pointerOpening = useRef(false);

  useEffect(() => {
    if (!editing) return;
    const el = field.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    const sel = pendingSelection.current;
    if (sel) { pendingSelection.current = null; el.setSelectionRange(sel.start, sel.end); }
  }, [editing, body]);

  /* A1-LS1 · R5 — a restore request reopens THIS editor and puts back the
     exact selection it had. Never scrolls: focus uses preventScroll. */
  useEffect(() => {
    if (!restore) return;
    const el = field.current;
    if (editing && el) {
      el.focus({ preventScroll: true });
      el.setSelectionRange(restore.start, restore.end);
      return;
    }
    pendingSelection.current = { start: restore.start, end: restore.end };
    engaged.current = true;
    setEditing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restore?.nonce]);

  const captureSelection = () => {
    const el = field.current;
    if (!el || el.selectionStart === el.selectionEnd) return;
    const start = cp(el.value, el.selectionStart);
    const end = cp(el.value, el.selectionEnd);
    const selected = el.value.slice(el.selectionStart, el.selectionEnd);
    if (!selected.trim()) return;
    onSelectPassage(start, end, selected);
  };

  if (!section.editable) {
    return (
      <div data-authored-body={section.draftSectionId}
        style={{ fontSize: 17.5, lineHeight: 1.74, whiteSpace: 'pre-wrap' }}>
        {body}
      </div>
    );
  }

  if (editing) {
    return (
      <textarea
        ref={field}
        data-authored-body={section.draftSectionId}
        value={body}
        onChange={(e) => {
          engaged.current = true;
          if (!began.current) { began.current = true; onEditingBegan(); }
          onEdit(e.target.value);
        }}
        onFocus={onFocusPlace}
        onMouseUp={() => { engaged.current = true; captureSelection(); }}
        onKeyUp={(e) => {
          /* Moving THROUGH an editor with Tab is not working in it. */
          if (e.key !== 'Tab' && e.key !== 'Shift') engaged.current = true;
          captureSelection();
        }}
        onBlur={(e) => {
          if (engaged.current) onEditorBlur?.(e.currentTarget.selectionStart, e.currentTarget.selectionEnd);
          engaged.current = false;
          onCaptureBeforeBlur(e.currentTarget.value);
          began.current = false;
          setEditing(false);
        }}
        spellCheck
        aria-label={section.heading ?? `Section ${section.position + 1}`}
        rows={1}
        style={{
          width: '100%', resize: 'none', overflow: 'hidden', border: 'none', outline: 'none',
          background: 'transparent', color: 'inherit', font: 'inherit', fontSize: 17.5,
          lineHeight: 1.74, padding: 0, margin: 0, whiteSpace: 'pre-wrap',
        }}
      />
    );
  }

  const points = [...body];
  return (
    <div
      role="textbox"
      aria-readonly="false"
      tabIndex={0}
      data-authored-body={section.draftSectionId}
      data-held-passage={held ? 'true' : undefined}
      onPointerDown={() => { pointerOpening.current = true; }}
      onClick={() => { engaged.current = true; setEditing(true); }}
      onFocus={() => {
        /* Opened by the writer's pointer: engaged. Reached by keyboard focus
           passing through: not engaged. */
        engaged.current = pointerOpening.current;
        pointerOpening.current = false;
        setEditing(true);
      }}
      style={{
        fontSize: 17.5, lineHeight: 1.74, whiteSpace: 'pre-wrap', cursor: 'text',
        minHeight: '1.74em',
      }}
    >
      {held ? (
        <>
          {points.slice(0, held.start).join('')}
          <mark style={{
            background: 'color-mix(in srgb, var(--ws-gold-fill, #CDBD91) 58%, transparent)',
            color: 'inherit', borderRadius: 3, padding: '2px 0', boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone',
          }}>{points.slice(held.start, held.end).join('')}</mark>
          {points.slice(held.end).join('')}
        </>
      ) : body}
    </div>
  );
}
