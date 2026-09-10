/**
 * S3 · P1 · step 4 — recognition metadata, and the boundary it must not cross.
 *
 *   ⭐ What the writer saw helps them RECOGNIZE the section.
 *     What the server authorizes is determined INDEPENDENTLY.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { labelFor } from '../sectionRecognition';
import { __parseAuthorizeActForTest } from '@/app/api/sovereign/manuscripts/[id]/ask/route';

describe('heading and label stay separate', () => {
  it('⭐ an authored heading is both the heading and the label', () => {
    expect(labelFor('The Lighthouse Keeper', 3)).toBe('The Lighthouse Keeper');
  });

  it('⛔ no authored heading → a generated label, and heading stays null upstream', () => {
    /* A generated "Section 4" is NOT authored text. The caller keeps `heading`
       null so a member-facing field never silently mixes authored prose with a
       generated string. */
    expect(labelFor(null, 3)).toBe('Section 4');
  });

  it('position is 0-based in the substrate and 1-based to a reader', () => {
    expect(labelFor(null, 0)).toBe('Section 1');
  });

  it('⛔ a whitespace-only title is not a heading', () => {
    expect(labelFor('   ', 6)).toBe('Section 7');
  });

  it('⛔ a label is never a UUID', () => {
    const label = labelFor(null, 11);
    expect(label).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i);
  });
});

/**
 * ⛔ A PROPOSED TITLE IS NOT THE MEMBER'S WORD FOR THEIR OWN DIVISION.
 *
 * `manuscript_structure_units` admits `origin = 'proposed'` so that adopting a
 * proposal later is an INSERT with provenance rather than a migration — and that
 * table's own rule is that proposed rows cannot render as the Work's structure.
 * A section whose ONLY unit is proposed therefore has no authored heading, and
 * MAIA's suggestion must not be handed back to the writer as though they had
 * named it themselves.
 *
 * ⭐ The exclusion is on the JOIN, not in a WHERE clause. This asserts the
 * consequence of that choice: the SECTION survives with a positional label,
 * rather than disappearing from a response the member is being asked to act on.
 */
describe('a proposed structure title never becomes a heading', () => {
  const RECOGNITION = readFileSync(
    join(__dirname, '..', 'sectionRecognition.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it("⛔ the query excludes proposed units, and does so on the JOIN", () => {
    expect(RECOGNITION).toMatch(/LEFT JOIN manuscript_structure_units[\s\S]{0,80}origin <> 'proposed'/);
    /* ⛔ If this moved into a WHERE clause the section itself would vanish. */
    expect(RECOGNITION).not.toMatch(/WHERE[\s\S]{0,120}origin <> 'proposed'/);
  });

  it("⭐ a section with no authored title still gets a positional label", () => {
    /* The heading is null; the label is never absent and never a UUID. */
    expect(labelFor(null, 3)).toBe('Section 4');
  });

  it('⛔ recognition never selects section text', () => {
    expect(RECOGNITION).not.toMatch(/SELECT[\s\S]{0,200}s\.text/);
  });
});

/**
 * ⭐⭐ THE FALSIFIER THE RULING ASKED FOR.
 *
 * A client returns manipulated display strings alongside a genuine `sectionId`.
 * The resumed Ask must behave identically — and it does so for the strongest
 * available reason: ACT 3 does not accept those strings AT ALL. There is no
 * field to manipulate, so there is no code path in which a forged heading could
 * influence what is authorized.
 */
describe('display metadata can never become authorization input', () => {
  const base = {
    act: 'authorize_sections_and_resume',
    pendingAskRef: 'pending-ref-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    authorizes: ['section-S'],
  };

  it('⭐ a genuine act parses to section identities only', () => {
    const parsed = __parseAuthorizeActForTest(base);
    expect(parsed).toEqual({ pendingAskRef: base.pendingAskRef, authorizes: ['section-S'] });
    expect(Object.keys(parsed!)).toEqual(['pendingAskRef', 'authorizes']);
  });

  it('⛔ manipulated headings and labels are not carried into the act', () => {
    const forged = {
      ...base,
      sections: [{ sectionId: 'section-S', heading: 'Chapter One', label: 'Chapter One' }],
      heading: 'a heading the client invented',
      label: 'a label the client invented',
    };
    const parsed = __parseAuthorizeActForTest(forged);
    /* The act is unchanged: same pendingAskRef, same section identities, and no
       trace of the forged strings anywhere in what the server will act on. */
    expect(parsed).toEqual({ pendingAskRef: base.pendingAskRef, authorizes: ['section-S'] });
    expect(JSON.stringify(parsed)).not.toContain('Chapter One');
    expect(JSON.stringify(parsed)).not.toContain('invented');
  });

  it('⛔ a section OBJECT is not a section identity', () => {
    /* A client that returned ACT 2's `sections` array verbatim must not have it
       read as authorization: those are display objects, not identities. */
    expect(__parseAuthorizeActForTest({
      ...base, authorizes: [{ sectionId: 'section-S', label: 'Chapter One' }],
    })).toBeNull();
  });
});
