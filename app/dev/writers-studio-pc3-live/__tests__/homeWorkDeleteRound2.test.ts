/**
 * Work-card Delete, the second full review (2026-11-05): what the page does when the picture it was given is out of date, when a
 * message is on screen as its card goes away, and at EVERY place a Work card can appear. Component-level, jsdom, fictional data.
 *
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/full-redesign/Shell', () => ({
  Shell: ({ work }: { work: React.ReactNode }) => React.createElement('main', { 'data-test-shell': '' }, work),
}));
jest.mock('@/app/writers-studio/useWorkVisual', () => ({ useWorkVisual: () => ({ src: null }) }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1WorkMaterialsSummary', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1ProducePanel', () => ({ __esModule: true, default: () => null }));

import P4R1HomeView from '@/app/dev/writers-studio-pc3-live/P4R1HomeView';
import {
  DELETE_WORK_COPY,
  DeletionNotice,
  DeletionSharedMaterial,
  DeletionUnconfirmed,
  REMOVE_SHARED_WORK_COPY,
  removeSharedWorkCopy,
} from '@/lib/writersStudio/deleteWork';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const SHARED_REFUSAL = 'This writing is also in another of your Works, so it cannot be deleted from here without taking it from there. Nothing was deleted.';
const CUSTODY = 'This work was removed from your studio, but we could not confirm two things. Until we can, we are not going to tell you it is gone.';
const UNKNOWN = 'We could not confirm whether that work was deleted. Home now shows what is current, so check it before you try again.';

const expression = (id: string) => ({ expressionType: 'manuscript', expressionId: id, declaredAt: '2026-10-01T00:00:00Z' });
const makeWork = (id: string, title: string, manuscriptIds: string[] = ['fictional-shared-manuscript']) => ({
  id, title, purpose: null, form: 'Book', stage: 'writing', manuscriptState: 'partial-manuscript',
  createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z', expressions: manuscriptIds.map(expression), materials: [],
});
const makeManuscript = (id: string, title: string) => ({
  id, title, createdAt: '2026-10-01T00:00:00Z', sectionCount: 1, charCount: 30, keepCount: 0, draftCharCount: 30,
  hasDraftWriting: true, hasWriting: true, hasCurrentMemberContribution: true, lastMemberDraftActivityAt: '2026-10-02T00:00:00Z',
});
const workA = makeWork('fictional-work-a', 'Fictional Work A');
const workB = makeWork('fictional-work-b', 'Fictional Work B');
const workC = makeWork('fictional-work-c', 'Fictional Work C');
const shared = makeManuscript('fictional-shared-manuscript', 'The Shared Fictional Writing');
const loose = makeManuscript('fictional-loose-manuscript', 'A Loose Fictional Draft');
const orient = { kind: 'orient', resume: null, alsoWritten: [], shelf: [], feature: null, imported: [] };

const onDeleteWork = jest.fn();
const onRemoveWork = jest.fn();
const onDeleteWriting = jest.fn();
const baseProps = {
  appearance: 'night', arrival: orient, works: [workA, workB], manuscripts: [shared],
  resumeActivity: null, returnWork: null, returnActivity: null,
  markedLines: [], historyActs: [], busy: false, error: null, pendingMode: null,
  onMode: jest.fn(), onChooseManuscript: jest.fn(), onBegin: jest.fn(), onOpen: jest.fn(),
  onMakeWork: jest.fn(), onAddToWork: jest.fn(), onStartWriting: jest.fn(), onImport: jest.fn(), onSources: jest.fn(),
  onDeleteWriting, onDeleteWork, onRemoveWork,
};

let host: HTMLDivElement;
let root: Root;
const render = (extra: Record<string, unknown> = {}) =>
  act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, ...extra } as any)));
beforeEach(() => {
  jest.clearAllMocks();
  onDeleteWork.mockReset(); onRemoveWork.mockReset(); onDeleteWriting.mockReset();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  render();
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

const buttons = () => Array.from(host.querySelectorAll('button'));
const byText = (label: string) => buttons().find((b) => b.textContent?.trim() === label) as HTMLButtonElement | undefined;
const click = async (label: string) => {
  const target = byText(label);
  expect({ label, found: Boolean(target) }).toEqual({ label, found: true });
  await act(async () => { target!.click(); });
};
/** The Delete/Remove door on the card (hero or shelf) that shows this Work's title. */
const doorOf = (title: string) =>
  (Array.from(host.querySelectorAll('button.p4r1-home-delete-open')) as HTMLButtonElement[])
    .find((b) => (b.closest('article, section')?.textContent ?? '').includes(title));
