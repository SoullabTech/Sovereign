import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const controller = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'),
  'utf8',
);

describe('P4R1 imported manuscript arrival', () => {
  it('seeds the canonical draft when an imported manuscript has no draft yet', () => {
    expect(controller).toContain("if (body.state === 'no_draft')");
    expect(controller).toContain("'/api/sovereign/manuscripts/' + encodeURIComponent(manuscriptId) + '/draft'");
    expect(controller).toContain("{ method: 'POST' }");
    expect(controller).toContain("throw new Error('draft seed')");
    expect(controller).toContain("throw new Error('context after draft seed')");
  });

  it('still refuses to guess continuous structure', () => {
    expect(controller).toContain("if (body.state !== 'section_aware')");
    expect(controller).toContain("The Studio will not guess at its structure.");
  });
});
