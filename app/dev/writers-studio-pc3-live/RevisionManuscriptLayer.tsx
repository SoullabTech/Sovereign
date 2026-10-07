'use client';

import { useEffect, useMemo, useState } from 'react';
import { editorialSegments, type Segment } from '@/lib/writersStudio/editorialDiff';

type Rect = { left: number; top: number; width: number; height: number };

export type RevisionEdit = {
  id: number;
  start: number;
  end: number;
  from: string;
  to: string;
  protectedSpan: boolean;
};

export type RevisionManuscriptLayerProps = {
  sectionId: string;
  passageStart: number;
  original: string;
  proposed: string;
  rationale: string | null;
  selected: ReadonlySet<number>;
  busy: boolean;
  onToggle: (editId: number) => void;
  onWhy: (edit: RevisionEdit) => void;
  onTeach: (edit: RevisionEdit) => void;
  onChange: (edit: RevisionEdit) => void;
  onSaveSelected: () => void;
  /** Develop Craft always marks the active passage, even before a proposal exists. */
  showLocus?: boolean;
};

function textNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) out.push(node as Text);
  return out;
}

function domOffsetForCodePoints(text: string, points: number): number {
  return Array.from(text).slice(0, points).join('').length;
}

function locateRange(root: HTMLElement, start: number, end: number): Range | null {
  if (start < 0 || end < start) return null;
  const nodes = textNodes(root);
  let cursor = 0;
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startOffset = 0;
  let endOffset = 0;

  for (const node of nodes) {
    const len = Array.from(node.data).length;
    const next = cursor + len;
    if (!startNode && start >= cursor && start <= next) {
      startNode = node;
      startOffset = domOffsetForCodePoints(node.data, start - cursor);
    }
    if (end >= cursor && end <= next) {
      endNode = node;
      endOffset = domOffsetForCodePoints(node.data, end - cursor);
      break;
    }
    cursor = next;
  }
  if (!startNode || !endNode) return null;

  const range = document.createRange();
  try {
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  } catch {
    return null;
  }
}

function changes(original: string, proposed: string): RevisionEdit[] {
  const segments = editorialSegments(original, proposed);
  const byId = new Map<number, RevisionEdit>();
  let cursor = 0;

  for (const segment of segments) {
    if (segment.kind === 'same') {
      cursor += Array.from(segment.text).length;
      continue;
    }
    const id = segment.editId;
    if (id === null) continue;
    const entry = byId.get(id) ?? {
      id,
      start: cursor,
      end: cursor,
      from: '',
      to: '',
      protectedSpan: false,
    };
    if (segment.kind === 'del') {
      if (!entry.from) entry.start = cursor;
      entry.from += segment.text;
      cursor += Array.from(segment.text).length;
      entry.end = cursor;
    } else {
      if (!entry.from) {
        entry.start = cursor;
        entry.end = cursor;
      }
      entry.to += segment.text;
    }
    entry.protectedSpan = entry.protectedSpan || segment.protectedSpan;
    byId.set(id, entry);
  }
  return [...byId.values()].filter((edit) => !edit.protectedSpan).sort((a, b) => a.id - b.id);
}

function rectsForEdit(editor: HTMLElement, edit: RevisionEdit, passageStart: number): Rect[] {
  const start = passageStart + edit.start;
  const end = passageStart + edit.end;
  const range = locateRange(editor, start, end);

  if (range && end > start) {
    const rects = Array.from(range.getClientRects())
      .filter((rect) => rect.width > 0 && rect.height > 0)
      .map((rect) => ({ left: rect.left, top: rect.top, width: rect.width, height: rect.height }));
    if (rects.length > 0) return rects;
  }

  // Pure insertion: anchor the marker at the nearest live character boundary.
  const fallbackEnd = Math.max(start + 1, end + 1);
  const fallback = locateRange(editor, start, fallbackEnd);
  const rect = fallback?.getBoundingClientRect();
  return rect && rect.height > 0
    ? [{ left: rect.left, top: rect.top, width: Math.max(2, Math.min(rect.width, 3)), height: rect.height }]
    : [];
}

