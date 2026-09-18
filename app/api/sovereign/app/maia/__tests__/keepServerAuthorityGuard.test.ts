/**
 * KEEP-SERVER-AUTHORITY-01-R1 — regression guard.
 *
 * The live MAIA route must not convert conversational recognition directly
 * into durable Keep persistence. The canonical client Keep contract owns
 * recognition/facilitation; COMMIT must remain a separately governed member act.
 *
 * This test intentionally guards the live route by source topology rather than
 * mocking persistence. A later refactor must not quietly reintroduce the legacy
 * parseFilingInstruction -> applyConversationalKeepResult sidecar under another
 * branch condition (including Sanctuary).
 */
import { readFileSync } from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../../../../..');

function read(rel: string): string {
  return readFileSync(path.join(repoRoot, rel), 'utf8');
}

const LIVE_ROUTE = 'app/api/sovereign/app/maia/list/route.ts';
const RETIRED_ORACLE_ROUTE = 'app/api/oracle/conversation/route.ts';

describe('KEEP-SERVER-AUTHORITY-01-R1 — live route authority containment', () => {
  it('live /maia route contains no legacy conversational filing recognizer or persistence bridge', () => {
    const src = read(LIVE_ROUTE);

    expect(src).not.toContain('parseFilingInstruction');
    expect(src).not.toContain('applyConversationalKeepResult');
    expect(src).not.toContain('CONVERSATIONAL_KEEP_ENABLED');
    expect(src).not.toContain('[MAIA/sovereign] keep filed:');
    expect(src).not.toContain("kind: 'filing_confirmation'");
  });

  it('the member-facing /maia surfaces still route through the guarded live endpoint', () => {
    const page = read('app/maia/page.tsx');
    const presence = read('components/maia/presence/MaiaPresence.tsx');

    expect(page).toContain('apiEndpoint="/api/sovereign/app/maia/list"');
    expect(presence).toContain('apiEndpoint="/api/sovereign/app/maia/list"');
  });
});

describe('KEEP-SERVER-AUTHORITY-01-R1 — retired duplicate remains contained', () => {
  it('legacy Oracle route hard-refuses before its old conversational-Keep code can execute', () => {
    const src = read(RETIRED_ORACLE_ROUTE);
    const refusal = src.indexOf("reason: 'Legacy route retired pending Sanctuary-governed persistence");
    const status410 = src.indexOf('{ status: 410 }');
    const legacyKeep = src.indexOf('if (CONVERSATIONAL_KEEP_ENABLED)');

    expect(refusal).toBeGreaterThan(-1);
    expect(status410).toBeGreaterThan(refusal);
    expect(legacyKeep).toBeGreaterThan(status410);
  });
});
