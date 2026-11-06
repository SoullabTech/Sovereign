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
  REMOVE_MANY_WORK_COPY,
  REMOVE_SHARED_WORK_COPY,
  deleteConfirmCopy,
  deleteWork,
  deletionRefusalCopy,
  removeWork,
  removedWorkNotice,
  runDeleteWork,
  runRemoveWork,
} from '@/lib/writersStudio/deleteWork';
import { WorkRemoveConfirm } from '@/app/dev/writers-studio-pc3-live/WorkRemoveConfirm';
import { workDeleteKind, writingDeleteKindFor } from '@/app/dev/writers-studio-pc3-live/useWorkDeleteDoor';

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
  // clearAllMocks keeps implementations: a rejection set by one test would leak into the next.
  onDeleteWork.mockReset();
  onRemoveWork.mockReset();
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
    // LAW CHANGED DELIBERATELY (post-merge census, 2026-11-06): this loop used to include 'conversations with MAIA', and the goes-list
    // said "its conversations with MAIA". That was mostly false for a Work that holds a writing: conversations about a writing belong
    // to the manuscript and stay. The goes-list now names only the conversation that belongs to the Work row itself.
    const goesList = text.slice(text.indexOf('what you built inside it:'), text.indexOf('It cannot be undone'));
    expect(goesList.length).toBeGreaterThan('what you built inside it:'.length);
    for (const goes of ['what you told MAIA about it', 'your corrections', 'where you left off', 'list of materials', 'its image', 'any conversation you had with MAIA about it while it held no writing']) {
      expect(goesList).toContain(goes);
    }
    expect(goesList).not.toContain('its conversations with MAIA');
    expect(goesList).not.toContain('conversations with MAIA about');
    // What does NOT go: the writing and the conversations about the writing itself (they belong to the manuscript, not to the Work).
    expect(text).toContain('The writing itself is not deleted: it stays in your other Work');
    // LAW CHANGED DELIBERATELY (same follow-up): this used to assert that the dialog did NOT contain 'conversations about the writing',
    // with a comment that the copy made no promise about where conversations live. It now says where they live and what ends them:
    // after the stays-sentence, never inside the goes-list, and with no claim about whether anything can still open them.
    expect(text).toContain('Your conversations with MAIA about that writing are not part of the Work, so removing the Work does not remove them: they stay with the writing, and deleting the writing deletes them.');
    expect(text.indexOf('Your conversations with MAIA about that writing')).toBeGreaterThan(text.indexOf('The writing itself is not deleted'));
    // The dialog's body paragraph ENDS with it (the card's own text goes on with the buttons).
    expect(card!.querySelector('p')!.textContent!.endsWith('deleting the writing deletes them.')).toBe(true);
    expect(text).not.toMatch(/cannot be opened|unreachable|no longer (be )?(opened|reached)|nothing (is|will be) (left|kept)/i);
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

  it('after the removal the member is told what happened on the page, and the card, if the list could not be re-read, offers no door', async () => {
    onRemoveWork.mockResolvedValue(undefined);
    await pressDeleteAndConfirm();
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    // Props are unchanged here: this is the failed-refresh case, where the removed Work's card is still on screen.
    const card = host.querySelector('[data-removed]');
    expect(card).not.toBeNull();
    expect(card!.textContent).toBe('“Fictional Work A” was removed.');
    expect(card!.querySelector('button')).toBeNull();
    // What is still true of the writing is said once, on the page, where it survives the card.
    const notice = host.querySelector('[data-delete-notice]');
    expect(notice?.getAttribute('role')).toBe('status');
    expect(notice?.textContent).toContain(removedWorkNotice('Fictional Work A', 'shared'));
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
    // The page no longer sees another Work, so it does not claim one is there: it says only what the server said, time-neutrally.
    expect(host.textContent).not.toContain('Remove “Fictional Work A” and keep the writing?');
    expect(host.querySelector('[data-deleting-confirmation]')?.textContent).toContain(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-deleting-confirmation] [role="alert"]')?.textContent).toContain('If you have just removed that Work, press Delete again');
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
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE, true));
    await pressDeleteAndConfirm();
    expect(host.textContent).toContain('we are not going to tell you it is gone');
    expect(host.querySelector('[data-deleting-confirmation]')).toBeNull();
    expect(byText('Dismiss')).toBeTruthy();
  });

  it('the notice is an ALERT (announced when it appears), unlike the plain confirmation of a removal', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE, true));
    await pressDeleteAndConfirm();
    expect(host.querySelector('[data-delete-notice]')?.getAttribute('role')).toBe('alert');
  });

  it('it survives the card: once the list is re-read without the removed Work, the notice is still on the page', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE, true));
    await pressDeleteAndConfirm();
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [workB] } as any)));
    // The removed Work has no card any more; only the page notice (which names it) remains.
    const cards = Array.from(host.querySelectorAll('.p4r1-home-workcard h3')).map((h) => h.textContent);
    expect(cards).toEqual(['Fictional Work B']);
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('“Fictional Work A”');
    expect(host.textContent).toContain('we are not going to tell you it is gone');
  });

  it('the Work card itself says only that it was removed from the studio, until the list is re-read', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE, true));
    await pressDeleteAndConfirm();
    expect(host.querySelector('[data-removed]')?.textContent).toBe('“Fictional Work A” was removed from your studio.');
    expect(host.querySelector('[data-removed] button')).toBeNull();
  });

  it('it survives the LAST Work being deleted: the welcome screen the member lands on carries the notice', async () => {
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [workA], manuscripts: [sharedManuscript] } as any)));
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE, true));
    await pressDeleteAndConfirm();
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [], manuscripts: [], arrival: { ...orient, kind: 'begin' } } as any)));
    expect(host.querySelector('.fr-home-begin')).not.toBeNull();
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('we are not going to tell you it is gone');
  });

  it('the notice can be dismissed', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE, true));
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
      onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE, true));
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

