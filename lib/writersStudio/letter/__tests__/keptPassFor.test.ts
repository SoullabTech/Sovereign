/** Founder walk 2026-11-12: Develop did not show the letter MAIA kept for the Work, and one click there began a new paid reading. */
import fs from 'node:fs';
import path from 'node:path';
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
import { keptPassFor, type ServerLetter } from '@/lib/writersStudio/letter/letterClient';

const letter = (over: Partial<ServerLetter> = {}, mapOver: Record<string, unknown> = {}): ServerLetter =>
  ({ id: 'L1', draftRevision: 5, createdAt: '2026-11-12T23:47:38Z', map: { manuscriptId: 'm1', revisionNumber: 5, items: [], ...mapOver } as never, ...over });

describe('Develop shows the letter kept for this Work', () => {
  it('⭐ MUST FAIL IF the kept letter for this draft is not the pass Develop shows', () => {
    expect(keptPassFor(letter(), 'm1', 5)).toEqual(letter().map);
  });
  it('a letter of an earlier draft is not "ready"', () => {
    expect(keptPassFor(letter({ draftRevision: 4 }), 'm1', 5)).toBeNull();
  });
  it('another Work\'s letter, no letter, or an unknown draft is never shown', () => {
    expect(keptPassFor(letter({}, { manuscriptId: 'm2' }), 'm1', 5)).toBeNull();
    expect(keptPassFor(null, 'm1', 5)).toBeNull();
    expect(keptPassFor(letter(), 'm1', null)).toBeNull();
  });
  it('Develop asks the server for the kept letter before falling back to this tab', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx'), 'utf8');
    expect(src).toMatch(/void fetchLetter\(workManuscript\)\.then\(\(out\) => \{[\s\S]{0,200}keptPassFor\(out\?\.letter \?\? null, workManuscript, revision\)[\s\S]{0,80}setAttentionMap\(kept\)[\s\S]{0,40}else fromThisTab\(\)/);
  });
});
