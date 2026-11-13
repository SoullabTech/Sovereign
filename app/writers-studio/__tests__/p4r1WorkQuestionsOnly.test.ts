/** @jest-environment jsdom */
import fs from 'fs';
import path from 'path';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import IsolatedEditorialRoom from '@/app/dev/writers-studio-pc3-live/IsolatedEditorialRoom';

/**
 * Work-wide "MAIA asks, never rewrites" in the live Studio's Focus Preferences
 * (ledger #1938, 2026-11-13). Before this, the control lived only in the Canvas
 * Work drawer, which the live Studio never mounts, so a writer could not reach it.
 */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root; let host: HTMLDivElement;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

function renderRoom(extra: Record<string, unknown>) {
  act(() => root.render(React.createElement(IsolatedEditorialRoom, {
    appearance: 'evening', title: 'Fire', currentText: 'x', sectionBody: 'x', busy: false,
    editingLatitude: 2, onEditingLatitude: jest.fn(), mayRemoveParagraphs: false, onMayRemoveParagraphs: jest.fn(),
    mayProposeImmediately: false, onMayProposeImmediately: jest.fn(), onClose: jest.fn(),
    children: React.createElement('div'), ...extra,
  } as any)));
}

describe('Work-wide "MAIA asks, never rewrites" in Focus Preferences', () => {
  it('is in Preferences, reflects the saved setting and reports the writer’s choice', () => {
    const onPauseWorkRevisions = jest.fn();
    renderRoom({ workRevisionsPaused: false, onPauseWorkRevisions });
    const box = host.querySelector<HTMLInputElement>('[data-pause-work-revisions] input')!;
    expect(box.closest('.p4r1-isolated-preferences')).not.toBeNull();
    expect(box.checked).toBe(false);
    expect(host.querySelector('[data-pause-work-revisions]')!.textContent).toContain('MAIA asks, never rewrites');
    act(() => box.click());
    expect(onPauseWorkRevisions).toHaveBeenCalledWith(true);
  });

  it('shows the saved "on" state, and a save error, without changing it', () => {
    renderRoom({ workRevisionsPaused: true, onPauseWorkRevisions: jest.fn(), workPauseError: 'Could not save that just now. Nothing changed.' });
    expect(host.querySelector<HTMLInputElement>('[data-pause-work-revisions] input')!.checked).toBe(true);
    expect(host.querySelector('[data-pause-work-revisions] [role="alert"]')!.textContent).toContain('Nothing changed');
  });

  it('is disabled while a save is in flight', () => {
    renderRoom({ workRevisionsPaused: false, onPauseWorkRevisions: jest.fn(), workPauseSaving: true });
    expect(host.querySelector<HTMLInputElement>('[data-pause-work-revisions] input')!.disabled).toBe(true);
  });

  it('without a Work the control is absent (unchanged room)', () => {
    renderRoom({});
    expect(host.querySelector('[data-pause-work-revisions]')).toBeNull();
  });
});

describe('the live view wires it to the member’s own Work setting', () => {
  const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  it('saves through the member Work PATCH, never anything else', () => {
    expect(view).toMatch(/apiFetch\(`\/api\/sovereign\/living-works\/\$\{workId\}`/);
    expect(view).toMatch(/JSON\.stringify\(\{ maiaRevisionsPaused: paused \}\)/);
  });
  it('NEGATIVE: while the Work is paused, every request is reply-only and the passage pause cannot re-open wording', () => {
    expect(view).toMatch(/const revisionsPaused = passageRevisionsPaused \|\| workRevisionsPaused;/);
    expect(view).toMatch(/pausedSendOptions\(options, revisionsPaused\)/);
    expect(view).toMatch(/onPauseRevisions=\{heldKey && !workRevisionsPaused \?/);
  });
  it('starts from the saved setting, not a default', () => {
    expect(view).toMatch(/useState\(props\.work\?\.maiaRevisionsPaused === true\)/);
  });
});

describe('the selection menu honours the Work-wide setting (live walk finding, 2026-11-13)', () => {
  const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  it('NEGATIVE: "Show me an edit" is not offered while the Work is questions-only; a plain note is', () => {
    const menu = view.slice(view.indexOf('or let MAIA offer'), view.indexOf('Teach me the craft'));
    expect(menu).toMatch(/\{workRevisionsPaused \? \(\s*<p[^>]*data-questions-only-note>MAIA asks, never rewrites: on for this Work<\/p>\s*\) : \(\s*<button[^>]*data-passage-choice="revise"/);
  });
  it('every passage act, sent now or held behind a gate, goes through the Work pause', () => {
    const run = view.slice(view.indexOf('const runPassageAct = '), view.indexOf('const runPassageAct = ') + 900);
    expect(run).toMatch(/options: pausedSendOptions\(requested\.options, workRevisionsPaused\)/);
    expect(run).toMatch(/props\.onSendEditorial\(act\.prompt, act\.options\)/);
    expect(run).toMatch(/setRequestedPassageAct\(\{ key: Date\.now\(\), \.\.\.act \}\)/);
  });
  it('the Work setting is declared before the passage actions that read it', () => {
    expect(view.indexOf('const [workRevisionsPaused')).toBeLessThan(view.indexOf('const runPassageAct = '));
    expect(view.indexOf('const [workRevisionsPaused')).toBeLessThan(view.indexOf('const contextualActions = '));
  });
});