describe('the stale-card guard and the vanished writing (deleteWork)', () => {
  it('a Work card names the Work it was pressed on; loose writing names none', async () => {
    const urls: string[] = [];
    await deleteWork({ workId: 'work-1', manuscriptId: 'ms-1' }, async (url) => { urls.push(url); return fake(200); });
    await deleteWork({ workId: null, manuscriptId: 'ms-2' }, async (url) => { urls.push(url); return fake(200); });
    expect(urls).toEqual(['/api/sovereign/manuscripts/ms-1?workId=work-1', '/api/sovereign/manuscripts/ms-2']);
  });

  it('a 404 on the WRITING from a Work card is done: ONE request (the server finishes a dangling declaration in its own transaction)', async () => {
    const calls: string[] = [];
    const out = await deleteWork({ workId: 'work-1', manuscriptId: 'ms-1' }, async (url, init) => { calls.push(`${init.method} ${url}`); return fake(404); });
    expect(out).toEqual({ ok: true, alreadyGone: true });
    expect(calls).toEqual(['DELETE /api/sovereign/manuscripts/ms-1?workId=work-1']);
  });

  it('a 404 on loose writing (no Work) is still just "already gone": one request, no follow-through', async () => {
    const calls: string[] = [];
    const out = await deleteWork({ workId: null, manuscriptId: 'ms-1' }, async (url) => { calls.push(url); return fake(404); });
    expect(out).toEqual({ ok: true, alreadyGone: true });
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
    expect(out).toEqual({ ok: true, workRemoved: true });
    expect(calls).toEqual(['DELETE /api/sovereign/living-works/fictional-work-a']);
  });
});


describe('the removal act, when the server does not simply say yes', () => {
  it('a server error that does not say what it did is UNKNOWN: it never claims "nothing changed"', async () => {
    const out = await removeWork('w', async () => fake(500));
    expect(out).toMatchObject({ ok: false, unknown: true });
    expect((out as any).message).toContain('could not confirm');
    expect((out as any).message).not.toContain('Nothing changed');
  });
  it('no answer at all is UNKNOWN too', async () => {
    const out = await removeWork('w', async () => { throw new Error('network'); });
    expect(out).toMatchObject({ ok: false, unknown: true });
  });
  it('a rejection before any act (4xx) says nothing changed and the writing is untouched', async () => {
    const out = await removeWork('w', async () => fake(400));
    expect(out).toMatchObject({ ok: false });
    expect((out as any).unknown).toBeUndefined();
    expect((out as any).message).toContain('Nothing changed');
  });
  it('an ended session says so and what to do, not "try again"', async () => {
    const out = await removeWork('w', async () => fake(401));
    expect((out as any).message).toContain('Sign in again');
  });
  it('a Work already gone (404) is done', async () => {
    expect(await removeWork('w', async () => fake(404))).toEqual({ ok: true, workRemoved: true });
  });
});

