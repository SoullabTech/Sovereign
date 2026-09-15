/**
 * EDITORIAL-LEGACY-LOCUS-DISPOSITION-01 — the discriminator's truth table.
 *
 * ⭐ PURE, so the law is falsifiable without a database, a fixture or a server.
 * The behavioural witness proves what the guard DID once; this proves what the
 * predicate MEANS, including the case it is documented to get wrong.
 */
import { locusSpaceOf, locusIsAdoptable } from '../legacyLocus';

const P = 'The spiral is not a circle.';
const H = 'Chapter Ten';

describe('locusSpaceOf', () => {
  it('⚠️ a headed section holding the STORED slice is legacy', () => {
    expect(locusSpaceOf(`${H}\n\n${P}`, H)).toBe('legacy_stored_section');
  });
  it('⭐ a headed section holding the PROJECTED passage is current', () => {
    expect(locusSpaceOf(P, H)).toBe('projected_section_body');
  });
  it('⚠️ the heading alone is legacy — it is the empty-body stored slice', () => {
    expect(locusSpaceOf(H, H)).toBe('legacy_stored_section');
  });
  it('⚠️ the single-newline stored form is legacy too', () => {
    expect(locusSpaceOf(`${H}\n${P}`, H)).toBe('legacy_stored_section');
  });

  /* ⛔ WHERE THERE IS NO HEADING THERE IS NOTHING TO DISTINGUISH: stored and
     projected coincide, so a pre-repair chain there was never malformed and
     must not have adoption withheld. */
  it('⛔ an unheaded section is never legacy (null heading)', () => {
    expect(locusSpaceOf(P, null)).toBe('projected_section_body');
  });
  it('⛔ nor with a blank heading', () => {
    expect(locusSpaceOf(P, '   ')).toBe('projected_section_body');
  });
  it('⭐ and text that merely LOOKS stored is not legacy without a heading', () => {
    expect(locusSpaceOf(`${H}\n\n${P}`, null)).toBe('projected_section_body');
  });

  /**
   * ⚠️⚠️ THE DOCUMENTED FALSE POSITIVE, ASSERTED RATHER THAN HIDDEN.
   *
   * A valid post-alignment chain matches the predicate if the writer literally
   * repeated the heading as the first line of her body. ⭐ The consequence is a
   * REFUSAL TO ADOPT — never a false statement about her manuscript — which is
   * the correct direction for an error to fall, and the reason this case is a
   * test rather than a footnote.
   */
  it('⚠️ fails SAFE when the body itself repeats the heading', () => {
    expect(locusSpaceOf(`${H}\n${P}`, H)).toBe('legacy_stored_section');
  });
});

describe('locusIsAdoptable', () => {
  it('is the negation, and nothing more', () => {
    expect(locusIsAdoptable(P, H)).toBe(true);
    expect(locusIsAdoptable(`${H}\n\n${P}`, H)).toBe(false);
  });
});
