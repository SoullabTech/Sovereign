import { safeReturnHref } from '../useStudioHandoff';
import {
  handoffToMaia,
  MAIA_RETURN_PARAM,
  MAIA_WORK_PARAM,
} from '@/app/writers-studio/workContext';

/**
 * WS2-03C — the receiving half of the Studio handoff.
 *
 * The `return` parameter is the security-relevant part. It arrives in a URL,
 * it is rendered as a link, and "it came from our own Studio" is precisely the
 * assumption an attacker supplies.
 */

describe('the return address cannot leave the Studio', () => {
  it('accepts a Studio path, with or without a manuscript', () => {
    expect(safeReturnHref('/writers-studio')).toBe('/writers-studio');
    expect(safeReturnHref('/writers-studio/canvas?m=ms-1')).toBe('/writers-studio/canvas?m=ms-1');
  });

  it('refuses anything that could leave this origin', () => {
    for (const hostile of [
      'https://evil.example/steal',
      'http://evil.example',
      '//evil.example',            // scheme-relative
      '/\\evil.example',           // backslash form browsers normalise
      'javascript:alert(1)',
      '/press/manuscript',         // same origin, but not the Studio
      '/writers-studioX/canvas',   // prefix lookalike
      '',
    ]) {
      expect(safeReturnHref(hostile)).toBeNull();
    }
    expect(safeReturnHref(null)).toBeNull();
  });

  it('round-trips the address the Studio actually writes', () => {
    const out = handoffToMaia('/maia', { workId: 'w1', manuscriptId: 'ms-1' });
    const p = new URLSearchParams(out.slice(out.indexOf('?')));
    expect(p.get(MAIA_WORK_PARAM)).toBe('w1');
    expect(safeReturnHref(p.get(MAIA_RETURN_PARAM))).toBe(
      '/writers-studio/canvas?m=ms-1',
    );
  });
});

describe('the handoff carries an identity and nothing else', () => {
  it('sends no title, purpose, or member prose in the URL', () => {
    // Every word that reaches MAIA's prompt is re-read server-side from the
    // member's own row. The URL is a claim; the row is the fact.
    const out = handoffToMaia('/maia', { workId: 'w1', manuscriptId: 'ms-1' });
    const keys = [...new URLSearchParams(out.slice(out.indexOf('?'))).keys()];
    expect(keys.sort()).toEqual([MAIA_RETURN_PARAM, MAIA_WORK_PARAM].sort());
  });
});
