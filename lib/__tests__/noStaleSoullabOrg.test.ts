/**
 * soullab.org is no longer a Soullab domain (founder, 2026-11-06): it serves a parked page, so
 * any sender, link or credential naming it points at someone else. Source must not name it.
 *
 * Deliberately excluded: the founder's book text (elemental-alchemy-full.json), which is the
 * author's own manuscript and is read by the audiobook, illustration and manuscript tooling.
 * Changing the author's words is not a clean-up task; it is recorded in the PR instead.
 */
import { execFileSync } from 'node:child_process';

const EXCLUDED = new Set(['app/api/_backend/data/founder-knowledge/elemental-alchemy-full.json']);

describe('no stale soullab.org in source', () => {
  it('names the retired domain nowhere outside the excluded book text', () => {
    let out = '';
    try {
      out = execFileSync(
        'git',
        ['grep', '-l', 'soullab\\.org', '--', 'app', 'lib', 'components', 'scripts', 'config', 'Community-Commons', ':!*.md', ':!lib/__tests__/noStaleSoullabOrg.test.ts'],
        { encoding: 'utf8' },
      );
    } catch {
      out = ''; // git grep exits 1 when nothing matches
    }
    const offenders = out.split('\n').filter(Boolean).filter((f) => !EXCLUDED.has(f));
    expect(offenders).toEqual([]);
  });

  it('keeps no disabled copy of the sign-in page that carries credentials', () => {
    const files = execFileSync('git', ['ls-files', 'app/signin'], { encoding: 'utf8' }).split('\n').filter(Boolean);
    expect(files.filter((f) => /\.DISABLED$/i.test(f))).toEqual([]);
  });
});
