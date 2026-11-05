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
  deletionRefusalCopy,
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
    // What goes, in the product's words, matching what cascades from the Work row (see the lane record's list).
    for (const goes of ['conversations with MAIA', 'what you told MAIA about it', 'your corrections', 'where you left off', 'list of materials', 'its image']) {
      expect(text).toContain(goes);
    }
    // What does NOT go: the writing and the conversations about the writing itself (they belong to the manuscript, not to the Work).
    expect(text).toContain('The writing, and your conversations about the writing itself, stay in your other Work');
    // Irreversible, with the same backup qualifier Delete carries.
    expect(text).toContain('It cannot be undone');
    expect(text).toContain('private backups already taken can still hold a copy');
    // It is a different act from Delete, so Delete's own words must not stay on screen.
    expect(text).not.toContain(DELETE_WORK_COPY.confirm);
    // The old instruction pointed at a control that does not exist.
    expect(host.textContent).not.toContain('Remove it from the other work first');
    expect(card!.querySelector('[role="alert"]')).toBeNull();
  });

  it('never claims nothing is deleted: the Work and what was built around it do go', () => {
    expect(REMOVE_SHARED_WORK_COPY.body).not.toMatch(/nothing is deleted|nothing was deleted/i);
    expect(REMOVE_SHARED_WORK_COPY.body).toContain('removes the Work and what you built inside it');
  });

  it('confirming removes THIS Work only: onRemoveWork gets the Work id, and Delete is not asked again', async () => {
    onRemoveWork.mockResolvedValue(undefined);
    await pressDeleteAndConfirm();
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    expect(onRemoveWork).toHaveBeenCalledTimes(1);
    expect(onRemoveWork).toHaveBeenCalledWith('fictional-work-a');
    expect(onDeleteWork).toHaveBeenCalledTimes(1);
  });

  it('after the removal the member is told what happened on the page, and the card, if the list could not be re-read, offers no Delete door', async () => {
    onRemoveWork.mockResolvedValue(undefined);
    await pressDeleteAndConfirm();
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    // Props are unchanged here: this is the failed-refresh case, where the removed Work's card is still on screen.
    const card = host.querySelector('[data-removed]');
    expect(card).not.toBeNull();
    expect(card!.textContent).toContain('“Fictional Work A” was removed. The writing is still in your other Work.');
    expect(card!.querySelector('button')).toBeNull();
    const notice = host.querySelector('[data-delete-notice]');
    expect(notice?.getAttribute('role')).toBe('status');
    expect(notice?.textContent).toContain('was removed');
    expect(host.querySelectorAll('[data-delete-notice]')).toHaveLength(1);
  });

  it('the dialog is announced as an alert dialog, and the safe button holds focus', async () => {
    await pressDeleteAndConfirm();
    const dialog = host.querySelector('[data-removing-shared-work]');
    expect(dialog?.getAttribute('role')).toBe('alertdialog');
    expect(dialog?.getAttribute('aria-label')).toContain('Remove “Fictional Work A”');
    expect(document.activeElement?.textContent).toBe(REMOVE_SHARED_WORK_COPY.cancel);
    // Under "Remove ... and keep the writing?" a button reading "Keep it" would read as an answer, not as cancel.
    expect(REMOVE_SHARED_WORK_COPY.cancel).not.toBe('Keep it');
  });

  it('the question is RE-DERIVED from the Works on screen: if the other Work is gone, the card falls back to Delete (it never keeps claiming the writing is shared)', async () => {
    await pressDeleteAndConfirm();
    expect(host.querySelector('[data-shared-writing]')).not.toBeNull();
    // Work B is removed elsewhere; Home re-reads and Work A now holds the writing alone.
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [workA] } as any)));
    expect(host.querySelector('[data-shared-writing]')).toBeNull();
    expect(host.textContent).not.toContain('also in another of your Works');
    expect(host.querySelector('[data-deleting-confirmation]')?.textContent).toContain(DELETE_WORK_COPY.confirm);
  });

  it('two cards each opened to the removal question: once the first Work is removed the second is no longer asked about a shared writing', async () => {
    const openRemoval = async (index: number) => {
      const doors = Array.from(host.querySelectorAll('button.p4r1-home-delete-open')) as HTMLButtonElement[];
      await act(async () => { doors[index]!.click(); });
      await click(DELETE_WORK_COPY.confirm);
    };
    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    await openRemoval(0);                // Work A -> removal question
    await openRemoval(0);                // Work B is now the first remaining Delete door -> removal question
    expect(host.querySelectorAll('[data-shared-writing]')).toHaveLength(2);
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [workB] } as any)));
    // Work A was removed; Work B's dialog may no longer say the writing is in another Work.
    expect(host.querySelectorAll('[data-shared-writing]')).toHaveLength(0);
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

  it('the notice is an ALERT (announced when it appears), unlike the plain confirmation of a removal', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE));
    await pressDeleteAndConfirm();
    expect(host.querySelector('[data-delete-notice]')?.getAttribute('role')).toBe('alert');
  });

  it('it survives the card: once the list is re-read without the removed Work, the notice is still on the page', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE));
    await pressDeleteAndConfirm();
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [workB] } as any)));
    expect(host.textContent).not.toContain('Fictional Work A');
    expect(host.textContent).toContain('we are not going to tell you it is gone');
  });

  it('it survives the LAST Work being deleted: the welcome screen the member lands on carries the notice', async () => {
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [workA], manuscripts: [sharedManuscript] } as any)));
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE));
    await pressDeleteAndConfirm();
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [], manuscripts: [], arrival: { ...orient, kind: 'begin' } } as any)));
    expect(host.querySelector('.fr-home-begin')).not.toBeNull();
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('we are not going to tell you it is gone');
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

