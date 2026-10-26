import 'server-only';

import { transaction, type TransactionClient } from '../db/postgres';
import { FREE_TEXT_TURNS_PER_DAY, type MemberTier } from './LimitsEnforcer';

export const PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE =
  'PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE' as const;
export const PROVIDER_SPEND_LIMIT_REACHED =
  'PROVIDER_SPEND_LIMIT_REACHED' as const;
export const PROVIDER_SPEND_IDENTITY_REQUIRED =
  'PROVIDER_SPEND_IDENTITY_REQUIRED' as const;
export const PROVIDER_SPEND_REQUEST_INVALID =
  'PROVIDER_SPEND_REQUEST_INVALID' as const;

export type ProviderSpendErrorCode =
  | typeof PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE
  | typeof PROVIDER_SPEND_LIMIT_REACHED
  | typeof PROVIDER_SPEND_IDENTITY_REQUIRED
  | typeof PROVIDER_SPEND_REQUEST_INVALID;

export class ProviderSpendGateError extends Error {
  readonly code: ProviderSpendErrorCode;
  readonly status: number;

  constructor(code: ProviderSpendErrorCode, status: number, safeMessage: string) {
    super(safeMessage);
    this.name = 'ProviderSpendGateError';
    this.code = code;
    this.status = status;
  }
}

export function isProviderSpendGateError(
  error: unknown,
): error is ProviderSpendGateError {
  return error instanceof ProviderSpendGateError;
}

export type VoiceProviderSpendInput = {
  memberId: string;
  estimatedSeconds: number;
  provider: 'openai';
  purpose: 'voice_tts';
};

export type TextProviderSpendInput = {
  memberId: string;
  provider: 'anthropic' | 'openai' | 'other-cloud';
  purpose: 'text_generation';
};

export type VoiceProviderSpendReservation = {
  tier: MemberTier;
  reservedSeconds: number;
  provider: 'openai';
  purpose: 'voice_tts';
};

export type TextProviderSpendReservation = {
  tier: MemberTier;
  reservedTurns: 1;
  provider: TextProviderSpendInput['provider'];
  purpose: 'text_generation';
};

type SpendTransaction = <T>(
  callback: (client: TransactionClient) => Promise<T>,
) => Promise<T>;

export type ProviderSpendDependencies = {
  transaction: SpendTransaction;
};

const DEFAULT_DEPENDENCIES: ProviderSpendDependencies = { transaction };
const MAX_VOICE_RESERVATION_SECONDS = 600;

export function estimateVoiceSeconds(text: string): number {
  const normalized = text.trim();
  if (!normalized) return 1;
  return Math.max(
    1,
    Math.min(MAX_VOICE_RESERVATION_SECONDS, Math.ceil(normalized.length / 12.5)),
  );
}

function normalizedSeconds(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ProviderSpendGateError(
      PROVIDER_SPEND_REQUEST_INVALID,
      400,
      'Provider usage request is invalid.',
    );
  }
  return Math.min(MAX_VOICE_RESERVATION_SECONDS, Math.max(1, Math.ceil(value)));
}

function requireMemberId(value: string): string {
  const memberId = value?.trim();
  if (!memberId) {
    throw new ProviderSpendGateError(
      PROVIDER_SPEND_IDENTITY_REQUIRED,
      401,
      'Authentication required for provider usage.',
    );
  }
  return memberId;
}

function mapMemberTier(value: unknown): MemberTier {
  if (value === 'studio_pro' || value === 'studio' || value === 'pro') return 'studio_pro';
  if (value === 'member_plus' || value === 'supporter' || value === 'member' || value === 'personal') {
    return 'member_plus';
  }
  return 'free';
}

function utcDateParts(now: Date): { day: string; month: string } {
  const year = now.getUTCFullYear();
  const monthNumber = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dayNumber = String(now.getUTCDate()).padStart(2, '0');
  return {
    day: `${year}-${monthNumber}-${dayNumber}`,
    month: `${year}-${monthNumber}-01`,
  };
}

async function loadMemberTier(
  client: TransactionClient,
  memberId: string,
): Promise<MemberTier> {
  const member = await client.query<{ tier: string | null }>(
    `/* provider-spend:member-tier */
     SELECT tier FROM members WHERE id = $1`,
    [memberId],
  );
  if (member.rows.length !== 1) {
    throw new ProviderSpendGateError(
      PROVIDER_SPEND_IDENTITY_REQUIRED,
      401,
      'Authentication required for provider usage.',
    );
  }
  return mapMemberTier(member.rows[0]?.tier);
}

