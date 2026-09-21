import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '..', 'rebuild', 'RebuildStudioClient.tsx'), 'utf8');

describe('live witness recovery surface', () => {
  it('keeps the immediate applied receipt truthful', () => {
    expect(source).toContain(
      "setAppliedVersionId(out.outcome.kind === 'applied' ? suggestedVersion.id : null)"
    );
  });

  it('reads durable recovery only after the Work context refresh', () => {
    const apply = source.slice(source.indexOf('const applySuggested'));
    const refresh = apply.indexOf('const fresh = await refreshContext()');
    const reread = apply.indexOf('const reread = await readBoundEditorialThread(editorialThread.threadId, focusId)');
    expect(refresh).toBeGreaterThan(-1);
    expect(reread).toBeGreaterThan(refresh);
  });

  it('renders the local receipt until durable recovery replaces it', () => {
    expect(source).toMatch(/editorialThread\.application\.versionId\s*:\s*appliedVersionId/);
    expect(source).toMatch(/onUndo=\{editorialThread\?\.application\?\.canUndo/);
  });
});
