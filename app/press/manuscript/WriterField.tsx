'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, redo, undo } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';

/**
 * The writing field — a durable prose surface over the Working Draft.
 *
 * ── Why this exists (2026-08-01) ───────────────────────────────────────────
 *
 * The draft was written in a `<textarea>`. That surface could not give the
 * writer safe undo: the browser's native history is discarded the moment the
 * value is set programmatically, and this editor does that on every Explicit
 * Insertion and every revision restore. So the two acts most in need of being
 * undoable were the two that silently emptied the undo stack.
 *
 * CodeMirror is used for exactly that one reason. It is NOT a rich-text
 * editor here and must never become one:
 *
 *   - The document IS a markdown string. `state.doc.toString()` is the same
 *     value the textarea's `.value` was, byte for byte.
 *   - Selections ARE integer offsets into that string.
 *
 * Those two facts are the whole contract. Explicit Insertion inserts at a
 * caret offset; `returningState` stores selectionStart/selectionEnd/scrollTop;
 * `headingAtOffset` reads structure from the string; revisions store full
 * content; `base_source_hash` hashes it. A rich document model would have
 * replaced offsets with document positions and broken all five at once.
 *
 * ── Why the handle is textarea-shaped ──────────────────────────────────────
 *
 * This component deliberately exposes `selectionStart`, `selectionEnd`,
 * `scrollTop`, `setSelectionRange`, `focus` — the same surface the textarea
 * offered. The 800 lines of save-integrity logic around it (single-flight
 * autosave, exit flush, checkpoints, conflict recovery, caret restore) were
 * written against that shape and are covered by tests that must pass
 * unchanged. Swapping the surface should not require rewriting the contracts
 * it serves; anything that made those tests need editing would mean the
 * surface had broken a contract rather than replaced a widget.
 */

export interface WriterFieldHandle {
  /** Caret start as an offset into the markdown string. */
  readonly selectionStart: number;
  /** Caret end as an offset into the markdown string. */
  readonly selectionEnd: number;
  /** Current document text. Identical to what a textarea's `.value` returned. */
  readonly value: string;
  scrollTop: number;
  /** Total scrollable height, for clamping a restored scroll position. */
  readonly scrollHeight: number;
  setSelectionRange(start: number, end: number): void;
  focus(opts?: { preventScroll?: boolean }): void;
  /** True when the writer's caret is actually in this field right now. */
  hasFocus(): boolean;
  undo(): void;
  redo(): void;
}

interface WriterFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Fires on any caret/selection move, including moves caused by typing. */
  onSelectionChange?: () => void;
  /** Fires the first time the writer places a caret in the field this session. */
  onCaretTouched?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  fontFamily?: string;
  fontSize?: string;
  caretColor?: string;
  ariaLabel?: string;
  /**
   * Height the editable area occupies even when the document is empty, as a
   * CSS length. Without this the contenteditable is exactly as tall as its
   * content — one line on a blank draft — so a click anywhere in the blank
   * writing area lands on the surrounding page and focuses nothing. Setting it
   * makes the field the thing the writer is actually clicking.
   */
  minHeight?: string;
}

