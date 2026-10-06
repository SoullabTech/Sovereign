import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_WORKING_STYLE,
  RELATIONSHIP_FIRST_DIRECTIVE,
  parseWorkingStyle,
} from '@/lib/writersStudio/workingStyle';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('Writer Studio relationship-first shell', () => {
  const host = read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
  const shell = read('app/writers-studio/full-redesign/Shell.tsx');
  const themeMenu = read('app/dev/writers-studio-p4r1/P4R1ThemeMenu.tsx');
  const settings = read('app/dev/writers-studio-p4r1/P4R1MaiaSettings.tsx');
  const topbarPortal = read('app/dev/writers-studio-p4r1/useStudioTopbarAccessoriesHost.ts');
  const client = read('lib/writersStudio/attentionMapClient.ts');
  const attentionRoute = read('app/api/sovereign/manuscripts/[id]/attention-map/route.ts');
  const askClient = read('lib/writersStudio/askClient.ts');
  const askRoute = read('app/api/sovereign/manuscripts/[id]/ask/route.ts');
  const editorialRoute = read('app/api/writers-studio/editorial/turn/route.ts');
  const editorialRuntime = read('lib/manuscript/editorialRuntime/turn.ts');
  const reviewDiscussClient = read('lib/writersStudio/rebuild/reviewDiscuss.ts');
  const reviewDiscussReader = read('lib/manuscript/ask/reviewDiscussReader.ts');

  it('restores Working with MAIA as a persistent Write · Develop · Review control', () => {
    expect(host).toContain("mode === 'write' || mode === 'develop' || mode === 'review'");
    expect(host).toContain('<P4R1MaiaSettings />');
    expect(settings).toContain('Working with MAIA');
    expect(settings).toContain('How actively MAIA joins you');
    expect(settings).toContain('How much MAIA shows at once');
    expect(settings).toContain('How MAIA explains what she sees');
  });

  it('keeps relationship and theme controls in real topbar layout instead of overlapping the Work picker', () => {
    expect(shell).toContain('data-studio-topbar-accessories');
    expect(settings).toContain('createPortal');
    expect(settings).toContain('useStudioTopbarAccessoriesHost');
    expect(themeMenu).toContain('createPortal');
    expect(themeMenu).toContain('useStudioTopbarAccessoriesHost');
    expect(topbarPortal).toContain("document.querySelector<HTMLElement>('[data-studio-topbar-accessories]')");
  });

  it('keeps engagement, pace, and explanatory depth as separate axes', () => {
    expect(DEFAULT_WORKING_STYLE).toEqual({
      engagement: 'guide',
      pace: 'intimate',
      explanation: 'guided',
    });
    expect(settings).toContain('ENGAGEMENT_VALUES');
    expect(settings).toContain('PACE_VALUES');
    expect(settings).toContain('EXPLANATION_VALUES');
  });

  it('migrates older saved two-axis preferences without losing them', () => {
    expect(parseWorkingStyle(JSON.stringify({
      pace: 'mapped',
      explanation: 'expert',
    }))).toEqual({
      engagement: 'guide',
      pace: 'mapped',
      explanation: 'expert',
    });
  });

  it('states relationship-first as evidence-bound recognition, not flattery', () => {
    expect(RELATIONSHIP_FIRST_DIRECTIVE).toContain('Relationship comes before diagnosis.');
    expect(RELATIONSHIP_FIRST_DIRECTIVE).toContain('inspiring, generative, original, or full of possibility');
    expect(RELATIONSHIP_FIRST_DIRECTIVE).toContain('brilliant or genius');
    expect(RELATIONSHIP_FIRST_DIRECTIVE).toContain('Never manufacture praise');
  });

  it('carries the working relationship into synthesis and ordinary MAIA conversation', () => {
    expect(client).toContain('workingStyle: readWorkingStyle()');
    expect(attentionRoute).toContain('workingStyleFrom(body.workingStyle)');
    expect(attentionRoute).toContain('RELATIONSHIP_FIRST_DIRECTIVE');
    expect(attentionRoute).toContain('engagementInstruction(workingStyle.engagement)');
    expect(attentionRoute).toContain('explanationInstruction(workingStyle.explanation)');
    expect(askClient).toContain('workingStyle: readWorkingStyle()');
    expect(askRoute).toContain('const workingStyle = workingStyleFrom(body.workingStyle)');
    expect(askRoute).toContain('const engagement = workingStyle.engagement');
  });

  it('carries relationship-first through Write editorial and Review Discuss too', () => {
    expect(editorialRoute).toContain("'workingStyle'");
    expect(editorialRoute).toContain('engagement: parsed.workingStyle.engagement');
    expect(editorialRuntime).toContain('RELATIONSHIP_FIRST_DIRECTIVE');
    expect(editorialRuntime).toContain('engagementInstruction(input.engagement');
    expect(reviewDiscussClient).toContain('workingStyle: readWorkingStyle()');
    expect(reviewDiscussReader).toContain('RELATIONSHIP_FIRST_DIRECTIVE');
    expect(reviewDiscussReader).toContain('engagementInstruction(engagement)');
  });
});
