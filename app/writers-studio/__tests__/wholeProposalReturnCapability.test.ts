/**
 * @jest-environment jsdom
 *
 * C10 capability falsifier.
 *
 * The fixture is hostile to incidental geometry: the proposal locus sits deep
 * inside a long section. The test does not ask whether the locus happens to be
 * visible. It asks which resolved DOM object the voluntary Whole return
 * actually addresses.
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
import { WholeManuscriptSurface, type WholeProposalReturnRequest } from '@/app/writers-studio/canvas/WholeManuscriptSurface';
import { ProposalEvidenceInWork, proposalLocusKey } from '@/app/writers-studio/canvas/ProposalWorkSurface';
import type { SectionWriting, WritingSection } from '@/lib/writersStudio/useSectionWriting';

const reveal = revealWithin as jest.Mock;
const TARGET_ID = 's22';
const REMOVED = ', fixated';
const LONG_HEAD = `${'x'.repeat(4200)}\nElemental alchemy connects us with wisdom beyond the reactive`;
const TARGET_BODY = `${LONG_HEAD}${REMOVED}\nmind. ${'tail '.repeat(500)}`;
const START = [...TARGET_BODY.slice(0, TARGET_BODY.indexOf(REMOVED))].length;
const RANGE = {
  space: 'projected_section_body' as const,
  start: START,
  end: START + [...REMOVED].length,
};
const LOCUS_KEY = proposalLocusKey(TARGET_ID, RANGE);

const sections: WritingSection[] = Array.from({ length: 30 }, (_, i) => ({
  id: `s${i}`,
  position: i,
  heading: `Section ${i + 1}`,
  body: i === 22 ? TARGET_BODY : `ordinary body ${i}`,
  authority: i === 22 ? 'proposal_work' : 'manuscript_write',
}));

const byId = new Map(sections.map((s) => [s.id, s]));
const writing: SectionWriting = {
  sections,
  activeId: sections[0].id,
  active: sections[0],
  activeBody: sections[0].body,
  statusOf: () => 'clean',
  edit: () => undefined,
  editSection: () => undefined,
  captureForUnmount: () => false,
  bodyOf: (id) => byId.get(id)?.body ?? '',
  goToSection: () => undefined,
  hasUnsavedWork: () => false,
  currentRevisionId: () => 1,
  flushPending: () => undefined,
};

let container: HTMLDivElement;
let root: Root;

const evidence = (
  sectionId: string,
  registerLocus: (key: string, node: HTMLSpanElement | null) => void,
) => {
  if (sectionId !== TARGET_ID) return null;
  return createElement(ProposalEvidenceInWork, {
    body: TARGET_BODY,
    range: RANGE,
    replacementText: '',
    locusKey: LOCUS_KEY,
    onLocusNode: registerLocus,
  });
};

const result = jest.fn();
const renderWhole = async (proposalReturn: WholeProposalReturnRequest | null) => {
  await act(async () => {
    root.render(createElement(WholeManuscriptSurface, {
      writing,
      proposalReturn,
      onProposalReturnResult: result,
      renderProposalEvidence: evidence,
    }));
  });
};

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  reveal.mockClear();
  result.mockClear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
});

describe('C10 · Whole voluntary return addresses the proposal locus', () => {
  it('keeps the return owed across mounting until the exact locus is addressed', async () => {
    /* Start far from the proposal. The target evidence does not exist yet. */
    await renderWhole(null);
    expect(container.querySelector(`[data-whole-manuscript-section="${TARGET_ID}"]`))
      .not.toBeNull(); // persistent shell exists
    expect(Array.from(container.querySelectorAll('span'))
      .some((n) => n.textContent === `[${REMOVED}]`)).toBe(false);

    /* Dedicated carrier: the voluntary act is no longer collapsed into jumpTo. */
    await renderWhole({ requestId: 1, sectionId: TARGET_ID, locusKey: LOCUS_KEY });

    const shell = container.querySelector(
      `[data-whole-manuscript-section="${TARGET_ID}"]`,
    ) as HTMLElement | null;
    const locus = Array.from(container.querySelectorAll('span')).find(
      (n) => n.textContent === `[${REMOVED}]` && n.children.length === 3,
    ) as HTMLElement | undefined;
    const actualTarget = reveal.mock.calls.at(-1)?.[0] as HTMLElement | undefined;

    /* RED is admissible only if BOTH real targets resolved. */
    expect(shell).not.toBeNull();
    expect(locus).toBeDefined();
    expect(shell?.contains(locus ?? null)).toBe(true);
    expect(actualTarget).toBeDefined();

    /* GREEN means the capability itself exists, independent of implementation names. */
    expect(actualTarget).toBe(locus);
    expect(actualTarget).not.toBe(shell);
    expect(result).toHaveBeenCalledTimes(1);
    expect(result).toHaveBeenCalledWith({ requestId: 1, status: 'fulfilled' });
  });
});
