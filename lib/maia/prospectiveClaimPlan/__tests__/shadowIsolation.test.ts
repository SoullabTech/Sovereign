import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

describe('PROSPECTIVE-CLAIM-PLAN-01 · serving isolation', () => {
  test('no serving surface imports prospectiveClaimPlan', () => {
    const root = process.cwd();
    const files = execFileSync('git', ['ls-files', 'app', 'lib'], { cwd: root, encoding: 'utf8' })
      .split('\n').filter(Boolean)
      .filter((f) => /\.(?:ts|tsx|js|mjs)$/.test(f))
      .filter((f) => !f.startsWith('lib/maia/prospectiveClaimPlan/'));
    const offenders: string[] = [];
    for (const file of files) {
      const full = path.join(root, file);
      if (!fs.existsSync(full)) continue;
      if (/prospectiveClaimPlan/.test(fs.readFileSync(full, 'utf8'))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});
