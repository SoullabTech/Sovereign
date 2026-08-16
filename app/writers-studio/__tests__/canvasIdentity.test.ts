/**
 * The producer → consumer round trip.
 *
 * The defect these tests exist to prevent was not "the URL lacks a value".
 * The URL had a value. Home wrote `?id=` and the Canvas read `?m`, so the
 * Canvas discarded the identity and fell back to the first manuscript in its
 * list — and every check short of following the parameter through both sides
 * passed. "Continue writing Elemental Alchemy" opened whatever was first.
 *
 * So these tests never assert that a href contains something. They take the
 * exact string the Home renders, feed it to the exact reader the Canvas uses,
 * and assert on the manuscript that comes out the other end.
 */

import {
  CANVAS_MANUSCRIPT_PARAM,
  canvasForManuscript,
  identityHonoured,
  requestedManuscriptId,
  selectManuscript,
} from '../canvasIdentity';
import { CANVAS_HREF } from '../studioMap';

const M = (id: string) => ({ id });
const ALCHEMY = M('ms-alchemy');
const SECOND = M('ms-second');
const NOTES = M('ms-notes');
/* Deliberately NOT in id order, and the wanted one is NOT first — a fallback
   to manuscripts[0] must therefore be visible as a wrong answer. */
const LIBRARY = [SECOND, ALCHEMY, NOTES];

/** Exactly what a click does: render the href, then read it as the Canvas does. */
const followLink = (href: string) => {
  const query = href.includes('?') ? href.slice(href.indexOf('?')) : '';
  const requested = requestedManuscriptId(query);
  const selected = selectManuscript(requested, LIBRARY);
  return { requested, selected, honoured: identityHonoured(requested, selected) };
};

describe('Canvas identity — the round trip Home relies on', () => {
  it('lands on the work that was clicked, not the first in the list', () => {
    const { selected, honoured } = followLink(canvasForManuscript(CANVAS_HREF, ALCHEMY.id));
    expect(selected).toBe(ALCHEMY);
    expect(honoured).toBe(true);
    /* The negative half: a fallback would have produced SECOND. If this ever
       passes while the assertion above fails, the parameter has drifted. */
    expect(selected).not.toBe(LIBRARY[0]);
  });

  it('lands on each work in turn — no single lucky case', () => {
    for (const wanted of LIBRARY) {
      const { selected } = followLink(canvasForManuscript(CANVAS_HREF, wanted.id));
      expect(selected).toBe(wanted);
    }
  });

  it('FAILS the round trip when the producer uses a different parameter name', () => {
    /* This is the shipped defect, written down. `?id=` is what the rebuilt
       Home sent before the correction. */
    const wrong = `${CANVAS_HREF}?id=${ALCHEMY.id}`;
    const { requested, selected, honoured } = followLink(wrong);
    expect(requested).toBeNull();
    expect(selected).toBe(SECOND); // silently the wrong manuscript
    expect(honoured).toBe(true); // and it does not even look dishonoured
  });

  it('honours identity on a base that already carries a query', () => {
    const href = canvasForManuscript(`${CANVAS_HREF}?tab=draft`, ALCHEMY.id);
    expect(href).toContain('?tab=draft&');
    expect(followLink(href).selected).toBe(ALCHEMY);
  });

  it('degrades rather than stranding when the asked-for manuscript is gone', () => {
    const { selected, honoured } = followLink(canvasForManuscript(CANVAS_HREF, 'ms-deleted'));
    expect(selected).toBe(SECOND);
    expect(honoured).toBe(false); // the ask was overridden — a defect, not a degradation
  });

  it('asks for nothing when there is no manuscript to ask for', () => {
    expect(canvasForManuscript(CANVAS_HREF, null)).toBe(CANVAS_HREF);
    expect(followLink(CANVAS_HREF).requested).toBeNull();
  });

  it('selects nothing from an empty library rather than throwing', () => {
    expect(selectManuscript('ms-alchemy', [])).toBeNull();
  });

  it('pins the parameter name — the Canvas reads this exact string', () => {
    expect(CANVAS_MANUSCRIPT_PARAM).toBe('m');
  });
});
