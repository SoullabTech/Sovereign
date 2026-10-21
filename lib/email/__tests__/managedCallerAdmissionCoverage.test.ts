/**
 * MAIL-04 regression guard: no platform mail send can be added without
 * declaring separately sourced actor authority and recipient provenance.
 * The runtime enforces it; this source inventory prevents silent new gaps.
 */
import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

describe('MAIL-04 site census — all managed sends have explicit admission', () => {
  it('covers every tracked production sendEmail call with caller policy', () => {
    const cwd = process.cwd();
    const files = execFileSync('git', ['ls-files', '--', 'app', 'lib', 'scripts'], {
      cwd, encoding: 'utf8',
    }).split('\n').filter(f => /\.(ts|tsx|js|mjs)$/.test(f) && !f.includes('__tests__') &&
      !/\.(test|spec)\./.test(f) && f !== 'lib/email/sendEmail.ts');
    const uncovered: string[] = [];
    let total = 0;
    for (const file of files) {
      const content = readFileSync(join(cwd, file), 'utf8');
      const re = /(?<![\w.])sendEmail\(\{/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(content))) {
        const before = content.slice(Math.max(0, m.index - 28), m.index);
        if (/\/\//.test(before.split('\n').at(-1) || '')) continue;
        const body = content.slice(m.index, m.index + 900);
        if (!/\badmission\s*:/.test(body)) {
          uncovered.push(file + ':' + content.slice(0, m.index).split('\n').length);
        }
        total++;
      }
    }
    expect(total).toBeGreaterThan(35);
    expect(uncovered).toEqual([]);
  });

  it('does not permit an implicit sysop or system provenance default at the boundary', () => {
    const source = readFileSync(join(process.cwd(), 'lib/email/sendEmail.ts'), 'utf8');
    expect(source).toContain('if (!opts.admission)');
    expect(source).toContain('admit({ purpose: opts.purpose, ...opts.admission })');
  });
});
