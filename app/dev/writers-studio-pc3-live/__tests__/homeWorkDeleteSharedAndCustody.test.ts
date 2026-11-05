/**
 * Work-card Delete, two failures a founder saw in production on 2026-11-05 (component-level, jsdom, fictional data; not a browser run).
 *
 *  1. Two Works hold the same writing. The server refuses to erase it (409 declared_in_other_works) and the old card said
 *     "remove it from the other work first" with no control for that, so neither Work could ever be deleted. The card now
 *     offers the one act that is left, naming exactly what goes and what stays.
 *  2. The server removed the Work but could not confirm the original was destroyed (500 custody_incomplete). The card unmounts
 *     once the list is re-read, and the message that says what could not be confirmed was dropped. It now reaches the page.
 *
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'fs';
import { join } from 'path';

jest.mock('@/app/writers-studio/full-redesign/Shell', () => ({
  Shell: ({ work }: { work: React.ReactNode }) => React.createElement('main', { 'data-test-shell': '' }, work),
}));
jest.mock('@/app/writers-studio/useWorkVisual', () => ({ useWorkVisual: () => ({ src: null }) }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1WorkMaterialsSummary', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1ProducePanel', () => ({ __esModule: true, default: () => null }));

import P4R1HomeView from '@/app/dev/writers-studio-pc3-live/P4R1HomeView';
import {
  DELETE_WORK_COPY,
  DeletionSharedMaterial,
  DeletionUnconfirmed,
  REMOVE_SHARED_WORK_COPY,
  deleteWork,
  removeWork,
} from '@/lib/writersStudio/deleteWork';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const SHARED_REFUSAL =
  'This writing also belongs to another work, so deleting it here would remove it from there too. Nothing was deleted. Remove it from the other work first, then delete it here.';
const CUSTODY_MESSAGE =
  'This work was removed from your studio, but we could not confirm the original file was destroyed, so we are not going to tell you it is gone. This one is ours to finish — nothing of yours is being kept on purpose.';

const expression = { expressionType: 'manuscript', expressionId: 'fictional-shared-manuscript', declaredAt: '2026-10-01T00:00:00Z' };
const makeWork = (id: string, title: string) => ({
  id, title, purpose: null, form: 'Book', stage: 'writing', manuscriptState: 'partial-manuscript',
  createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z', expressions: [expression], materials: [],
});
const workA = makeWork('fictional-work-a', 'Fictional Work A');
const workB = makeWork('fictional-work-b', 'Fictional Work B');
const sharedManuscript = {
  id: 'fictional-shared-manuscript', title: 'The Shared Fictional Writing',
  createdAt: '2026-10-01T00:00:00Z', sectionCount: 1, charCount: 30, keepCount: 0, draftCharCount: 30,
  hasDraftWriting: true, hasWriting: true, hasCurrentMemberContribution: true,
  lastMemberDraftActivityAt: '2026-10-02T00:00:00Z',
};
const orient = { kind: 'orient', resume: null, alsoWritten: [], shelf: [], feature: null, imported: [] };

const onDeleteWork = jest.fn();
const onRemoveWork = jest.fn();
const baseProps = {
  appearance: 'night', arrival: orient, works: [workA, workB], manuscripts: [sharedManuscript],
  resumeActivity: null, returnWork: null, returnActivity: null,
  markedLines: [], historyActs: [], busy: false, error: null, pendingMode: null,
  onMode: jest.fn(), onChooseManuscript: jest.fn(), onBegin: jest.fn(), onOpen: jest.fn(),
  onMakeWork: jest.fn(), onAddToWork: jest.fn(), onStartWriting: jest.fn(), onImport: jest.fn(), onSources: jest.fn(),
  onDeleteWriting: jest.fn(), onDeleteWork, onRemoveWork,
};

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  jest.clearAllMocks();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(React.createElement(P4R1HomeView, baseProps as any)));
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

const buttons = () => Array.from(host.querySelectorAll('button'));
const byText = (label: string) => buttons().find((b) => b.textContent?.trim() === label) as HTMLButtonElement | undefined;
const click = async (label: string) => {
  const target = byText(label);
  expect({ label, found: Boolean(target) }).toEqual({ label, found: true });
  await act(async () => { target!.click(); });
};
/** Open the first Work card's Delete confirmation and press the confirm button. */
const pressDeleteAndConfirm = async () => {
  await click('Delete');
  expect(host.querySelector('[data-deleting-confirmation]')).not.toBeNull();
  await click(DELETE_WORK_COPY.confirm);
};

