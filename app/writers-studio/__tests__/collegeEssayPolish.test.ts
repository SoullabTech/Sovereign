/**
 * College Essay Studio polish pass (founder-approved scope, 2026-11-16). Real components in jsdom with stubbed clients, plus
 * pure-function checks; not a browser run. Each block names the approved item it pins.
 * @jest-environment jsdom
 */
import fs from 'node:fs';
import path from 'node:path';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const apiFetch = jest.fn();
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: (...a: unknown[]) => apiFetch(...a) }));
const fetchCoverage = jest.fn();
jest.mock('@/lib/writersStudio/coverageClient', () => ({ fetchCoverage: (...a: unknown[]) => fetchCoverage(...a) }));

import { projectPc3LiveWrite } from '@/app/writers-studio/full-redesign/liveWriteAdapter';
import { studioPathById, unheadedPlaceName } from '@/lib/writersStudio/studioPaths';
import { CoverageLine, sessionReadFor, sessionReadSentence } from '@/app/dev/writers-studio-pc3-live/CoverageLine';
import StudioFirstPageMaia from '@/app/dev/writers-studio-pc3-live/StudioFirstPageMaia';
import StudioInspirationOpening from '@/app/dev/writers-studio-pc3-live/StudioInspirationOpening';
import { invitationCheckAnswer } from '@/lib/studios/doorwayInvitations';
import { DoorwayJoin } from '@/components/studios/DoorwayJoin';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { act(() => root.unmount()); host.remove(); jest.restoreAllMocks(); });
async function flush() { for (let i = 0; i < 6; i++) await act(async () => { await Promise.resolve(); }); }
const button = (label: string) => [...host.querySelectorAll('button')].find((b) => b.textContent === label) as HTMLButtonElement;

const section = (position: number, heading: string | null = null) => ({
  draftSectionId: `s${position}`, position, heading, headingDepth: null, editable: true,
}) as never;
const project = (sections: never[], names?: Parameters<typeof projectPc3LiveWrite>[0]['names']) => projectPc3LiveWrite({
  sections, activeId: 's0', bodyOf: () => 'words', statusOf: () => 'saved' as never,
  workTitle: 'College essay', manuscriptTitle: null, names,
})!.data;

/* ── 1 · Essay-specific language, ordinary Works unchanged ─────────────────────────────────────────────────────────────── */
describe('1 · essay language', () => {
  const essay = studioPathById('college-essay')!.studioCopy;
  const names = { heading: essay.railHeading, unheaded: (p: number, t: number) => unheadedPlaceName(essay, p, t) };

  test('a one-place essay is "Your essay" / "Your draft", never "Manuscript" / "Section 1"', () => {
    const data = project([section(0)], names);
    expect(data.heading).toBe('Your essay');
    expect(data.place).toBe('Your draft');
    expect(data.chapters[0]!.label).toBe('Your draft');
  });

  test('an essay with several unheaded places names them "Part n"; a writer’s own heading always wins', () => {
    const data = project([section(0), section(1), section(2, 'Why the wrench')], names);
    expect(data.chapters.map((c) => c.label)).toEqual(['Part 1', 'Part 2', 'Why the wrench']);
  });

  test('an ordinary Work is exactly as before: "Manuscript" and "Section n"', () => {
    const data = project([section(0), section(1)]);
    expect(data.heading).toBe('Manuscript');
    expect(data.chapters.map((c) => c.label)).toEqual(['Section 1', 'Section 2']);
    expect(unheadedPlaceName(null, 0, 1)).toBe('Section 1');
  });

  test('the Write column speaks the program’s footer only on a program Work', () => {
    const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
    expect(view).toContain("{programCopy ? programCopy.foot : 'The manuscript stays primary; support follows your attention.'}");
    expect(essay.foot).not.toMatch(/manuscript|book|chapter/i);
  });
});

