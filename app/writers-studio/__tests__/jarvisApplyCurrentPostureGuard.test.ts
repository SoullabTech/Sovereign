import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * A deliberately bounded source-structure witness for the client Apply
 * gesture. PASS is never evidence of server authorization or consent.
 *
 * Conversation-first step 3 (PR #2089) split the gesture in two: the
 * posture-checked Apply act is now `applyVersionById(versionId)`, and both
 * `applySuggested` (the existing Apply button) and `useVersionNow` ("Use this")
 * are callers of it. The law pinned here is unchanged and is now pinned on the
 * act itself, plus the fact that, WITHIN THIS CONTROLLER, no caller reaches the
 * adoption request any other way. (Scope is this file's controller only: other
 * surfaces that post to the adoption endpoint are outside this witness.)
 */
const file = resolve(__dirname, '../../dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
const source = readFileSync(file, 'utf8');
const begin = source.indexOf('  const applyVersionById = useCallback(async (versionId: string) => {');
const end = source.indexOf('  const applySuggested = useCallback(async () => {');
const apply = source.slice(begin, end);

describe('JARVIS existing Apply gesture — current Ordinary client preflight', () => {
  it('checks live current posture BEFORE attempting manuscript settling or adoption', () => {
    expect(begin).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(begin);
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

  it('within this controller, every caller reaches the adoption request only through that one posture-checked act', () => {
    // The whole controller, not just the slice: a second adoption call site
    // anywhere (a new caller that skips the act) would carry no posture check.
    const sites = [...source.matchAll(/adoptBoundEditorialVersion\(/g)].map((m) => m.index as number);
    expect(sites).toHaveLength(1);
    expect(sites[0]).toBeGreaterThan(begin);
    expect(sites[0]).toBeLessThan(end);

    const suggested = source.slice(end, source.indexOf('  const undoSuggested = useCallback(async () => {'));
    expect(suggested).toContain('await applyVersionById(suggestedVersion.id)');

    const useNow = source.slice(
      source.indexOf('  const useVersionNow = useCallback('),
      source.indexOf('  const openWorkspace = useCallback('),
    );
    // "Use this": the save half returns the verified id or null; Apply runs
    // only for a truthy id, on that exact id, through the same act.
    expect(useNow).toContain('const savedId = await saveMemberRevisionForId(draft);');
    expect(useNow.indexOf('if (!savedId) return false;')).toBeGreaterThan(-1);
    expect(useNow.indexOf('await applyVersionById(savedId);')).toBeGreaterThan(
      useNow.indexOf('if (!savedId) return false;'),
    );
  });
});
