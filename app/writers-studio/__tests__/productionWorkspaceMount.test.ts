import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const page = readFileSync(
  join(process.cwd(), 'app/writers-studio/rebuild/page.tsx'),
  'utf8',
);

describe('Writer’s Studio production workspace mount', () => {
  it('mounts the full manuscript-first workspace at /writers-studio/rebuild', () => {
    expect(page).toContain("import RebuildStudioClient from './RebuildStudioClient'");
    expect(page).toContain('<RebuildStudioClient />');
    expect(page).toContain("import './rebuild.css'");
  });

  it('does not replace the member-facing workspace with the bounded flagship proof host', () => {
    expect(page).not.toContain('<FlagshipWriteHost');
    expect(page).not.toContain("import './flagshipWriteHost.css'");
  });
});
