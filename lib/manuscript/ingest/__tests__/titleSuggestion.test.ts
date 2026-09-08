/**
 * A source filename is provenance, not a Work name (founder ruling 2026-09-07).
 *
 * Observed on production: the Studio's largest heading read ELEMENTAL_ALCHEMY.
 * The filename had become the book's identity.
 */

import { titleFromFilename } from '../titleSuggestion';

describe('the title a filename may suggest', () => {
  it('undoes the filesystem encoding', () => {
    expect(titleFromFilename('ELEMENTAL_ALCHEMY.docx')).toBe('ELEMENTAL ALCHEMY');
    expect(titleFromFilename('the-long-walk.pdf')).toBe('the long walk');
    expect(titleFromFilename('draft__two--final.docx')).toBe('draft two final');
  });

  it('\u26d4 does not invent case the writer did not choose', () => {
    /* Title-casing would be an authorial decision made by the importer. Some
       writers title in caps; some title in none. There is a titleFromFilename
       in lib/library/ingestIntegrity.ts that DOES title-case — it serves the
       library PDF pipeline, and another pipeline's idea of a good title is not
       a reason to restyle a member's book. */
    expect(titleFromFilename('ELEMENTAL_ALCHEMY.docx')).not.toBe('Elemental Alchemy');
    expect(titleFromFilename('a room of ones own.docx')).toBe('a room of ones own');
  });

  it('\u26d4 adds no characters of its own', () => {
    /* Every character out must have been a character in. The one thing removed
       is the extension; the one thing changed is separators. */
    const out = titleFromFilename('ELEMENTAL_ALCHEMY.docx');
    for (const ch of out.replace(/ /g, '')) {
      expect('ELEMENTAL_ALCHEMY').toContain(ch);
    }
  });

  it('returns nothing rather than something when there is nothing', () => {
    /* An empty suggestion leaves the member's field empty, which is correct:
       untitled is a real state, and the Studio has no name to offer. */
    expect(titleFromFilename('___.docx')).toBe('');
    expect(titleFromFilename('   .txt')).toBe('');
  });

  it('leaves a filename that is already a title alone', () => {
    expect(titleFromFilename('Elemental Alchemy.docx')).toBe('Elemental Alchemy');
  });
});