describe('what deleteWork tells the member when it cannot learn what happened', () => {
  it('a 5xx with no classification is UNKNOWN, not "nothing was removed"', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => fake(500, { error: 'Failed to remove manuscript' }));
    expect(out).toMatchObject({ ok: false, unknown: true });
    expect((out as any).message).not.toContain('Nothing was removed');
  });
  it('a transport failure is UNKNOWN: the request may have reached the server', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => { throw new Error('network'); });
    expect(out).toMatchObject({ ok: false, unknown: true });
  });
  it('a 4xx rejection is a plain rejection: nothing was removed', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => fake(400, { error: 'Bad request' }));
    expect((out as any).unknown).toBeUndefined();
    expect((out as any).message).toContain('Nothing was removed');
  });
  it('an ended session (401) names the session, not a retry', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => fake(401, { error: 'Unauthorized' }));
    expect((out as any).message).toContain('Sign in again');
    expect((out as any).message).not.toContain('Unauthorized');
  });
  it('a raw server error string is never shown to the member', async () => {
    const out = await deleteWork({ workId: 'w', manuscriptId: 'm' }, async () => fake(422, { error: 'SQLSTATE 23503 constraint violation' }));
    expect((out as any).message).not.toMatch(/SQLSTATE|constraint/);
  });
  it('the custody sentence names both things that may be unconfirmed (the file and our own deletion record) and promises nothing more', () => {
    const text = deletionRefusalCopy('custody_incomplete');
    expect(text).toContain('its original file');
    expect(text).toContain('has been destroyed');
    // The independent deletion record is SEALED and kept on purpose; it is not something "to be destroyed".
    expect(text).toContain('our independent record of the deletion has been sealed');
    expect(text).not.toMatch(/record of the deletion[^.]*destroyed/);
    expect(text).toContain('we are not going to tell you it is gone');
    expect(text).not.toMatch(/nothing of yours is being kept|will be destroyed|within \d+/i);
  });
});

