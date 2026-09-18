/**
 * KEEP-LEGACY-SURFACE-01-R1 — legacy respond authority retirement guard.
 *
 * The obsolete conversational-Keep respond endpoint must never mint or mutate
 * member memory. Canonical Keep authority is:
 *
 *   UNDERSTAND -> FACILITATE -> member CONFIRM -> POST /api/capsules
 *
 * The retired endpoint remains addressable only as an explicit 410 refusal so
 * stale clients fail closed rather than silently exercising a second COMMIT path.
 */
import { readFileSync } from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../../../..');

function read(rel: string): string {
  return readFileSync(path.join(repoRoot, rel), 'utf8');
}

const LEGACY_RESPOND = 'app/api/psyche/conversational-keep/respond/route.ts';
const LIVE_MAIA = 'app/api/sovereign/app/maia/list/route.ts';
const RETIRED_ORACLE = 'app/api/oracle/conversation/route.ts';
const PREPARE_KEEP = 'app/api/capsules/from-chat-window/route.ts';
const ORACLE_UI = 'components/OracleConversation.tsx';

describe('KEEP-LEGACY-SURFACE-01-R1 — legacy respond endpoint is non-executable', () => {
  it('hard-refuses with 410 and carries no atom-minting or mutation authority', () => {
    const src = read(LEGACY_RESPOND);

    expect(src).toContain('LEGACY_KEEP_RESPOND_RETIRED');
    expect(src).toContain('{ status: 410 }');

    for (const forbidden of [
      'applyConversationalKeepResult',
      'keepSource',
      'applyAtomGesture',
      'recordAccept',
      'recordDecline',
      'pauseOffers',
      'resumeOffers',
      "case 'accept_offer'",
      "case 'confirm_filing'",
      "case 'confirm_gesture'",
    ]) {
      expect(src).not.toContain(forbidden);
    }
  });
});

describe('KEEP-LEGACY-SURFACE-01-R1 — canonical Keep authority remains elsewhere', () => {
  it('live MAIA route still contains no retired server filing authority', () => {
    const src = read(LIVE_MAIA);

    expect(src).not.toContain('parseFilingInstruction');
    expect(src).not.toContain('applyConversationalKeepResult');
    expect(src).not.toContain('CONVERSATIONAL_KEEP_ENABLED');
  });

  it('Keep preparation remains non-persistent and member confirmation writes through /api/capsules', () => {
    const prepare = read(PREPARE_KEEP);
    const ui = read(ORACLE_UI);

    expect(prepare).toContain('Deliberately NOT imported: createCapsule');
    expect(prepare).not.toMatch(/^import\s+\{[^}]*createCapsule/m);
    expect(ui).toContain("apiFetch('/api/capsules',");
    expect(ui).not.toContain('/api/psyche/conversational-keep/respond');
  });

  it('legacy Oracle conversation route remains hard-refused before dormant Keep machinery', () => {
    const src = read(RETIRED_ORACLE);
    const refusal = src.indexOf("reason: 'Legacy route retired pending Sanctuary-governed persistence");
    const status410 = src.indexOf('{ status: 410 }');
    const dormantKeep = src.indexOf('if (CONVERSATIONAL_KEEP_ENABLED)');

    expect(refusal).toBeGreaterThan(-1);
    expect(status410).toBeGreaterThan(refusal);
    expect(dormantKeep).toBeGreaterThan(status410);
  });
});
