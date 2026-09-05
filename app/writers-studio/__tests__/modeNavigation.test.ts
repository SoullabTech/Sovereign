/**
 * THE MODE SEAM — a switch of stance may never lose or guess the Work.
 *
 * When the mode bar was written, Write was the only room and the writer was
 * already standing in it, so no mode had to carry anyone anywhere and every
 * mode was an inert span. BUILD-07D built the Develop room. An available mode
 * must now actually go there, holding the same Work.
 *
 * canvasIdentity.ts records why this file exists in its own words: a link is
 * not a binding. Home once shipped `?id=` while the Canvas read `?m`, so the
 * Canvas silently opened a DIFFERENT manuscript and every check still passed —
 * the control had an href, the href carried a value, the route resolved, the
 * page rendered. What none of it established was that the producer's parameter
 * matched the consumer's. So these assertions are round trips, not string
 * matches: what the bar composes is read back by what the room reads.
 */

import * as fs from 'fs';
import * as path from 'path';
import { CANVAS_HREF, DEVELOP_HREF, STUDIO_MODES, assertModesHonest } from '../studioMap';
import { canvasForManuscript, requestedManuscriptId } from '../canvasIdentity';

const src = (...p: string[]) =>
  fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');

const WORK = 'a2f1c0de-0000-4000-8000-000000000001';

describe('a mode switch carries the Work', () => {
  it('Write → Develop: what the bar composes is what the room reads', () => {
    const href = canvasForManuscript(DEVELOP_HREF, WORK);
    expect(href.startsWith(DEVELOP_HREF)).toBe(true);
    expect(requestedManuscriptId(href.slice(href.indexOf('?')))).toBe(WORK);
  });

  it('Develop → Write: the same Work returns, not the most recent one', () => {
    const href = canvasForManuscript(CANVAS_HREF, WORK);
    expect(requestedManuscriptId(href.slice(href.indexOf('?')))).toBe(WORK);
  });

  it('a Work id that needs encoding survives the round trip intact', () => {
    const odd = 'a b/c?d&e=f';
    const href = canvasForManuscript(DEVELOP_HREF, odd);
    expect(href).not.toContain(' ');
    expect(requestedManuscriptId(href.slice(href.indexOf('?')))).toBe(odd);
  });

  it('with no Work on the table, no destination is fabricated', () => {
    expect(canvasForManuscript(DEVELOP_HREF, null)).toBe(DEVELOP_HREF);
  });
});

describe('the bar navigates exactly where a room exists', () => {
  it('every available mode has somewhere to go; no unavailable mode pretends', () => {
    expect(() => assertModesHonest()).not.toThrow();
    for (const m of STUDIO_MODES) {
      if (m.availability === 'available') expect(m.href).toBeTruthy();
      else expect(m.href).toBeUndefined();
    }
  });

  it('two rooms are built, and they are Write and Develop', () => {
    expect(STUDIO_MODES.filter((m) => m.availability === 'available').map((m) => m.id))
      .toEqual(['write', 'develop']);
  });

  it('the bar composes its href through the single identity definition, never by hand', () => {
    const bar = src('studio', 'StudioModeBar.tsx');
    expect(bar).toContain('canvasForManuscript');
    /* No inlined parameter name: that is the 2026-08-14 defect's exact shape. */
    expect(bar).not.toMatch(/['"`]\?m=/);
    expect(bar).not.toMatch(/['"`]&m=/);
  });

  it('an unavailable mode is not a link, and neither is a mode with no Work to bring', () => {
    const bar = src('studio', 'StudioModeBar.tsx');
    expect(bar).toContain("manuscriptId !== null");
    expect(bar).toContain("'needs-work'");
    /* "not built" and "nothing to bring" stay distinguishable to a reader. */
    expect(bar).toContain("'unavailable'");
  });

  it('the Canvas hands the bar the Work it is holding', () => {
    expect(src('canvas', 'page.tsx')).toContain('<StudioModeBar current="write" manuscriptId=');
  });
});
