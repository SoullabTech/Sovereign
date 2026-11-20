/**
 * Beta walk 2026-11-15 (#1800, R3): MAIA's column said "I haven't read this draft yet" with no way to ask her to read it.
 * Real component; no network. Not a browser run.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import fs from 'fs';
import path from 'path';
import { createRoot, type Root } from 'react-dom/client';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { StageReadingInvitation, type StageReading } from '@/app/dev/writers-studio-pc3-live/DevelopStage';

let root: Root; let host: HTMLDivElement;
beforeEach(() => { jest.useFakeTimers(); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); jest.useRealTimers(); });

const reading = (over: Partial<StageReading> = {}): StageReading =>
  ({ status: 'idle', progress: null, error: null, chapterLabel: 'Section 1', chapterWords: 420, items: [], ...over });
function mount(r: StageReading, needsCheckpoint = false) {
  const onRead = jest.fn(); const onCheckpointAndRead = jest.fn();
  act(() => root.render(React.createElement(StageReadingInvitation, { reading: r, needsCheckpoint, onRead, onCheckpointAndRead })));
  return { onRead, onCheckpointAndRead };
}
const btn = () => host.querySelector<HTMLButtonElement>('[data-develop-maia-read-chapter]');

test('unread chapter: MAIA\'s column offers the reading, and rendering alone reads nothing', () => {
  const h = mount(reading());
  expect(host.textContent).toContain('MAIA does not have a completed reading of Section 1 here yet. Would you like her to read it?');
  expect(btn()!.textContent).toBe('Read this part with MAIA'); // no form named: neutral words (founder 2026-11-20)
  expect(h.onRead).not.toHaveBeenCalled(); expect(h.onCheckpointAndRead).not.toHaveBeenCalled();
  act(() => btn()!.click());
  expect(h.onRead).toHaveBeenCalledTimes(1); expect(h.onCheckpointAndRead).not.toHaveBeenCalled();
});

test('a double-click asks once; the button comes back if nothing moves', () => {
  const h = mount(reading());
  act(() => { btn()!.click(); btn()!.click(); });
  act(() => btn()!.click());
  expect(h.onRead).toHaveBeenCalledTimes(1);
  expect(btn()!.disabled).toBe(true);
  act(() => { jest.advanceTimersByTime(4000); });
  expect(btn()!.disabled).toBe(false);
});

test('unsaved changes: the same checkpoint-first path as the toolbar, said before it happens', () => {
  // the stage's own checkpoint error, verbatim from P4R1DevelopView: it names the toolbar's label, not this column's button
  const h = mount(reading({ status: 'error', error: 'Your latest changes need saving as a checkpoint before MAIA can read this chapter. Choose “Read this chapter with MAIA” to save it and read.' }), true);
  expect(host.textContent).toContain('Your latest changes to Section 1 aren’t saved yet. MAIA reads a saved draft, so this saves a checkpoint first, then she reads it.');
  expect(host.textContent).not.toContain('Choose “Read this chapter with MAIA”');
  expect(btn()!.textContent).toBe('Save checkpoint and read with MAIA');
  act(() => btn()!.click());
  expect(h.onCheckpointAndRead).toHaveBeenCalledTimes(1); expect(h.onRead).not.toHaveBeenCalled();
});

test('while she reads: progress only, no second ask', () => {
  mount(reading({ status: 'reading', progress: null }));
  expect(btn()).toBeNull();
  expect(host.querySelector('[role="status"]')!.textContent).toBe('MAIA is reading Section 1…');
});

test('a failed reading says so, keeps the writing safe, and offers a retry', () => {
  const h = mount(reading({ status: 'error', error: null }));
  expect(host.textContent).toContain('MAIA could not finish this reading. Your writing is unchanged.');
  act(() => btn()!.click());
  expect(h.onRead).toHaveBeenCalledTimes(1);
});

test('once her reading is ready the invitation is gone (the reading card takes the place)', () => {
  mount(reading({ status: 'ready' }));
  expect(host.querySelector('[data-develop-maia-reading-invitation]')).toBeNull();
});

test('the View wires the invitation to the same handlers the toolbar uses, keyed so the latch clears on a new status or chapter', () => {
  const view = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');
  expect(view).toMatch(/<StageReadingInvitation key=\{`\$\{stageReading\.status\}:\$\{stageReading\.chapterLabel\}`\}/);
  expect(view).toContain('onRead={props.onReadChapter} onCheckpointAndRead={props.onCheckpointAndReadChapter}');
  expect(view).toContain('needsCheckpoint={props.chapterNeedsCheckpoint}');
  // the toolbar's act is unchanged
  expect(view).toContain('onReadChapter={props.chapterNeedsCheckpoint ? props.onCheckpointAndReadChapter : props.onReadChapter}');
});
