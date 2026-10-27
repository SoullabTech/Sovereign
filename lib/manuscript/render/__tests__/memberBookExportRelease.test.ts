import fs from 'node:fs';
import path from 'node:path';
import { isMemberBookExportReleased } from '../memberBookExportRelease';

describe('member book export release authority', () => {
  it('is hard-off and has no environment, query, tier, plan, or browser override', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'lib/manuscript/render/memberBookExportRelease.ts'),
      'utf8',
    );

    expect(isMemberBookExportReleased()).toBe(false);
    expect(isMemberBookExportReleased).toHaveLength(0);
    expect(source).not.toMatch(
      /process\.env|searchParams|localStorage|sessionStorage|writerStudioPlanForMember|tierSatisfies/,
    );
  });
});