const pressDoor = async (title: string) => {
  const door = doorOf(title);
  expect({ title, door: Boolean(door) }).toEqual({ title, door: true });
  await act(async () => { door!.click(); });
};

describe('the shared-writing exit works at EVERY place a Work card can appear', () => {
  const layouts: Array<[string, Record<string, unknown>]> = [
    ['many Works (no hero)', {}],
    ['returning to Work A: A is the hero, B on "Your other Works"', { returnWork: workA }],
    ['returning to Work B: B is the hero, A on "Your other Works"', { returnWork: workB }],
    ['continue, A resumed and B in "Also written"', { arrival: { ...orient, kind: 'continue', resume: workA, alsoWritten: [workB], shelf: [] } }],
    ['continue, A resumed and B on the shelf', { arrival: { ...orient, kind: 'continue', resume: workA, alsoWritten: [], shelf: [workB] } }],
    ['continue, B resumed and A in "Also written"', { arrival: { ...orient, kind: 'continue', resume: workB, alsoWritten: [workA], shelf: [] } }],
    ['writing outside any Work is present: Works listed beneath it', { manuscripts: [shared, loose] }],
  ];
  for (const [name, extra] of layouts) {
    for (const [title, id] of [['Fictional Work A', 'fictional-work-a'], ['Fictional Work B', 'fictional-work-b']] as const) {
      it(`${name} — ${title}: 409 opens the removal question, and Remove calls onRemoveWork`, async () => {
        render(extra);
        onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
        onRemoveWork.mockResolvedValue(undefined);
        await pressDoor(title);
        await click(DELETE_WORK_COPY.confirm);
        expect(host.querySelector('[data-shared-writing]')).not.toBeNull();
        expect(host.textContent).toContain(`Remove “${title}” and keep the writing?`);
        await click(REMOVE_SHARED_WORK_COPY.confirm);
        expect(onRemoveWork).toHaveBeenCalledWith(id);
        expect(onDeleteWork).toHaveBeenCalledTimes(1);
      });
    }
  }
});

describe('the server says the writing is shared, but this page cannot see the other Work', () => {
  it('the card shows the server\'s sentence instead of doing nothing, and does not offer a removal it cannot justify', async () => {
    render({ works: [workA] });               // Work B was declared elsewhere after this page loaded
    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-shared-writing]')).toBeNull();
    expect(host.querySelector('[data-deleting-confirmation] [role="alert"]')?.textContent).toContain('Nothing was deleted');
  });

  it('pressing Delete again clears the earlier verdict while the new attempt is in flight (a verdict about the last attempt is not shown beside the next)', async () => {
    render({ works: [workA] });
    onDeleteWork.mockRejectedValueOnce(new DeletionSharedMaterial(SHARED_REFUSAL));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-deleting-confirmation] [role="alert"]')?.textContent).toContain('Nothing was deleted');
    let finish: (value?: unknown) => void = () => undefined;
    onDeleteWork.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-deleting-confirmation] [role="alert"]')).toBeNull();     // the attempt is in flight: no old verdict beside it
    await act(async () => { finish(undefined); });
  });

  it('once the re-read brings the other Work in, the same card turns into the removal question', async () => {
    render({ works: [workA] });
    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    render({ works: [workA, workB] });
    expect(host.querySelector('[data-shared-writing]')).not.toBeNull();
    expect(host.querySelector('[data-shared-writing] [role="alert"]')).toBeNull();
  });
});

