/**
 * WS2-07 · BUILD-07F — the Develop room's standing axis, at the source.
 *
 * Comments are stripped first: this file's subject discusses at length the
 * things it must not do, and a check that counted prose would pass for the
 * wrong reason.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const ROOM = strip(readFileSync(join(ROOT, 'app/writers-studio/develop/DevelopRoom.tsx'), 'utf8'));
const CLIENT = strip(readFileSync(join(ROOT, 'lib/writersStudio/standingClient.ts'), 'utf8'));

describe('the room can tell unknown from unset', () => {
  it('a failed lookup becomes `unavailable`, never an empty list', () => {
    expect(ROOM).toMatch(/r\.ok \? \{ state: 'available', standings: r\.standings \} : \{ state: 'unavailable' \}/);
    expect(ROOM).not.toMatch(/standings: \[\]/);
  });

  it('the client never degrades a failure into an empty result', () => {
    expect(CLIENT).not.toMatch(/return \{ ok: true, standings: \[\] \}/);
    expect(CLIENT).toMatch(/refusal: 'unreachable'/);
  });

  it('the controls are disabled unless the expectation says the room may act', () => {
    expect(ROOM).toMatch(/disabled=\{!expectation\.canAct \|\| sending\}/);
  });

  it('the token sent is the one the expectation produced, never invented', () => {
    expect(ROOM).toMatch(/expectedCurrentEventId: expectation\.expectedCurrentEventId/);
    expect(ROOM).not.toMatch(/expectedCurrentEventId: null,?\s*\}\)/);
  });
});

describe('standing changes the member row and nothing else', () => {
  it('carries the compound surface identity', () => {
    expect(ROOM).toMatch(/key=\{standingSurfaceKey\(readingId, o\.key\)\}/);
  });

  it('offers exactly three choices and no fourth', () => {
    expect(ROOM).toMatch(/\['keep', 'dismiss', 'unresolved'\] as const/);
    expect(ROOM).not.toMatch(/'investigate'/);
    expect(ROOM).not.toMatch(/'unset'/);
  });

  it('has no deselect, clear or delete gesture', () => {
    for (const gesture of ['Clear', 'clearStanding', 'deleteStanding', 'method: \'DELETE\'']) {
      expect(ROOM).not.toContain(gesture);
      expect(CLIENT).not.toContain(gesture);
    }
  });

  it('never hides, fades, strikes through or reorders the observation by standing', () => {
    /* The observation's own opacity is driven by its measured state, never by
       what the writer decided about it. */
    expect(ROOM).not.toMatch(/line-through/);
    expect(ROOM).not.toMatch(/standing[\s\S]{0,40}(display: 'none'|hidden)/);
    expect(ROOM).not.toMatch(/opacity:[^\n]*view\.standing/);
    expect(ROOM).not.toMatch(/sort\([^)]*standing/);
  });

  it('does not retry a conflict on the writer\'s behalf', () => {
    expect(ROOM).not.toMatch(/take\(standing\)[\s\S]{0,200}take\(/);
    expect(CLIENT).not.toMatch(/retry|setTimeout/i);
  });
});

describe('history is retained, not rendered', () => {
  it('the room shows no history, count or frequency of standings', () => {
    /* `window.history` is the URL and is not this. The terms guarded here are
       the ones that would mean the STREAM had been surfaced. */
    for (const forbidden of ['eventIndex', 'standingHistory', 'changedCount', 'reversal', 'recordedAt']) {
      expect(ROOM).not.toContain(forbidden);
    }
  });
});