/* ── 2 · MAIA's reading status is truthful ─────────────────────────────────────────────────────────────────────────────── */
describe('2 · reading status', () => {
  const coverage = (read: number) => ({
    whole: { read, changed: 0, notRead: 1 - read, positionOnly: 0, total: 1 },
    sections: [{ sectionId: 's0', state: read ? 'read' : 'not_read' }],
  });
  async function renderLine(props: Record<string, unknown>) {
    await act(async () => { root.render(React.createElement(CoverageLine, { manuscriptId: 'm1', labelOf: () => 'Your draft', ...props } as never)); });
    await flush();
    return host.textContent ?? '';
  }

  test('with no reading at all, she says she has not read it', async () => {
    fetchCoverage.mockResolvedValue(coverage(0));
    expect(await renderLine({})).toContain('I haven’t kept a reading of this draft yet.');
  });

  test('after an authorized first-page reading this visit, she says so — and that it isn’t kept', async () => {
    fetchCoverage.mockResolvedValue(coverage(0));
    expect(await renderLine({ sessionRead: 'current' })).toBe(sessionReadSentence('current'));
  });

  test('an edit since that reading is told as a change', async () => {
    fetchCoverage.mockResolvedValue(coverage(0));
    expect(await renderLine({ sessionRead: 'changed' })).toBe('This page has changed since I read it with you.');
  });

  test('the visit’s reading never overrides the durable record', async () => {
    fetchCoverage.mockResolvedValue(coverage(1));
    expect(await renderLine({ sessionRead: 'changed' })).toContain('I’ve read this draft.');
  });

  test('onRead fires only after a successful authorized reading, never on refusal or failure', async () => {
    const onRead = jest.fn();
    const mount = async () => {
      await act(async () => { root.render(React.createElement(StudioFirstPageMaia, { page: 'The cold wrench.', sanctuary: false, onAnswer: jest.fn(), onRead })); });
      await act(async () => { button('Show MAIA this page').click(); });
      await act(async () => { button('Yes, read it').click(); });
      await flush();
    };
    apiFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ refusal: 'quote_unverified' }) });
    await mount();
    apiFetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });
    await act(async () => { button('Show MAIA this page').click(); });
    await act(async () => { button('Yes, read it').click(); });
    await flush();
    expect(onRead).not.toHaveBeenCalled();
    apiFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reply: '"The cold wrench." What else?' }) });
    await act(async () => { button('Show MAIA this page').click(); });
    await act(async () => { button('Yes, read it').click(); });
    await flush();
    expect(onRead).toHaveBeenCalledTimes(1);
    expect(onRead).toHaveBeenCalledWith('The cold wrench.');
  });

  test('the visit’s reading is bound to this Work, manuscript and shown section, and tracks edits', () => {
    const receipt = { workId: 'work-A', manuscriptId: 'm-shared', sectionId: 's0', page: 'The cold wrench.' };
    const here = { workId: 'work-A', manuscriptId: 'm-shared', focusId: 's0', bodyOf: () => 'The cold wrench.' };
    expect(sessionReadFor(receipt, here)).toBe('current');
    expect(sessionReadFor(receipt, { ...here, bodyOf: () => 'The cold wrench, and the rain.' })).toBe('changed');
    expect(sessionReadFor(receipt, { ...here, manuscriptId: 'm-other' })).toBeNull();
    expect(sessionReadFor(receipt, { ...here, focusId: 's1' })).toBeNull();
    expect(sessionReadFor(receipt, { ...here, focusId: null })).toBeNull();
    expect(sessionReadFor(null, here)).toBeNull();
  });

  test('review 2026-11-16 (reassessment): two Works sharing ONE manuscript never share a reading receipt', () => {
    const receipt = { workId: 'work-A', manuscriptId: 'm-shared', sectionId: 's0', page: 'The cold wrench.' };
    // Same manuscript, same section, same unchanged text — only the Work differs.
    expect(sessionReadFor(receipt, { workId: 'work-B', manuscriptId: 'm-shared', focusId: 's0', bodyOf: () => 'The cold wrench.' })).toBeNull();
    expect(sessionReadFor(receipt, { workId: null, manuscriptId: 'm-shared', focusId: 's0', bodyOf: () => 'The cold wrench.' })).toBeNull();
    const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
    expect(view).toContain('sessionReadFor(pageReadWithMaia, {');
    expect(view).toContain('workId: props.work?.id ?? null, manuscriptId: props.context.manuscriptId, sectionId: shownSectionId, page');
  });

  test('review 2026-11-16 #1: the receipt names the section whose body was SENT (focusId), never the editor’s active section', () => {
    const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
    // The page MAIA is shown is the focused section's body …
    expect(view).toContain("const currentBody = props.focusId ? props.writing.bodyOf(props.focusId) : '';");
    expect(view).toContain('const shownSectionId = props.focusId ?? null;');
    // … so the receipt is recorded for, and only matches, that same section.
    expect(view).toContain('sectionId: shownSectionId, page');
    expect(view).toContain('focusId: props.focusId,');
    const receipt = view.slice(view.indexOf('const sessionRead: SessionRead'), view.indexOf('});', view.indexOf('const sessionRead: SessionRead')));
    expect(receipt).not.toContain('activeId');
    expect(view).not.toMatch(/setPageReadWithMaia\([^)]*activeId/);
  });
});