async function reserveFreeTextTurn(
  client: TransactionClient,
  memberId: string,
  day: string,
): Promise<void> {
  await client.query(
    `/* provider-spend:text-free-initialize */
     INSERT INTO usage_daily (member_id, usage_date, text_turns)
     VALUES ($1, $2, 0)
     ON CONFLICT (member_id, usage_date) DO NOTHING`,
    [memberId, day],
  );

  const result = await client.query(
    `/* provider-spend:text-free-reserve */
     UPDATE usage_daily
        SET text_turns = COALESCE(text_turns, 0) + 1,
            updated_at = NOW()
      WHERE member_id = $1
        AND usage_date = $2
        AND COALESCE(text_turns, 0) < $3
      RETURNING text_turns`,
    [memberId, day, FREE_TEXT_TURNS_PER_DAY],
  );

  if (result.rows.length !== 1) {
    throw new ProviderSpendGateError(
      PROVIDER_SPEND_LIMIT_REACHED,
      429,
      "You're working at today's capacity. We can continue tomorrow, or you can expand to give MAIA more room.",
    );
  }
}

async function reserveMeteredTextTurn(
  client: TransactionClient,
  memberId: string,
  day: string,
): Promise<void> {
  const result = await client.query(
    `/* provider-spend:text-metered-reserve */
     INSERT INTO usage_daily (member_id, usage_date, text_turns)
     VALUES ($1, $2, 1)
     ON CONFLICT (member_id, usage_date)
     DO UPDATE SET
       text_turns = COALESCE(usage_daily.text_turns, 0) + 1,
       updated_at = NOW()
     RETURNING text_turns`,
    [memberId, day],
  );

  if (result.rows.length !== 1) {
    throw new Error('text reservation did not return a row');
  }
}

async function reserveFreeVoice(
  client: TransactionClient,
  memberId: string,
  seconds: number,
): Promise<void> {
  await client.query(
    `/* provider-spend:free-initialize */
     INSERT INTO usage_voice_demo (member_id, voice_seconds_used, demo_exhausted)
     VALUES ($1, 0, FALSE)
     ON CONFLICT (member_id) DO NOTHING`,
    [memberId],
  );

  const result = await client.query(
    `/* provider-spend:free-reserve */
     UPDATE usage_voice_demo
        SET voice_seconds_used = COALESCE(voice_seconds_used, 0) + $2,
            demo_exhausted = (COALESCE(voice_seconds_used, 0) + $2) >= voice_seconds_limit,
            updated_at = NOW()
      WHERE member_id = $1
        AND COALESCE(demo_exhausted, FALSE) = FALSE
        AND COALESCE(voice_seconds_used, 0) + $2 <= voice_seconds_limit
      RETURNING voice_seconds_used, voice_seconds_limit, demo_exhausted`,
    [memberId, seconds],
  );

  if (result.rows.length !== 1) {
    throw new ProviderSpendGateError(
      PROVIDER_SPEND_LIMIT_REACHED,
      429,
      'Cloud voice time is not available for this account right now.',
    );
  }
}

async function reserveMemberPlusVoice(
  client: TransactionClient,
  memberId: string,
  month: string,
  seconds: number,
): Promise<void> {
  await client.query(
    `/* provider-spend:member-plus-initialize */
     INSERT INTO usage_voice_monthly (member_id, usage_month, voice_seconds_used)
     VALUES ($1, $2, 0)
     ON CONFLICT (member_id, usage_month) DO NOTHING`,
    [memberId, month],
  );

  const result = await client.query(
    `/* provider-spend:member-plus-reserve */
     UPDATE usage_voice_monthly
        SET voice_seconds_used = COALESCE(voice_seconds_used, 0) + $3,
            updated_at = NOW()
      WHERE member_id = $1
        AND usage_month = $2
        AND COALESCE(voice_seconds_used, 0) + $3
              <= voice_seconds_limit + COALESCE(voice_boost_seconds, 0)
      RETURNING voice_seconds_used, voice_seconds_limit, voice_boost_seconds`,
    [memberId, month, seconds],
  );

  if (result.rows.length !== 1) {
    throw new ProviderSpendGateError(
      PROVIDER_SPEND_LIMIT_REACHED,
      429,
      'Cloud voice time is not available for this account right now.',
    );
  }
}