export default function RevisionManuscriptLayer({
  sectionId,
  passageStart,
  original,
  proposed,
  rationale,
  selected,
  busy,
  onToggle,
  onWhy,
  onTeach,
  onChange,
  onSaveSelected,
  showLocus = false,
}: RevisionManuscriptLayerProps) {
  const edits = useMemo(() => changes(original, proposed), [original, proposed]);
  const [rectMap, setRectMap] = useState<Map<number, Rect[]>>(new Map());
  const [locusRects, setLocusRects] = useState<Rect[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const editor = document.querySelector<HTMLElement>(
          `[data-write-editor][data-section-id="${CSS.escape(sectionId)}"]`,
        );
        if (!editor) {
          setRectMap(new Map());
          setLocusRects([]);
          return;
        }
        const next = new Map<number, Rect[]>();
        for (const edit of edits) {
          const rects = rectsForEdit(editor, edit, passageStart);
          if (rects.length > 0) next.set(edit.id, rects);
        }
        setRectMap(next);

        if (showLocus) {
          const end = passageStart + Array.from(original).length;
          const locusRange = locateRange(editor, passageStart, end);
          const nextLocus = locusRange
            ? Array.from(locusRange.getClientRects())
                .filter((rect) => rect.width > 0 && rect.height > 0)
                .map((rect) => ({ left: rect.left, top: rect.top, width: rect.width, height: rect.height }))
            : [];
          setLocusRects(nextLocus);
        } else {
          setLocusRects([]);
        }
      });
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const editor = document.querySelector<HTMLElement>(
      `[data-write-editor][data-section-id="${CSS.escape(sectionId)}"]`,
    );
    const observer = new ResizeObserver(measure);
    if (editor) observer.observe(editor);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      observer.disconnect();
    };
  }, [sectionId, passageStart, original, edits, showLocus]);

  if (edits.length === 0 && !showLocus) return null;

  const open = openId === null ? null : edits.find((edit) => edit.id === openId) ?? null;
  const openRects = open ? rectMap.get(open.id) ?? [] : [];
  const firstOpenRect = openRects[0] ?? null;

  return (
    <>
      {showLocus && locusRects.length > 0 ? (
        <div className="p4r1-craft-locus-ink" aria-hidden="true">
          {locusRects.map((rect, index) => (
            <span
              key={`locus:${index}`}
              style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
            />
          ))}
          <b
            style={{
              left: Math.max(8, locusRects[0]!.left - 42),
              top: Math.max(66, locusRects[0]!.top - 2),
            }}
          >
            Craft
          </b>
        </div>
      ) : null}

      <div className="p4r1-revision-ink" aria-hidden="true">
        {edits.flatMap((edit) =>
          (rectMap.get(edit.id) ?? []).map((rect, index) => (
            <span
              key={`${edit.id}:${index}`}
              data-edit-id={edit.id}
              data-delete={edit.from ? 'true' : undefined}
              data-insert={edit.to ? 'true' : undefined}
              data-selected={selected.has(edit.id) ? 'true' : undefined}
              style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
            />
          )),
        )}
        {edits.map((edit) => {
          if (!edit.to.trim()) return null;
          const rects = rectMap.get(edit.id) ?? [];
          const anchor = rects[rects.length - 1];
          if (!anchor) return null;
          return (
            <span
              key={`insert:${edit.id}`}
              className="p4r1-revision-inline-insert"
              data-edit-id={edit.id}
              data-selected={selected.has(edit.id) ? 'true' : undefined}
              style={{
                left: Math.min(window.innerWidth - 340, anchor.left + anchor.width + 7),
                top: anchor.top + anchor.height + 2,
              }}
            >
              {edit.to.trim()}
            </span>
          );
        })}
      </div>

      {edits.map((edit) => {
        const first = (rectMap.get(edit.id) ?? [])[0];
        if (!first) return null;
        const taken = selected.has(edit.id);
        return (
          <button
            key={edit.id}
            type="button"
            className="p4r1-revision-marker"
            data-selected={taken ? 'true' : undefined}
            aria-pressed={taken}
            aria-label={`Proposed edit ${edit.id}`}
            style={{ left: Math.max(10, first.left - 34), top: first.top - 1 }}
            onClick={() => setOpenId((current) => current === edit.id ? null : edit.id)}
          >
            Δ{edit.id}
          </button>
        );
      })}

      {open && firstOpenRect ? (
        <aside
          className="p4r1-revision-popover"
          style={{
            left: Math.min(window.innerWidth - 400, Math.max(18, firstOpenRect.left + firstOpenRect.width + 18)),
            top: Math.min(window.innerHeight - 360, Math.max(82, firstOpenRect.top - 16)),
          }}
          data-revision-manuscript-layer={open.id}
        >
          <header>
            <span>Proposed change Δ{open.id}</span>
            <button type="button" aria-label="Close proposed change" onClick={() => setOpenId(null)}>×</button>
          </header>

          <p className="p4r1-revision-change">
            {open.from ? <><del>{open.from.trim()}</del><span aria-hidden="true"> → </span></> : <em>Add: </em>}
            {open.to ? <ins>{open.to.trim()}</ins> : <em>remove these words</em>}
          </p>

          {rationale ? <p className="p4r1-revision-rationale">{rationale}</p> : null}

          <div className="p4r1-revision-popover-actions">
            <button type="button" aria-pressed={selected.has(open.id)} onClick={() => onToggle(open.id)}>
              {selected.has(open.id) ? 'Use my original here' : 'Use this change'}
            </button>
            <button type="button" onClick={() => onWhy(open)}>Why this?</button>
            <button type="button" onClick={() => onTeach(open)}>Teach me</button>
            <button type="button" onClick={() => onChange(open)}>Change it</button>
          </div>
        </aside>
      ) : null}

      {selected.size > 0 ? (
        <div className="p4r1-revision-compose">
          <span>{selected.size} change{selected.size === 1 ? '' : 's'} chosen</span>
          <button type="button" disabled={busy} onClick={onSaveSelected}>
            Save these as my version
          </button>
        </div>
      ) : null}
    </>
  );
}
