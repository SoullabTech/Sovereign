#!/usr/bin/env tsx
import assert from 'node:assert/strict';
import {
  PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE,
  PROVIDER_SPEND_IDENTITY_REQUIRED,
  PROVIDER_SPEND_LIMIT_REACHED,
  ProviderSpendGateError,
  estimateVoiceSeconds,
  reserveTextProviderSpend,
  reserveTextProviderSpendWithClient,
  reserveVoiceProviderSpend,
  reserveVoiceProviderSpendWithClient,
} from '../../lib/limits/ProviderSpendGate';
import type { TransactionClient } from '../../lib/db/postgres';

type RowResult = { rows: any[] };

type Scenario = {
  tier?: string | null;
  freeReservationRows?: any[];
  memberPlusReservationRows?: any[];
  freeTextReservationRows?: any[];
  failOn?: string;
};

function fakeClient(scenario: Scenario, calls: string[]): TransactionClient {
  return {
    async query(sql: string): Promise<RowResult> {
      const marker = /provider-spend:([a-z-]+)/.exec(sql)?.[1] ?? 'unknown';
      calls.push(marker);
      if (scenario.failOn === marker) throw new Error('synthetic database failure');
      if (marker === 'member-tier') {
        return { rows: scenario.tier === undefined ? [] : [{ tier: scenario.tier }] };
      }
      if (marker === 'free-reserve') {
        return { rows: scenario.freeReservationRows ?? [{ voice_seconds_used: 12 }] };
      }
      if (marker === 'member-plus-reserve') {
        return { rows: scenario.memberPlusReservationRows ?? [{ voice_seconds_used: 12 }] };
      }
      if (marker === 'text-free-reserve') {
        return { rows: scenario.freeTextReservationRows ?? [{ text_turns: 1 }] };
      }
      if (marker === 'text-metered-reserve' || marker === 'daily-reserve') {
        return { rows: [{ recorded: true }] };
      }
      return { rows: [] };
    },
  } as TransactionClient;
}

async function expectGateError(
  action: () => Promise<unknown>,
  code: string,
  status: number,
): Promise<void> {
  await assert.rejects(action, (error: unknown) => {
    assert.ok(error instanceof ProviderSpendGateError);
    assert.equal(error.code, code);
    assert.equal(error.status, status);
    return true;
  });
}

