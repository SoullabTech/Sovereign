import fs from 'node:fs';
import path from 'node:path';
import {
  WRITER_INDEPENDENT_RELEASE_HOLDS,
  WRITER_STUDIO_FEATURE_INCLUSION,
} from '@/lib/writersStudio/planPolicy';

const ROOT = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

describe('Writer Free + Pro experience is visible without becoming an authority bypass', () => {
  const host = read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
  const notice = read('app/dev/writers-studio-p4r1/WriterStudioPlanNotice.tsx');
  const plans = read('app/writers-studio/plans/page.tsx');
  const admission = read('lib/writersStudio/admissionServer.ts');

  it('mounts one server-resolved plan surface across the canonical Studio', () => {
    expect(host).toContain("import WriterStudioPlanNotice from './WriterStudioPlanNotice'");
    expect(host).toContain('<WriterStudioPlanNotice />');
    expect(notice).toContain("apiFetch('/api/sovereign/writers-studio/plan'");
    expect(notice).toContain('/writers-studio/plans');
  });

  it('does not use browser or query state to grant Free or Pro', () => {
    expect(notice).not.toContain('localStorage');
    expect(notice).not.toContain('useSearchParams');
    expect(notice).not.toContain('demoPlan');
    expect(admission).toContain('plan.pilotEligible');
    expect(admission).toContain('WRITER_STUDIO_INVITATION_REQUIRED');
  });

  it('keeps the meaningful Free product and the deeper Pro product explicit', () => {
    expect(WRITER_STUDIO_FEATURE_INCLUSION.author_owned_writing).toEqual({ free: true, pro: true });
    expect(WRITER_STUDIO_FEATURE_INCLUSION.basic_develop).toEqual({ free: true, pro: true });
    expect(WRITER_STUDIO_FEATURE_INCLUSION.advanced_develop).toEqual({ free: false, pro: true });
    expect(WRITER_STUDIO_FEATURE_INCLUSION.listen).toEqual({ free: false, pro: true });
    expect(plans).toContain('The complete product definition');
    expect(plans).toContain('Each approved writer enters Pro without a subscription.');
  });

  it('keeps checkout and independently held operations off', () => {
    expect(WRITER_INDEPENDENT_RELEASE_HOLDS).toEqual(expect.arrayContaining([
      'member_pdf_epub_delivery',
      'live_provider_inference',
      'deletion_safe_recovery',
    ]));
    expect(plans).toContain('Future pricing is not set.');
    expect(plans).toContain('No checkout, subscription or public enrollment is active.');
  });
});
