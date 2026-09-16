import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

describe('RELATIONAL-CLAIM-IDENTITY-01 · serving isolation', () => {
  test('no app/lib serving surface imports the shadow module', () => {
    const root = process.cwd();
    const files = execFileSync('git', ['ls-files', 'app', 'lib'], { cwd: root, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)
      .filter((f) => /\.(?:ts|tsx|js|mjs)$/.test(f))
      .filter((f) => !f.startsWith('lib/maia/claimIdentityShadow/'));

    const offenders: string[] = [];
    for (const file of files) {
      const full = path.join(root, file);
      if (!fs.existsSync(full)) continue;
      const text = fs.readFileSync(full, 'utf8');
      if (/claimIdentityShadow/.test(text)) offenders.push(file);
    }

    expect(offenders).toEqual([]);
  });
});