describe('the page-level act (runDeleteWork / runRemoveWork): what the page does with what the server said', () => {
  const trace: string[] = [];
  const refresh = jest.fn(async () => { trace.push('refresh'); });
  const failingRefresh = jest.fn(async () => { trace.push('refresh'); throw new Error('list could not be re-read'); });
  const settle = async (p: Promise<void>) => { try { await p; trace.push('resolved'); return null; } catch (e) { trace.push('rejected'); return e as Error; } };
  beforeEach(() => { trace.length = 0; refresh.mockClear(); failingRefresh.mockClear(); });
  const target = { workId: 'w', manuscriptId: 'm' };

  it('success: the list is re-read, then the act resolves', async () => {
    expect(await settle(runDeleteWork(target, async () => fake(200), refresh))).toBeNull();
    expect(trace).toEqual(['refresh', 'resolved']);
  });
  it('success is still success when the re-read itself fails (the server said it is gone)', async () => {
    expect(await settle(runDeleteWork(target, async () => fake(200), failingRefresh))).toBeNull();
    expect(trace).toEqual(['refresh', 'resolved']);
  });
  it('removed but unconfirmed: the list is re-read BEFORE the member is told, and the error is the custody one', async () => {
    const err = await settle(runDeleteWork(target, async () => fake(500, { removed: true, refusal: 'custody_incomplete' }), refresh));
    expect(trace).toEqual(['refresh', 'rejected']);
    expect(err).toBeInstanceOf(DeletionUnconfirmed);
    expect(err!.message).toContain('we are not going to tell you it is gone');
  });
  it('removed but unconfirmed, and the re-read fails too: the member is still told', async () => {
    const err = await settle(runDeleteWork(target, async () => fake(500, { removed: true, refusal: 'custody_incomplete' }), failingRefresh));
    expect(err).toBeInstanceOf(DeletionUnconfirmed);
  });
  it('shared writing: ONLY this refusal becomes the shared-writing error, and the page is re-read first (the server knows an other Work this page may not)', async () => {
    const err = await settle(runDeleteWork(target, async () => fake(409, { refusal: 'declared_in_other_works', works: 2 }), refresh));
    expect(err).toBeInstanceOf(DeletionSharedMaterial);
    expect(trace).toEqual(['refresh', 'rejected']);
  });
  it('a stale card: the page is made true FIRST, then the member is told; it is neither the shared nor the custody error', async () => {
    const err = await settle(runDeleteWork(target, async () => fake(409, { refusal: 'work_no_longer_holds_it' }), refresh));
    expect(trace).toEqual(['refresh', 'rejected']);
    expect(err).not.toBeInstanceOf(DeletionSharedMaterial);
    expect(err).not.toBeInstanceOf(DeletionUnconfirmed);
    expect(err!.message).toContain('Nothing was deleted');
  });
  it('an outcome we could not learn (5xx / no answer): the page is re-read first, and the message does not claim "nothing was removed"', async () => {
    for (const fetcher of [async () => fake(500), async () => { throw new Error('network'); }]) {
      trace.length = 0;
      const err = await settle(runDeleteWork(target, fetcher, refresh));
      expect(trace).toEqual(['refresh', 'rejected']);
      expect(err!.message).not.toContain('Nothing was removed');
    }
  });
  it('a rejection before any act (4xx, 401): nothing is re-read, and the message is the plain one', async () => {
    const err400 = await settle(runDeleteWork(target, async () => fake(400), refresh));
    const err401 = await settle(runDeleteWork(target, async () => fake(401), refresh));
    expect(refresh).not.toHaveBeenCalled();
    expect(err400!.message).toContain('Nothing was removed');
    expect(err401!.message).toContain('Sign in again');
  });
  it('removal: success re-reads then resolves; it asks the Work route only', async () => {
    const calls: string[] = [];
    expect(await settle(runRemoveWork('w', async (url, init) => { calls.push(`${init.method} ${url}`); return fake(200); }, refresh))).toBeNull();
    expect(trace).toEqual(['refresh', 'resolved']);
    expect(calls).toEqual(['DELETE /api/sovereign/living-works/w']);
  });
  it('removal: an unknown outcome re-reads first and then says so; a plain rejection re-reads nothing', async () => {
    const unknown = await settle(runRemoveWork('w', async () => fake(500), refresh));
    expect(trace).toEqual(['refresh', 'rejected']);
    expect(unknown!.message).toContain('could not confirm');
    trace.length = 0; refresh.mockClear();
    const plain = await settle(runRemoveWork('w', async () => fake(400), refresh));
    expect(refresh).not.toHaveBeenCalled();
    expect(plain!.message).toContain('Nothing changed');
  });
});

describe('what deleting THIS writing reaches, asked from the writing (writingDeleteKindFor)', () => {
  const ex = (id: string, type = 'manuscript') => ({ expressionType: type, expressionId: id, declaredAt: '2026-10-01T00:00:00Z' });
  const work = (id: string, expressions: any[]) => ({ ...makeWork(id, id), expressions }) as any;
  it('no Work holds it: loose', () => {
    expect(writingDeleteKindFor('a', [])).toBe('loose');
    expect(writingDeleteKindFor('a', [work('w', [ex('b')])])).toBe('loose');
  });
  it('one Work holds only this writing: the Work goes with it', () => {
    expect(writingDeleteKindFor('a', [work('w', [ex('a')])])).toBe('writing');
  });
  it('the Work holds another part too, or another writing: the Work stays', () => {
    expect(writingDeleteKindFor('a', [work('w', [ex('a'), ex('x', 'visual')])])).toBe('writing-from-work');
    expect(writingDeleteKindFor('a', [work('w', [ex('a'), ex('b')])])).toBe('writing-from-work');
  });
  it('several Works hold it: the strongest claim is not made (it is "from a Work that stays" for every holder that holds more)', () => {
    expect(writingDeleteKindFor('a', [work('w1', [ex('a')]), work('w2', [ex('a'), ex('b')])])).toBe('writing-from-work');
    expect(writingDeleteKindFor('a', [work('w1', [ex('a')]), work('w2', [ex('a')])])).toBe('writing');
  });
});

