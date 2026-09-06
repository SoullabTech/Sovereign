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
  it('every lookup completion is settled through the reading-addressed transition', () => {
    /* R2. The room must not merge a result into whatever state it happens to
       hold; `settleLookup` discards one belonging to a reading it has left. */
    const settles = [...ROOM.matchAll(/setStandings\(/g)]
      .map((m) => ROOM.slice(m.index ?? 0, (m.index ?? 0) + 120));
    expect(settles.length).toBeGreaterThan(0);
    for (const s of settles) expect(s).toMatch(/settleLookup|adoptInto|beginLookup|beginRefresh/);
    expect(ROOM).not.toMatch(/state: 'available'/);
    expect(ROOM).not.toMatch(/standings: \[\]/);
  });

  it('a refresh STARTS through the reading-addressed transition too', () => {
    /* Not only its completion: a stale conflict must not put the room into
       loading(otherReading). */
    /* `beginLookup` is right for a DELIBERATE change of reading — the room is
       the one changing it there. It is wrong for a refresh asked for by a
       component that may already be unmounted, so the refresh callback must not
       reach for it. */
    const from = ROOM.indexOf('const loadStandings');
    const refresh = ROOM.slice(from, ROOM.indexOf('useEffect', from));
    expect(refresh.length).toBeGreaterThan(0);
    expect(refresh).toMatch(/beginRefresh\(prev, readingId\)/);
    expect(refresh).not.toMatch(/beginLookup/);
  });

  it('a recorded event is adopted into the reading it belongs to', () => {
    expect(ROOM).toMatch(/onStanding\(readingId, r\.standing\)/);
    expect(ROOM).toMatch(/adoptInto\(prev, readingId, next\)/);
  });

  it('the view names the reading as well as the observation', () => {
    expect(ROOM).toMatch(/standingView\(standings, readingId, observationKey\)/);
  });

  it('the client never degrades a failure into an empty result', () => {
    expect(CLIENT).not.toMatch(/return \{ ok: true, standings: \[\] \}/);
    expect(CLIENT).toMatch(/refusal: 'unreachable'/);
  });

  it('the controls are disabled unless the expectation says the room may act', () => {
    expect(ROOM).toMatch(/disabled=\{!expectation\.canAct \|\| sending\}/);
  });

  it('the row sentence is decided by the one function that weighs unknown against a refusal', () => {
    expect(ROOM).toMatch(/standingRowSentence\(view, refusal\)/);
    expect(ROOM).not.toMatch(/as it now stands/);
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