const WriterField = forwardRef<WriterFieldHandle, WriterFieldProps>(function WriterField(
  {
    value,
    onChange,
    onSelectionChange,
    onCaretTouched,
    placeholder,
    readOnly = false,
    fontFamily,
    fontSize,
    caretColor,
    ariaLabel = 'Working draft',
    minHeight,
  },
  ref
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Ref indirection so the CodeMirror extensions — created once, for the life
  // of the view — always call the latest handlers without the view being torn
  // down and rebuilt on every render. Rebuilding the view would destroy the
  // undo history, which is the one thing this component exists to keep.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;
  const onCaretTouchedRef = useRef(onCaretTouched);
  onCaretTouchedRef.current = onCaretTouched;
  const caretTouchedRef = useRef(false);

  useImperativeHandle(
    ref,
    (): WriterFieldHandle => ({
      get selectionStart() {
        return viewRef.current?.state.selection.main.from ?? 0;
      },
      get selectionEnd() {
        return viewRef.current?.state.selection.main.to ?? 0;
      },
      get value() {
        return viewRef.current?.state.doc.toString() ?? '';
      },
      get scrollTop() {
        return viewRef.current?.scrollDOM.scrollTop ?? 0;
      },
      set scrollTop(next: number) {
        const view = viewRef.current;
        if (view) view.scrollDOM.scrollTop = next;
      },
      get scrollHeight() {
        return viewRef.current?.scrollDOM.scrollHeight ?? 0;
      },
      setSelectionRange(start, end) {
        const view = viewRef.current;
        if (!view) return;
        // Clamp: a restored position can outlive the text it referred to.
        const len = view.state.doc.length;
        const from = Math.max(0, Math.min(start, len));
        const to = Math.max(0, Math.min(end, len));
        view.dispatch({ selection: { anchor: from, head: to } });
      },
      focus(opts) {
        const view = viewRef.current;
        if (!view) return;
        // `preventScroll` matters on return: focusing must not yank the page
        // back to the caret before the restored scroll position is applied.
        view.contentDOM.focus({ preventScroll: opts?.preventScroll ?? false });
      },
      hasFocus() {
        return viewRef.current?.hasFocus ?? false;
      },
      undo() {
        const view = viewRef.current;
        if (view) undo(view);
      },
      redo() {
        const view = viewRef.current;
        if (view) redo(view);
      },
    }),
    []
  );

  // Build the view exactly once. Every prop that could change is read through
  // a ref above, precisely so this effect never re-runs and the history
  // survives for the whole writing session.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || viewRef.current) return;

    const extensions: Extension[] = [
      history(),
      keymap.of([...historyKeymap, ...defaultKeymap]),
      markdown(),
      EditorView.lineWrapping,
      EditorState.allowMultipleSelections.of(false),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
        if (update.selectionSet || update.docChanged) {
          if (!caretTouchedRef.current && update.view.hasFocus) {
            caretTouchedRef.current = true;
            onCaretTouchedRef.current?.();
          }
          onSelectionChangeRef.current?.();
        }
      }),
      EditorView.theme({
        '&': { backgroundColor: 'transparent', color: 'inherit' },
        '&.cm-focused': { outline: 'none' },
        '.cm-content': {
          fontFamily: fontFamily ?? 'inherit',
          fontSize: fontSize ?? '17px',
          lineHeight: '1.75',
          padding: '0',
          caretColor: caretColor ?? 'currentColor',
          // The editable area, not the page around it, is what the writer aims
          // at. A blank draft is one line tall; without this the whole blank
          // field is a click target that focuses nothing, and writing is only
          // reachable through a programmatic focus() the writer does not have.
          // CodeMirror maps a click in this space to the nearest line, so the
          // caret lands correctly rather than merely focusing.
          ...(minHeight ? { minHeight } : {}),
        },
        '.cm-line': { padding: '0' },
        // The page grows with the writing. No inner scrollbar: the browser owns
        // the one scrollbar, so the caret stays in the band the eye rests in
        // rather than pinned near the bottom edge for hours.
        '.cm-scroller': { overflow: 'visible', fontFamily: 'inherit', lineHeight: '1.75' },
        '&.cm-editor': { height: 'auto' },
        '.cm-gutters': { display: 'none' },
      }),
    ];

    if (placeholder) extensions.push(cmPlaceholder(placeholder));
    if (readOnly) extensions.push(EditorState.readOnly.of(true));

    const view = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: host,
    });
    view.contentDOM.setAttribute('aria-label', ariaLabel);
    view.contentDOM.setAttribute('role', 'textbox');
    view.contentDOM.setAttribute('aria-multiline', 'true');
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconcile external writes (revision restore, Explicit Insertion, initial
  // load) into the document — WITHOUT recreating the view, so undo still
  // reaches back past them. Guarded on inequality: echoing the writer's own
  // keystroke back as a transaction would fight the caret on every character.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      // The caller owns the caret after a programmatic write; it sets the
      // selection explicitly in the same tick via setSelectionRange.
      selection: { anchor: Math.min(view.state.selection.main.anchor, value.length) },
    });
  }, [value]);

  return <div ref={hostRef} data-testid="writer-field" />;
});

export default WriterField;
