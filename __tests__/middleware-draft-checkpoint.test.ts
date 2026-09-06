/**
 * The bodyless Writer Studio checkpoint deliberately remains behind middleware.
 * Unlike /api/voice/transcribe-simple, /api/sovereign has a real authenticated
 * access rule, so solving the body-stream defect by excluding this path would
 * silently remove policy. The transport repair is zero-body instead.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { matchRule } from '../config/accessMatrix';

const CHECKPOINT = '/api/sovereign/manuscripts/x/draft/checkpoint';

function middlewareRuns(pathname: string): boolean {
  const src = readFileSync(path.join(__dirname, '..', 'middleware.ts'), 'utf8');
  const block = /export const config = \{[\s\S]*?\n\};/.exec(src);
  if (!block) throw new Error('middleware config block not found');
  const patterns = [...block[0].matchAll(/'(\/\(\(\?![^']+)'/g)].map((m) => m[1]);
  return patterns.some((p) => new RegExp(`^${p}$`).test(pathname));
}

describe('Writer Studio checkpoint transport and policy', () => {
  it('keeps the checkpoint route inside middleware', () => {
    expect(middlewareRuns(CHECKPOINT)).toBe(true);
  });

  it('keeps the /api/sovereign authenticated policy premise', () => {
    expect(matchRule(CHECKPOINT)).toMatchObject({ prefix: '/api/sovereign', minTier: 'free' });
  });

  it('the route itself also requires verified member identity', () => {
    const route = readFileSync(
      path.join(__dirname, '..', 'app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts'),
      'utf8',
    );
    expect(route).toContain('getMemberIdFromRequest(request)');
    expect(route).toContain("{ error: 'Unauthorized' }");
    expect(route).not.toMatch(/request\.(json|text|formData)\(/);
  });
});
