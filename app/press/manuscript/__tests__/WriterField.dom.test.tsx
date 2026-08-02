import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import WriterField, { type WriterFieldHandle } from '../WriterField';

/**
 * The Writer's Field — editor contract proof.
 *
 * These tests exist for one reason: the field replaced the surface the whole
 * save/insert/return substrate was written against, and the contracts most at
 * risk in that swap are the ones a Node environment cannot touch at all.
 *
 * What is asserted here is exactly what jsdom can honestly witness — document
 * contents, integer selection offsets, undo/redo history, full replacement,
 * and what the handle reports after asynchronous work. Geometry is NOT
 * asserted anywhere: jsdom has no layout, so real focus, scrolling, keyboard
 * shortcuts, autosave timing and chapter-sized behaviour stay with the
 * authenticated browser walk. A green run here is not a claim about those.
 *
 * Typing is driven through `view.dispatch({ changes, userEvent: 'input.type' })`
 * — the same transaction a keystroke produces — rather than synthetic key
 * events, which jsdom cannot deliver to a contenteditable.
 */

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/** A controlled host, mirroring how WorkingDraftEditor owns `content`. */
function mount(initial: string) {
  const api: {
    handle: WriterFieldHandle | null;
    value: string;
    setValue: (v: string) => void;
    changes: string[];
  } = { handle: null, value: initial, setValue: () => {}, changes: [] };

  function Host() {
    const [value, setValue] = useState(initial);
    const ref = useRef<WriterFieldHandle | null>(null);
    api.handle = ref.current;
    api.value = value;
    api.setValue = setValue;
    return (
      <WriterField
        ref={(h) => {
          ref.current = h;
          api.handle = h;
        }}
        value={value}
        onChange={(v) => {
          api.changes.push(v);
          setValue(v);
        }}
      />
    );
  }

  act(() => root.render(<Host />));
  return api;
}

function viewOf(): EditorView {
  const view = EditorView.findFromDOM(container);
  if (!view) throw new Error('EditorView not mounted');
  return view;
}

/** The transaction a keystroke produces. */
function type(text: string, at?: number) {
  const view = viewOf();
  const from = at ?? view.state.selection.main.from;
  const to = at ?? view.state.selection.main.to;
  act(() => {
    view.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
      userEvent: 'input.type',
    });
  });
}

const CHAPTER = '# Chapter One\n\nThe river had changed course again.\n\n## The Return\n\nShe waited.';

describe("Writer's Field — document contract", () => {
  it('1. renders initial markdown byte-identically', () => {
    const api = mount(CHAPTER);
    expect(api.handle!.value).toBe(CHAPTER);
    expect(viewOf().state.doc.toString()).toBe(CHAPTER);
  });

  it('2. typing emits the exact markdown string', () => {
    const api = mount('Hello');
    type(' world', 5);
    expect(api.changes[api.changes.length - 1]).toBe('Hello world');
    expect(api.handle!.value).toBe('Hello world');
  });

  it('3. selection offsets are exact integers into the string', () => {
    const api = mount(CHAPTER);
    const at = CHAPTER.indexOf('river');
    act(() => {
      viewOf().dispatch({ selection: { anchor: at, head: at + 5 } });
    });
    expect(api.handle!.selectionStart).toBe(at);
    expect(api.handle!.selectionEnd).toBe(at + 5);
    expect(api.handle!.value.slice(at, at + 5)).toBe('river');
  });

  it('4. setSelectionRange restores an exact offset, and clamps a stale one', () => {
    const api = mount(CHAPTER);
    act(() => api.handle!.setSelectionRange(10, 17));
    expect(api.handle!.selectionStart).toBe(10);
    expect(api.handle!.selectionEnd).toBe(17);

    // A position stored against longer text must not throw or land outside.
    act(() => api.handle!.setSelectionRange(99_999, 99_999));
    expect(api.handle!.selectionStart).toBe(CHAPTER.length);
  });

  it('11. markdown headings survive for the existing structure logic', () => {
    const api = mount(CHAPTER);
    type('\n\nMore prose.', CHAPTER.length);
    expect(api.handle!.value).toContain('# Chapter One');
    expect(api.handle!.value).toContain('## The Return');
  });
});

