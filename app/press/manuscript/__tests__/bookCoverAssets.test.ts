import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const COVER = readFileSync(join(__dirname, '..', 'BookCoverAssets.tsx'), 'utf8');
const PANEL = readFileSync(join(__dirname, '..', 'BookProductionPanel.tsx'), 'utf8');

describe('HPB-05 — print covers are governed publication assets', () => {
  it('mounts cover custody inside the existing Book Production room', () => {
    expect(PANEL).toContain("import BookCoverAssets from './BookCoverAssets'");
    expect(PANEL).toContain('<BookCoverAssets manuscriptId={manuscriptId} />');
    expect(COVER).toContain('data-book-cover-assets');
  });

  it('keeps paperback and hardcover as separate slots', () => {
    expect(COVER).toContain('COVER_EDITIONS.map');
    expect(COVER).toContain("edition === 'paperback' ? 'Paperback cover' : 'Hardcover cover'");
    expect(COVER).toContain('data-cover-edition={edition}');
  });

  it('supports explicit upload, replacement, download and removal', () => {
    expect(COVER).toContain("form.append('cover', file)");
    expect(COVER).toContain("cover ? 'Replace PDF' : 'Upload PDF'");
    expect(COVER).toContain('Download original');
    expect(COVER).toContain('Remove');
  });

  it('shows custody facts without claiming print certification', () => {
    expect(COVER).toContain('Artwork in custody');
    expect(COVER).toContain('Print geometry not yet certified.');
    expect(COVER).toContain('cover.pageWidthPt');
    expect(COVER).toContain('cover.pageHeightPt');
    expect(COVER).toContain('cover.sha256.slice(0, 16)');
  });

  it('uses authenticated cover routes rather than public asset URLs', () => {
    expect(COVER).toContain('/covers/${edition}');
    expect(COVER).toContain('/covers/${edition}/bytes');
    expect(COVER).not.toMatch(/signedUrl|publicUrl|cdn/i);
  });
});