describe('the sentence about where the writing stays matches how many other Works hold it', () => {
  it('one other Work: "another of your Works" / "your other Work"', () => {
    const copy = removeSharedWorkCopy(1);
    expect(copy.body).toContain('also in another of your Works');
    expect(copy.body).toContain('it stays in your other Work');
  });
  it('several other Works: the number, and "the other Works that hold it"', async () => {
    render({ works: [workA, workB, workC] });
    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    const text = host.querySelector('[data-shared-writing]')!.textContent!;
    expect(text).toContain('also in 2 of your other Works');
    expect(text).toContain('it stays in the other Works that hold it');
    expect(text).not.toContain('your other Work.');
  });
});

describe('a message about an outcome the page was re-read for is carried by the PAGE, in the real event order', () => {
  // In production the re-read (which can remove this card) happens BEFORE the act throws. These mocks do the same: they re-render the
  // page without the Work, and only then throw.
  const reReadThenThrow = (props: Record<string, unknown>, error: Error) => async () => { render(props); throw error; };

  it('an unknown Delete outcome whose re-read shows the Work gone: the card is gone before the throw, and the page still has the message', async () => {
    onDeleteWork.mockImplementation(reReadThenThrow({ works: [workB] }, new DeletionNotice(UNKNOWN)));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(Array.from(host.querySelectorAll('.p4r1-home-workcard h3')).map((h) => h.textContent)).toEqual(['Fictional Work B']);
    const notice = host.querySelector('[data-delete-notice]');
    expect(notice?.textContent).toContain('“Fictional Work A”: We could not confirm');
    expect(notice?.getAttribute('role')).toBe('status');
  });

  it('the same when the re-read shows the Work STILL there: the dialog closes and the page says to check (one place, no duplicate)', async () => {
    onDeleteWork.mockRejectedValue(new DeletionNotice(UNKNOWN));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-deleting-confirmation]')).toBeNull();
    expect(host.querySelectorAll('[data-delete-notice]')).toHaveLength(1);
    expect(doorOf('Fictional Work A')).toBeTruthy();
  });

  it('a stale-card refusal is a page notice too (the Work it names may be the one the re-read just removed)', async () => {
    onDeleteWork.mockImplementation(reReadThenThrow({ works: [workB] }, new DeletionNotice('That Work has changed since this page loaded. It may have been removed on another device. Nothing was deleted. Home now shows what is current.')));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('Nothing was deleted');
  });

  it('Remove: an unknown outcome whose re-read removes the card', async () => {
    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    onRemoveWork.mockImplementation(reReadThenThrow({ works: [workB] }, new DeletionNotice('We could not confirm whether that work was removed. Home now shows what is current, so check it before you try again.')));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('could not confirm whether that work was removed');
  });

  it('a PLAIN rejection (nothing happened, nothing re-read) stays in the dialog and is not copied to the page', async () => {
    onDeleteWork.mockRejectedValue(new Error('That work could not be deleted just now. Nothing was removed — please try again.'));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-deleting-confirmation] [role="alert"]')?.textContent).toContain('Nothing was removed');
    expect(host.querySelector('[data-delete-notice]')).toBeNull();
  });
});

describe('a failed attempt followed by a successful one leaves only the success on the page', () => {
  it('Remove: failed once (plain), retried and succeeded', async () => {
    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    onRemoveWork.mockRejectedValueOnce(new Error('That work could not be removed just now. Nothing changed. Please try again.')).mockResolvedValueOnce({ refreshed: true, workRemoved: true });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    expect(host.querySelector('[data-shared-writing] [role="alert"]')?.textContent).toContain('Nothing changed');
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    render({ works: [workB] });
    const messages = Array.from(host.querySelectorAll('[data-delete-notice]')).map((n) => n.textContent ?? '');
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('was removed');
  });
  it('Delete: failed once (plain), retried and succeeded', async () => {
    onDeleteWork.mockRejectedValueOnce(new Error('That work could not be deleted just now. Nothing was removed — please try again.')).mockResolvedValueOnce({ refreshed: true, workRemoved: true });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    await click(DELETE_WORK_COPY.confirm);
    render({ works: [workB] });
    expect(host.querySelector('[data-delete-notice]')).toBeNull();
  });
});

