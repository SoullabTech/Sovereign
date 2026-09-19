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
  highlights?: readonly HeldPassage[];
  onEdit: (body: string) => void;
  onEditingBegan: () => void;
  onFocusPlace: () => void;
  onCaptureBeforeBlur: (body: string) => void;
  onSelectPassage: (start: number, end: number, text: string) => void;
}

const cp = (text: string, unitOffset: number) => [...text.slice(0, unitOffset)].length;

export default function RebuildAuthoredBody({
  section, body, held, highlights = [], onEdit, onEditingBegan, onFocusPlace,
  onCaptureBeforeBlur, onSelectPassage,
}: RebuildAuthoredBodyProps) {
  const [editing, setEditing] = useState(false);
  const field = useRef<HTMLTextAreaElement | null>(null);
  const began = useRef(false);

  useEffect(() => {
    if (!editing) return;
    const el = field.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [editing, body]);

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
          if (!began.current) { began.current = true; onEditingBegan(); }
          onEdit(e.target.value);
        }}
        onFocus={onFocusPlace}
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
        onBlur={(e) => {
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
      onClick={() => setEditing(true)}
      onFocus={() => setEditing(true)}
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
      ) : highlightedBody(body, highlights)}
    </div>
  );
}

/** Preserve every authored code point, including overlapping evidence and verse. */
export function highlightedBody(body: string, ranges: readonly HeldPassage[]) {
  const points = Array.from(body);
  const valid = ranges.filter(r => Number.isInteger(r.start) && Number.isInteger(r.end) && r.start >= 0 && r.end > r.start && r.end <= points.length);
  const boundaries = [...new Set([0, points.length, ...valid.flatMap(r => [r.start, r.end])])].sort((a,b) => a-b);
  return boundaries.slice(0,-1).map((start, index) => {
    const end = boundaries[index + 1];
    const text = points.slice(start, end).join('');
    return valid.some(r => r.start <= start && r.end >= end)
      ? <mark key={start} className="ws-development-highlight">{text}</mark> : text;
  });
}