describe('what a Work\'s door is, from what it holds (workDeleteKind)', () => {
  const ms = (id: string) => ({ ...sharedManuscript, id });
  const ex = (id: string, type = 'manuscript') => ({ expressionType: type, expressionId: id, declaredAt: '2026-10-01T00:00:00Z' });
  const work = (expressions: any[]) => ({ ...makeWork('w', 'W'), expressions }) as any;
  it('one writing and nothing else', () => {
    expect(workDeleteKind(work([ex('a')]), [ms('a')] as any)).toEqual({ kind: 'writing', manuscriptId: 'a' });
  });
  it('one writing plus another part: the writing goes and the Work stays', () => {
    expect(workDeleteKind(work([ex('a'), ex('x', 'visual')]), [ms('a')] as any)).toEqual({ kind: 'writing-keeps-work', manuscriptId: 'a' });
  });
  it('no writing at all: only the Work goes', () => {
    expect(workDeleteKind(work([]), [] as any)).toEqual({ kind: 'empty', manuscriptId: null });
    expect(workDeleteKind(work([ex('x', 'visual')]), [] as any)).toEqual({ kind: 'empty', manuscriptId: null });
  });
  it('several writings: no Delete exists (which writing would go is the member\'s choice), so the door is Remove', () => {
    expect(workDeleteKind(work([ex('a'), ex('b')]), [ms('a'), ms('b')] as any)).toEqual({ kind: 'many', manuscriptId: null });
  });
  it('several writings declared even when only one is on screen: still Remove, never a guess at which one', () => {
    expect(workDeleteKind(work([ex('a'), ex('b')]), [ms('a')] as any)).toEqual({ kind: 'many', manuscriptId: null });
  });
  it('a writing the list does not show (declared, but not read back) still names itself, so Delete reaches the server, which finishes a declaration that outlived its writing', () => {
    expect(workDeleteKind(work([ex('gone')]), [] as any)).toEqual({ kind: 'writing', manuscriptId: 'gone' });
  });
});

