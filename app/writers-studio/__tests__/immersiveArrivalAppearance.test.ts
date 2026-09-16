import { readFileSync } from 'fs';
import { join } from 'path';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

describe('Writer Studio immersive arrival + appearance', () => {
  const home = read('app/writers-studio/HomeView.tsx');
  const rebuild = read('app/writers-studio/rebuild/RebuildStudioClient.tsx');

  it('makes the threshold an invitation into creative work, not a history-first ledger', () => {
    expect(home).toContain('A quieter place for bigger ideas');
    expect(home).toContain('Welcome to your writing studio.');
    expect(home).toContain('Return to this work');
    expect(home.indexOf('Your works')).toBeLessThan(home.indexOf('Recent activity'));
  });

  it('uses one shared appearance control at threshold and workspace', () => {
    expect(home).toContain('<AppearanceMenu />');
    expect(rebuild).toContain('<AppearanceMenu />');
  });

  it('does not force the rebuilt workspace into Cloud', () => {
    expect(rebuild).not.toContain('atmosphereVariables(ATMOSPHERES.cloud)');
    expect(rebuild).toContain('useCanvasSurfaceVariables()');
    expect(rebuild).toContain('...canvasSurfaceVars');
  });

  it('keeps appearance decorative rather than inventing writer facts', () => {
    expect(home).not.toContain('minutes of writing');
    expect(home).not.toContain('BRENÉ BROWN');
    expect(home).not.toContain('Good writing begins');
  });
});

describe('rebuilt manuscript movement + developmental continuity', () => {
  const rebuild = read('app/writers-studio/rebuild/RebuildStudioClient.tsx');
  const modeBar = read('app/writers-studio/studio/StudioModeBar.tsx');
  const studioMap = read('app/writers-studio/studioMap.ts');

  it('keeps manuscript movement inside the manuscript scroll container', () => {
    expect(rebuild).toContain('manuscriptScrollRef');
    expect(rebuild).toContain("overflowY: 'auto'");
    expect(rebuild).toContain("minHeight: 0");
    expect(rebuild).not.toContain('scrollIntoView(');
  });

  it('treats section navigation as a spent one-shot destination, never a standing scroll effect', () => {
    expect(rebuild).toContain('pendingManuscriptJumpRef');
    expect(rebuild).toContain('useLayoutEffect');
    expect(rebuild).toContain('pendingManuscriptJumpRef.current = null');
    expect(rebuild).not.toContain('requestAnimationFrame(');
  });

  it('opens section-addressed arrivals in the continuous chapter canvas by default', () => {
    expect(rebuild).toContain("setManuscriptView('chapter')");
    expect(rebuild).toContain("manuscriptView === 'section'");
  });

  it('provides a real return door from the writing workspace to the Studio workbench', () => {
    expect(rebuild).toContain('href="/writers-studio"');
    expect(rebuild).toContain('Return to Writer’s Studio workbench');
    expect(rebuild).toContain('‹ Workbench');
  });

  it('offers chapter and section as explicit canvas views, separate from MAIA mode', () => {
    expect(rebuild).toContain("type ManuscriptView = 'chapter' | 'section'");
    expect(rebuild).toContain('data-manuscript-view-switch');
    expect(rebuild).toContain("['chapter', 'section'] as const");
    expect(rebuild).toContain("type MaiaMode = 'chapter' | 'passage'");
  });

  it('checkpoints server truth inside the explicit chapter-review act before MAIA reads', () => {
    expect(rebuild).toContain('checkpointServerDraft(apiFetch, context.manuscriptId');
    expect(rebuild).toContain('baseRevisionId: writing.currentRevisionId()');
    expect(rebuild).toContain('idempotencyKey: newIdempotencyKey()');
    const checkpoint = rebuild.indexOf('checkpointServerDraft(apiFetch, context.manuscriptId');
    const reviewCall = rebuild.indexOf('let bundle = await runChapterReview', checkpoint);
    expect(checkpoint).toBeGreaterThan(-1);
    expect(reviewCall).toBeGreaterThan(checkpoint);
  });

  it('uses the proven Studio mode bar so Develop carries the same manuscript identity', () => {
    expect(rebuild).toContain('<StudioModeBar');
    expect(rebuild).toContain('manuscriptId={context.manuscriptId}');
    expect(studioMap).toContain("export const DEVELOP_HREF = '/writers-studio/develop'");
    expect(modeBar).toContain('canvasForManuscript(mode.href!, manuscriptId)');
  });
});
