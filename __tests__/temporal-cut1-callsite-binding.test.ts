import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '');

function callArgs(source: string, marker: string, from = 0): string {
  const start = source.indexOf(marker, from);
  expect(start).toBeGreaterThan(-1);
  const end = source.indexOf('});', start);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe('Cut-1 turn binding coverage', () => {
  it('main text route keeps its existing session + trace binding', () => {
    const source = read('app/api/sovereign/app/maia/list/route.ts');
    const args = callArgs(source, 'MemoryBundleService.build(');
    expect(args).toContain('sessionId: session.id');
    expect(args).toContain('traceId');
  });

  it('maiaOrchestrator keeps its existing session + trace binding', () => {
    const source = read('lib/consciousness/maiaOrchestrator.ts');
    const args = callArgs(source, 'MemoryBundleService.build(');
    expect(args).toContain('sessionId');
    expect(args).toContain('traceId');
  });

  it('voice direct R2 retrieval binds the existing turnId without enabling retrieval-side use audit', () => {
    const source = read('app/api/voice/stream-conversation/route.ts');
    const args = callArgs(source, 'MemoryBundleService.build(');
    expect(args).toContain('sessionId: effectiveSessionId');
    expect(args).toContain('traceId: turnId');
    expect(args).toContain('recordRetrievedCandidates: false');
  });

  it('voice wisdom retrieval carries the same turnId through MaiaWisdomProvider', () => {
    const route = read('app/api/voice/stream-conversation/route.ts');
    const wisdomArgs = callArgs(route, 'MaiaWisdomProvider.buildVoiceContext(');
    expect(wisdomArgs).toContain('traceId: turnId');

    const provider = read('lib/voice/wisdom/MaiaWisdomProvider.ts');
    expect(provider).toContain('traceId?: string');
    const buildArgs = callArgs(provider, 'MemoryBundleService.build(');
    expect(buildArgs).toContain('traceId');
    expect(buildArgs).toContain('recordRetrievedCandidates: false');
  });

  it('the two voice retrieval acts remain distinct calls rather than a turn-level dedupe', () => {
    const route = read('app/api/voice/stream-conversation/route.ts');
    const provider = read('lib/voice/wisdom/MaiaWisdomProvider.ts');
    expect((route.match(/MemoryBundleService\.build\(/g) ?? [])).toHaveLength(1);
    expect((provider.match(/MemoryBundleService\.build\(/g) ?? [])).toHaveLength(1);
  });
});