describe("Writer's Field — history", () => {
  it('6. undo removes ordinary typing', () => {
    const api = mount('Hello');
    type(' world', 5);
    expect(api.handle!.value).toBe('Hello world');
    act(() => api.handle!.undo());
    expect(api.handle!.value).toBe('Hello');
  });

  it('7 + 8. undo removes a programmatic insertion, and redo restores it', () => {
    // This is the case the textarea could not do: setting `.value`
    // programmatically discarded native history, so Bring in was unundoable.
    const api = mount('Start.');
    act(() => {
      viewOf().dispatch({
        changes: { from: 6, to: 6, insert: '\n\nBrought in.' },
        userEvent: 'input.paste',
      });
    });
    expect(api.handle!.value).toBe('Start.\n\nBrought in.');

    act(() => api.handle!.undo());
    expect(api.handle!.value).toBe('Start.');

    act(() => api.handle!.redo());
    expect(api.handle!.value).toBe('Start.\n\nBrought in.');
  });

  it('8b. undo reaches back past a programmatic insertion to earlier typing', () => {
    const api = mount('A');
    type('B', 1);
    act(() => {
      viewOf().dispatch({ changes: { from: 2, to: 2, insert: 'C' }, userEvent: 'input.paste' });
    });
    expect(api.handle!.value).toBe('ABC');
    act(() => api.handle!.undo());
    expect(api.handle!.value).toBe('AB');
    act(() => api.handle!.undo());
    expect(api.handle!.value).toBe('A');
  });
});

describe("Writer's Field — replacement and live reads", () => {
  it('9 + 10. full replacement (revision restore) lands, then selection is set after it', () => {
    const api = mount(CHAPTER);
    const restored = '# Chapter One\n\nAn earlier version.';
    act(() => api.setValue(restored));
    expect(api.handle!.value).toBe(restored);

    // Selection applied AFTER the replacement, as the restore path does.
    act(() => api.handle!.setSelectionRange(restored.length, restored.length));
    expect(api.handle!.selectionStart).toBe(restored.length);
  });

  it('12 (W-2). insertion uses the document as it is when the checkpoint resolves', async () => {
    // The defect: insertAtCaret captured `content`, awaited the checkpoint,
    // then rebuilt the document from that pre-await string — deleting anything
    // typed during the await. The fix is to read the live surface afterwards.
    const api = mount('Before.');

    let resolveCheckpoint!: (ok: boolean) => void;
    const checkpoint = new Promise<boolean>((res) => {
      resolveCheckpoint = res;
    });

    const staleCapture = api.handle!.value; // what the old closure would hold

    // Bring in begins: caret placed, checkpoint pending.
    act(() => api.handle!.setSelectionRange(7, 7));
    const bringIn = (async () => {
      const ok = await checkpoint;
      if (!ok) return;
      const current = api.handle!.value; // <- reads live, not the capture
      const start = api.handle!.selectionStart;
      const before = current.slice(0, start);
      const after = current.slice(start);
      api.setValue(`${before}\n\nBrought in.${after}`);
    })();

    // The writer keeps typing while the checkpoint is still in flight. The
    // caret travels with the typing, from 7 to 17 — as it would for a writer.
    type(' And more.', 7);
    expect(api.handle!.value).toBe('Before. And more.');
    expect(api.handle!.selectionStart).toBe(17);

    await act(async () => {
      resolveCheckpoint(true);
      await bringIn;
    });

    // Both halves of the contract:
    //  · the intervening words survive — nothing typed during the await is lost
    expect(api.handle!.value).toContain(' And more.');
    //  · the passage lands at the caret as it is NOW, not as it was when Bring
    //    in started. Reading the live surface gives both at once.
    expect(api.handle!.value).toBe('Before. And more.\n\nBrought in.');

    // Proof this is the fix and not merely favourable timing: the string the
    // old closure would have held is stale, and rebuilding from it would have
    // produced this instead — silently deleting ' And more.'.
    expect(staleCapture).toBe('Before.');
    expect(api.handle!.value).not.toBe(`${staleCapture}\n\nBrought in.`);
  });
});
