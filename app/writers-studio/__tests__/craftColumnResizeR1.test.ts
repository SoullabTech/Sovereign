import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe("Craftsman's Table adjustable columns", () => {
  const shell = read('app/writers-studio/full-redesign/Shell.tsx');
  const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const css = read('app/dev/writers-studio-p4r1/p4r1-live.css');

  it('keeps both resize affordances at the shell level', () => {
    expect(shell).toContain('manuscriptResizable?: boolean');
    expect(shell).toContain('className="fr-manuscript-divider"');
    expect(shell).toContain('className="fr-maia-divider"');
    expect(shell).toContain('data-manuscript-collapsed');
    expect(shell).toContain('aria-label={manuscriptCollapsed');
  });

  it('lets the manuscript rail collapse without unmounting it', () => {
    expect(shell).toContain("'--fr-live-ms-w': manuscriptCollapsed ? '0px'");
    expect(shell).toContain('setManuscriptCollapsed(true)');
    expect(shell).toContain('setManuscriptCollapsed(false)');
    expect(shell).toContain('lastOpenManuscriptWidth');
    expect(css).toContain("[data-manuscript-collapsed='true'] .fr-manuscript");
  });

  it('enables both adjustable sides in Develop Craft', () => {
    expect(view).toContain("manuscriptResizable={props.surfaceMode === 'develop-craft'}");
    expect(view).toContain('maiaResizable={shellHasCraftEditorial}');
    expect(css).toContain("[data-resizable-manuscript='true'][data-resizable-maia='true']");
    expect(css).toContain('var(--fr-live-work-fr');
    expect(css).toContain('var(--fr-live-maia-fr');
  });

  it('keeps keyboard access for resizing and collapse', () => {
    expect(shell).toContain("event.key === 'ArrowLeft'");
    expect(shell).toContain("event.key === 'ArrowRight'");
    expect(shell).toContain("event.key === 'Enter' || event.key === ' '");
    expect(shell).toContain("event.key === 'Home'");
    expect(shell).toContain("event.key === 'End'");
  });
});
