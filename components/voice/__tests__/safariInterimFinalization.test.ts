import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/voice/ContinuousConversation.tsx'),
  'utf8',
);

describe('Safari interim-only silence-boundary finalization', () => {
  it('uses the pure selector at the existing Web Speech silence timer boundary', () => {
    const timer = source.indexOf('silenceTimerRef.current = setTimeout(() => {');
    const selector = source.indexOf('selectSilenceBoundaryTranscript({', timer);
    const process = source.indexOf('processAccumulatedTranscript();', selector);
    expect(timer).toBeGreaterThan(-1);
    expect(selector).toBeGreaterThan(timer);
    expect(process).toBeGreaterThan(selector);
  });

  it('passes Safari identity explicitly instead of changing all browsers', () => {
    const selector = source.indexOf('selectSilenceBoundaryTranscript({');
    const window = source.slice(selector, selector + 500);
    expect(window).toContain('isSafari: isSafari()');
  });

  it('does not shorten the existing silence threshold', () => {
    expect(source).toContain('silenceTimerRef.current = setTimeout(() => {');
    expect(source).toContain('}, silenceThreshold); // Use configurable threshold from props');
  });

  it('does not relabel promoted interim speech as a browser final', () => {
    const promotion = source.indexOf("selection.source === 'safari_interim_promotion'");
    const window = source.slice(promotion, promotion + 1800);
    expect(window).not.toContain('lastFinalAtRef.current =');
    expect(window).toContain("lastInterimTextRef.current = ''");
  });
});
