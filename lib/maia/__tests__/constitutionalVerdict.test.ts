/**
 * Constitutional verdict persistence — the Sanctuary boundary, pinned.
 *
 * Mock discipline (mirrors lib/workbench/__tests__/keepSourceAdapter): the db
 * mock only RECORDS calls. It never simulates the guard. The suppression claim
 * is asserted against whether a write reached the wire at all, so a test passes
 * only because the recorder really refused — not because a fake filtered it.
 *
 * What is load-bearing here: `provider` is operational metadata, but stanceMode
 * and authSlip are classifications DERIVED FROM MEMBER CONTENT. The live egress
 * guard still adjudicates a sanctuary turn — MAIA needs that protection on
 * every turn — but the verdict must die with the turn rather than become
 * durable evidence. Otherwise the portability experiment becomes a reason to
 * increase persistence in the one room designed to minimize it.
 *
 * The complementary behavioural proof (real Postgres: ordinary turn persisted
 * all four fields, sanctuary turn left all four NULL) was run during the build.
 * These tests pin the wiring so it cannot silently regress.
 *
 * Canon: docs/canon/MAIA_BEHAVIORAL_PORTABILITY.md · CLAUDE.md § Sanctuary Mode
 */

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
}));

import { recordConstitutionalVerdict } from '../substrateObservability';
import { query } from '@/lib/db/postgres';
import type { ConstitutionalVerdict } from '@/lib/ai/types';

const mockQuery = query as jest.MockedFunction<typeof query>;

const VERDICT: ConstitutionalVerdict = {
  stanceMode: 'captured',
  authSlip: true,
  adjudicatorVersion: 'stance/v4',
};

const ctx = (isSanctuary: boolean) =>
  ({ turnId: 'turn-1', member: { userId: 'u1', isSanctuary } }) as never;

const settle = () => new Promise(resolve => setImmediate(resolve));

describe('recordConstitutionalVerdict — Sanctuary suppression', () => {
  beforeEach(() => mockQuery.mockClear());

  it('persists the verdict, its contract, and the served substrate on an ordinary turn', async () => {
    recordConstitutionalVerdict(ctx(false), VERDICT, 'ollama');
    await settle();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('UPDATE runtime_events');
    expect(sql).toContain('WHERE turn_id = $1');
    // All four fields, or the row records an outcome that cannot be compared.
    expect(sql).toContain('stance_mode');
    expect(sql).toContain('auth_slip');
    expect(sql).toContain('stance_adjudicator_version');
    expect(sql).toContain('verdict_provider');
    expect(params).toEqual(['turn-1', 'captured', true, 'stance/v4', 'ollama']);
  });

  it('writes NOTHING for a sanctuary turn', async () => {
    recordConstitutionalVerdict(ctx(true), VERDICT, 'ollama');
    await settle();

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('suppresses under Sanctuary even when the served substrate is known', async () => {
    // The interesting case: everything needed for a useful evidence row is in
    // hand. Suppression is unconditional, not a fallback for missing data.
    recordConstitutionalVerdict(ctx(true), VERDICT, 'anthropic');
    await settle();

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('writes nothing when adjudication produced no verdict', async () => {
    recordConstitutionalVerdict(ctx(false), undefined, 'anthropic');
    await settle();

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('records the SERVED substrate, not the configured one', async () => {
    // provider and verdict_provider diverge exactly when fallback fires — the
    // case portability most needs recorded correctly.
    recordConstitutionalVerdict(ctx(false), VERDICT, 'ollama');
    await settle();

    const [, params] = mockQuery.mock.calls[0] as [string, unknown[]];
    expect((params as unknown[])[4]).toBe('ollama');
  });
});
