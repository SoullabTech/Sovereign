/**
 * Founder 2026-11-12: "we need to be able to expand/contract that horizontal field of Make a plan with MAIA" (Develop, All tools).
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/canvas/ReadScopeControl', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/writers-studio/canvas/SettledDecisions', () => ({ __esModule: true, default: () => null }));
jest.mock('@/lib/writersStudio/workKindClient', () => ({ setWorkKindClient: jest.fn() }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import { DevelopStage, clampShare } from '@/app/dev/writers-studio-pc3-live/DevelopStage';

const sections = [{ draftSectionId: 's1', heading: 'Harbour', body: 'Harbour\n\nMarta held the key.', position: 0 }];
let root: Root; let host: HTMLDivElement;
beforeEach(() => { window.localStorage.clear(); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
function mount(view: string) {
  const props = { workTitle: 'W', sections, currentId: 's1', onSelect: jest.fn(), starters: ['A question?'], onStarter: jest.fn(), onOpenWrite: jest.fn(), onMoreWays: jest.fn(), lastRead: null, plan: null, planBusy: false, planNote: null, onMakePlan: jest.fn(), onEditPlan: jest.fn(), onWorkOnStep: jest.fn(), view };
  act(() => root.render(React.createElement(DevelopStage as any, props)));
}
const q = (s: string) => host.querySelector(s) as HTMLElement | null;
const panel = () => q('[data-develop-more-panel="true"]');

describe('the tools under the chapter can be resized and folded', () => {
  it('⭐ in All tools there is a resize line between the chapter and the tools', () => {
    mount('full');
    expect(q('[data-develop-tools-splitter]')?.getAttribute('role')).toBe('separator');
    expect(panel()?.style.flex).toBe('0 0 40%');
  });
  it('⭐ the keyboard makes the tools taller or shorter, within limits, and it is remembered', () => {
    mount('full');
    const sep = q('[data-develop-tools-splitter]')!;
    act(() => { sep.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })); });
    expect(panel()?.style.flex).toBe('0 0 45%');
    for (let i = 0; i < 20; i += 1) act(() => { sep.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); });
    expect(panel()?.style.flex).toBe('0 0 15%');
    expect(window.localStorage.getItem('writers-studio:develop-tools-share:v1')).toBe('15');
  });
  it('⭐ "Hide tools" folds them away, leaving the chapter; "Show tools" brings them back', () => {
    mount('full');
    act(() => q('[data-develop-tools-fold]')!.click());
    expect(panel()).toBeNull();
    expect(q('[data-develop-chapter]')).not.toBeNull();
    act(() => q('[data-develop-tools-fold]')!.click());
    expect(panel()).not.toBeNull();
  });
  it('outside All tools there is no resize line', () => {
    mount('balanced');
    expect(q('[data-develop-tools-splitter]')).toBeNull();
  });
  it('the size is always within 15–80%', () => {
    expect(clampShare(2)).toBe(15); expect(clampShare(99)).toBe(80); expect(clampShare(Number.NaN)).toBe(40);
  });
});
