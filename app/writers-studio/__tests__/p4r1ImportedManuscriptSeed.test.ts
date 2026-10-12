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

  it('opens member-owned continuous drafts in the original Worktable without guessing boundaries', () => {
    expect(controller).toContain("if (body.state === 'continuous')");
    expect(controller).toContain("body.manuscriptId !== manuscriptId");
    expect(controller).toContain("setPhase('continuous')");
    expect(controller).toContain('<ContinuousDraftRecovery manuscriptId={continuousDraftId}');
    expect(controller).toContain("if (body.state !== 'section_aware')");
    const recover = controller.split("if (body.state === 'continuous')")[1]
      .split("if (body.state !== 'section_aware')")[0];
    expect(recover).not.toMatch(/apiFetch\(|convert: true|content:/);
  });
});
