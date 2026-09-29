import fs from 'node:fs';
import path from 'node:path';

const route = fs.readFileSync(
  path.join(process.cwd(), 'app/api/sovereign/manuscripts/[id]/lineage-chapter/route.ts'),
  'utf8',
);
const view = fs.readFileSync(
  path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'),
  'utf8',
);

describe('C15R3 chapter lineage', () => {
  it('requires an explicit chapter root chosen by the writer', () => {
    expect(route).toContain('chapterRootId_required');
    expect(route).toContain('chapter_root_not_found');
    expect(view).toContain('Choose a chapter to investigate');
  });

  it('reads actual chapter prose while carrying whole-work orientation', () => {
    expect(route).toContain('CHAPTER SECTIONS WITH PROSE');
    expect(route).toContain('WHOLE-WORK ORIENTATION');
    expect(route).toContain('sampleAcross(converted, 2)');
  });

  it('keeps exact source/citation work non-mutating', () => {
    expect(route).not.toMatch(/UPDATE\s+manuscript|INSERT\s+INTO\s+manuscript|DELETE\s+FROM\s+manuscript/i);
    expect(route).not.toContain('applyCitation');
    expect(route).not.toContain('rewriteBibliography');
  });

  it('preserves return to the whole intellectual field', () => {
    expect(view).toContain('Return to whole intellectual field');
  });
});
