/**
 * @jest-environment jsdom
 *
 * WS-DEVELOP density views, B1 (spec §10 R2, §11.4, §13.1, 2026-11-09).
 * The View preference belongs to one signed-in writer; a temporary choice belongs to one
 * Work for one browser session; the legacy unscoped preference is never adopted.
 * Fictional member and work ids only.
 */
import {
  PRESENTATION_STORAGE_KEY,
  __setPresentationMemberResolver,
  clearWorkPresentationOverride,
  hasWorkPresentationOverride,
  presentationKeyFor,
  readStudioPresentation,
  subscribeStudioPresentation,
  writeStudioPresentation,
} from '../presentationRequests';

const INES = '11111111-1111-4111-8111-111111111111';
const TOMAS = '22222222-2222-4222-8222-222222222222';
const SALT = 'work-salt-orchard';
const LEDGER = 'work-ledger';

let member: string | null = INES;
beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  member = INES;
  __setPresentationMemberResolver(() => member);
});
afterAll(() => __setPresentationMemberResolver(null));

describe('writer isolation (falsifier f)', () => {
  it('a second writer on the same browser does not inherit the first writer’s view', () => {
    writeStudioPresentation({ depth: 'full' });
    expect(readStudioPresentation().depth).toBe('full');
    member = TOMAS;
    expect(readStudioPresentation().depth).toBe('focused');
    member = INES;
    expect(readStudioPresentation().depth).toBe('full');
  });

  it('stores under the writer’s own key, never the unscoped key', () => {
    writeStudioPresentation({ depth: 'guided' });
    expect(window.localStorage.getItem(PRESENTATION_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(presentationKeyFor(INES))).toBe(JSON.stringify({ depth: 'guided' }));
  });

  it('with no signed-in writer: Quiet, and nothing is written', () => {
    member = null;
    writeStudioPresentation({ depth: 'full' });
    expect(readStudioPresentation().depth).toBe('focused');
    expect(window.localStorage.length).toBe(0);
  });
});

describe('legacy unscoped preference (§13.1)', () => {
  it('is never adopted by the signed-in writer and is left untouched', () => {
    window.localStorage.setItem(PRESENTATION_STORAGE_KEY, JSON.stringify({ depth: 'full' }));
    expect(readStudioPresentation().depth).toBe('focused');
    writeStudioPresentation({ depth: 'guided' });
    expect(window.localStorage.getItem(PRESENTATION_STORAGE_KEY)).toBe(JSON.stringify({ depth: 'full' }));
  });
});

describe('temporary choice for one Work (falsifier h)', () => {
  it('outranks the default for that Work only, and survives a re-read (refresh)', () => {
    writeStudioPresentation({ depth: 'guided' });
    writeStudioPresentation({ depth: 'full' }, { workId: LEDGER, temporary: true });
    expect(readStudioPresentation({ workId: LEDGER }).depth).toBe('full');
    expect(readStudioPresentation({ workId: SALT }).depth).toBe('guided');
    expect(readStudioPresentation().depth).toBe('guided');
    expect(hasWorkPresentationOverride(LEDGER)).toBe(true);
    expect(hasWorkPresentationOverride(SALT)).toBe(false);
  });

  it('ends with the browser session and when cleared', () => {
    writeStudioPresentation({ depth: 'guided' });
    writeStudioPresentation({ depth: 'full' }, { workId: LEDGER, temporary: true });
    clearWorkPresentationOverride(LEDGER);
    expect(readStudioPresentation({ workId: LEDGER }).depth).toBe('guided');
    writeStudioPresentation({ depth: 'full' }, { workId: LEDGER, temporary: true });
    window.sessionStorage.clear(); // browser session ends
    expect(readStudioPresentation({ workId: LEDGER }).depth).toBe('guided');
  });

  it('is not visible to another writer for the same Work', () => {
    writeStudioPresentation({ depth: 'full' }, { workId: LEDGER, temporary: true });
    member = TOMAS;
    expect(readStudioPresentation({ workId: LEDGER }).depth).toBe('focused');
  });
});

describe('storage failure', () => {
  it('falls back to Quiet without throwing', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => writeStudioPresentation({ depth: 'full' })).not.toThrow();
    expect(readStudioPresentation().depth).toBe('focused');
    spy.mockRestore(); set.mockRestore();
  });
});

describe('subscribers', () => {
  it('in-tab change re-reads through precedence for the subscriber’s Work', () => {
    const seen: string[] = [];
    const off = subscribeStudioPresentation(p => seen.push(p.depth), { workId: SALT });
    writeStudioPresentation({ depth: 'full' }, { workId: LEDGER, temporary: true });
    writeStudioPresentation({ depth: 'guided' });
    off();
    expect(seen).toEqual(['guided']);
  });

  it('a default change does not reach a Work whose temporary choice is in effect', () => {
    const seen: string[] = [];
    writeStudioPresentation({ depth: 'full' }, { workId: LEDGER, temporary: true });
    const off = subscribeStudioPresentation(p => seen.push(p.depth), { workId: LEDGER });
    writeStudioPresentation({ depth: 'guided' });
    clearWorkPresentationOverride(LEDGER);
    off();
    expect(seen).toEqual(['guided']);
  });

  it('a choice that cannot be stored still holds for this session (no writer, blocked storage)', () => {
    member = null;
    const seen: string[] = [];
    const off = subscribeStudioPresentation(p => seen.push(p.depth));
    writeStudioPresentation({ depth: 'full' });
    off();
    expect(seen).toEqual(['full']);
  });

  it('cross-tab change reacts only to the signed-in writer’s own key', () => {
    const seen: string[] = [];
    const off = subscribeStudioPresentation(p => seen.push(p.depth));
    window.localStorage.setItem(presentationKeyFor(TOMAS), JSON.stringify({ depth: 'full' }));
    window.dispatchEvent(new StorageEvent('storage', { key: presentationKeyFor(TOMAS) }));
    window.localStorage.setItem(presentationKeyFor(INES), JSON.stringify({ depth: 'guided' }));
    window.dispatchEvent(new StorageEvent('storage', { key: presentationKeyFor(INES) }));
    off();
    expect(seen).toEqual(['guided']);
  });
});