async function recordDailyVoiceReservation(
  client: TransactionClient,
  memberId: string,
  day: string,
  seconds: number,
): Promise<void> {
  const result = await client.query(
    `/* provider-spend:daily-reserve */
     INSERT INTO usage_daily (member_id, usage_date, voice_seconds_tts)
     VALUES ($1, $2, $3)
     ON CONFLICT (member_id, usage_date)
     DO UPDATE SET
       voice_seconds_tts = COALESCE(usage_daily.voice_seconds_tts, 0)
                           + EXCLUDED.voice_seconds_tts,
       updated_at = NOW()
     RETURNING voice_seconds_tts`,
    [memberId, day, seconds],
  );

  if (result.rows.length !== 1) {
    throw new Error('voice reservation did not return a row');
  }
}

/**
 * Reserve one paid text-generation turn atomically before provider dispatch.
 */
export async function reserveTextProviderSpendWithClient(
  client: TransactionClient,
  input: TextProviderSpendInput,
  now = new Date(),
): Promise<TextProviderSpendReservation> {
  const memberId = requireMemberId(input.memberId);
  if (
    input.purpose !== 'text_generation' ||
    !['anthropic', 'openai', 'other-cloud'].includes(input.provider)
  ) {
    throw new ProviderSpendGateError(
      PROVIDER_SPEND_REQUEST_INVALID,
      400,
      'Provider usage request is invalid.',
    );
  }

  const { day } = utcDateParts(now);
  const tier = await loadMemberTier(client, memberId);
  if (tier === 'free') {
    await reserveFreeTextTurn(client, memberId, day);
  } else {
    await reserveMeteredTextTurn(client, memberId, day);
  }

  return {
    tier,
    reservedTurns: 1,
    provider: input.provider,
    purpose: input.purpose,
  };
}

/**
 * Reserve estimated paid voice usage atomically before provider dispatch.
 */
export async function reserveVoiceProviderSpendWithClient(
  client: TransactionClient,
  input: VoiceProviderSpendInput,
  now = new Date(),
): Promise<VoiceProviderSpendReservation> {
  const memberId = requireMemberId(input.memberId);
  if (input.provider !== 'openai' || input.purpose !== 'voice_tts') {
    throw new ProviderSpendGateError(
      PROVIDER_SPEND_REQUEST_INVALID,
      400,
      'Provider usage request is invalid.',
    );
  }

  const seconds = normalizedSeconds(input.estimatedSeconds);
  const { day, month } = utcDateParts(now);
  const tier = await loadMemberTier(client, memberId);
  if (tier === 'free') {
    await reserveFreeVoice(client, memberId, seconds);
  } else if (tier === 'member_plus') {
    await reserveMemberPlusVoice(client, memberId, month, seconds);
  }

  await recordDailyVoiceReservation(client, memberId, day, seconds);
  return {
    tier,
    reservedSeconds: seconds,
    provider: input.provider,
    purpose: input.purpose,
  };
}

async function reserveWithFailClosedAccounting<T>(
  action: (client: TransactionClient) => Promise<T>,
  dependencies: ProviderSpendDependencies,
): Promise<T> {
  try {
    const outcome = await dependencies.transaction(async (client) => {
      try {
        return { admitted: true as const, value: await action(client) };
      } catch (error) {
        // A policy refusal is an expected outcome, not a database fault. Return
        // it through the transaction so initialization/no-op statements can
        // settle without teaching operators to ignore rollback errors.
        if (isProviderSpendGateError(error)) {
          return { admitted: false as const, error };
        }
        throw error;
      }
    });
    if (!outcome.admitted) throw outcome.error;
    return outcome.value;
  } catch (error) {
    if (isProviderSpendGateError(error)) throw error;
    throw new ProviderSpendGateError(
      PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE,
      503,
      'Provider service is temporarily unavailable because usage accounting could not be confirmed.',
    );
  }
}

export async function reserveTextProviderSpend(
  input: TextProviderSpendInput,
  dependencies: ProviderSpendDependencies = DEFAULT_DEPENDENCIES,
): Promise<TextProviderSpendReservation> {
  return reserveWithFailClosedAccounting(
    (client) => reserveTextProviderSpendWithClient(client, input),
    dependencies,
  );
}

/**
 * This reservation is intentionally conservative. A provider failure after a
 * successful reservation does not automatically refund usage because there is
 * not yet an independently idempotent settlement ledger. Over-counting a failed
 * request is safer than spending outside a durable accounting boundary. Local
 * voice paths do not call this gate and remain available during an accounting
 * outage.
 */
export async function reserveVoiceProviderSpend(
  input: VoiceProviderSpendInput,
  dependencies: ProviderSpendDependencies = DEFAULT_DEPENDENCIES,
): Promise<VoiceProviderSpendReservation> {
  return reserveWithFailClosedAccounting(
    (client) => reserveVoiceProviderSpendWithClient(client, input),
    dependencies,
  );
}
