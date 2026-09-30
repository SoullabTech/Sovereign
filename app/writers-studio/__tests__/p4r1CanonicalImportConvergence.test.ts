import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('Writer Studio canonical import convergence', () => {
  const write = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const press = read('app/press/manuscript/page.tsx');

  it('begins a verbatim Working Draft when canonical Write receives Source without a draft', () => {
    expect(write).toContain("import { beginDraft } from '@/app/press/manuscript/workingDraftClient';");
    expect(write).toContain("if (body.state === 'no_draft')");
    expect(write).toContain('await beginDraft(apiFetch, manuscriptId)');
    expect(write).toContain("if (body.state !== 'section_aware')");
  });

  it('lands a completed import in canonical Write rather than the historical rebuild route', () => {
    expect(press).toContain("import { CANONICAL_STUDIO_PATH } from '@/lib/writersStudio/canonicalStudioRoute';");
    expect(press).toContain('`${CANONICAL_STUDIO_PATH}?mode=write&m=${encodeURIComponent(data.id)}`');
    expect(press).not.toContain('REBUILD_HREF');
  });
});