describe('a Work\'s open question belongs to the Work, not to the card that happens to show it', () => {
  it('the 409 turns into the removal question even though the re-read moved the Work from the shelf to the hero slot', async () => {
    onDeleteWork.mockImplementation(async () => {
      render({ returnWork: workA });                       // the re-read changed which component shows Work A
      throw new DeletionSharedMaterial(SHARED_REFUSAL);
    });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('.p4r1-home-anchor[data-shared-writing]')).not.toBeNull();
    expect(host.textContent).toContain('Remove “Fictional Work A” and keep the writing?');
  });
  it('an open Delete question survives the same move', async () => {
    await pressDoor('Fictional Work A');
    render({ returnWork: workA });
    expect(host.querySelector('.p4r1-home-anchor[data-deleting-confirmation]')).not.toBeNull();
  });
  it('and it does not follow the hero slot to a DIFFERENT Work', async () => {
    render({ returnWork: workA });
    await pressDoor('Fictional Work A');
    render({ returnWork: workB, works: [workB] });
    expect(host.querySelector('.p4r1-home-anchor[data-deleting-confirmation]')).toBeNull();
    expect(host.querySelector('.p4r1-home-anchor h2')?.textContent).toBe('Fictional Work B');
  });
});

describe('a re-read that did not work is said to the member, never hidden', () => {
  it('Delete of a Work that goes: the card says it was deleted and the page says to reload', async () => {
    onDeleteWork.mockResolvedValue({ refreshed: false, workRemoved: true });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')?.textContent).toBe('“Fictional Work A” was deleted.');
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('reload this page');
  });
  it('a re-read that worked adds nothing', async () => {
    onDeleteWork.mockResolvedValue({ refreshed: true, workRemoved: true });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-delete-notice]')).toBeNull();
  });
  it('Remove', async () => {
    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    onRemoveWork.mockResolvedValue({ refreshed: false });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('reload this page');
  });
});

describe('custody unconfirmed after deleting only the writing of a Work that STAYS', () => {
  const mixed = { ...workA, expressions: [expression('fictional-shared-manuscript'), { expressionType: 'visual', expressionId: 'v', declaredAt: '2026-10-01T00:00:00Z' }] };
  it('the Work\'s card is NOT replaced by a "removed" ghost; the page carries an alert naming the writing', async () => {
    render({ works: [mixed, workB] });
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed('This writing was deleted from your studio, but we could not confirm that its original file has been destroyed. Until we can, we are not going to tell you it is gone.', false));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')).toBeNull();
    expect(doorOf('Fictional Work A')).toBeTruthy();
    const notice = host.querySelector('[data-delete-notice]');
    expect(notice?.getAttribute('role')).toBe('alert');
    expect(notice?.textContent).toContain('This writing was deleted from your studio');
    expect(notice?.textContent).not.toContain('was removed from your studio');
  });
});

describe('notices stack: a later one never erases an earlier one the member has not dismissed', () => {
  it('a custody alert survives a later plain "was removed"', async () => {
    onDeleteWork
      .mockRejectedValueOnce(new DeletionUnconfirmed(CUSTODY, true))                    // Work A: removed, custody unconfirmed
      .mockRejectedValueOnce(new DeletionSharedMaterial(SHARED_REFUSAL));         // Work B: shared with (the now gone) A as far as this page knows
    onRemoveWork.mockResolvedValue(undefined);
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    await pressDoor('Fictional Work B');
    await click(DELETE_WORK_COPY.confirm);
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    const notices = Array.from(host.querySelectorAll('[data-delete-notice]'));
    expect(notices.map((n) => n.getAttribute('role'))).toEqual(['alert', 'status']);
    expect(notices[0]!.textContent).toContain('we are not going to tell you it is gone');
    expect(notices[1]!.textContent).toContain('“Fictional Work B” was removed');
  });

  it('dismissing one leaves the other', async () => {
    onDeleteWork.mockRejectedValueOnce(new DeletionUnconfirmed(CUSTODY, true)).mockRejectedValueOnce(new DeletionUnconfirmed('Second. ' + CUSTODY, true));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    await pressDoor('Fictional Work B');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelectorAll('[data-delete-notice]')).toHaveLength(2);
    await act(async () => { (host.querySelector('[data-delete-notice] button') as HTMLButtonElement).click(); });
    const left = Array.from(host.querySelectorAll('[data-delete-notice]'));
    expect(left).toHaveLength(1);
    expect(left[0]!.textContent).toContain('Second.');
  });

  it('the newest notice is scrolled into view', async () => {
    const scroll = jest.fn();
    (Element.prototype as any).scrollIntoView = scroll;
    try {
      onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY, true));
      await pressDoor('Fictional Work A');
      await click(DELETE_WORK_COPY.confirm);
      expect(scroll).toHaveBeenCalled();
    } finally {
      delete (Element.prototype as any).scrollIntoView;
    }
  });
});

