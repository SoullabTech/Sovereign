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
  canvasHrefFor,
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
  const selection = selectManuscript(requested, LIBRARY);
  return { requested, selection, honoured: identityHonoured(requested, selection) };
};

/** What the room actually puts on the table. Null means it refused. */
const opened = (href: string) => {
  const { selection } = followLink(href);
  return selection.kind === 'found' ? selection.manuscript : null;
};

describe('Canvas identity — the round trip Home relies on', () => {
  it('lands on the work that was clicked, not the first in the list', () => {
    const href = canvasForManuscript(CANVAS_HREF, ALCHEMY.id);
    expect(opened(href)).toBe(ALCHEMY);
    expect(followLink(href).honoured).toBe(true);
    /* The negative half: a fallback would have produced SECOND. If this ever
       passes while the assertion above fails, the parameter has drifted. */
    expect(opened(href)).not.toBe(LIBRARY[0]);
  });

  it('lands on each work in turn — no single lucky case', () => {
    for (const wanted of LIBRARY) {
      expect(opened(canvasForManuscript(CANVAS_HREF, wanted.id))).toBe(wanted);
    }
  });

  it('honours identity on a base that already carries a query', () => {
    const href = canvasForManuscript(`${CANVAS_HREF}?tab=draft`, ALCHEMY.id);
    expect(href).toContain('?tab=draft&');
    expect(opened(href)).toBe(ALCHEMY);
  });

  it('pins the parameter name — the Canvas reads this exact string', () => {
    expect(CANVAS_MANUSCRIPT_PARAM).toBe('m');
  });
});

/**
 * ── D-008 · the consumer may not compensate for a lost or invalid identity ──
 *
 * Founder-caught in production twice. These are not style assertions: each one
 * is a shape the room shipped, and each shipped as a confident render of the
 * wrong writing under the right name.
 */
describe('D-008 — an identity failure may never look like a retrieval', () => {
  it('refuses a named manuscript that is not on the shelf — ZERO substitute', () => {
    const { selection, honoured } = followLink(canvasForManuscript(CANVAS_HREF, 'ms-deleted'));
    expect(selection.kind).toBe('missing');
    expect(selection).toEqual({ kind: 'missing', requested: 'ms-deleted' });
    expect(opened(canvasForManuscript(CANVAS_HREF, 'ms-deleted'))).toBeNull();
    expect(honoured).toBe(false);
  });

  it('opens NOTHING when no identity was named — the 2026-08-27 failure', () => {
    /* A work with no manuscript attached produced exactly this URL, and the
       room answered with "The most recent of your 4 manuscripts is on the
       table" — a 5-page transcript under that work's name. */
    const { selection } = followLink(CANVAS_HREF);
    expect(selection.kind).toBe('unnamed');
    expect(opened(CANVAS_HREF)).toBeNull();
  });

  it('refuses a drifted parameter instead of silently opening the first', () => {
    /* `?id=` is what the rebuilt Home sent before the 2026-08-14 correction.
       It is unreadable to the Canvas, so it must open nothing — where it once
       opened SECOND and did not even look dishonoured. */
    const { requested, selection } = followLink(`${CANVAS_HREF}?id=${ALCHEMY.id}`);
    expect(requested).toBeNull();
    expect(selection.kind).toBe('unnamed');
    expect(opened(`${CANVAS_HREF}?id=${ALCHEMY.id}`)).toBeNull();
  });

  it('refuses rather than throwing when the shelf is empty', () => {
    expect(selectManuscript('ms-alchemy', [])).toEqual({
      kind: 'missing',
      requested: 'ms-alchemy',
    });
  });
});

/**
 * ── D-010 · the producer may not lose or invent identity ────────────────────
 *
 * There must be no way to build a Canvas href that the producer believes names
 * a writing while it names nothing. F-1 was exactly that: `manuscriptIdOf(w)`
 * returned null for a work with no manuscript, and the href builder answered
 * with a bare Canvas URL.
 */
describe('D-010 — a control that cannot name a writing must not open one', () => {
  it('gives no href at all when there is no identity to send', () => {
    expect(canvasHrefFor(CANVAS_HREF, null)).toBeNull();
  });

  it('gives a real href when there is', () => {
    expect(canvasHrefFor(CANVAS_HREF, ALCHEMY.id)).toBe(
      canvasForManuscript(CANVAS_HREF, ALCHEMY.id),
    );
  });

  it('has no null-shaped href that quietly means "open something"', () => {
    /* The type forbids it; this pins the behaviour against a future signature
       loosened back to `string | null`. An empty id is the nearest legal
       expression of "I have nothing", and it must not resolve to a manuscript. */
    expect(opened(canvasForManuscript(CANVAS_HREF, ''))).toBeNull();
  });
});
