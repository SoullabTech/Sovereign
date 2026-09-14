/**
 * @jest-environment jsdom
 */
/**
 * WS-PROPOSAL-INTERACTION-01 — the acceptance the founder ruled must be
 * BEHAVIOURAL.
 *
 * ⛔ "A callback firing, an API name appearing, or a section becoming visible
 * is insufficient evidence." Every earlier obligation in this lane read SOURCE,
 * and source reading is exactly what missed this defect: the instrument
 * asserted that `showProposedChange` existed, which was true while the control
 * did nothing. Naming a callback is not naming arrival.
 *
 * So this MOUNTS the surface in jsdom, drives a real sequence of renders, and
 * observes where the reveal actually terminated. No dependency was added —
 * `react-dom` and `jest-environment-jsdom` are already here, and the suite is
 * `.ts` (the runner matches only `.test.ts`), so elements are built with
 * `createElement` rather than JSX.
 *
 * THE GOVERNING PROPERTY, as ruled:
 *
 *   Automatic reveal is once-only. Asked-for reveal is repeatable. Both must
 *   reach the exact locus. They are distinct acts and may not share
 *   consumption state.
 */
import { createElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/canvas/revealWithin', () => ({
  revealWithin: jest.fn(),
  scrollDelta: jest.fn(),
  nearestScroller: jest.fn(),
}));

import { revealWithin } from '@/app/writers-studio/canvas/revealWithin';
import ProposalWorkSurface from '@/app/writers-studio/canvas/ProposalWorkSurface';

const reveal = revealWithin as jest.Mock;

/* Real §23 shape: the removed run sits deep inside a long body, which is the
   whole point — a reveal that lands on the section start is not a reveal. */
const HEAD = 'Elemental alchemy connects us with wisdom beyond the reactive';
const REMOVED = ', fixated';
const TAIL = '\nmind. Success lies in holding space for all elements of experience.';
const BODY = `${'x'.repeat(600)}\n${HEAD}${REMOVED}${TAIL}`;
const START = [...BODY.slice(0, BODY.indexOf(REMOVED))].length;
const RANGE = {
  space: 'projected_section_body' as const,
  start: START,
  end: START + [...REMOVED].length,
};

let container: HTMLDivElement;
let root: Root;

const render = async (props: Record<string, unknown>) => {
  await act(async () => {
    root.render(createElement(ProposalWorkSurface as never, {
      body: BODY, range: RANGE, replacementText: '', sectionLabel: 'Section 23',
      ...props,
    } as never));
  });
};

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  reveal.mockClear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
});

describe('WS-PROPOSAL-INTERACTION-01 · arrival and asked-for return', () => {
  it('1 · the initial automatic reveal reaches the EXACT locus', async () => {
    await render({ revealToken: 0 });
    expect(reveal).toHaveBeenCalledTimes(1);

    /* ⛔ OBLIGATION 5, AND IT IS THE ONE THAT CANNOT BE FAKED. The node the
       reveal was given must be the marked run, not the section that contains
       it. A surface that scrolled to its own top would satisfy every other
       assertion here and fail this one. */
    const node = reveal.mock.calls[0][0] as HTMLElement;
    expect(node.textContent).toBe(`[${REMOVED}]`);
    expect(node.textContent).not.toContain(HEAD);
    expect(container.textContent).toContain(HEAD);   // the body IS rendered
  });

  it('2 · automatic reveal does not repeat merely because of a re-render', async () => {
    await render({ revealToken: 0 });
    await render({ revealToken: 0 });
    await render({ revealToken: 0 });
    expect(reveal).toHaveBeenCalledTimes(1);
  });

  it('3 · after the automatic reveal is spent, SHOW CHANGE reaches the locus', async () => {
    await render({ revealToken: 0 });
    await render({ revealToken: 0 });
    expect(reveal).toHaveBeenCalledTimes(1);

    await render({ revealToken: 1 });
    expect(reveal).toHaveBeenCalledTimes(2);
    const node = reveal.mock.calls[1][0] as HTMLElement;
    expect(node.textContent).toBe(`[${REMOVED}]`);
  });

  it('4 · a second and third SHOW CHANGE also reach it', async () => {
    await render({ revealToken: 0 });
    await render({ revealToken: 1 });
    await render({ revealToken: 2 });
    await render({ revealToken: 3 });
    expect(reveal).toHaveBeenCalledTimes(4);
    for (const call of reveal.mock.calls) {
      expect((call[0] as HTMLElement).textContent).toBe(`[${REMOVED}]`);
    }
  });

  it('6 · an asked-for reveal does not re-arm the automatic one', async () => {
    await render({ revealToken: 0 });
    await render({ revealToken: 1 });
    expect(reveal).toHaveBeenCalledTimes(2);

    /* ⛔ Ordinary re-renders after a press must stay silent. Repairing this
       defect by resetting the arrival guard would reopen involuntary movement
       — the founder ruled that out by name, and this is what would catch it. */
    await render({ revealToken: 1 });
    await render({ revealToken: 1 });
    expect(reveal).toHaveBeenCalledTimes(2);
  });

  it('⭐ and a genuinely new locus is an arrival, not a press', async () => {
    await render({ revealToken: 0 });
    expect(reveal).toHaveBeenCalledTimes(1);

    const other = BODY.indexOf('Success');
    const start = [...BODY.slice(0, other)].length;
    await render({
      revealToken: 0,
      range: { space: 'projected_section_body' as const, start, end: start + 7 },
    });
    expect(reveal).toHaveBeenCalledTimes(2);
    expect((reveal.mock.calls[1][0] as HTMLElement).textContent).toBe('[Success]');
  });

  it('⛔ every reveal goes through the room\'s seam, centred', async () => {
    await render({ revealToken: 0 });
    await render({ revealToken: 1 });
    for (const call of reveal.mock.calls) {
      expect(call[1]).toBe('center');
      expect(call[2]).toBe('smooth');
    }
  });
});
