import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * A deliberately bounded source-structure witness for the client Apply
 * gesture. PASS is never evidence of server authorization or consent.
 */
const file = resolve(__dirname, '../../dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
const source = readFileSync(file, 'utf8');
const begin = source.indexOf('  const applySuggested = useCallback(async () => {');
const end = source.indexOf('  const undoSuggested = useCallback(async () => {');
const apply = source.slice(begin, end);

describe('JARVIS existing Apply gesture — current Ordinary client preflight', () => {
  it('checks live current posture BEFORE attempting manuscript settling or adoption', () => {
    expect(begin).toBeGreaterThan(-1);
    const first = apply.indexOf('const gesturePosture = readCurrentSanctuaryPosture()');
    const settle = apply.indexOf('await settleWriting()');
    const adopt = apply.indexOf('await adoptBoundEditorialVersion(');
    expect(first).toBeGreaterThan(-1);
    expect(settle).toBeGreaterThan(first);
    expect(adopt).toBeGreaterThan(settle);
    expect(apply).toMatch(/!gesturePosture\.resolved\s*\|\|\s*gesturePosture\.sanctuary/);
  });

  it('re-checks posture AFTER async manuscript settling, BEFORE the only Apply call', () => {
    const settle = apply.indexOf('await settleWriting()');
    const second = apply.indexOf('const settledPosture = readCurrentSanctuaryPosture()');
    const adopt = apply.indexOf('await adoptBoundEditorialVersion(');
    expect(second).toBeGreaterThan(settle);
    expect(adopt).toBeGreaterThan(second);
    expect(apply).toMatch(/!settledPosture\.resolved\s*\|\|\s*settledPosture\.sanctuary/);
    expect((apply.match(/adoptBoundEditorialVersion\(/g) ?? [])).toHaveLength(1);
  });

  it('refuses the client gesture without claiming server enforcement', () => {
    expect(apply).toContain('Persistent editorial Apply is unavailable in Sanctuary');
    expect(apply).toContain('Nothing was submitted for Apply.');
    // The endpoint remains a separate Class A HOLD.
    expect(apply).not.toContain('WRITERS_STUDIO_EDITORIAL_ENABLED =');
  });
});