describe('the hero Work\'s state belongs to that Work, not to the slot', () => {
  it('after the hero Work is deleted, the next Work is shown as itself, not behind "was deleted"', async () => {
    render({ returnWork: workA, works: [workA, workB] });
    onDeleteWork.mockResolvedValue({ refreshed: true, workRemoved: true });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('.p4r1-home-anchor[data-removed]')?.textContent).toBe('“Fictional Work A” was deleted.');
    render({ returnWork: workB, works: [workB] });         // the re-read: B is now the Work the page returns to
    expect(host.querySelector('.p4r1-home-anchor[data-removed]')).toBeNull();
    expect(host.querySelector('.p4r1-home-anchor h2')?.textContent).toBe('Fictional Work B');
    expect(doorOf('Fictional Work B')?.textContent).toBe('Delete');
  });
  it('and an open confirmation does not follow the slot to a different Work either', async () => {
    render({ returnWork: workA, works: [workA, workB] });
    await pressDoor('Fictional Work A');
    expect(host.querySelector('.p4r1-home-anchor[data-deleting-confirmation]')).not.toBeNull();
    render({ returnWork: workB, works: [workB] });
    expect(host.querySelector('.p4r1-home-anchor[data-deleting-confirmation]')).toBeNull();
  });
  it('what a card remembers on its own (its open Publish panel) does not follow the slot to a different Work', async () => {
    render({ returnWork: workA, works: [workA, workB] });
    await click('Publish');
    expect(byText('Publish')!.getAttribute('aria-expanded')).toBe('true');
    render({ returnWork: workB, works: [workA, workB] });          // the re-read hands the slot to Work B
    expect(byText('Publish')!.getAttribute('aria-expanded')).toBe('false');
  });
  it('and the same in the continue layout', async () => {
    const continueWith = (resume: unknown) => ({ arrival: { ...orient, kind: 'continue', resume, alsoWritten: [], shelf: [] }, works: [workA, workB] });
    render(continueWith(workA));
    await click('Publish');
    expect(byText('Publish')!.getAttribute('aria-expanded')).toBe('true');
    render(continueWith(workB));
    expect(byText('Publish')!.getAttribute('aria-expanded')).toBe('false');
  });
  it('the continue layout is keyed the same way', async () => {
    render({ arrival: { ...orient, kind: 'continue', resume: workA, alsoWritten: [], shelf: [workB] }, works: [workA, workB] });
    onDeleteWork.mockResolvedValue({ refreshed: true, workRemoved: true });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    render({ arrival: { ...orient, kind: 'continue', resume: workB, alsoWritten: [], shelf: [] }, works: [workB] });
    expect(host.querySelector('.p4r1-home-anchor[data-removed]')).toBeNull();
  });
});

