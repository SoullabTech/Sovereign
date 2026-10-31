/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { WriteRoom } from '@/app/writers-studio/full-redesign/WriteRoom';
import { WRITE_COPY } from '@/app/writers-studio/full-redesign/fixtures';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.getSelection()?.removeAllRanges();
});

test('blank live editor anchors the canonical caret inside its empty paragraph', () => {
  act(() => root.render(React.createElement(WriteRoom, {
    fixture: {
      work: 'Fictional Work', heading: 'Opening',
      chapters: [{ id: 'section-1', label: 'Opening' }],
      currentChapterId: 'section-1', place: 'Opening', title: 'Opening',
      paragraphs: [''], blocks: [{ text: '', kind: 'paragraph' as const }],
      saveState: 'Saved', unsaved: 'Unsaved',
    },
    copy: WRITE_COPY, canvas: false, onCanvasChange: () => undefined,
    live: { canonicalBody: '', onEditBody: () => undefined },
  })));

  const editor = container.querySelector<HTMLElement>('[data-write-editor]');
  const paragraph = editor?.querySelector('p');
  const selection = window.getSelection();
  expect(editor).toBeTruthy();
  expect(paragraph).toBeTruthy();
  expect(document.activeElement).toBe(editor);
  expect(selection?.rangeCount).toBe(1);
  expect(selection?.anchorNode).toBe(paragraph);
  expect(selection?.anchorOffset).toBe(0);
});
