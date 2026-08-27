/**
 * Regression control for the transcription body-reconstruction 500.
 *
 * Next threw `TypeError: Response body object should not be disturbed or locked`
 * from fromNodeNextRequest — while CONSTRUCTING the Request, before any route
 * code ran — because middleware.ts matched the route and Next had to buffer and
 * rebuild the body. Roughly half of multipart audio POSTs died there.
 * See docs/ops/TRANSCRIBE_BODY_DISTURBED_2026-08-27.md.
 *
 * These tests hold the fix in place AND hold its justification in place. The
 * exclusion is only defensible because middleware was not authenticating this
 * route to begin with; if that premise ever changes, the premise test fails
 * rather than the exclusion quietly becoming a hole.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { matchRule, getAccessMode } from '../config/accessMatrix';

const EXCLUDED = '/api/voice/transcribe-simple';

/** The matcher as middleware.ts actually declares it. */
function matcherPatterns(): string[] {
  const src = readFileSync(path.join(__dirname, '..', 'middleware.ts'), 'utf8');
  const block = /export const config = \{[\s\S]*?\n\};/.exec(src);
  if (!block) throw new Error('middleware config block not found');
  return [...block[0].matchAll(/'(\/\(\(\?![^']+)'/g)].map((m) => m[1]);
}

/** Does the declared matcher select this path for middleware? */
function middlewareRuns(pathname: string): boolean {
  return matcherPatterns().some((p) => new RegExp(`^${p}$`).test(pathname));
}

describe('middleware matcher — transcription exclusion', () => {
  it('does NOT run middleware on the transcription route', () => {
    // Pre-fix this was true, and the request died in fromNodeNextRequest.
    expect(middlewareRuns(EXCLUDED)).toBe(false);
  });

  it('still runs middleware on every other route', () => {
    for (const p of [
      '/api/voice/transcribe',
      '/api/voice/openai-tts',
      '/api/sovereign/app/maia/list',
      '/api/members/signin',
      '/api/studio/sessions/abc/voice-notes',
      '/maia',
      '/',
    ]) {
      expect({ path: p, runs: middlewareRuns(p) }).toEqual({ path: p, runs: true });
    }
  });

  it('excludes exactly one path, not the /api/voice namespace', () => {
    const src = readFileSync(path.join(__dirname, '..', 'middleware.ts'), 'utf8');
    const block = /export const config = \{[\s\S]*?\n\};/.exec(src)![0];
    expect(block).not.toMatch(/api\/voice(?!\/transcribe-simple)/);
    expect(block).not.toMatch(/api\/voice\/\*/);
  });

  it('PREMISE: middleware was not authenticating this route anyway', () => {
    // The exclusion is only safe because of this. If a rule is ever added for
    // /api/voice/*, or the mode goes strict, this fails and the exclusion must
    // be reconsidered rather than silently becoming an auth hole.
    expect(matchRule(EXCLUDED)).toBeNull();
    expect(getAccessMode()).toBe('permissive');
  });

  it('PREMISE: the route still authenticates itself', () => {
    const route = readFileSync(
      path.join(__dirname, '..', 'app/api/voice/transcribe-simple/route.ts'),
      'utf8',
    );
    expect(route).toMatch(/getMemberIdFromRequest\(req\)/);
    expect(route).toMatch(/status:\s*401/);
    // And the gates that were explicitly not to be touched.
    expect(route).toMatch(/ALLOW_AUDIO_TRANSCRIPTION/);
    expect(route).toMatch(/MAX_FILE_SIZE = 25 \* 1024 \* 1024/);
    expect(route).toMatch(/multipart\/form-data/);
    expect(route).toMatch(/WHISPER_LOCAL_URL/);
    expect(route).not.toMatch(/openai\.com|api\.openai/);
  });
});
