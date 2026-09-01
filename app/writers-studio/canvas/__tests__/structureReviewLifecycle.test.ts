/**
 * @jest-environment jsdom
 *
 * WS2-05B-8B-02c-2R — the review surface, mounted through its own lifecycle.
 *
 * WHY THIS GATE EXISTS. 02c-2's closeout tests are source inspections: they
 * prove the marks exist, that they call `onMark`, that `takeUpMark` consumes
 * the frozen `questionMarks`, and that an open tag routes to a division. Every
 * one of them passed while the surface was, at runtime, unreachable — a
 * `useCallback` had been added BELOW the `if (!view)` loading return, so the
 * first render ran twenty hooks and the loaded render twenty-one. React threw
 * "Rendered more hooks than during the previous render", the error boundary
 * took the page, and `data-mark-question` rendered zero times.
 *
 * A source-regex assertion about hook placement would not be this gate. It
 * would encode today's fix rather than the property, and the next hook added
 * below a return in some other branch would slip past it. So this MOUNTS the
 * real component in its loading state and transitions THE SAME MOUNTED
 * INSTANCE to a loaded proposal — the exact transition the runtime witness
 * failed on — and fails if React complains, if the review does not draw, or
 * if the marker never becomes reachable.
 *
 * Read-only and model-free: the adversarial fixture is a shape, not a reading
 * of anyone's Work, and `fetchProposal` is the only thing stubbed.
 */

import { act } from 'react';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { adversarialReading, fixtureSections } from '@/lib/manuscript/structure/fixtures';
import { toReviewed } from '@/lib/manuscript/structure/review';
import type { ProposalView } from '@/lib/writersStudio/reviewClient';

/* The surface's only door to the server. Nothing else is stubbed: the
   component, its marks and `takeUpMark` are the real ones under test. */
jest.mock('@/lib/writersStudio/reviewClient', () => ({
  __esModule: true,
  fetchProposal: jest.fn(),
  applyGesture: jest.fn(),
  previewGesture: jest.fn(),
  reviewRefusalCopy: (r: string) => `refused: ${r}`,
}));

import { fetchProposal } from '@/lib/writersStudio/reviewClient';
import StructureReview from '../StructureReview';

const PROPOSAL = 'e6cabcc4-a506-4ea7-aa89-9b23b450ca74';
const MANUSCRIPT = 'a3ae67fd-a21e-4948-8766-4c397d2e4712';

function adversarialView(): ProposalView {
  const sections = fixtureSections(14);
  const interpretation = adversarialReading(sections);
  return {
    proposalId: PROPOSAL,
    interpretation,
    coverage: interpretation.coverage,
    reviewed: { units: toReviewed(interpretation.units) },
    reviewRevision: 0,
    adoptedAt: null,
    staleAsRead: false,
    sections,
  };
}

/* React reports a hook-order fault two ways: a console.error warning, and a
   thrown Error that the caller sees. Both are failures here, so both are
   captured rather than only the one that happens to surface first. */
let host: HTMLDivElement;
let root: Root;
let consoleErrors: string[];
let realError: typeof console.error;

beforeEach(() => {
  consoleErrors = [];
  realError = console.error;
  console.error = (...args: unknown[]) => { consoleErrors.push(args.map(String).join(' ')); };
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  console.error = realError;
});

const hookFaults = () => consoleErrors.filter((e) =>
  /Rendered more hooks|Rendered fewer hooks|change in the order of Hooks|Rules of Hooks/i.test(e));

describe('WS2-05B-8B-02c-2R · StructureReview survives loading → loaded', () => {
  it('mounts loading, then transitions the SAME instance to a loaded proposal '
    + 'without a hook-order fault, and the marker becomes reachable', async () => {
    /* The load is held open so the loading render is a real render, not a
       state the test skipped past. This is the first of the two renders whose
       hook counts disagreed. */
    let release: (v: { ok: true; view: ProposalView }) => void = () => {};
    const held = new Promise<{ ok: true; view: ProposalView }>((res) => { release = res; });
    (fetchProposal as jest.Mock).mockReturnValue(held);

    await act(async () => {
      root.render(createElement(StructureReview, {
        manuscriptId: MANUSCRIPT, proposalId: PROPOSAL,
      }));
    });

    expect(host.querySelector('[data-review-state="loading"]')).not.toBeNull();
    expect(hookFaults()).toEqual([]);

    /* THE SAME MOUNTED COMPONENT crosses over. Re-rendering a fresh instance
       already-loaded would never exercise the transition and would have passed
       against the defect. */
    await act(async () => { release({ ok: true, view: adversarialView() }); await held; });

    expect(hookFaults()).toEqual([]);
    expect(host.querySelector('[data-review-state="loading"]')).toBeNull();
    expect(host.textContent).toContain('the book itself');

    const marks = host.querySelectorAll('[data-mark-question]');
    expect(marks.length).toBeGreaterThan(0);

    /* The mark says what is open in the writer's language — the runtime
       witness found zero of these, because the surface never drew. */
    expect(marks[0].getAttribute('aria-label')).toMatch(/Talk with MAIA about her question/);
    expect(host.querySelectorAll('[data-mark-open]').length).toBeGreaterThan(0);
  });

  it('does not throw the hook-order Error the runtime witness observed', async () => {
    (fetchProposal as jest.Mock).mockResolvedValue({ ok: true, view: adversarialView() });
    let thrown: unknown = null;
    try {
      await act(async () => {
        root.render(createElement(StructureReview, {
          manuscriptId: MANUSCRIPT, proposalId: PROPOSAL,
        }));
      });
    } catch (e) { thrown = e; }
    expect(thrown).toBeNull();
    expect(hookFaults()).toEqual([]);
    expect(host.querySelectorAll('[data-mark-question]').length).toBeGreaterThan(0);
  });

  it('a refusal still degrades to the loading/notice render, hooks intact', async () => {
    (fetchProposal as jest.Mock).mockResolvedValue({ ok: false, refusal: 'not_found' });
    await act(async () => {
      root.render(createElement(StructureReview, {
        manuscriptId: MANUSCRIPT, proposalId: PROPOSAL,
      }));
    });
    expect(hookFaults()).toEqual([]);
    expect(host.querySelector('[data-review-state="loading"]')).not.toBeNull();
    expect(host.textContent).toContain('refused: not_found');
  });
});