async function main(): Promise<void> {
  assert.equal(estimateVoiceSeconds(''), 1);
  assert.equal(estimateVoiceSeconds('x'.repeat(25)), 2);
  assert.equal(estimateVoiceSeconds('x'.repeat(100_000)), 600);

  {
    const calls: string[] = [];
    const result = await reserveTextProviderSpendWithClient(
      fakeClient({ tier: 'free' }, calls),
      { memberId: 'fictional-member', provider: 'anthropic', purpose: 'text_generation' },
      new Date('2026-10-25T12:00:00Z'),
    );
    assert.equal(result.tier, 'free');
    assert.deepEqual(calls, ['member-tier', 'text-free-initialize', 'text-free-reserve']);
  }

  {
    const calls: string[] = [];
    await expectGateError(
      () => reserveTextProviderSpendWithClient(
        fakeClient({ tier: 'free', freeTextReservationRows: [] }, calls),
        { memberId: 'fictional-member', provider: 'anthropic', purpose: 'text_generation' },
      ),
      PROVIDER_SPEND_LIMIT_REACHED,
      429,
    );
  }

  {
    const calls: string[] = [];
    const result = await reserveTextProviderSpendWithClient(
      fakeClient({ tier: 'personal' }, calls),
      { memberId: 'fictional-member', provider: 'anthropic', purpose: 'text_generation' },
    );
    assert.equal(result.tier, 'member_plus');
    assert.deepEqual(calls, ['member-tier', 'text-metered-reserve']);
  }

  {
    const calls: string[] = [];
    const result = await reserveVoiceProviderSpendWithClient(
      fakeClient({ tier: 'free' }, calls),
      { memberId: 'fictional-member', estimatedSeconds: 12, provider: 'openai', purpose: 'voice_tts' },
      new Date('2026-10-25T12:00:00Z'),
    );
    assert.equal(result.tier, 'free');
    assert.deepEqual(calls, ['member-tier', 'free-initialize', 'free-reserve', 'daily-reserve']);
  }

  {
    const calls: string[] = [];
    await expectGateError(
      () => reserveVoiceProviderSpendWithClient(
        fakeClient({ tier: 'free', freeReservationRows: [] }, calls),
        { memberId: 'fictional-member', estimatedSeconds: 12, provider: 'openai', purpose: 'voice_tts' },
      ),
      PROVIDER_SPEND_LIMIT_REACHED,
      429,
    );
    assert.ok(!calls.includes('daily-reserve'));
  }

  {
    const calls: string[] = [];
    const result = await reserveVoiceProviderSpendWithClient(
      fakeClient({ tier: 'personal' }, calls),
      { memberId: 'fictional-member', estimatedSeconds: 15, provider: 'openai', purpose: 'voice_tts' },
    );
    assert.equal(result.tier, 'member_plus');
    assert.deepEqual(calls, ['member-tier', 'member-plus-initialize', 'member-plus-reserve', 'daily-reserve']);
  }

  {
    const calls: string[] = [];
    await expectGateError(
      () => reserveVoiceProviderSpendWithClient(
        fakeClient({ tier: 'personal', memberPlusReservationRows: [] }, calls),
        { memberId: 'fictional-member', estimatedSeconds: 15, provider: 'openai', purpose: 'voice_tts' },
      ),
      PROVIDER_SPEND_LIMIT_REACHED,
      429,
    );
    assert.ok(!calls.includes('daily-reserve'));
  }

  {
    const calls: string[] = [];
    const result = await reserveVoiceProviderSpendWithClient(
      fakeClient({ tier: 'pro' }, calls),
      { memberId: 'fictional-member', estimatedSeconds: 20, provider: 'openai', purpose: 'voice_tts' },
    );
    assert.equal(result.tier, 'studio_pro');
    assert.deepEqual(calls, ['member-tier', 'daily-reserve']);
  }

  await expectGateError(
    () => reserveTextProviderSpendWithClient(
      fakeClient({}, []),
      { memberId: 'fictional-member', provider: 'anthropic', purpose: 'text_generation' },
    ),
    PROVIDER_SPEND_IDENTITY_REQUIRED,
    401,
  );

  await expectGateError(
    () => reserveTextProviderSpendWithClient(
      fakeClient({ tier: 'free' }, []),
      { memberId: 'fictional-member', provider: 'invalid' as any, purpose: 'text_generation' },
    ),
    'PROVIDER_SPEND_REQUEST_INVALID',
    400,
  );

  {
    let transactionSettled = false;
    await expectGateError(
      () => reserveTextProviderSpend(
        { memberId: 'fictional-member', provider: 'anthropic', purpose: 'text_generation' },
        {
          transaction: async (callback) => {
            const result = await callback(fakeClient({ tier: 'free', freeTextReservationRows: [] }, []));
            transactionSettled = true;
            return result;
          },
        },
      ),
      PROVIDER_SPEND_LIMIT_REACHED,
      429,
    );
    assert.equal(transactionSettled, true);
  }

  await expectGateError(
    () => reserveVoiceProviderSpend(
      { memberId: 'fictional-member', estimatedSeconds: 3, provider: 'openai', purpose: 'voice_tts' },
      { transaction: async () => { throw new Error('synthetic unavailable'); } },
    ),
    PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE,
    503,
  );

  await expectGateError(
    () => reserveTextProviderSpend(
      { memberId: 'fictional-member', provider: 'anthropic', purpose: 'text_generation' },
      { transaction: async () => { throw new Error('synthetic unavailable'); } },
    ),
    PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE,
    503,
  );

  console.log(JSON.stringify({
    status: 'PASS',
    checks: 13,
    member_content_used: false,
    provider_calls_made: false,
    secrets_included: false,
  }));
}

main().catch((error) => {
  console.error(JSON.stringify({
    status: 'FAIL',
    error_category: error instanceof Error ? error.name : typeof error,
    secrets_included: false,
  }));
  process.exit(1);
});
