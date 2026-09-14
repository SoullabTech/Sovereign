/** @jest-environment jsdom */
import { createElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/canvas/revealWithin', () => ({
  revealWithin: jest.fn(), scrollDelta: jest.fn(), nearestScroller: jest.fn(),
}));

import { revealWithin } from '@/app/writers-studio/canvas/revealWithin';
import {
  WholeManuscriptSurface,
  type WholeProposalReturnRequest,
} from '@/app/writers-studio/canvas/WholeManuscriptSurface';
import {
  ProposalEvidenceInWork,
  proposalLocusKey,
} from '@/app/writers-studio/canvas/ProposalWorkSurface';
import type { SectionWriting, WritingSection } from '@/lib/writersStudio/useSectionWriting';

const reveal = revealWithin as jest.Mock;
const TARGET_ID = 's22';
const A = ', fixated';
const B = 'Success';
const BODY = `${'x'.repeat(4200)}\nElemental alchemy connects us with wisdom beyond the reactive${A}\nmind. ${'tail '.repeat(350)} ${B} ${'end '.repeat(200)}`;
const cp = (needle: string) => [...BODY.slice(0, BODY.indexOf(needle))].length;
const rangeA = { space: 'projected_section_body' as const, start: cp(A), end: cp(A) + [...A].length };
const rangeB = { space: 'projected_section_body' as const, start: cp(B), end: cp(B) + [...B].length };
const keyA = proposalLocusKey(TARGET_ID, rangeA);
const keyB = proposalLocusKey(TARGET_ID, rangeB);

const sections: WritingSection[] = Array.from({ length: 30 }, (_, i) => ({
  id: `s${i}`, position: i, heading: `Section ${i + 1}`,
  body: i === 22 ? BODY : `ordinary body ${i}`,
  authority: i === 22 ? 'proposal_work' : 'manuscript_write',
}));
const byId = new Map(sections.map((s) => [s.id, s]));
const writing: SectionWriting = {
  sections, activeId: 's0', active: sections[0], activeBody: sections[0].body,
  statusOf: () => 'clean', edit: () => undefined, editSection: () => undefined,
  captureForUnmount: () => false, bodyOf: (id) => byId.get(id)?.body ?? '',
  goToSection: () => undefined, hasUnsavedWork: () => false,
  currentRevisionId: () => 1, flushPending: () => undefined,
};

type EvidenceMode = 'a' | 'b' | 'both' | 'none';
const evidence = (mode: EvidenceMode) => (
  sectionId: string,
  register: (key: string, node: HTMLSpanElement | null) => void,
) => {
  if (sectionId !== TARGET_ID || mode === 'none') return null;
  const one = (which: 'a' | 'b') => {
    const range = which === 'a' ? rangeA : rangeB;
    const key = which === 'a' ? keyA : keyB;
    return createElement(ProposalEvidenceInWork, {
      key: which, body: BODY, range, replacementText: '', locusKey: key, onLocusNode: register,
    });
  };
  return mode === 'both' ? createElement('div', null, one('a'), one('b')) : one(mode);
};

const req = (requestId: number, locusKey = keyA): WholeProposalReturnRequest => ({
  requestId, sectionId: TARGET_ID, locusKey,
});

let container: HTMLDivElement;
let root: Root;
const result = jest.fn();

const render = async ({
  proposalReturn = null, mode = 'a', jumpTo = null, initialOpenAt = null,
}: {
  proposalReturn?: WholeProposalReturnRequest | null;
  mode?: EvidenceMode;
  jumpTo?: string | null;
  initialOpenAt?: string | null;
}) => {
  await act(async () => {
    root.render(createElement(WholeManuscriptSurface, {
      writing, proposalReturn, onProposalReturnResult: result,
      jumpTo, onJumpHandled: jest.fn(), initialOpenAt,
      renderProposalEvidence: evidence(mode),
    }));
  });
};

const locus = (text: string) => Array.from(container.querySelectorAll('span')).find(
  (n) => n.textContent === `[${text}]` && n.children.length === 3,
) as HTMLElement | undefined;
const shell = () => container.querySelector(
  `[data-whole-manuscript-section="${TARGET_ID}"]`,
) as HTMLElement | null;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  reveal.mockClear(); result.mockClear();
  container = document.createElement('div'); document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

