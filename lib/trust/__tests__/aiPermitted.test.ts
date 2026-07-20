/**
 * Bug B (Parent Update on scribe reviews) — safety-net tests.
 *
 * Parent Update generation runs through the trust gate, which looks the session
 * up in `rl_sessions`. A scribe session id does not exist there, so generation
 * must fail closed with `session_not_found` — and, critically, the gate must
 * NEVER create or infer an rl_session to satisfy the endpoint. These tests pin
 * both properties directly on the trust service. The UI hides the control (see
 * the source-guard test); this proves that even a direct call stays blocked.
 */

const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...a: unknown[]) => mockQuery(...a),
}));

import { isAiPermitted } from '../service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('isAiPermitted fails closed for non-rl (scribe) sessions', () => {
  it('returns session_not_found when the session is absent from rl_sessions', async () => {
    // getSessionPrivacy SELECT → zero rows (a scribe id is not an rl_session)
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await isAiPermitted('11111111-1111-4111-8111-111111111111');
    expect(result.permitted).toBe(false);
    expect(result.reason).toBe('session_not_found');
  });

  it('never issues an INSERT/UPDATE — no synthetic rl_session is manufactured', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    await isAiPermitted('22222222-2222-4222-8222-222222222222');
    const mutating = mockQuery.mock.calls.filter(c =>
      typeof c[0] === 'string' && /\b(INSERT|UPDATE|UPSERT|DELETE)\b/i.test(c[0])
    );
    expect(mutating).toHaveLength(0);
    // and the only lookup it did was a SELECT against rl_sessions
    expect(mockQuery.mock.calls[0][0]).toMatch(/SELECT/i);
    expect(mockQuery.mock.calls[0][0]).toMatch(/rl_sessions/);
  });
});