describe('deleting a Work\'s writing when the Work stays', () => {
  const mixed = { ...workA, expressions: [expression('fictional-shared-manuscript'), { expressionType: 'visual', expressionId: 'v', declaredAt: '2026-10-01T00:00:00Z' }] };
  it('the Work\'s card is not replaced by a ghost; the page says what happened, and the card keeps its door', async () => {
    render({ works: [mixed, workB] });
    onDeleteWork.mockResolvedValue({ refreshed: true, workRemoved: false });       // the server says the Work stays
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')).toBeNull();
    expect(doorOf('Fictional Work A')).toBeTruthy();
    expect(host.querySelector('[data-delete-notice]')?.getAttribute('role')).toBe('status');
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('The Work stays, with what else it holds.');
  });
  it('and it is the SERVER\'s word that decides, not the card\'s picture: a card that believed the Work would go is not turned into "deleted" when the server kept it', async () => {
    render({ works: [workA, workB] });                                             // workA holds one writing as far as this card knows
    onDeleteWork.mockResolvedValue({ refreshed: true, workRemoved: false });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')).toBeNull();
    expect(doorOf('Fictional Work A')).toBeTruthy();                                // the Work is still there, with its door
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('The Work stays');
  });
  it('and the converse: a card that believed the Work would stay is replaced when the server says it went', async () => {
    render({ works: [mixed, workB] });
    onDeleteWork.mockResolvedValue({ refreshed: true, workRemoved: true });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')?.textContent).toBe('“Fictional Work A” was deleted.');
  });
  it('a writing that was already gone (the server says nothing about the Work): no ghost, and the page says only that', async () => {
    render({ works: [workA, workB] });
    onDeleteWork.mockResolvedValue({ refreshed: true });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')).toBeNull();
    const text = host.querySelector('[data-delete-notice]')?.textContent ?? '';
    expect(text).toContain('“Fictional Work A”: that writing was already gone.');
    expect(text).toContain('Home now shows what is current');
  });
  it('the same, with a re-read that failed: it tells the member to reload and does not say Home is current', async () => {
    render({ works: [workA, workB] });
    onDeleteWork.mockResolvedValue({ refreshed: false });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    const text = host.querySelector('[data-delete-notice]')?.textContent ?? '';
    expect(text).toContain('reload this page');
    expect(text).not.toContain('Home now shows what is current');
  });
  it('the Work stays and the re-read failed: the notice still tells the member to reload', async () => {
    render({ works: [mixed, workB] });
    onDeleteWork.mockResolvedValue({ refreshed: false, workRemoved: false });
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('reload this page');
  });
});

describe('custody unconfirmed: whether the card becomes a "removed" card is the server\'s word (workRemoved), never the card\'s picture', () => {
  it('the server says the Work went: the card says it was removed from the studio', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY, true));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')?.textContent).toBe('“Fictional Work A” was removed from your studio.');
  });
  it('the server says the Work STAYS (even though this card believed it would go): no ghost, the alert is on the page, and the door is still there', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY, false));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')).toBeNull();
    expect(doorOf('Fictional Work A')).toBeTruthy();
    expect(host.querySelector('[data-delete-notice]')?.getAttribute('role')).toBe('alert');
  });
  it('the server did not say: no ghost either (a "removed" card is shown only on the server\'s word)', async () => {
    onDeleteWork.mockRejectedValue(new DeletionUnconfirmed(CUSTODY));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')).toBeNull();
    expect(host.querySelector('[data-delete-notice]')?.getAttribute('role')).toBe('alert');
  });
});

describe('a Work whose removal leaves its image bytes owed', () => {
  it('shows the removed card and an ALERT that says what could not be confirmed', async () => {
    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    onRemoveWork.mockRejectedValue(new DeletionUnconfirmed('This work was removed from your studio, but we could not yet confirm that its image has been destroyed. Until we can, we are not going to tell you it is gone.'));
    await pressDoor('Fictional Work A');
    await click(DELETE_WORK_COPY.confirm);
    await click(REMOVE_SHARED_WORK_COPY.confirm);
    expect(host.querySelector('[data-removed]')?.textContent).toBe('“Fictional Work A” was removed from your studio.');
    const notice = host.querySelector('[data-delete-notice]');
    expect(notice?.getAttribute('role')).toBe('alert');
    expect(notice?.textContent).toContain('its image');
  });
});