describe('the writing is shared with another Work (409 declared_in_other_works)', () => {
  beforeEach(() => { onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL)); });

  it('replaces the dead end with a confirmation for the one act that is left, naming what goes and what stays', async () => {
    await pressDeleteAndConfirm();
    const card = host.querySelector('[data-shared-writing]');
    expect(card).not.toBeNull();
    const text = card!.textContent ?? '';
    expect(text).toContain('Remove “Fictional Work A” and keep the writing?');
    expect(text).toContain('conversations with MAIA');
    expect(text).toContain('its image');
    expect(text).toContain('The writing stays in your other Work');
    // It is a different act from Delete, so Delete's own words must not stay on screen.
    expect(text).not.toContain(DELETE_WORK_COPY.confirm);
    // The old instruction pointed at a control that does not exist.
    expect(host.textContent).not.toContain('Remove it from the other work first');
    expect(card!.querySelector('[role="alert"]')).toBeNull();
  });

  it('never claims nothing is deleted: the Work and what was built around it do go', () => {
    expect(REMOVE_SHARED_WORK_COPY.body).not.toMatch(/nothing is deleted|nothing was deleted/i);
    expect(REMOVE_SHARED_WORK_COPY.body).toContain('removes the Work and what was built around it');
  });

  it('confirming removes THIS Work only: onRemoveWork gets the Work id, and Delete is not asked again', async () => {
    onRemoveWork.mockResolvedValue(undefined);
    await pressDeleteAndConfirm();
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    expect(onRemoveWork).toHaveBeenCalledTimes(1);
    expect(onRemoveWork).toHaveBeenCalledWith('fictional-work-a');
    expect(onDeleteWork).toHaveBeenCalledTimes(1);
  });

  it('Keep it goes back to the card and calls nothing', async () => {
    await pressDeleteAndConfirm();
    await click(REMOVE_SHARED_WORK_COPY.cancel);
    expect(host.querySelector('[data-shared-writing]')).toBeNull();
    expect(host.querySelector('[data-deleting-confirmation]')).toBeNull();
    expect(onRemoveWork).not.toHaveBeenCalled();
    expect(byText('Delete')).toBeTruthy();
  });

  it('a failed removal stays in the dialog and says so, without closing or claiming success', async () => {
    onRemoveWork.mockRejectedValue(new Error('That work could not be removed just now. Nothing changed. Please try again.'));
    await pressDeleteAndConfirm();
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    const card = host.querySelector('[data-shared-writing]');
    expect(card).not.toBeNull();
    expect(card!.querySelector('[role="alert"]')?.textContent).toContain('Nothing changed');
  });

  it('after Keep it, a later Delete starts again from the Delete question, not the removal question', async () => {
    await pressDeleteAndConfirm();
    await click(REMOVE_SHARED_WORK_COPY.cancel);
    onDeleteWork.mockRejectedValue(new Error('That work could not be deleted just now. Nothing was removed. Please try again.'));
    await pressDeleteAndConfirm();
    expect(host.querySelector('[data-shared-writing]')).toBeNull();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Nothing was removed');
  });
});

describe('the server removed the Work but could not confirm the original was destroyed (500 custody_incomplete)', () => {
  it('shows what could not be confirmed on the page, even though the card has finished with its dialog', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE));
    await pressDeleteAndConfirm();
    expect(host.textContent).toContain('we are not going to tell you it is gone');
    expect(host.querySelector('[data-deleting-confirmation]')).toBeNull();
    expect(byText('Dismiss')).toBeTruthy();
  });

  it('the notice can be dismissed', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE));
    await pressDeleteAndConfirm();
    await click('Dismiss');
    expect(host.textContent).not.toContain('we are not going to tell you it is gone');
  });
});

describe('the custody notice reaches the page in every Home layout that shows Work cards, exactly once', () => {
  const looseManuscript = { ...sharedManuscript, id: 'fictional-loose-manuscript', title: 'A Loose Fictional Draft' };
  const noticeCount = () => host.querySelectorAll('p.p4r1-home-delete-notice').length;
  const layouts: Array<[string, Record<string, unknown>]> = [
    ['returning to one Work (returnWork)', { returnWork: workA }],
    ['continue (a Work to resume, the others on the shelf)', { arrival: { ...orient, kind: 'continue', resume: workA, alsoWritten: [], shelf: [workB] } }],
    ['writing outside any Work is also present (its own layout)', { manuscripts: [sharedManuscript, looseManuscript] }],
    // Here the notice already renders beside the loose writing, so a second copy would be a bug of its own.
    ['returning to one Work, with loose writing present', { returnWork: workA, manuscripts: [sharedManuscript, looseManuscript] }],
    ['continue, with loose writing present', { arrival: { ...orient, kind: 'continue', resume: workA, alsoWritten: [], shelf: [workB] }, manuscripts: [sharedManuscript, looseManuscript] }],
  ];
  for (const [name, extra] of layouts) {
    it(`${name}`, async () => {
      onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE));
      act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, ...extra } as any)));
      // The Work card with a Delete door: the first Delete on the page that belongs to a Work shelf card.
      const open = Array.from(host.querySelectorAll('.p4r1-home-workcard button.p4r1-home-delete-open'))[0] as HTMLButtonElement;
      expect(open).toBeTruthy();
      await act(async () => { open.click(); });
      await click(DELETE_WORK_COPY.confirm);
      expect(host.textContent).toContain('we are not going to tell you it is gone');
      expect(noticeCount()).toBe(1);
    });
  }
});

