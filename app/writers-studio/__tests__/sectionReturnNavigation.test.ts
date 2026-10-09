/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { locationForSection, replacePlaceAddress, STUDIO_PLACE_CHANGE_EVENT } from '@/lib/writersStudio/placeInWork';

describe('Writer’s Studio: chapter → back-matter section return', () => {
  const initial = '/writers-studio?mode=write&m=test-work&s=chapter-10';
  beforeEach(() => window.history.replaceState(null, '', initial));
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('avoids an unnecessary history write while clearing an absent editorial thread', () => {
    const calls = jest.spyOn(window.history, 'replaceState');
    const events = jest.fn();
    window.addEventListener(STUDIO_PLACE_CHANGE_EVENT, events);
    try {
      const same = locationForSection(window.location.pathname, window.location.search, 'chapter-10');
      replacePlaceAddress(same);
      expect(calls).not.toHaveBeenCalled();
      expect(events).not.toHaveBeenCalled();
    } finally {
      calls.mockRestore();
      window.removeEventListener(STUDIO_PLACE_CHANGE_EVENT, events);
    }
  });

  it('puts the selected section in the real URL, emits one place change and keeps manuscript identity', () => {
    const events = jest.fn();
    window.addEventListener(STUDIO_PLACE_CHANGE_EVENT, events);
    try {
      const next = locationForSection(window.location.pathname, window.location.search, 'conclusion');
      replacePlaceAddress(next);
      const url = new URL(window.location.href);
      expect(url.searchParams.get('m')).toBe('test-work');
      expect(url.searchParams.get('mode')).toBe('write');
      expect(url.searchParams.get('s')).toBe('conclusion');
      expect(events).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener(STUDIO_PLACE_CHANGE_EVENT, events);
    }
  });

  it('controller reuses no-op-aware place updates when clearing editorial state, not unconditional history writes', () => {
    const source = readFileSync('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx', 'utf8');
    const beginning = source.indexOf('  const clearEditorial = useCallback(() => {');
    const ending = source.indexOf('  const moveCraftFocus = useCallback', beginning);
    expect(beginning).toBeGreaterThan(0);
    expect(ending).toBeGreaterThan(beginning);
    const reset = source.slice(beginning, ending);
    expect(reset).toContain('replacePlaceAddress(canvasWithoutEditorialThread(');
    expect(reset).not.toContain('window.history.replaceState(');
    expect(source).toContain('replacePlaceAddress(locationForSection(window.location.pathname, window.location.search, sectionId))');
  });
});
