import { readFileSync } from 'fs';
import { join } from 'path';
import { writingFieldLayout } from '../studioTheme';
import { REBUILD_HREF, DEVELOP_HREF, modeLocation } from '../studioMap';
import { canvasForManuscript } from '../canvasIdentity';
import { SECTION_PARAM } from '@/lib/writersStudio/placeInWork';

function source(rel: string): string {
  return readFileSync(join(__dirname, '..', rel), 'utf8');
}

describe('WRITERS-STUDIO-NEXT-01 A1C · E1 host proof', () => {
  const rebuild = source('rebuild/RebuildStudioClient.tsx');

  it('composes the canonical measured-layout authority into the live host', () => {
    expect(rebuild).toContain('writingFieldLayout');
    expect(rebuild).toMatch(/from ['"]\.\.\/studioTheme['"]/);
    expect(rebuild).toContain("['outlinePanel', 'writingField', 'maiaPanel']");
    expect(rebuild).toContain("['outlinePanel', 'writingField']");
  });

  it('refuses the audited remainder-based multi-column host geometry', () => {
    expect(rebuild).not.toContain("'286px minmax(520px, 1fr) 390px'");
    expect(rebuild).not.toContain("'250px minmax(0, 1fr)'");
  });

  it('gives the manuscript an explicit computed share for each neighbour set', () => {
    const normal = writingFieldLayout(
      100000,
      ['outlinePanel', 'writingField', 'maiaPanel'],
    );
    const editorial = writingFieldLayout(
      100000,
      ['outlinePanel', 'writingField'],
    );

    expect(normal.writingField).toBeGreaterThan(0);
    expect(editorial.writingField).toBeGreaterThan(0);
    expect(editorial.writingField).toBeGreaterThan(normal.writingField);

    const normalTotal =
      normal.outlinePanel + normal.writingField + normal.maiaPanel;
    const editorialTotal = editorial.outlinePanel + editorial.writingField;

    expect(normal.writingField / normalTotal).toBeGreaterThan(0);
    expect(editorial.writingField / editorialTotal).toBeGreaterThan(0);
  });
});

type ModeLocator = (base: string, manuscriptId: string, sectionId: string | null) => string;

function droppingPlace(base: string, manuscriptId: string): string {
  return canvasForManuscript(base, manuscriptId);
}

describe('WRITERS-STUDIO-NEXT-01 A1C · E5 place continuity', () => {
  const M = '5f1c0a2e-8c4d-4f2a-9b77-2ad0e3b41c90';
  const S = '9c7b1d40-2e55-4a18-8f36-77c1a0be2d13';
  const locate: ModeLocator =
    process.env.A1C_E5_WRONG === '1' ? droppingPlace : modeLocation;

  const paramsOf = (href: string) =>
    new URLSearchParams(href.slice(href.indexOf('?')));

  it('carries Work and section identity from Write to Develop', () => {
    const p = paramsOf(locate(DEVELOP_HREF, M, S));
    expect(p.get('m')).toBe(M);
    expect(p.get(SECTION_PARAM)).toBe(S);
  });

  it('carries Work and section identity from Develop back to Write', () => {
    const p = paramsOf(locate(REBUILD_HREF, M, S));
    expect(p.get('m')).toBe(M);
    expect(p.get(SECTION_PARAM)).toBe(S);
  });
  it('round-trips without losing the section', () => {
    const there = locate(DEVELOP_HREF, M, S);
    const back = locate(REBUILD_HREF, M, new URL(there, 'https://studio.local').searchParams.get(SECTION_PARAM));
    expect(paramsOf(back).get('m')).toBe(M);
    expect(paramsOf(back).get(SECTION_PARAM)).toBe(S);
  });

  it('keeps null place honest rather than inventing one', () => {
    const href = locate(REBUILD_HREF, M, null);
    expect(paramsOf(href).get('m')).toBe(M);
    expect(paramsOf(href).has(SECTION_PARAM)).toBe(false);
  });
});
