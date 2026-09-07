/**
 * GET /api/sovereign/keeps — read doctrine.
 *
 * This route carries the member's own sentences back onto Studio Home. The
 * danger is not that it leaks; it is that it quietly becomes a curator. A
 * single ORDER BY that scores, or one join reaching into section bodies at
 * large, turns "the lines you marked" into "the lines we chose for you" with
 * no member gesture underneath — and nothing in the rendering would show it.
 *
 * ⚠️ The scan STRIPS COMMENTS FIRST. Learned at cost on 2026-09-07 (Circles
 * C21): the route documents its own prohibitions in prose, so a scanner
 * reading raw source finds the banned string in the sentence banning it and
 * fails the file precisely because that file states its compliance. A prose
 * ban must never read as the banned behaviour returning.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const RAW = readFileSync(join(__dirname, '..', 'route.ts'), 'utf8');

/** Block and line comments removed; string literals are left intact. */
const CODE = RAW.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('keeps read route — doctrine', () => {
  it('is member-scoped by credential, not by a parameter', () => {
    expect(CODE).toContain('getMemberIdFromRequest');
    expect(CODE).toContain('k.member_id = $1');
    /* No caller-supplied member may reach the query. */
    expect(CODE).not.toMatch(/searchParams\.get\(\s*['"](memberId|member_id|userId)['"]\s*\)/);
  });

  it('refuses an unauthenticated read rather than returning an empty list', () => {
    /* An empty list would tell a signed-out member they have marked nothing. */
    expect(CODE).toMatch(/if\s*\(!memberId\)\s*return[\s\S]{0,80}401/);
  });

  it('⛔ orders by the member act only — it never ranks, scores or selects', () => {
    const orderings = CODE.match(/ORDER BY[^`]*/g) ?? [];
    expect(orderings).toHaveLength(1);
    expect(orderings[0]).toMatch(/ORDER BY\s+k\.created_at\s+DESC/);
    for (const banned of ['score', 'rank', 'relevance', 'similarity', 'RANDOM(', 'embedding']) {
      expect(CODE.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });

  it('⛔ never reads section body text — only passages the member kept', () => {
    /* manuscript_sections is joined for the HEADING a keep belongs under.
       Reaching for s.body would make the whole book available to a surface
       that has no gesture authorizing it. */
    expect(CODE).toContain('manuscript_keeps');
    expect(CODE).not.toMatch(/\bs\.body\b/);
    expect(CODE).not.toMatch(/\bbody\b\s*:/);
  });

  it('carries provenance with every line, never separately', () => {
    for (const field of ['manuscriptId', 'manuscriptTitle', 'heading']) {
      expect(CODE).toContain(field);
    }
  });

  it('returns the kept characters unaltered', () => {
    /* The member's text is not the Studio's to tidy: no trim, no normalize,
       no ellipsis, no case change on the way out. */
    expect(CODE).toMatch(/text:\s*r\.verbatim_text/);
    expect(CODE).not.toMatch(/verbatim_text\s*\.\s*(trim|slice|substring|normalize|toLowerCase)/);
  });

  it('the comment strip is load-bearing, not decorative', () => {
    /* Not a hypothetical. This route's own doctrine paragraph reads "Nothing
       on this path infers, ranks, scores or interprets" — so the RAW source
       contains 'ranks' and 'scores', and the ranking check above would fail
       this file precisely because the file states it does not rank.

       Asserted rather than assumed: if someone later rewrites the prose and
       this stops being true, this test goes red and tells them the strip is
       now unproven — instead of the strip quietly becoming a no-op that
       nobody notices until it is needed. */
    expect(RAW.toLowerCase()).toContain('ranks');
    expect(RAW.toLowerCase()).toContain('scores');
    expect(CODE.toLowerCase()).not.toContain('rank');
    expect(CODE.toLowerCase()).not.toContain('score');
  });

  it('bounds the read without letting a caller unbound it', () => {
    expect(CODE).toContain('MAX_LIMIT');
    expect(CODE).toMatch(/Math\.min\([\s\S]{0,40}MAX_LIMIT\)/);
  });
});
