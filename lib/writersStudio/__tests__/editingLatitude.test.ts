/**
 * WS-EDITORIAL-SCOPE-01 · L3 IS THE ONE THAT MATTERS.
 *
 * ⭐ If a stored paragraph permission ever survives a reload, the writer can be
 * shown a deletion under a permission they granted weeks ago and have no reason
 * to remember giving.
 */

import {
  LATITUDE_STORAGE_KEY, persistableLatitude, restoreDeclaration,
} from '../editingLatitude';
import { DEFAULT_EDITORIAL_LATITUDE } from '@/lib/manuscript/editorialScope/contract';

describe('WS-EDITORIAL-SCOPE-01 · the author\'s remembered controls', () => {
  it('L1 · a stored latitude is restored', () => {
    expect(restoreDeclaration('3').latitude).toBe(3);
    expect(restoreDeclaration('5').latitude).toBe(5);
  });

  it('L2 · nothing stored is the protective default', () => {
    expect(restoreDeclaration(null).latitude).toBe(DEFAULT_EDITORIAL_LATITUDE);
  });

  it('L3 · ⭐⭐ the paragraph permission NEVER survives, whatever is stored', () => {
    for (const stored of [null, '1', '5', 'true', '{"mayRemoveParagraphs":true}', '']) {
      expect(restoreDeclaration(stored).mayRemoveParagraphs).toBe(false);
    }
  });

  it('L4 · ⛔ an unreadable value is the default, never a guess or a throw', () => {
    for (const junk of ['', 'x', '0', '6', '-1', '2.5', 'NaN', '[]']) {
      expect(restoreDeclaration(junk).latitude).toBe(DEFAULT_EDITORIAL_LATITUDE);
    }
  });

  it('L5 · ⛔ what is written down carries the latitude and nothing else', () => {
    expect(persistableLatitude(4)).toBe('4');
    expect(persistableLatitude(4)).not.toMatch(/paragraph/i);
  });

  it('L6 · the storage key is stable — a rename silently resets every writer', () => {
    expect(LATITUDE_STORAGE_KEY).toBe('ws_editing_latitude');
  });
});
