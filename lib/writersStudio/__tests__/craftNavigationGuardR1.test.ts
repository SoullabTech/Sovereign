import type { CraftTableSnapshot } from '../craftFocusR1';
import { assessCraftNavigation, craftNavigationRefusal } from '../craftNavigationGuardR1';

const original = 'The lantern waits beside the river.';
const kept = [{ start: 4, end: 11, text: 'lantern' }];

function snapshot(change: Partial<CraftTableSnapshot> = {}): CraftTableSnapshot {
  return {
    key: 'fiction-only-focus', candidateVersion: null,
    decisions: [], manualText: null, manualFromVersionId: null,
    directDraft: '', directEditing: false, customDraft: '',
    customEditId: null, writerHasActed: false, activeEditId: null,
    view: 'preview', notation: 'guided', kept: [],
    workingText: original, original,
    ...change,
  };
}

describe('JARVIS Craft navigation has one author-draft loss guard', () => {
  it('refuses movement when the active Table has no current snapshot', () => {
    expect(assessCraftNavigation(null)).toEqual({ allowed: false, reason: 'unavailable' });
  });

  it('refuses an unfinished direct-write textarea, even if the original still renders', () => {
    expect(assessCraftNavigation(snapshot({
      directEditing: true, directDraft: 'FICTIONAL UNSAVED WORDING',
    }))).toEqual({ allowed: false, reason: 'composing' });
  });

  it('refuses an unfinished custom edit on one marked word', () => {
    expect(assessCraftNavigation(snapshot({
      customEditId: 2, customDraft: 'FICTIONAL PERSONAL ALTERNATIVE',
    }))).toEqual({ allowed: false, reason: 'composing' });
  });

  it('allows movement only when no writer working copy or annotation would be lost', () => {
    expect(assessCraftNavigation(snapshot())).toEqual({ allowed: true });
    expect(assessCraftNavigation(snapshot({
      candidateVersion: { id: 'v1', author: 'maia', supersedes: null,
        wording: 'FICTIONAL alternative', rationale: 'Proposed only' },
    }))).toEqual({ allowed: true });
  });

  it('protects a committed but unsaved new working version', () => {
    expect(assessCraftNavigation(snapshot({
      manualText: 'The lantern waits by the river.',
      workingText: 'The lantern waits by the river.', writerHasActed: true,
    }))).toEqual({ allowed: false, reason: 'unsaved' });
  });

  it('protects author-selected marks even when they keep the original wording', () => {
    expect(assessCraftNavigation(snapshot({
      kept, writerHasActed: true,
    }))).toEqual({ allowed: false, reason: 'unsaved' });
  });

  it('permits a matching member-saved wording only without session-only marks', () => {
    const revised = 'The lantern shines beside the river.';
    const candidateVersion = { id: 'author-v1', author: 'member' as const,
      supersedes: null, wording: revised, rationale: 'Written by author' };
    expect(assessCraftNavigation(snapshot({
      candidateVersion, kept: [], workingText: revised, writerHasActed: true,
    }))).toEqual({ allowed: true });
  });

  it('refuses a saved member version that no longer matches the local copy', () => {
    expect(assessCraftNavigation(snapshot({
      candidateVersion: { id: 'v1', author: 'member', supersedes: null,
        wording: 'A previously saved version', rationale: 'Saved' },
      workingText: 'FICTIONAL newer unsaved change',
    }))).toEqual({ allowed: false, reason: 'unsaved' });
  });

  it('refuses to treat session-held marks as persisted by the wording-only version', () => {
    expect(assessCraftNavigation(snapshot({
      candidateVersion: { id: 'v1', author: 'member', supersedes: null,
        wording: original, rationale: 'Saved' },
      kept,
    }))).toEqual({ allowed: false, reason: 'unsaved' });
  });

  it('never tells the writer that a blocked navigation saved or applied anything', () => {
    for (const reason of ['unavailable', 'composing', 'unsaved'] as const) {
      const text = craftNavigationRefusal(reason);
      expect(text).toMatch(/nothing was (moved or applied|applied)/i);
      expect(text).not.toMatch(/successfully saved|changes were applied|version was saved/i);
    }
  });
});