describe('loose writing (no Work) uses the same truth, and its delete is covered at runtime', () => {
  const looseOnly = { works: [], manuscripts: [loose] };
  const openLoose = async () => {
    const door = host.querySelector('[data-kind="writing"] button.p4r1-home-delete-open') as HTMLButtonElement;
    expect(door).toBeTruthy();
    await act(async () => { door.click(); });
  };

  it('its confirmation says what loose deletion reaches and does NOT talk about a Work', async () => {
    render(looseOnly);
    await openLoose();
    const text = host.querySelector('[data-deleting-confirmation]')!.textContent!;
    expect(text).toContain('This deletes the writing');
    expect(text).toContain('your conversations with MAIA about the writing');
    expect(text).not.toContain('built inside the Work');
    expect(text).toContain('It cannot be undone');
  });

  it('the confirmation stays open and inert until the server has answered (no optimistic success), then closes', async () => {
    render(looseOnly);
    let finish!: () => void;
    onDeleteWriting.mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
    await openLoose();
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-deleting-confirmation]')).not.toBeNull();
    expect(byText(DELETE_WORK_COPY.working)?.disabled).toBe(true);
    await act(async () => { finish(); });
    expect(host.querySelector('[data-deleting-confirmation]')).toBeNull();
  });

  it('removed but unconfirmed: the dialog closes and the page carries an alert', async () => {
    render(looseOnly);
    onDeleteWriting.mockRejectedValue(new DeletionUnconfirmed(CUSTODY, true));
    await openLoose();
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-deleting-confirmation]')).toBeNull();
    expect(host.querySelector('[data-delete-notice]')?.getAttribute('role')).toBe('alert');
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('we are not going to tell you it is gone');
  });

  it('removed but unconfirmed names the writing on the page', async () => {
    render(looseOnly);
    onDeleteWriting.mockRejectedValue(new DeletionUnconfirmed(CUSTODY, true));
    await openLoose();
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('“A Loose Fictional Draft”: ');
  });

  it('an outcome the page was re-read for reaches the page even though the re-read removed the writing\'s card first', async () => {
    render(looseOnly);
    onDeleteWriting.mockImplementation(async () => { render({ works: [], manuscripts: [] }); throw new DeletionNotice(UNKNOWN); });
    await openLoose();
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-kind="writing"]')).toBeNull();
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('“A Loose Fictional Draft”: We could not confirm');
  });

  it('a shared-writing refusal (the writing was meanwhile placed in two Works) is carried by the page, not lost with the loose card', async () => {
    render(looseOnly);
    onDeleteWriting.mockImplementation(async () => { render({ works: [makeWork('w1', 'W1', ['fictional-loose-manuscript']), makeWork('w2', 'W2', ['fictional-loose-manuscript'])], manuscripts: [loose] }); throw new DeletionSharedMaterial(SHARED_REFUSAL); });
    await openLoose();
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('Nothing was deleted');
  });

  it('a re-read that did not work is said', async () => {
    render(looseOnly);
    onDeleteWriting.mockResolvedValue({ refreshed: false });
    await openLoose();
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('reload this page');
  });

  it('any other failure stays in the dialog as an error', async () => {
    render(looseOnly);
    onDeleteWriting.mockRejectedValue(new Error('That writing could not be deleted just now. Nothing was removed. Please try again.'));
    await openLoose();
    await click(DELETE_WORK_COPY.confirm);
    expect(host.querySelector('[data-deleting-confirmation] [role="alert"]')?.textContent).toContain('Nothing was removed');
  });
});

describe('the destructive dialogs', () => {
  it('Keep it holds focus when the Delete question opens', async () => {
    await pressDoor('Fictional Work A');
    expect(document.activeElement?.textContent).toBe(DELETE_WORK_COPY.cancel);
  });
  it('both dialogs are described by the body that states what is lost, not only labelled by the question', async () => {
    await pressDoor('Fictional Work A');
    const del = host.querySelector('[role="alertdialog"]')!;
    const delBody = document.getElementById(del.getAttribute('aria-describedby')!);
    expect(delBody?.textContent).toContain('It cannot be undone');

    onDeleteWork.mockRejectedValue(new DeletionSharedMaterial(SHARED_REFUSAL));
    await click(DELETE_WORK_COPY.confirm);
    const rem = host.querySelector('[role="alertdialog"]')!;
    const remBody = document.getElementById(rem.getAttribute('aria-describedby')!);
    expect(remBody?.textContent).toContain('what you built inside it');
  });
});