describe('each Delete confirmation says what is true of THIS Work and no more', () => {
  const ex = (id: string, type = 'manuscript') => ({ expressionType: type, expressionId: id, declaredAt: '2026-10-01T00:00:00Z' });
  const renderWith = (works: any[], manuscripts: any[], extra: Record<string, unknown> = {}) =>
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works, manuscripts, ...extra } as any)));
  const openDelete = async () => { await act(async () => { (host.querySelector('button.p4r1-home-delete-open') as HTMLButtonElement).click(); }); };

  it('writing + Work: says both go, and what is built inside the Work goes too; irreversible; backups qualified', async () => {
    await openDelete();
    const dialog = host.querySelector('[data-deleting-confirmation]')!;
    expect(dialog.textContent).toContain('Delete “Fictional Work A”?');
    expect(dialog.textContent).toContain('deletes the Work and its writing');
    expect(dialog.textContent).toContain('conversations with MAIA');
    expect(dialog.textContent).toContain('It cannot be undone and there is no archive');
    expect(dialog.textContent).toContain('private backups already taken'.replace('private', 'Private'));
  });
  it('writing in a Work that holds more: says the Work stays, and that conversations about the writing go', async () => {
    const mixed = { ...workA, expressions: [expression, ex('fictional-note', 'visual')] };
    renderWith([mixed, workB], [sharedManuscript]);
    await openDelete();
    const text = host.querySelector('[data-deleting-confirmation]')!.textContent!;
    expect(text).toContain('Delete the writing in “Fictional Work A”?');
    expect(text).toContain('The Work itself stays');
    expect(text).toContain('conversations with MAIA about the writing');
    onDeleteWork.mockResolvedValue({ refreshed: true, workRemoved: false });          // the server says the Work stays
    await click(DELETE_WORK_COPY.confirm);
    expect(onDeleteWork).toHaveBeenCalledWith('fictional-work-a', 'fictional-shared-manuscript');
    // And the Work\'s own card is NOT replaced by a ghost: it stays, and the page says what happened.
    expect(host.querySelector('[data-removed]')).toBeNull();
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('The writing in “Fictional Work A” was deleted. The Work stays, with what else it holds.');
  });
  it('a Work with no writing: says only the Work goes, and sends no manuscript id', async () => {
    const empty = { ...workA, expressions: [] };
    renderWith([empty, workB], [sharedManuscript]);
    await openDelete();
    expect(host.querySelector('[data-deleting-confirmation]')!.textContent).toContain('This Work has no writing in it');
    onDeleteWork.mockResolvedValue({ refreshed: true, workRemoved: true });
    await click(DELETE_WORK_COPY.confirm);
    expect(onDeleteWork).toHaveBeenCalledWith('fictional-work-a', null);
    expect(host.querySelector('[data-removed]')?.textContent).toBe('“Fictional Work A” was deleted.');
  });
  it('the same act asked from the WRITING (History, loose list) says the Work it is in stays, and does not claim the Work-level things go', () => {
    const { body } = deleteConfirmCopy('writing-from-work', 'T');
    expect(body).toContain('The Work it is in stays, with what else it holds');
    expect(body).toContain('cannot be undone');
    expect(body).toMatch(/private backups already taken/i);
    expect(body).not.toContain('what you told MAIA about it');
    expect(body).not.toContain('your corrections');
  });
  it('the three bodies never claim "nothing is kept" and each carries the same irreversibility sentence', () => {
    for (const kind of ['writing', 'writing-keeps-work', 'empty'] as const) {
      const { body } = deleteConfirmCopy(kind, 'T');
      expect(body).not.toMatch(/nothing is kept/i);
      expect(body).toContain('cannot be undone');
      expect(body).toMatch(/private backups already taken/i);
    }
  });
});

