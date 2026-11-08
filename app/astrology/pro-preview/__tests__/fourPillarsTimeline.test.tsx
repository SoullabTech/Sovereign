/** @jest-environment jsdom */
/**
 * Founder walk 2026-11-07: the luck pillars showed no mapping of where the
 * person is now, nor which were lived and which are to come.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { calculateFourPillars } from '@/lib/astrology/proFourPillars';
import ProFourPillars from '../ProFourPillars';

jest.mock('../pro-four-pillars.module.css', () => ({}), { virtual: true });
jest.mock('../pro-ask-maia.module.css', () => ({}), { virtual: true });
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

const fp = calculateFourPillars(new Date('1990-06-15T18:30:00Z'), '1990-06-15', '14:30', 'midnight', new Date('2026-11-07T12:00:00Z'));
const render = (direction: 'forward' | 'backward' | null) =>
  act(() => root.render(React.createElement(ProFourPillars, { fp, direction, onDirection: () => {} })));
const phases = (label: string) =>
  Array.from(container.querySelectorAll(`ol[aria-label="${label}"] > li`)).map((li) => li.getAttribute('data-phase'));

describe('Da Yun timeline', () => {
  it('asks for a direction before mapping anything', () => {
    render(null);
    expect(container.textContent).toContain('Choose a direction to map the luck pillars.');
    expect(container.querySelector('ol[aria-label="Luck pillars"]')).toBeNull();
  });

  it('marks the lived, current and coming luck pillars, and says where the person is now', () => {
    render('backward'); // backward from age 3 y 3 m: ages 3–13, 13–23, 23–33, 33–43 (now 36), …
    expect(phases('Luck pillars')).toEqual(['past', 'past', 'past', 'current', 'future', 'future', 'future', 'future']);
    const now = container.querySelector('[role="status"]')!.textContent!;
    expect(now).toContain('age 36');
    expect(now).toContain('luck pillar 4 of 8');
    expect(now).toContain('this year 丙午');
    const current = container.querySelector('ol[aria-label="Luck pillars"] > li[aria-current="true"]')!;
    expect(current.textContent).toContain('now');
  });

  it('lists the annual pillars of the current luck pillar with this year marked', () => {
    render('backward');
    const years = Array.from(container.querySelectorAll('ol[aria-label="Annual pillars"] > li'));
    expect(years).toHaveLength(10);
    const current = years.find((li) => li.getAttribute('aria-current') === 'true')!;
    expect(current.textContent).toContain('2026');
    expect(current.textContent).toContain('丙午');
    expect(phases('Annual pillars').filter((p) => p === 'current')).toHaveLength(1);
  });
});
