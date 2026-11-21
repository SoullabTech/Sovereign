/** @jest-environment jsdom */
/**
 * F1 — guided beta session 2026-11-19 (#1800 contract D1; founder ruling 2026-11-19 item 5).
 * A writer who had talked with MAIA about this Work that afternoon asked about a passage and was told
 * "I haven't read this Work with you yet". The gate is about a kept conversation, not reading, so it must never claim that;
 * and when earlier conversations exist, continuing the latest is the first choice, by the writer's own click.
 * Fictional Work, inert handlers. NOT an authenticated app/server witness.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';
import { relationshipGateCopy, BEGIN_LABEL, BEGIN_INSTEAD_LABEL } from '@/lib/writersStudio/relationshipGateCopy';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let container: HTMLDivElement;
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

const fmt = (d: Date) => d.toISOString().slice(0, 10);
const OLDER = { id: 'rel-older', createdAt: '2026-11-02T10:00:00Z' };
const LATEST = { id: 'rel-latest', createdAt: '2026-11-19T15:00:00Z' };

describe('relationshipGateCopy', () => {
  test('no earlier conversation: start one; nothing claims what MAIA has read', () => {
    const c = relationshipGateCopy([], fmt);
    expect(c.primary).toEqual({ kind: 'begin', label: BEGIN_LABEL });
    expect(c.beginInstead).toBeNull();
    expect(`${c.heading} ${c.nudge}`).not.toMatch(/read/i);
    expect(c.nudge).toContain('I haven’t sent anything');
  });

  test('earlier conversations: continue the LATEST first (by date, whatever the input order), then start new, then older', () => {
    const c = relationshipGateCopy([OLDER, LATEST], fmt);
    expect(c.primary).toEqual({ kind: 'continue', id: 'rel-latest', label: 'Continue our conversation · begun 2026-11-19' });
    expect(c.beginInstead).toBe(BEGIN_INSTEAD_LABEL);
    expect(c.older).toEqual([{ id: 'rel-older', label: 'Continue · 2026-11-02' }]);
    expect(c.heading).toContain('We’ve talked about this Work before');
    expect(`${c.heading} ${c.nudge}`).not.toMatch(/haven.t read/i);
  });

  test('an unreadable date never breaks the choice', () => {
    expect(relationshipGateCopy([{ id: 'x', createdAt: 'not a date' }], fmt).primary)
      .toEqual({ kind: 'continue', id: 'x', label: 'Continue our conversation' });
  });
});

function props(choices: { id: string; createdAt: string }[], over: Record<string, unknown> = {}) {
  return {
    manuscriptTitle: 'Fictional', currentText: 'Original words.', sectionBody: 'Original words.',
    thread: null, version: null, lastMaiaTurn: null, appliedVersionId: null, busy: false,
    message: null, undoMessage: null, sessionPosture: { resolved: true, sanctuary: false },
    onChooseSessionPosture: jest.fn(), onSelectVersion: jest.fn(), onSend: jest.fn(),
    onSaveMember: jest.fn(async () => true), onApply: jest.fn(), onKeep: jest.fn(), onDepth: jest.fn(),
    maiaRelationship: { active: false, busy: false, choices, message: null, onBegin: jest.fn(), onChoose: jest.fn() },
    ...over,
  } as any;
}
const draw = (p: any) => act(() => root.render(React.createElement(EditorialDancePanel, p)));
const gateText = () => container.querySelector('[data-relationship-gate]')?.textContent ?? '';
const buttonsIn = () => [...container.querySelectorAll('[data-relationship-gate] button')].map((b) => b.textContent);

describe('the mounted gate', () => {
  test('never says MAIA has not read the Work', () => {
    for (const choices of [[], [LATEST], [OLDER, LATEST]]) {
      draw(props(choices));
      expect(gateText()).not.toMatch(/haven.t read this Work/i);
    }
  });

  test('with earlier conversations, the first button continues the latest, and only on the writer’s click', () => {
    const p = props([OLDER, LATEST]);
    draw(p);
    expect(p.maiaRelationship.onChoose).not.toHaveBeenCalled();   // nothing is resumed automatically
    const first = container.querySelector('[data-relationship-gate] .p4r1-dance-posture-actions button') as HTMLButtonElement;
    expect(first.hasAttribute('data-relationship-continue')).toBe(true);
    act(() => first.click());
    expect(p.maiaRelationship.onChoose).toHaveBeenCalledWith('rel-latest');
    expect(p.maiaRelationship.onBegin).not.toHaveBeenCalled();
    expect(buttonsIn()).toEqual(expect.arrayContaining([BEGIN_INSTEAD_LABEL, 'Keep this private']));
  });

  test('"Start a new conversation" still begins a new one', () => {
    const p = props([LATEST]);
    draw(p);
    const fresh = [...container.querySelectorAll('button')].find((b) => b.textContent === BEGIN_INSTEAD_LABEL)!;
    act(() => fresh.click());
    expect(p.maiaRelationship.onBegin).toHaveBeenCalledTimes(1);
    expect(p.maiaRelationship.onChoose).not.toHaveBeenCalled();
  });

  test('a program Work keeps its own heading (College Essay copy is owned by #1900)', () => {
    draw(props([LATEST], { notYetCopy: 'Program heading.' }));
    expect(gateText()).toContain('Program heading.');
  });
});