/* ── 3 · Relationship card: quiet first entry, nothing begins on the writer's behalf ────────────────────────────────── */
describe('3 · relationship card', () => {
  const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const start = view.indexOf('const relationshipUnchosen');
  const quiet = view.slice(start, view.indexOf(') : props.work && !canvas ? (', start));

  test('with nothing chosen, one plain line and one quiet "See options"; no Begin button on first sight', () => {
    expect(quiet).toContain('You can write here on your own.');
    expect(quiet).toContain('only if you choose it');
    expect(quiet).toContain('See options');
    expect(quiet).not.toContain('onBeginMaiaRelationship');
  });

  test('review 2026-11-16 #2: "See options" belongs to one Work and is closed on first entry to another', () => {
    expect(view).toContain('useState<string | null>(null)');
    expect(view).toContain("relationshipOptionsWorkId !== (props.work?.id ?? null)");
    expect(view).toContain("setRelationshipOptionsWorkId(props.work?.id ?? null)");
    expect(view).not.toMatch(/maiaRelationshipOptionsOpen/);
  });

  test('every existing choice is still reachable behind it, unchanged', () => {
    expect(view).toContain('Begin relationship with MAIA');
    expect(view).toContain('Continue relationship ·');
    expect(view).toContain('Leave relationship · nothing is deleted');
    expect(view).toContain("props.maiaRelationshipPhase !== 'loading' && props.maiaRelationshipPhase !== 'unavailable'");
  });

  test('mobile: the quiet line wraps and its control stays a 44px tap target', () => {
    const css = read('app/dev/writers-studio-p4r1/p4r1-live.css');
    expect(css).toMatch(/\.p4r1-maia-relationship-quiet \{[^}]*flex-wrap: wrap/);
    expect(css).toContain('[data-relationship-options] { min-height: 44px; }');
    expect(css).toMatch(/@media \(max-width: 640px\) \{ \.p4r1-maia-relationship-quiet/);
  });
});

/* ── 4 · One Ordinary/Sanctuary control at a time; default and consent unchanged ─────────────────────────────────── */
describe('4 · Ordinary/Sanctuary', () => {
  const groups = () => host.querySelectorAll('[aria-label="Ordinary or Sanctuary"]').length;
  async function toHold(storage: string | null) {
    if (storage !== null) localStorage.setItem('maia_settings', storage);
    apiFetch.mockResolvedValue({ ok: true, json: async () => ({ reply: 'So it is the cold wrench. Am I hearing that right?' }) });
    await act(async () => { root.render(React.createElement(StudioInspirationOpening, { busy: false, error: null })); });
    const box = host.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(box, 'The cold wrench in the rain.');
      box.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => { button('Tell MAIA').click(); });
    await flush();
    await act(async () => { button('Yes').click(); });
    await flush();
  }

  test('a fresh browser is Ordinary with exactly one control, and MAIA does not stop to ask', async () => {
    await toHold(null);
    expect(groups()).toBe(1);
    expect(host.textContent).not.toContain('Before I ask about keeping anything');
    expect(button('Ordinary').getAttribute('aria-pressed')).toBe('true');
  });

  test('an unreadable setting still asks first, and then shows ONE control (in the question), not two', async () => {
    await toHold('{not json');
    expect(host.textContent).toContain('Before I ask about keeping anything');
    expect(groups()).toBe(1);
    expect(button('Ordinary').getAttribute('aria-pressed')).toBe('false');
  });

  test('an explicit Sanctuary choice is respected', async () => {
    await toHold(JSON.stringify({ sanctuary: true }));
    expect(groups()).toBe(1);
    expect(button('Sanctuary').getAttribute('aria-pressed')).toBe('true');
  });
});

