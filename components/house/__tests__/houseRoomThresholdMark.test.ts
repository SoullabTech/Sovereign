import fs from 'node:fs';
import path from 'node:path';

/**
 * H1-close-1 — the threshold is orientation, not branding. Where the
 * destination already carries the Soullab mark, the threshold does not repeat
 * it; the destination declares that about itself, and every other room keeps
 * the mark by default.
 */
const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
const threshold = read('components/house/HouseRoomThreshold.tsx');

describe('HouseRoomThreshold — no competing mark', () => {
  it('keeps the mark unless the destination declares its own', () => {
    expect(threshold).toMatch(/destinationCarriesMark = false/);
    expect(threshold).toMatch(/destinationCarriesMark \? \(\s*<span className=\{styles\.brandSpace\}/);
  });

  it('keeps the return link either way', () => {
    expect(threshold.match(/className=\{styles\.return\}/g)?.length).toBe(1);
    expect(threshold).not.toMatch(/destinationCarriesMark[^)]*styles\.return/);
  });

  it('Writer’s Studio declares its own mark; no other room does', () => {
    expect(read('app/writers-studio/StudioHouseReturn.tsx')).toMatch(/destinationCarriesMark \/>/);
    for (const rel of ['app/journal/layout.tsx', 'app/reflections/layout.tsx', 'app/library/page.tsx']) {
      expect(read(rel)).not.toMatch(/destinationCarriesMark/);
    }
  });
});
