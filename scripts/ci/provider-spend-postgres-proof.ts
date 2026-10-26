#!/usr/bin/env tsx
import assert from 'node:assert/strict';
import {
  PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE,
  PROVIDER_SPEND_LIMIT_REACHED,
  ProviderSpendGateError,
  reserveTextProviderSpend,
  reserveVoiceProviderSpend,
} from '../../lib/limits/ProviderSpendGate';
import { closePool, query } from '../../lib/db/postgres';

const FREE_MEMBER = '00000000-0000-4000-8000-000000000101';
const PLUS_MEMBER = '00000000-0000-4000-8000-000000000102';
const PRO_MEMBER = '00000000-0000-4000-8000-000000000103';

function fulfilledCount(results: PromiseSettledResult<unknown>[]): number {
  return results.filter((result) => result.status === 'fulfilled').length;
}

function rejectedCodeCount(
  results: PromiseSettledResult<unknown>[],
  code: string,
): number {
  return results.filter((result) =>
    result.status === 'rejected'
      && result.reason instanceof ProviderSpendGateError
      && result.reason.code === code,
  ).length;
}

async function resetSchema(): Promise<void> {
  await query('DROP TABLE IF EXISTS usage_voice_monthly');
  await query('DROP TABLE IF EXISTS usage_voice_demo');
  await query('DROP TABLE IF EXISTS usage_daily');
  await query('DROP TABLE IF EXISTS members');

  await query(`
    CREATE TABLE members (
      id UUID PRIMARY KEY,
      tier TEXT NOT NULL
    )
  `);
  await query(`
    CREATE TABLE usage_daily (
      id BIGSERIAL PRIMARY KEY,
      member_id UUID NOT NULL,
      usage_date DATE NOT NULL,
      text_turns INTEGER NOT NULL DEFAULT 0,
      voice_seconds_tts INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (member_id, usage_date)
    )
  `);
  await query(`
    CREATE TABLE usage_voice_demo (
      id BIGSERIAL PRIMARY KEY,
      member_id UUID NOT NULL UNIQUE,
      voice_seconds_used INTEGER NOT NULL DEFAULT 0,
      voice_seconds_limit INTEGER NOT NULL DEFAULT 180,
      demo_exhausted BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE usage_voice_monthly (
      id BIGSERIAL PRIMARY KEY,
      member_id UUID NOT NULL,
      usage_month DATE NOT NULL,
      voice_seconds_used INTEGER NOT NULL DEFAULT 0,
      voice_seconds_limit INTEGER NOT NULL DEFAULT 1200,
      voice_boost_seconds INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (member_id, usage_month)
    )
  `);
  await query(
    'INSERT INTO members (id, tier) VALUES ($1, $2), ($3, $4), ($5, $6)',
    [FREE_MEMBER, 'free', PLUS_MEMBER, 'personal', PRO_MEMBER, 'pro'],
  );
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for the disposable PostgreSQL proof');
  }

  await resetSchema();
  const today = new Date().toISOString().slice(0, 10);
  const month = `${today.slice(0, 7)}-01`;

  await query(
    `INSERT INTO usage_daily (member_id, usage_date, text_turns)
     VALUES ($1, $2, 9)`,
    [FREE_MEMBER, today],
  );
  const textRace = await Promise.allSettled([
    reserveTextProviderSpend({
      memberId: FREE_MEMBER,
      provider: 'anthropic',
      purpose: 'text_generation',
    }),
    reserveTextProviderSpend({
      memberId: FREE_MEMBER,
      provider: 'anthropic',
      purpose: 'text_generation',
    }),
  ]);
  assert.equal(fulfilledCount(textRace), 1);
  assert.equal(rejectedCodeCount(textRace, PROVIDER_SPEND_LIMIT_REACHED), 1);
  const textFinal = await query<{ text_turns: number }>(
    'SELECT text_turns FROM usage_daily WHERE member_id = $1 AND usage_date = $2',
    [FREE_MEMBER, today],
  );
  assert.equal(textFinal.rows[0]?.text_turns, 10);

  await query(
    `INSERT INTO usage_voice_demo
       (member_id, voice_seconds_used, voice_seconds_limit, demo_exhausted)
     VALUES ($1, 179, 180, FALSE)`,
    [FREE_MEMBER],
  );
  const freeVoiceRace = await Promise.allSettled([
    reserveVoiceProviderSpend({
      memberId: FREE_MEMBER,
      estimatedSeconds: 1,
      provider: 'openai',
      purpose: 'voice_tts',
    }),
    reserveVoiceProviderSpend({
      memberId: FREE_MEMBER,
      estimatedSeconds: 1,
      provider: 'openai',
      purpose: 'voice_tts',
    }),
  ]);
  assert.equal(fulfilledCount(freeVoiceRace), 1);
  assert.equal(rejectedCodeCount(freeVoiceRace, PROVIDER_SPEND_LIMIT_REACHED), 1);
  const freeVoiceFinal = await query<{
    voice_seconds_used: number;
    demo_exhausted: boolean;
  }>(
    `SELECT voice_seconds_used, demo_exhausted
       FROM usage_voice_demo WHERE member_id = $1`,
    [FREE_MEMBER],
  );
  assert.equal(freeVoiceFinal.rows[0]?.voice_seconds_used, 180);
  assert.equal(freeVoiceFinal.rows[0]?.demo_exhausted, true);

  const freeDailyVoice = await query<{ voice_seconds_tts: number }>(
    'SELECT voice_seconds_tts FROM usage_daily WHERE member_id = $1 AND usage_date = $2',
    [FREE_MEMBER, today],
  );
  assert.equal(freeDailyVoice.rows[0]?.voice_seconds_tts, 1);

  await query(
    `INSERT INTO usage_voice_monthly
       (member_id, usage_month, voice_seconds_used, voice_seconds_limit, voice_boost_seconds)
     VALUES ($1, $2, 1199, 1200, 0)`,
    [PLUS_MEMBER, month],
  );
  const plusVoiceRace = await Promise.allSettled([
    reserveVoiceProviderSpend({
      memberId: PLUS_MEMBER,
      estimatedSeconds: 1,
      provider: 'openai',
      purpose: 'voice_tts',
    }),
    reserveVoiceProviderSpend({
      memberId: PLUS_MEMBER,
      estimatedSeconds: 1,
      provider: 'openai',
      purpose: 'voice_tts',
    }),
  ]);
  assert.equal(fulfilledCount(plusVoiceRace), 1);
  assert.equal(rejectedCodeCount(plusVoiceRace, PROVIDER_SPEND_LIMIT_REACHED), 1);
  const plusVoiceFinal = await query<{ voice_seconds_used: number }>(
    `SELECT voice_seconds_used FROM usage_voice_monthly
      WHERE member_id = $1 AND usage_month = $2`,
    [PLUS_MEMBER, month],
  );
  assert.equal(plusVoiceFinal.rows[0]?.voice_seconds_used, 1200);

  const plusDailyVoice = await query<{ voice_seconds_tts: number }>(
    'SELECT voice_seconds_tts FROM usage_daily WHERE member_id = $1 AND usage_date = $2',
    [PLUS_MEMBER, today],
  );
  assert.equal(plusDailyVoice.rows[0]?.voice_seconds_tts, 1);

  const proText = await reserveTextProviderSpend({
    memberId: PRO_MEMBER,
    provider: 'anthropic',
    purpose: 'text_generation',
  });
  assert.equal(proText.tier, 'studio_pro');

  await query('DROP TABLE usage_daily');
  await assert.rejects(
    () => reserveTextProviderSpend({
      memberId: PLUS_MEMBER,
      provider: 'anthropic',
      purpose: 'text_generation',
    }),
    (error: unknown) => {
      assert.ok(error instanceof ProviderSpendGateError);
      assert.equal(error.code, PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE);
      assert.equal(error.status, 503);
      return true;
    },
  );

  console.log(JSON.stringify({
    status: 'PASS',
    physical_database: 'PostgreSQL',
    concurrent_text_last_unit: 'one_admitted_one_refused',
    concurrent_free_voice_last_unit: 'one_admitted_one_refused',
    concurrent_member_plus_voice_last_unit: 'one_admitted_one_refused',
    accounting_failure: 'fail_closed_503',
    canonical_tiers: 'free_personal_pro_verified',
    rejected_racers_recorded_zero_usage: true,
    member_content_used: false,
    provider_calls_made: false,
    secrets_included: false,
  }));
}

main()
  .catch((error) => {
    console.error(JSON.stringify({
      status: 'FAIL',
      error_category: error instanceof Error ? error.name : typeof error,
      member_content_used: false,
      provider_calls_made: false,
      secrets_included: false,
    }));
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool().catch(() => undefined);
  });
