/**
 * GET /api/sovereign/studio/history — read doctrine.
 *
 * The danger on this route is not leakage; it is a category error that reads
 * as a feature. Current state looks exactly like history until you notice the
 * entries move. `manuscript_working_drafts.updated_at` would yield a plausible
 * "returned to X" line — and rewrite last week's history every time the member
 * writes today.
 *
 * ⚠️ Comments are stripped before scanning. The route documents its own
 * prohibitions, so a raw scan finds `updated_at` inside the paragraph banning
 * it (Circles C21, 2026-09-07: a prose ban must never read as the banned
 * behaviour returning).
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const RAW = readFileSync(join(__dirname, '..', 'route.ts'), 'utf8');
const CODE = RAW.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('history read route — doctrine', () => {
  it('is member-scoped by credential, not by a parameter', () => {
    expect(CODE).toContain('getMemberIdFromRequest');
    expect(CODE).toMatch(/if\s*\(!memberId\)\s*return[\s\S]{0,80}401/);
    expect(CODE).not.toMatch(/searchParams\.get\(\s*['"](memberId|member_id|userId)['"]\s*\)/);
  });

  it('⛔ never reads current state — every act is an immutable record', () => {
    /* The whole ruling, in one assertion. updated_at is CURRENT STATE: one row
       per manuscript, relocating to a new date on every write. */
    expect(CODE).not.toContain('updated_at');
    expect(CODE).not.toContain('lastWrittenAt');
    expect(CODE).not.toContain('last_written');
  });

  it('the comment strip is load-bearing, not decorative', () => {
    /* Proven, not assumed: the route's own doctrine paragraph names updated_at
       while forbidding it, so a raw scan would fail the file for explaining
       its compliance. If the prose changes and this stops holding, this test
       goes red rather than the strip quietly becoming a no-op. */
    expect(RAW).toContain('updated_at');
    expect(CODE).not.toContain('updated_at');
  });

  it("⛔ excludes the system's own initializing revision", () => {
    /* Revision 1 is written by the draft-creation path, not by the member.
       Excluded by note AND revision number together, so it can never swallow a
       real checkpoint on a draft that predates the initializing revision. */
    expect(CODE).toContain('SYSTEM_INITIAL_REVISION_NOTE');
    expect(CODE).toMatch(/r\.revision_number = 1 AND r\.note IS NOT DISTINCT FROM/);
  });

  it('⛔ does not choose between two Works claiming the same writing', () => {
    /* Living Work exclusivity is deliberately un-ruled. Picking one here would
       decide a constitutional question by accident. */
    expect(CODE).toMatch(/CASE WHEN count\(\*\) = 1 THEN min\(w\.title\) END/);
  });

  it('orders by when the act happened, and by nothing else', () => {
    const orderings = CODE.match(/ORDER BY[^`\n]*/g) ?? [];
    expect(orderings).toHaveLength(1);
    expect(orderings[0]).toMatch(/ORDER BY at DESC/);
    for (const banned of ['score', 'rank', 'relevance', 'RANDOM(', 'importance']) {
      expect(CODE.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });

  it('⛔ carries no summary, headline or count of a day', () => {
    /* There is nothing to derive one from, and no column to hold one. */
    for (const banned of ['summary', 'headline', 'digest', 'streak', 'total', 'count(*) as']) {
      expect(CODE.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });

  it('bounds the read without letting a caller unbound it', () => {
    expect(CODE).toMatch(/Math\.min\([\s\S]{0,40}MAX_LIMIT\)/);
  });
});