describe('a Work that holds several writings has no Delete, only Remove', () => {
  const m1 = { ...sharedManuscript, id: 'fictional-many-1', title: 'Many One' };
  const m2 = { ...sharedManuscript, id: 'fictional-many-2', title: 'Many Two' };
  const ex = (id: string) => ({ expressionType: 'manuscript', expressionId: id, declaredAt: '2026-10-01T00:00:00Z' });
  const workMany = { ...makeWork('fictional-work-many', 'Fictional Work Many'), expressions: [ex('fictional-many-1'), ex('fictional-many-2')] };
  beforeEach(() => {
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [workMany], manuscripts: [m1, m2] } as any)));
  });

  it('the door says Remove, not Delete (Delete would have to choose which writing goes)', () => {
    const door = host.querySelector('button.p4r1-home-delete-open');
    expect(door?.textContent).toBe('Remove');
    expect(byText('Delete')).toBeUndefined();
  });
  it('its confirmation says none of the writings is deleted, what does go, and that it cannot be undone', async () => {
    await act(async () => { (host.querySelector('button.p4r1-home-delete-open') as HTMLButtonElement).click(); });
    const dialog = host.querySelector('[data-many-writings]');
    expect(dialog).not.toBeNull();
    const text = dialog!.textContent!;
    expect(text).toContain('Remove “Fictional Work Many”?');
    expect(text).toContain('None of the writings is deleted');
    // LAW CHANGED DELIBERATELY (post-merge census, 2026-11-06): the goes-list no longer says "its conversations with MAIA"; the
    // plural retention-and-exit sentence ends the dialog, after what stays.
    expect(text).not.toContain('its conversations with MAIA');
    expect(text).toContain('any conversation you had with MAIA about it while it held no writing');
    expect(text).toContain('Your conversations with MAIA about those writings are not part of the Work, so removing the Work does not remove them: they stay with the writings, and deleting a writing deletes its conversations.');
    expect(dialog!.querySelector('p')!.textContent!.endsWith('deleting a writing deletes its conversations.')).toBe(true);
    expect(text).toContain('It cannot be undone');
    expect(text).not.toContain(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-shared-writing]')).toBeNull();
  });
  it('confirming removes the Work through onRemoveWork and never calls Delete', async () => {
    onRemoveWork.mockResolvedValue(undefined);
    await act(async () => { (host.querySelector('button.p4r1-home-delete-open') as HTMLButtonElement).click(); });
    await click(REMOVE_MANY_WORK_COPY.confirm);
    expect(onRemoveWork).toHaveBeenCalledWith('fictional-work-many');
    expect(onDeleteWork).not.toHaveBeenCalled();
    expect(host.querySelector('[data-removed]')?.textContent).toBe('“Fictional Work Many” was removed.');
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain(removedWorkNotice('Fictional Work Many', 'many'));
  });
  it('the notice for this removal says what removal guarantees (no writing deleted) and does not name a label the page lacks', () => {
    const text = removedWorkNotice('X', 'many');
    expect(text).toContain('None of its writings was deleted');
    expect(text).not.toContain('Writing not yet in a Work');
    expect(REMOVE_MANY_WORK_COPY.body).not.toContain('Writing not yet in a Work');
  });
  it('Don\'t remove goes back to the card and calls nothing', async () => {
    await act(async () => { (host.querySelector('button.p4r1-home-delete-open') as HTMLButtonElement).click(); });
    await click(REMOVE_MANY_WORK_COPY.cancel);
    expect(host.querySelector('[data-many-writings]')).toBeNull();
    expect(onRemoveWork).not.toHaveBeenCalled();
    expect(host.querySelector('button.p4r1-home-delete-open')?.textContent).toBe('Remove');
  });
  it('a failed removal stays in the dialog and says what is known', async () => {
    onRemoveWork.mockRejectedValue(new Error('We could not confirm whether that work was removed. Home now shows what is current, so check it before you try again.'));
    await act(async () => { (host.querySelector('button.p4r1-home-delete-open') as HTMLButtonElement).click(); });
    await click(REMOVE_MANY_WORK_COPY.confirm);
    expect(host.querySelector('[data-many-writings] [role="alert"]')?.textContent).toContain('could not confirm');
    expect(host.querySelector('[data-removed]')).toBeNull();
  });
});

describe('the hero Work has the same door as every other Work', () => {
  const anchorDoor = () => host.querySelector('.p4r1-home-anchor button.p4r1-home-delete-open') as HTMLButtonElement | null;
  const renderReturning = (extra: Record<string, unknown> = {}) =>
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, returnWork: workA, ...extra } as any)));

  it('returning to one Work: the anchor offers Delete, and the question replaces the anchor', async () => {
    renderReturning();
    expect(anchorDoor()?.textContent).toBe('Delete');
    await act(async () => { anchorDoor()!.click(); });
    const dialog = host.querySelector('.p4r1-home-anchor[data-deleting-confirmation]');
    expect(dialog?.textContent).toContain('Delete “Fictional Work A”?');
    expect(host.querySelector('.p4r1-home-anchor h1')).toBeNull();
  });
  it('shared writing on the hero Work offers the same removal, and removing it is reported on the page and on the anchor', async () => {
    renderReturning();
    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    onRemoveWork.mockResolvedValue(undefined);
    await act(async () => { anchorDoor()!.click(); });
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('.p4r1-home-anchor[data-shared-writing]')).not.toBeNull();
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    expect(onRemoveWork).toHaveBeenCalledWith('fictional-work-a');
    expect(host.querySelector('.p4r1-home-anchor[data-removed]')?.textContent).toBe('“Fictional Work A” was removed.');
    expect(host.querySelectorAll('[data-delete-notice]')).toHaveLength(1);
  });
  it('the custody notice from the hero Work survives the anchor unmounting', async () => {
    renderReturning();
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY_MESSAGE, true));
    await act(async () => { anchorDoor()!.click(); });
    await click(DELETE_WORK_COPY.confirm);
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [workB], manuscripts: [], returnWork: null, arrival: { ...orient, kind: 'begin' } } as any)));
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('we are not going to tell you it is gone');
  });
  it('the continue layout\'s hero Work has the door too', () => {
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, arrival: { ...orient, kind: 'continue', resume: workA, alsoWritten: [], shelf: [workB] } } as any)));
    expect(anchorDoor()?.textContent).toBe('Delete');
  });
  it('a hero Work that holds several writings offers Remove', () => {
    const m1 = { ...sharedManuscript, id: 'fictional-many-1' };
    const m2 = { ...sharedManuscript, id: 'fictional-many-2' };
    const ex = (id: string) => ({ expressionType: 'manuscript', expressionId: id, declaredAt: '2026-10-01T00:00:00Z' });
    const many = { ...makeWork('fictional-work-many', 'Fictional Work Many'), expressions: [ex('fictional-many-1'), ex('fictional-many-2')] };
    act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, works: [many], manuscripts: [m1, m2], returnWork: many } as any)));
    expect(anchorDoor()?.textContent).toBe('Remove');
  });
});

