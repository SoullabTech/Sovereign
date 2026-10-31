import { isWriterStudioRestrictedPath } from '../restrictedCorridor';

describe('Writer Studio restricted corridor', () => {
  it.each([
    '/writers-studio',
    '/writers-studio/canvas',
    '/writers-studio/develop',
    '/api/writers-studio/focus',
    '/api/writers-studio/editorial/turn',
    '/api/writers-studio/sources/source-1',
    '/api/sovereign/writers-studio/beta-feedback',
  ])('requires the Writer grant for %s', (pathname) => {
    expect(isWriterStudioRestrictedPath(pathname)).toBe(true);
  });

  it.each([
    '/api/sovereign/manuscripts/blank',
    '/api/sovereign/manuscripts/m1/ask',
    '/api/sovereign/manuscripts/m1/readings',
    '/api/sovereign/manuscripts/m1/develop/preparation',
    '/api/sovereign/manuscripts/m1/structure/proposals',
    '/api/sovereign/manuscripts/m1/themes',
    '/api/sovereign/manuscripts/m1/write-state',
  ])('requires the Writer grant for advanced manuscript operation %s', (pathname) => {
    expect(isWriterStudioRestrictedPath(pathname)).toBe(true);
  });

  it.each([
    '/api/sovereign/writers-studio/beta-access',
    '/api/sovereign/writers-studio/plan',
    '/api/writers-studio/local-review/import',
    '/api/writers-studio/local-review/render',
  ])('leaves introspection or local review outside the member grant at %s', (pathname) => {
    expect(isWriterStudioRestrictedPath(pathname)).toBe(false);
  });

  it.each([
    '/press/manuscript',
    '/api/sovereign/manuscripts',
    '/api/sovereign/manuscripts/m1',
    '/api/sovereign/manuscripts/ingest',
    '/api/sovereign/manuscripts/m1/draft',
    '/api/sovereign/manuscripts/m1/draft/checkpoint',
    '/api/sovereign/manuscripts/m1/draft/revisions',
    '/api/sovereign/manuscripts/m1/candidates',
    '/api/sovereign/manuscripts/m1/keeps',
    '/api/sovereign/manuscripts/m1/collections',
    '/api/sovereign/manuscripts/m1/render',
    '/api/sovereign/living-works/work-1',
    '/api/voice/transcribe-simple',
  ])('does not reclassify shared platform operation %s', (pathname) => {
    expect(isWriterStudioRestrictedPath(pathname)).toBe(false);
  });
});
