import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('P4R1 unified PC3/V10 Writer Studio host', () => {
  const host = read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
  const write = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const develop = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const review = read('app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx');
  const home = read('app/dev/writers-studio-pc3-live/P4R1HomeView.tsx');

  it('hosts all four primary Studio modes in one route family', () => {
    expect(host).toContain("mode === 'home'");
    expect(host).toContain("mode === 'develop'");
    expect(host).toContain("mode === 'review'");
    expect(host).toContain('<P4R1WriteEditController');
    expect(host).toContain('<P4R1HomeController');
    expect(host).toContain('<P4R1DevelopController');
    expect(host).toContain('<P4R1ReviewController');
  });

  it('uses the accepted PC3/V10 Shell and WriteRoom, never the rejected old shell', () => {
    expect(write).toContain("from '@/app/writers-studio/full-redesign/Shell'");
    expect(write).toContain("from '@/app/writers-studio/full-redesign/WriteRoom'");
    expect(write).not.toContain('StudioShell');
    expect(write).not.toContain('WriteFrame');
    expect(develop).toContain("from '@/app/writers-studio/full-redesign/Shell'");
    expect(review).toContain("from '@/app/writers-studio/full-redesign/Shell'");
    expect(home).toContain("from '@/app/writers-studio/full-redesign/Shell'");
    expect(home).toContain("import { HOME_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens'");
    expect(home).toContain('geometry={HOME_GEOMETRY}');
    expect(home).not.toContain('STATE_GEOMETRY[geometryKey]');
  });

  it('exposes the full eight-field Develop set plus Overview', () => {
    for (const field of [
      "'development'", "'structure'", "'arc'", "'themes'",
      "'voice'", "'coherence'", "'continuity'", "'reader'",
    ]) {
      expect(develop).toContain(field);
    }
    expect(develop).toContain("'overview'");
  });

  it('keeps developmental reading explicit rather than navigation-triggered', () => {
    expect(develop).toContain('onCommission');
    expect(develop).toContain('Nothing is read automatically.');
    expect(develop).toContain('Opening this field never reads more of your Work.');
  });

  it('mounts durable observation conversation rather than a static MAIA card only', () => {
    expect(develop).toContain("import ObservationDialogue");
    expect(develop).toContain('<ObservationDialogue');
  });

  it('keeps Review non-commissioning and exact-run addressed', () => {
    expect(review).toContain('reviewRunId');
    expect(review).toContain('loadChapterReviewManifestById');
    expect(review).toContain('Opening Review does not read your Work.');
  });
});
