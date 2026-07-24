/**
 * ModernTextInput multiline growth cap — regression pin.
 *
 * BUG: the JS auto-resize cap (`Math.min(textarea.scrollHeight, 200)`,
 * commented "Max 200px height - expanded for mobile") and the CSS
 * `max-h-[...]` utility on the same textarea were introduced together in
 * commit 5ad91b44a but disagreed — CSS said 120px. Since `max-height`
 * always wins over an inline `height` regardless of what JS computes, the
 * "expanded for mobile" growth never actually took effect; the field
 * visually capped at 120px no matter what the JS cap said.
 *
 * FIX: both now read 200px. This test pins the two numbers to match —
 * whichever one is intentionally changed in the future, change both.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '..', 'components/ui/ModernTextInput.tsx'),
  'utf8'
);

describe('multiline growth cap — JS and CSS must agree', () => {
  it('the JS auto-resize cap is 200px', () => {
    const match = SRC.match(/Math\.min\(textarea\.scrollHeight,\s*(\d+)\)/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe('200');
  });

  it('the textarea\'s max-h utility matches the JS cap', () => {
    const jsCap = SRC.match(/Math\.min\(textarea\.scrollHeight,\s*(\d+)\)/)![1];
    const cssCap = SRC.match(/max-h-\[(\d+)px\]/);
    expect(cssCap).not.toBeNull();
    expect(cssCap![1]).toBe(jsCap);
  });
});