describe('any other failure is neither of those', () => {
  it('stays on the card as an error with the dialog open, and offers no removal and no notice', async () => {
    onDeleteWork.mockRejectedValue(new Error('That work could not be deleted just now. Nothing was removed. Please try again.'));
    await pressDeleteAndConfirm();
    expect(host.querySelector('[data-shared-writing]')).toBeNull();
    expect(host.querySelector('[data-deleting-confirmation] [role="alert"]')?.textContent).toContain('Nothing was removed');
    expect(host.textContent).not.toContain('we are not going to tell you it is gone');
    expect(onRemoveWork).not.toHaveBeenCalled();
  });
});

const fake = (status: number, body: unknown = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => body }) as unknown as Response;

describe('how deleteWork classifies what the server said', () => {
  it('carries the refusal classification on a refusal, so the caller can tell shared writing from any other failure', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => fake(409, { refusal: 'declared_in_other_works', works: 2 }));
    expect(out).toMatchObject({ ok: false, refusal: 'declared_in_other_works' });
    expect((out as any).removed).toBeUndefined();
  });
  it('a removal that is not yet confirmed is removed AND carries its own classification', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => fake(500, { removed: true, refusal: 'custody_incomplete' }));
    expect(out).toMatchObject({ ok: false, removed: true, refusal: 'custody_incomplete' });
  });
  it('a plain failure carries no classification and is not marked removed', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => fake(500, { error: 'Failed to remove manuscript' }));
    expect((out as any).refusal).toBeUndefined();
    expect((out as any).removed).toBeUndefined();
  });
  it('a body that is not JSON carries no classification', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => ({ ok: false, status: 502, json: async () => { throw new Error('not json'); } }) as unknown as Response);
    expect(out).toMatchObject({ ok: false });
    expect((out as any).refusal).toBeUndefined();
  });
});

describe('the removal act itself', () => {
  it('sends ONE request to the Work route and never to the manuscript erase route', async () => {
    const calls: string[] = [];
    const out = await removeWork('fictional-work-a', async (url, init) => { calls.push(`${init.method} ${url}`); return fake(200, { withdrawn: 'fictional-work-a' }); });
    expect(out).toEqual({ ok: true });
    expect(calls).toEqual(['DELETE /api/sovereign/living-works/fictional-work-a']);
  });
});

describe('controller wiring (source-reading; comments stripped)', () => {
  const strip = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
  const controller = strip(readFileSync(join(__dirname, '..', 'P4R1HomeController.tsx'), 'utf8'));
  const onDeleteWork = controller.slice(controller.indexOf('const onDeleteWork'), controller.indexOf('const onRemoveWork'));
  const onRemoveWork = controller.slice(controller.indexOf('const onRemoveWork'), controller.indexOf('const onAddToWork'));

  it('maps ONLY the shared-writing refusal to the shared-writing error', () => {
    expect(onDeleteWork).toMatch(/outcome\.refusal\s*===\s*'declared_in_other_works'\)\s*throw new DeletionSharedMaterial\(/);
    expect(onDeleteWork.match(/DeletionSharedMaterial/g)).toHaveLength(1);
  });
  it('still reports a committed-but-unconfirmed removal before anything else', () => {
    expect(onDeleteWork.indexOf('outcome.removed')).toBeGreaterThan(-1);
    expect(onDeleteWork.indexOf('outcome.removed')).toBeLessThan(onDeleteWork.indexOf('declared_in_other_works'));
  });
  it('removal goes through removeWork with the Work id and never touches the manuscript erase route', () => {
    expect(onRemoveWork).toMatch(/removeWork\(workId,/);
    expect(onRemoveWork).not.toMatch(/manuscripts/);
    expect(onRemoveWork).not.toMatch(/deleteWork\(/);
  });
  it('hands onRemoveWork to the Home view', () => {
    expect(controller).toMatch(/onRemoveWork=\{onRemoveWork\}/);
  });
});
