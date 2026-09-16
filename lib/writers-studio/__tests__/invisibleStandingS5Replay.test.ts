/**
 * JARVIS-MAIA-INVISIBLE-STANDING-SHADOW-02
 * Replay the ten human-preferred/current S5 responses through the LIVE shadow audit.
 */

jest.mock('../../auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));

import fs from 'fs';
import path from 'path';
import { getMemberIdFromRequest } from '../../auth/getMemberFromRequest';
import { resolveCanonicalIdentity } from '../../maia/canonical-turn';
import { constructEditorialWriterTurn } from '../canonicalWriterTurn';
import { auditInvisibleStandingShadow } from '../invisibleStandingShadow';
import { STANDING_SHADOW_FIXTURES } from '../../../scripts/research/standing-shadow/fixtures';

const mockedResolver = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const REQ = {} as Parameters<typeof resolveCanonicalIdentity>[0];
const MEMBER = '11111111-2222-4333-8444-555555555555';

interface BlindCase {
  caseId: string;
  candidates: Array<{ id: string; text: string }>;
}
interface KeyCase {
  caseId: string;
  fixtureId: string;
  candidates: Array<{ id: string; condition: 'current' | 'shadow' }>;
}

const readJson = <T,>(rel: string): T =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), 'utf8')) as T;

describe('S5 preferred relational voice survives live Invisible Standing shadow', () => {
  it('passes all 10 current responses with zero would-refuse findings', async () => {
    mockedResolver.mockResolvedValue(MEMBER);
    const blind = readJson<{ cases: BlindCase[] }>(
      'docs/programme/evidence/STANDING_SHADOW_S5_BLIND_REVIEW_2026-09-16.json',
    );
    const key = readJson<{ cases: KeyCase[] }>(
      'docs/programme/evidence/STANDING_SHADOW_S5_CONDITION_KEY_REVEALED_2026-09-16.json',
    );

    const dispositions: string[] = [];
    for (const keyCase of key.cases) {
      const blindCase = blind.cases.find((c) => c.caseId === keyCase.caseId);
      const currentId = keyCase.candidates.find((c) => c.condition === 'current')?.id;
      const response = blindCase?.candidates.find((c) => c.id === currentId)?.text;
      const fixture = STANDING_SHADOW_FIXTURES.find((f) => f.id === keyCase.fixtureId);
      expect(blindCase).toBeDefined();
      expect(currentId).toBeDefined();
      expect(response).toBeDefined();
      expect(fixture).toBeDefined();
      if (!response || !fixture) throw new Error(`fixture mismatch: ${keyCase.caseId}`);

      const identity = await resolveCanonicalIdentity(REQ);
      const turn = constructEditorialWriterTurn({
        identity,
        sessionRef: `live-shadow-${keyCase.caseId}`,
        exchangeId: `live-shadow-${keyCase.caseId}-turn`,
        ask: fixture.userInput,
        sanctuary: false,
        emit: false,
      }, fixture.candidates);

      const audit = auditInvisibleStandingShadow(turn, response);
      dispositions.push(audit.disposition);
      expect(audit.disposition).toBe('pass');
      expect(audit.findings).toHaveLength(0);
      expect(audit.responseChars).toBe(response.length);
    }

    expect(dispositions).toHaveLength(10);
    expect(dispositions.every((d) => d === 'pass')).toBe(true);
  });
});
