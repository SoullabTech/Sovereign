/**
 * D1/D2 ingestion-integrity contract tests.
 * docs/defects/LIBRARY_INGESTION_IDENTITY_DEFECT_2026-07-27.md
 *
 * Regression fixtures reproduce the observed corpus failures: the Elemental
 * Alchemy manuscript recorded as title "#" author "would like", emoji titles,
 * dot-prefixed filename titles.
 */

import {
  validateTitle,
  validateAuthor,
  titleFromFilename,
  extractIdentity,
  resolveIngestStatus,
} from '../../lib/library/ingestIntegrity';

describe('validateTitle (D1)', () => {
  it('rejects the observed junk titles', () => {
    for (const junk of ['#', '**🌱', '**🎭**', '. Elemental Alchemy Educational Material Development', '', '  ', '...', '🌱🌱🌱']) {
      expect(validateTitle(junk).valid).toBe(false);
    }
  });

  it('accepts real titles', () => {
    for (const good of [
      'Elemental Alchemy: The Ancient Art of Living a Phenomenal Life',
      '12 Facets Of Spiralogic Profile',
      '"Alchemy Is Alchemy Is Alchemy, Turtles All The Way Down!"',
    ]) {
      expect(validateTitle(good).valid).toBe(true);
    }
  });
});

describe('validateAuthor (D1)', () => {
  it('rejects the observed content-fragment authors', () => {
    for (const junk of ['would like', 'the end', 'our father', 'sharing and', 'connecting to']) {
      expect(validateAuthor(junk).valid).toBe(false);
    }
  });

  it('accepts real names — including particles, single names, and accents — and absent authors as honest', () => {
    for (const good of [
      'Kelly Nezat',
      'Marie-Louise von Franz',
      'John of the Cross',
      'Teresa of Ávila',
      'Rumi',
      'Carl Jung',
    ]) {
      expect(validateAuthor(good).valid).toBe(true);
    }
    expect(validateAuthor(null).valid).toBe(true);
    expect(validateAuthor('').valid).toBe(true);
  });
});

describe('extractIdentity (D1)', () => {
  it('does not let a bare heading destroy a good filename title (the EA case)', () => {
    const content = '#\n\nSome opening prose that mentions produced by would like more context...';
    const id = extractIdentity(content, 'Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life');
    expect(id.title).toMatch(/Elemental Alchemy/);
    expect(id.validation.valid).toBe(true);
  });

  it('lets a VALID heading override the filename', () => {
    const content = '# The Alchemy of Awakening\n\nBody text.';
    const id = extractIdentity(content, 'untitled-draft-7');
    expect(id.title).toBe('The Alchemy of Awakening');
  });

  it('never extracts an author from mid-document prose (the "would like" regression)', () => {
    const prose = 'x'.repeat(2000) + '\nThis effect is caused by would like patterns in text.';
    const id = extractIdentity(prose, 'Some Real Title');
    expect(id.author).toBeNull();
  });

  it('extracts a byline author from the document head', () => {
    const content = '# Elemental Alchemy\n\nby Kelly Nezat\n\nChapter one begins...';
    const id = extractIdentity(content, 'elemental-alchemy');
    expect(id.author).toBe('Kelly Nezat');
  });

  it('flags identity invalid when nothing validates', () => {
    const id = extractIdentity('#\n\ncontent', '🌱🌱');
    expect(id.validation.valid).toBe(false);
    expect(id.validation.reasons).toContain('junk_title');
  });
});

describe('titleFromFilename', () => {
  it('converts separator-heavy filenames', () => {
    expect(titleFromFilename('elemental-alchemy_book')).toBe('Elemental Alchemy Book');
  });
});

describe('resolveIngestStatus (D2)', () => {
  it('completes only when expected === actual and identity holds', () => {
    expect(resolveIngestStatus({ expectedChunks: 10, actualChunks: 10, identityValid: true }).status).toBe('completed');
  });

  it('resolves partial on a shortfall — never a silent completed', () => {
    const out = resolveIngestStatus({ expectedChunks: 3676, actualChunks: 3, identityValid: true });
    expect(out.status).toBe('partial');
    expect(out.error).toContain('3/3676');
  });

  it('fails explicitly on zero chunks', () => {
    expect(resolveIngestStatus({ expectedChunks: 0, actualChunks: 0, identityValid: true }).status).toBe('failed');
  });

  it('identity-invalid blocks completion regardless of chunk math', () => {
    const out = resolveIngestStatus({ expectedChunks: 10, actualChunks: 10, identityValid: false });
    expect(out.status).toBe('failed');
    expect(out.error).toBe('identity_invalid');
  });
});
