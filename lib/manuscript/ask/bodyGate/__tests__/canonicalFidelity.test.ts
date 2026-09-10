/**
 * S3 · P1 — THE KNOWN-BAD MODEL IS PINNED TO CANONICAL, AND STAYS PINNED.
 *
 *   ⭐⭐ A "canonical-shaped" variant that nobody checked against canonical is a
 *       strawman, and beating a strawman is not evidence of a defect.
 *
 * ⚠️ THIS FILE READS THE ROUTE AT A NAMED COMMIT, NOT THE WORKING TREE. The first
 * version read the working tree and went red the moment the repair landed —
 * correctly, and for the wrong reason: it was asserting that the DEFECT still
 * existed. A pin that dissolves when the thing it pins is fixed was never a pin.
 * The subject of R1 is canonical `c509976b5`, so the subject of this file is
 * canonical `c509976b5`.
 *
 * ⛔ COMMENTS ARE STRIPPED BEFORE SCANNING — the C21 repair earned this: a file
 * documenting its own compliance in prose is otherwise read as evidence of the
 * behaviour it forbids.
 */

import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..', '..');
const ROUTE = 'app/api/sovereign/manuscripts/[id]/ask/route.ts';

/** The commit R1's known-bad model describes. ⛔ Never "HEAD". */
const CANONICAL = 'c509976b5';

const stripComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

let canonical: string | null = null;
try {
  canonical = stripComments(
    execFileSync('git', ['show', `${CANONICAL}:${ROUTE}`], { cwd: ROOT, encoding: 'utf8' }),
  );
} catch {
  canonical = null;
}

const working = stripComments(readFileSync(join(ROOT, ROUTE), 'utf8'));

describe('canonical fidelity of the R1 known-bad model', () => {
  /* ⛔ A missing commit must be loud. Silently passing would let the pin rot. */
  it('the canonical route is readable at the named commit', () => {
    expect(canonical).not.toBeNull();
  });

  it('⛔ canonical loads revision content', () => {
    expect(canonical).toMatch(/loadRevisionContent\(/);
  });

  it('⛔ canonical establishes NO disclosure boundary', () => {
    for (const seam of [
      'establishDisclosureBoundary', 'mayCrossBoundary', 'mintDisclosureAttempt',
      'confirmDisclosureCrossed', 'BODY_AUTHORITY_REQUIRED',
    ]) {
      expect(canonical).not.toContain(seam);
    }
  });

  it('⛔ canonical passes the loaded revision straight into the assembly', () => {
    expect(canonical).toMatch(/assembleDevelopmentalContext\(\{[\s\S]{0,200}revisionContent/);
  });

  it('⛔ nothing in canonical gates the load on the evidence requirement', () => {
    expect(canonical).not.toContain('requirementOf');
    expect(canonical).not.toContain('sectionIdsOf');
    expect(canonical).not.toContain('pending_ask_claims');
    expect(canonical).not.toContain('pendingAskRef');
  });
});

/**
 * ⭐ The other half of the same evidence. Without this, the file only proves the
 * defect existed; it would say nothing about whether the repair addressed it.
 */
describe('the working tree answers the defect canonical shows', () => {
  it('⭐ the requirement is resolved before any load', () => {
    expect(working).toContain('resolveBodyRequirement');
    const iResolve = working.indexOf('resolveBodyRequirement(observation.evidenceRefs)');
    const iLoad = working.indexOf('loadRevisionContent(reading.readState.draftId');
    expect(iResolve).toBeGreaterThan(-1);
    expect(iLoad).toBeGreaterThan(iResolve);
  });

  it('⭐ the atomic claim precedes the disclosure boundary', () => {
    const iClaim = working.indexOf('.claim(authorization.pendingAskRef)');
    const iBoundary = working.indexOf('establishDisclosureBoundary(');
    expect(iClaim).toBeGreaterThan(-1);
    expect(iBoundary).toBeGreaterThan(iClaim);
  });

  it('⭐ the boundary precedes the load, which precedes the W2 filter', () => {
    const iBoundary = working.indexOf('establishDisclosureBoundary(');
    const iLoad = working.indexOf('loadRevisionContent(reading.readState.draftId');
    const iFilter = working.indexOf('enforceW2SectionBoundary(');
    expect(iLoad).toBeGreaterThan(iBoundary);
    expect(iFilter).toBeGreaterThan(iLoad);
  });

  it('⛔ the developmental crossing is recorded at its OWN boundary', () => {
    expect(working).toContain('writers_studio.ask->maia_developmental');
    expect(working).not.toContain('writers_studio.focus->maia_cognition');
  });

  it('⛔ the body path never asks for passage scope', () => {
    expect(working).toMatch(/scopeKind: 'section'/);
    expect(working).not.toMatch(/scopeKind: 'passage'/);
  });
});