/* ── 5 · Invitation messages: used / expired / invalid, never account information ─────────────────────────────────── */
describe('5 · invitation messages', () => {
  test('the answer is a fact about the code only', () => {
    expect(invitationCheckAnswer(null)).toEqual({ valid: false, reason: 'invalid' });
    expect(invitationCheckAnswer({ used_up: true, expired: false })).toEqual({ valid: false, reason: 'used' });
    expect(invitationCheckAnswer({ used_up: true, expired: true })).toEqual({ valid: false, reason: 'used' });
    expect(invitationCheckAnswer({ used_up: false, expired: true })).toEqual({ valid: false, reason: 'expired' });
    expect(invitationCheckAnswer({ used_up: false, expired: false })).toEqual({ valid: true });
  });

  test('review 2026-11-16 #3: "expired" mirrors the registration claim, including an ended beta grant', () => {
    const route = read('app/api/doorway/check/route.ts');
    const claim = read('lib/studios/doorwayInvitations.ts');
    expect(claim).toContain('AND (beta_grant_until IS NULL OR beta_grant_until > now())');
    expect(claim).toContain('AND expires_at > now()');
    expect(route).toContain('(expires_at <= now() OR (beta_grant_until IS NOT NULL AND beta_grant_until <= now())) AS expired');
  });

  test('the route reads only open (unrevoked) invitations for this door and selects no account columns', () => {
    const route = read('app/api/doorway/check/route.ts');
    expect(route).toContain('WHERE code_hash = $1 AND studio = $2 AND revoked_at IS NULL');
    expect(route).not.toMatch(/member_id|email|issuer|issued_by|\bnote\b|cohort/);
  });

  async function door(reason: string) {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ valid: false, reason }) })) as never;
    await act(async () => {
      root.render(React.createElement(DoorwayJoin, { studio: 'writer', studioName: 'Writer’s Studio', selectedPath: 'college-essay', returnPath: '/writers-studio?path=college-essay' }));
    });
    const input = host.querySelector('#doorway-code') as HTMLInputElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'WRITER-TEST-0000-0000');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => { (host.querySelector('form') as HTMLFormElement).requestSubmit(); });
    await flush();
    return host.querySelector('[role="alert"]')?.textContent ?? '';
  }

  test('used: points to sign-in, never says whose', async () => {
    const text = await door('used');
    expect(text).toContain('This invitation has already been used.');
    expect(host.querySelector('[data-doorway-used-signin]')?.getAttribute('href')).toBe('/signin?next=%2Fwriters-studio%3Fpath%3Dcollege-essay');
    expect(text).not.toMatch(/@|account belongs|registered to/i);
  });

  test('expired: asks for a new one', async () => {
    expect(await door('expired')).toContain('This invitation has expired.');
    expect(host.querySelector('[data-doorway-used-signin]')).toBeNull();
  });

  test('invalid: the existing message, unchanged', async () => {
    expect(await door('invalid')).toContain('That code doesn’t open this door.');
  });
});
