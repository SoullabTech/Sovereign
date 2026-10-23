/**
 * Class A SECURITY NEGATIVE PROOF ONLY — expected RED on original source.
 * The real disclosure receipt module is called; ONLY PostgreSQL is mocked.
 * Fictional strings; no network, original Work, database, member, or model.
 * DO NOT invert the negative tests or confuse a fail-closed receipt with
 * safe diagnostics. Related security issue #1917 and router PR #1922.
 */
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
}));

import { query } from '@/lib/db/postgres';
import {
  mintDisclosureAttempt,
  confirmDisclosureCrossed,
  mayCross,
  type ContextDisclosureAttempt,
} from '../contextDisclosureReceipt';

const mockQuery = query as jest.Mock;
const PRIVATE_MARKER = 'FICTIONAL_WRITER_PRIVATE_NEVER_IN_DIAGNOSTICS_711';
const attempt: ContextDisclosureAttempt = {
  disclosureId: 'fictional-disclosure-711',
  memberId: 'fictional-member-711',
  requestRef: 'fictional-request-711',
  boundary: 'writers_studio.focus->maia_cognition',
  sourceClass: 'work',
  participationBasis: 'member_invoked',
  sourceRef: 'fictional-work-711',
  scopeKind: 'passage',
  gesture: 'ask_maia',
};

beforeEach(() => {
  mockQuery.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('Class A HOLD: disclosure failures must refuse without private logs', () => {
  test.each([
    ['Error object', () => new Error(PRIVATE_MARKER)],
    ['bare string', () => PRIVATE_MARKER],
  ])('EXPECTED RED: mint %s must not log fictional private prose', async (_kind, makeError) => {
    mockQuery.mockRejectedValueOnce(makeError());
    const outcome = await mintDisclosureAttempt(attempt);
    expect(outcome).toEqual({ kind: 'unavailable' });
    expect(mayCross(outcome)).toBe(false);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const logs = (console.error as jest.Mock).mock.calls;
    expect(logs).toHaveLength(1);
    // CURRENT UNSAFE SOURCE: err.message/String(err) enters a log field.
    expect(JSON.stringify(logs)).not.toContain(PRIVATE_MARKER);
  });

  test.each([
    ['Error object', () => new Error(PRIVATE_MARKER)],
    ['bare string', () => PRIVATE_MARKER],
  ])('EXPECTED RED: confirm %s must not log fictional private prose', async (_kind, makeError) => {
    mockQuery.mockRejectedValueOnce(makeError());
    const confirmed = await confirmDisclosureCrossed(attempt.disclosureId);
    // After-crossing uncertainty MUST remain visible; do not convert failure to success.
    expect(confirmed).toBe(false);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const logs = (console.error as jest.Mock).mock.calls;
    expect(logs).toHaveLength(1);
    expect(JSON.stringify(logs)).not.toContain(PRIVATE_MARKER);
  });

  test('GREEN control: fresh minted receipt authorizes exactly this attempt', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'fictional-row-1' }], rowCount: 1 });
    const outcome = await mintDisclosureAttempt(attempt);
    expect(outcome).toEqual({
      kind: 'minted', id: 'fictional-row-1', disclosureId: attempt.disclosureId,
    });
    expect(mayCross(outcome)).toBe(true);
    expect(console.error).not.toHaveBeenCalled();
  });

  test('GREEN control: a matching successful confirm is not a refusal', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    expect(await confirmDisclosureCrossed(attempt.disclosureId)).toBe(true);
    expect(console.error).not.toHaveBeenCalled();
  });
});