describe('C10 · Whole exact-return lifecycle', () => {
  it('F1 · unmounted target mounts, then exact locus fulfills once; shell never fulfills', async () => {
    await render({});
    expect(locus(A)).toBeUndefined();
    await render({ proposalReturn: req(1) });
    expect(locus(A)).toBeDefined();
    expect(reveal).toHaveBeenCalledTimes(1);
    expect(reveal.mock.calls[0][0]).toBe(locus(A));
    expect(reveal.mock.calls[0][0]).not.toBe(shell());
    expect(result).toHaveBeenCalledWith({ requestId: 1, status: 'fulfilled' });
  });

  it('F2 · already-mounted exact locus fulfills without a remount requirement', async () => {
    await render({ initialOpenAt: TARGET_ID });
    expect(locus(A)).toBeDefined();
    reveal.mockClear(); result.mockClear();
    await render({ initialOpenAt: TARGET_ID, proposalReturn: req(2) });
    expect(reveal).toHaveBeenCalledTimes(1);
    expect(reveal.mock.calls[0][0]).toBe(locus(A));
    expect(result).toHaveBeenCalledWith({ requestId: 2, status: 'fulfilled' });
  });

  it('F3/F8 · mounted target with no exact locus refuses, with zero shell fallback', async () => {
    await render({ proposalReturn: req(3), mode: 'none' });
    expect(shell()).not.toBeNull();
    expect(reveal).not.toHaveBeenCalled();
    expect(result).toHaveBeenCalledTimes(1);
    expect(result).toHaveBeenCalledWith({ requestId: 3, status: 'refused' });
  });

  it('F4 + two-loci · same section cannot satisfy the request with the wrong locus identity', async () => {
    await render({ proposalReturn: req(4, keyA), mode: 'b' });
    expect(locus(B)).toBeDefined();
    expect(locus(A)).toBeUndefined();
    expect(reveal).not.toHaveBeenCalled();
    expect(result).toHaveBeenCalledWith({ requestId: 4, status: 'refused' });

    reveal.mockClear(); result.mockClear();
    await render({ proposalReturn: req(5, keyB), mode: 'both' });
    expect(locus(A)).toBeDefined(); expect(locus(B)).toBeDefined();
    expect(reveal).toHaveBeenCalledTimes(1);
    expect(reveal.mock.calls[0][0]).toBe(locus(B));
    expect(reveal.mock.calls[0][0]).not.toBe(locus(A));
  });

  it('F5 · fulfilled request does not repeat on ordinary rerenders', async () => {
    await render({ proposalReturn: req(6) });
    expect(reveal).toHaveBeenCalledTimes(1);
    await render({ proposalReturn: req(6) });
    await render({ proposalReturn: req(6) });
    expect(reveal).toHaveBeenCalledTimes(1);
    expect(result).toHaveBeenCalledTimes(1);
  });

  it('F6 · fulfilled locus may evict/remount without a late exact-locus reveal', async () => {
    await render({ proposalReturn: req(7) });
    expect(reveal.mock.calls.at(-1)?.[0]).toBe(locus(A));
    await render({ proposalReturn: null, jumpTo: 's0' });
    expect(locus(A)).toBeUndefined();
    reveal.mockClear();
    await render({ proposalReturn: null, jumpTo: TARGET_ID });
    expect(locus(A)).toBeDefined();
    expect(reveal).toHaveBeenCalledTimes(1); // ordinary jump still reveals its shell
    expect(reveal.mock.calls[0][0]).toBe(shell());
    expect(reveal.mock.calls[0][0]).not.toBe(locus(A));
  });

  it('F7/F10 · a newer request committed before effects supersedes the older one without refusal', async () => {
    await act(async () => {
      root.render(createElement(WholeManuscriptSurface, {
        writing, proposalReturn: req(8, keyA), onProposalReturnResult: result,
        renderProposalEvidence: evidence('both'),
      }));
      root.render(createElement(WholeManuscriptSurface, {
        writing, proposalReturn: req(9, keyB), onProposalReturnResult: result,
        renderProposalEvidence: evidence('both'),
      }));
    });
    expect(reveal).toHaveBeenCalledTimes(1);
    expect(reveal.mock.calls[0][0]).toBe(locus(B));
    expect(result).toHaveBeenCalledTimes(1);
    expect(result).toHaveBeenCalledWith({ requestId: 9, status: 'fulfilled' });
    expect(result).not.toHaveBeenCalledWith({ requestId: 8, status: 'refused' });
  });
});
