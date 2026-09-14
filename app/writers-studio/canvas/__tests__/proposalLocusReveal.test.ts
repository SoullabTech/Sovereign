/**
 * @jest-environment jsdom
 *
 * EW-F2-R1 · `Show change` reaches THE CHANGE, every time it is asked.
 *
 * ⭐⭐ THIS SUITE EXISTS BECAUSE THE GREEN ONE PROVED THE WRONG THING. The
 * covering obligation asserted a `useCallback` existed, that `onShowChange?.()`
 * was called, and that the string `Show change` was present — all true, all
 * green, while the writer pressing the button was returned to the top of the
 * section and never to the change.
 *
 *     Wiring is not arrival.
 *
 * ⚠️ That is the same lesson `845b814df2` recorded one layer down, when PW-16
 * asserted `scrollIntoView` BY NAME and so pinned a banned call instead of the
 * property. A callback can be wired correctly while the user-visible act it
 * names still fails.
 *
 * ── ⛔ WHAT IS AND IS NOT CLAIMED ─────────────────────────────────────────
 *
 * ⛔ THIS DOES NOT ASSERT PIXELS. jsdom performs no layout and every rect it
 * returns is zero — `revealWithin`'s own source says so, which is why its
 * arithmetic is exported as a pure function instead. Asserting "visible" here
 * would assert nothing.
 *
 * ⭐ WHAT IT DOES ASSERT is the property the defect violated: the reveal is
 * aimed at THE LOCUS NODE — identified by the prose it contains, not by its
 * position in the tree — and it happens on EVERY explicit request, without
 * limit, while an automatic arrival still happens exactly once.
 *
 * ⛔ A RENDER IS NOT AN ASK. Re-rendering with the same request must reveal
 * nothing, or the guard against dragging the writer back is gone.
 */

jest.mock('../revealWithin', () => ({
  revealWithin: jest.fn(),
  nearestScroller: jest.fn(() => null),
  scrollDelta: jest.fn(() => 0),
}));

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { revealWithin } from '../revealWithin';
import ProposalWorkSurface, { ProposalEvidenceInWork } from '../ProposalWorkSurface';

const BODY = 'Alpha beta gamma delta epsilon.';
/* `beta ` — code points, the only space this surface accepts. */
const RANGE = { space: 'projected_section_body' as const, start: 6, end: 11 };
const LEAVING = 'beta ';

const revealed = revealWithin as jest.Mock;

/** Every node the reveal has been aimed at, in order. */
const targets = () => revealed.mock.calls.map((c) => c[0] as HTMLElement);

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  revealed.mockClear();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

function render(el: React.ReactElement) {
  act(() => { root.render(el); });
}

/**
 * ⭐ THE DISCRIMINATOR. The section shell contains the whole body; the locus
 * contains only the bracketed change. A repair that revealed the section again
 * would pass a "something was revealed" assertion and fail this one.
 */
function expectAimedAtLocus(node: HTMLElement) {
  expect(node).toBeTruthy();
  expect(node.textContent).toContain(LEAVING);
  expect(node.textContent).toContain('[');
  expect(node.textContent).not.toContain('epsilon');
}

describe.each([
  ['Section view · ProposalWorkSurface', (revealRequest: number) =>
    createElement(ProposalWorkSurface, {
      body: BODY, range: RANGE, replacementText: '',
      sectionLabel: 'Section 23', revealRequest,
    })],
  ['Whole view · ProposalEvidenceInWork', (revealRequest: number) =>
    createElement(ProposalEvidenceInWork, {
      body: BODY, range: RANGE, replacementText: '',
      sectionLabel: 'Section 23', revealRequest,
    })],
])('%s', (_name, at) => {
  it('automatic arrival reveals the locus exactly ONCE', () => {
    render(at(0));
    expect(revealed).toHaveBeenCalledTimes(1);
    expectAimedAtLocus(targets()[0]);
  });

  it('⛔ a re-render is not an ask — the writer is not dragged back', () => {
    render(at(0));
    render(at(0));
    render(at(0));
    expect(revealed).toHaveBeenCalledTimes(1);
  });

  it('⭐ EVERY explicit request reveals the locus again, without limit', () => {
    render(at(0));            /* arrive */
    expect(revealed).toHaveBeenCalledTimes(1);

    render(at(1));            /* the writer scrolled away and pressed Show change */
    expect(revealed).toHaveBeenCalledTimes(2);

    render(at(2));            /* and again */
    expect(revealed).toHaveBeenCalledTimes(3);

    render(at(3));            /* and again — no limit */
    expect(revealed).toHaveBeenCalledTimes(4);

    /* ⭐ EVERY one of them aimed at the change, not at the section. */
    for (const node of targets()) expectAimedAtLocus(node);
  });

  it('⛔ FALSIFIER · spending the reveal on the locus alone turns this RED', () => {
    /**
     * The defect, restated as an executable expectation: if the guard is keyed
     * on the locus only — as it was — then requests 1..3 all carry the SAME
     * locus and none of them would reveal. This asserts the count that shape
     * produces is NOT what we get.
     */
    render(at(0));
    render(at(1));
    render(at(2));
    expect(revealed).not.toHaveBeenCalledTimes(1);
    expect(revealed).toHaveBeenCalledTimes(3);
  });

  it('⛔ a range in another coordinate space draws nothing and reveals nothing', () => {
    /**
     * ⭐ The structural half of this lives in PW-6. This is the half that can
     * fail for the right reason: an unstated space must produce NO locus and NO
     * reveal — never a locus drawn at offsets that address a different text,
     * which is FOCUS-W3 exactly.
     */
    render(createElement(ProposalWorkSurface, {
      body: BODY,
      range: { ...RANGE, space: 'raw_section_body' as unknown as typeof RANGE.space },
      replacementText: '', sectionLabel: 'Section 23', revealRequest: 0,
    }));
    expect(host.textContent).toBe('');
    expect(revealed).not.toHaveBeenCalled();

    /* And an explicit ask cannot force it open either. */
    render(createElement(ProposalWorkSurface, {
      body: BODY,
      range: { ...RANGE, space: 'raw_section_body' as unknown as typeof RANGE.space },
      replacementText: '', sectionLabel: 'Section 23', revealRequest: 1,
    }));
    expect(revealed).not.toHaveBeenCalled();
  });

  it('a new locus still reveals on its own, with no request', () => {
    render(at(0));
    act(() => {
      root.render(createElement(ProposalWorkSurface, {
        body: BODY, range: { ...RANGE, start: 12, end: 17 },
        replacementText: '', sectionLabel: 'Section 23', revealRequest: 0,
      }));
    });
    expect(revealed).toHaveBeenCalledTimes(2);
  });
});
