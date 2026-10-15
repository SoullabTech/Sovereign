import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Writer Studio header: no controls that do nothing', () => {
  const shell = readFileSync(join(process.cwd(), 'app/writers-studio/full-redesign/Shell.tsx'), 'utf8');
  const css = readFileSync(join(process.cwd(), 'app/dev/writers-studio-full-redesign-review/full-redesign-review.css'), 'utf8');

  it('removes the misleading empty avatar and fake three-dot menu', () => {
    expect(shell).not.toContain('className="fr-avatar"');
    expect(shell).not.toContain('className="fr-more"');
    expect(css).not.toMatch(/\.fr-(?:avatar|more)\b/);
  });

  it('retains actual Studio navigation and writer-owned actions', () => {
    expect(shell).toContain('data-studio-topbar-accessories');
    expect(shell).toContain('props.onSelectMode?.(m.id)');
    expect(shell).toContain('className="fr-workpick"');
    expect(shell).toContain('data-writers-publish-entry');
    expect(shell).toContain('className="fr-region fr-work"');
  });
});