describe('the stale-card guard and the vanished-writing follow-through (deleteWork)', () => {
  it('a Work card names the Work it was pressed on; loose writing names none', async () => {
    const urls: string[] = [];
    await deleteWork({ workId: 'work-1', manuscriptId: 'ms-1' }, async (url) => { urls.push(url); return fake(200); });
    await deleteWork({ workId: null, manuscriptId: 'ms-2' }, async (url) => { urls.push(url); return fake(200); });
    expect(urls).toEqual(['/api/sovereign/manuscripts/ms-1?workId=work-1', '/api/sovereign/manuscripts/ms-2']);
  });

  it('a 404 on the WRITING from a Work card follows through and withdraws that Work, so no empty Work is left behind', async () => {
    const calls: string[] = [];
    const out = await deleteWork({ workId: 'work-1', manuscriptId: 'ms-1' }, async (url, init) => {
      calls.push(`${init.method} ${url}`);
      return url.includes('/manuscripts/') ? fake(404) : fake(200, { withdrawn: 'work-1' });
    });
    expect(out).toEqual({ ok: true });
    expect(calls).toEqual(['DELETE /api/sovereign/manuscripts/ms-1?workId=work-1', 'DELETE /api/sovereign/living-works/work-1']);
  });

  it('if that withdrawal fails, the member is told so and the Work is not reported as gone', async () => {
    const out = await deleteWork({ workId: 'work-1', manuscriptId: 'ms-1' }, async (url) => (url.includes('/manuscripts/') ? fake(404) : fake(500)));
    expect(out).toMatchObject({ ok: false });
    expect((out as any).message).toContain('Nothing was removed');
  });

  it('a 404 on loose writing (no Work) is still just "already gone": one request, no follow-through', async () => {
    const calls: string[] = [];
    const out = await deleteWork({ workId: null, manuscriptId: 'ms-1' }, async (url) => { calls.push(url); return fake(404); });
    expect(out).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
  });

  it('the stale-card refusal is classified and spoken plainly, and says nothing was deleted', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => fake(409, { refusal: 'work_no_longer_holds_it' }));
    expect(out).toMatchObject({ ok: false, refusal: 'work_no_longer_holds_it' });
    expect((out as any).message).toContain('Nothing was deleted');
    expect((out as any).message).not.toContain('Remove it from the other work first');
  });

  it('the shared-writing refusal shown OUTSIDE the Work card (History, loose writing) points at a door that exists', () => {
    const text = deletionRefusalCopy('declared_in_other_works');
    expect(text).toContain('Nothing was deleted');
    expect(text).toContain('Remove this Work');
    expect(text).not.toContain('Remove it from the other work first');
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
  it('a stale-card refusal refreshes the page BEFORE the member is told, so the message is true when read', () => {
    const at = onDeleteWork.indexOf("outcome.refusal === 'work_no_longer_holds_it'");
    expect(at).toBeGreaterThan(-1);
    const branch = onDeleteWork.slice(at, at + 220);
    expect(branch.indexOf('refresh()')).toBeGreaterThan(-1);
    expect(branch.indexOf('refresh()')).toBeLessThan(branch.indexOf('throw new Error'));
  });
  it('hands onRemoveWork to the Home view', () => {
    expect(controller).toMatch(/onRemoveWork=\{onRemoveWork\}/);
  });
});
