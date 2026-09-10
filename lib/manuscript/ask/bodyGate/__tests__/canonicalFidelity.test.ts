/**
 * S3 · P1 — THE KNOWN-BAD MODEL IS PINNED TO CANONICAL.
 *
 *   ⭐⭐ A "canonical-shaped" variant that nobody checked against canonical is a
 *       strawman, and beating a strawman is not evidence of a defect.
 *
 * R1's prohibited variant loads the revision with no disclosure authority. This
 * file asserts that the canonical developmental Ask route does exactly that, so
 * the red R1 result describes the system rather than the instrument.
 *
 * ⛔ COMMENTS ARE STRIPPED BEFORE SCANNING. The C21 repair earned this the hard
 * way: a file that documents its own compliance in prose will otherwise be read
 * as evidence of the behaviour it forbids.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..', '..');
const ROUTE = join(ROOT, 'app', 'api', 'sovereign', 'manuscripts', '[id]', 'ask', 'route.ts');

const stripComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const code = stripComments(readFileSync(ROUTE, 'utf8'));

describe('canonical fidelity of the R1 known-bad model', () => {
  it('⛔ the canonical route loads revision content', () => {
    expect(code).toMatch(/loadRevisionContent\(/);
  });

  it('⛔ the canonical route establishes NO disclosure boundary', () => {
    for (const seam of [
      'establishDisclosureBoundary', 'mayCrossBoundary', 'mintDisclosureAttempt',
      'confirmDisclosureCrossed', 'may_cross', 'BODY_AUTHORITY_REQUIRED',
    ]) {
      expect(code).not.toContain(seam);
    }
  });

  it('⛔ the loaded revision reaches the developmental context assembly', () => {
    expect(code).toMatch(/assembleDevelopmentalContext\(\{[\s\S]{0,200}revisionContent/);
  });

  it('⛔ nothing gates the load on the evidence requirement', () => {
    // `requirementOf` is what could decide "is body actually needed" before the
    // read. Canonical never consults it on this path.
    expect(code).not.toContain('requirementOf');
    expect(code).not.toContain('sectionIdsOf');
  });

  it('⭐ the substrate the repair will use is absent from canonical', () => {
    expect(code).not.toContain('pending_ask_claims');
    expect(code).not.toContain('pendingAskRef');
  });
});