describe('the removal confirmation, on its own', () => {
  const renderConfirm = (props: Partial<React.ComponentProps<typeof WorkRemoveConfirm>> = {}) => {
    const onConfirm = jest.fn(); const onCancel = jest.fn();
    act(() => root.render(React.createElement(WorkRemoveConfirm, { title: 'T', busy: false, error: null, onConfirm, onCancel, ...props })));
    return { onConfirm, onCancel };
  };
  it('while removing, both buttons are inert and the confirm button says it is working', () => {
    renderConfirm({ busy: true });
    expect(byText(REMOVE_SHARED_WORK_COPY.working)?.disabled).toBe(true);
    expect(byText(REMOVE_SHARED_WORK_COPY.cancel)?.disabled).toBe(true);
  });
  it('shows an error as an alert and keeps both buttons live', () => {
    renderConfirm({ error: 'Nothing changed.' });
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Nothing changed.');
    expect(byText(REMOVE_SHARED_WORK_COPY.confirm)?.disabled).toBe(false);
  });
  it('confirm and cancel each call exactly their own handler', async () => {
    const { onConfirm, onCancel } = renderConfirm();
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1); expect(onCancel).not.toHaveBeenCalled();
    await click(REMOVE_SHARED_WORK_COPY.cancel);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
  it('takes its words from the copy it is given', () => {
    renderConfirm({ copy: REMOVE_MANY_WORK_COPY });
    expect(host.textContent).toContain('Remove “T”?');
    expect(host.textContent).toContain('None of the writings is deleted');
  });
});

describe('controller wiring (source-reading; comments stripped)', () => {
  const strip = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
  const controller = strip(readFileSync(join(__dirname, '..', 'P4R1HomeController.tsx'), 'utf8'));
  it('Work Delete and Remove are the run functions, with the page\'s own fetcher and re-read', () => {
    expect(controller).toMatch(/runDeleteWork\(\{ workId, manuscriptId \}, \(url, init\) => apiFetch\(url, init\), refresh\)/);
    expect(controller).toMatch(/runRemoveWork\(workId, \(url, init\) => apiFetch\(url, init\), refresh\)/);
  });
  it('the re-read the delete flow uses covers EVERY list Home shows (Works, writings, its short History) and reports whether it worked', () => {
    expect(controller).toMatch(/const refresh = useCallback\(\(\) => reReadAll\(\[reloadWorks, reloadManuscripts, reloadHistory\]\), \[reloadWorks, reloadManuscripts, reloadHistory\]\)/);
  });
  it('hands onRemoveWork to the Home view', () => {
    expect(controller).toMatch(/onRemoveWork=\{onRemoveWork\}/);
  });
  it('the controller itself never names the manuscript erase route and holds no outcome-mapping of its own (that lives in runDeleteWork, where it is tested at runtime)', () => {
    expect(controller).not.toMatch(/api\/sovereign\/manuscripts/);
    expect(controller).not.toMatch(/outcome\.(refusal|removed|unknown)/);
    expect(controller).not.toMatch(/DeletionSharedMaterial|DeletionUnconfirmed|DeletionNotice/);
  });
});
