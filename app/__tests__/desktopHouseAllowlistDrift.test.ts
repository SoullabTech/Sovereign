import fs from 'node:fs';
import path from 'node:path';

import { buildManifest } from '../../scripts/generate-desktop-house-allowlist';

const manifestPath = path.join(
  process.cwd(),
  'maia-desktop',
  'src',
  'house-allowlist.json',
);

describe('MAIA Desktop canonical route manifest', () => {
  it('matches the current House registry and carries no retired /house route', () => {
    const checkedIn = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(checkedIn).toEqual(buildManifest());
    expect(checkedIn.allowedRoots).toContain('/writers-studio');
    expect(checkedIn.allowedRoots).toContain('/reflections');
    expect(checkedIn.allowedRoots).not.toContain('/house');
  });
});
