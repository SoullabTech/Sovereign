/**
 * RF01 S1-B — separately granted external model processing.
 *
 * No client metadata, ordinary remembrance receipt, or environment setting
 * can grant Anthropic access by implication. Records contain no writing or
 * generated content. The S1-A Sanctuary Send hold remains active.
 *
 * Provider grant = one exchange, one verified owner/session, Anthropic TEXT
 * processing only. It does not approve local HTTP inference, TTS, retention,
 * multi-engine calls, other providers, summarization or cloud storage.
 */
import { query } from '@/lib/db/postgres';
import { validExchangeId, EXPLICIT_PREFLIGHT_SOURCE } from './explicitTurnConsent';

export const S1B_PROVIDER = 'anthropic' as const;
export const S1B_PURPOSE = 'turn_text_generation' as const;
export const S1B_DISCLOSURE = 'rf01-s1b-anthropic-turn-v1' as const;
export const S1B_GRANT_AGE_MS = 5 * 60_000;

type ProcessingGrantRow = {
  request_id: string;
  member_id: string;
  session_id: string;
  processor: string;
  purpose: string;
  disclosure_version: string;
  granted_at: Date | string;
  expires_at: Date | string;
  posture: string;
  resolved_from: string;
  owner_id: string | null;
  session_status: string;
};

export type ProcessingGrantOutcome =
  | { ok: true; processor: typeof S1B_PROVIDER; expiresAt: string }
  | { ok: false; code: string };

/** An Anthropic grant does not approve local, Moonshot, or multi-engine. */
export class UnqualifiedProtectedProcessor extends Error {
  readonly code = 'PROTECTED_PROCESSOR_UNQUALIFIED';
  constructor() {
    super('PROTECTED_PROCESSOR_UNQUALIFIED');
    this.name = 'UnqualifiedProtectedProcessor';
  }
}
export function rejectUnqualifiedProtectedProcessor(meta?: Record<string, unknown>): void {
  if (meta?.sanctuary === true) throw new UnqualifiedProtectedProcessor();
}

export class UnapprovedExternalProcessing extends Error {
  readonly code = 'EXTERNAL_PROCESSING_NOT_AUTHORIZED';
  constructor() {
    super('EXTERNAL_PROCESSING_NOT_AUTHORIZED');
    this.name = 'UnapprovedExternalProcessing';
  }
}

function isActorIdentity(memberId: unknown, sessionId: unknown, exchangeId: unknown):
  memberId is string {
  return typeof memberId === 'string' && memberId.length > 0 &&
    typeof sessionId === 'string' && sessionId.trim().length > 0 &&
    sessionId.length <= 200 && validExchangeId(exchangeId);
}

function matchesGrant(
  row: ProcessingGrantRow | undefined,
  memberId: string,
  sessionId: string,
  exchangeId: string,
): boolean {
  if (!row || row.request_id !== exchangeId ||
      row.member_id !== memberId || row.owner_id !== memberId ||
      row.session_id !== sessionId || row.session_status !== 'active' ||
      row.processor !== S1B_PROVIDER || row.purpose !== S1B_PURPOSE ||
      row.disclosure_version !== S1B_DISCLOSURE ||
      row.posture !== 'sanctuary' ||
      row.resolved_from !== EXPLICIT_PREFLIGHT_SOURCE) return false;

  const expiry = new Date(row.expires_at).getTime();
  const issued = new Date(row.granted_at).getTime();
  const now = Date.now();
  return Number.isFinite(expiry) && Number.isFinite(issued) &&
    issued <= now + 30_000 && issued >= now - S1B_GRANT_AGE_MS - 30_000 &&
    expiry > now && expiry <= issued + S1B_GRANT_AGE_MS + 1000;
}

const READ_GRANT = [
  'SELECT g.request_id,g.member_id,g.session_id,g.processor,g.purpose,',
  'g.disclosure_version,g.granted_at,g.expires_at,',
  'c.posture,c.resolved_from,s.member_id AS owner_id,s.status AS session_status',
  'FROM runtime_processing_grants g',
  'JOIN runtime_consent_state c ON c.request_id = g.request_id',
  'JOIN maia_sessions s ON s.id = g.session_id',
  'WHERE g.request_id = $1 LIMIT 1',
].join(' ');

/** Check the actual database record, never client-authored meta, before egress. */
export async function verifyAnthropicTurnGrant(input: {
  memberId: unknown;
  sessionId: unknown;
  exchangeId: unknown;
}): Promise<ProcessingGrantOutcome> {
  if (!isActorIdentity(input.memberId, input.sessionId, input.exchangeId)) {
    return { ok: false, code: 'PROCESSING_IDENTITY_UNRESOLVED' };
  }
  try {
    const result = await query<ProcessingGrantRow>(READ_GRANT, [input.exchangeId]);
    const row = result.rows[0];
    if (!matchesGrant(row, input.memberId, input.sessionId as string, input.exchangeId as string)) {
      return { ok: false, code: 'PROCESSING_GRANT_MISSING_OR_MISMATCHED' };
    }
    return {
      ok: true, processor: S1B_PROVIDER,
      expiresAt: new Date(row.expires_at).toISOString(),
    };
  } catch {
    return { ok: false, code: 'PROCESSING_GRANT_STORE_UNAVAILABLE' };
  }
}

/** Authenticated, content-free issuance; it never calls the model provider. */
export async function issueAnthropicTurnGrant(input: {
  memberId: string;
  sessionId: string;
  exchangeId: string;
  disclosureVersion: string;
  explicitProcessorAuthorization: boolean;
}): Promise<ProcessingGrantOutcome> {
  if (!isActorIdentity(input.memberId, input.sessionId, input.exchangeId)) {
    return { ok: false, code: 'PROCESSING_IDENTITY_UNRESOLVED' };
  }
  if (input.disclosureVersion !== S1B_DISCLOSURE ||
      input.explicitProcessorAuthorization !== true) {
    return { ok: false, code: 'EXPLICIT_PROVIDER_PERMISSION_REQUIRED' };
  }
  try {
    // Atomic first-writer issue only when the authoritative Sanctuary receipt
    // and active member-owned session already exist and are still fresh.
    await query(
      'INSERT INTO runtime_processing_grants ' +
      '(request_id,member_id,session_id,processor,purpose,disclosure_version) ' +
      'SELECT c.request_id,c.member_id,c.session_id,$4,$5,$6 ' +
      'FROM runtime_consent_state c ' +
      'JOIN maia_sessions s ON s.id = c.session_id ' +
      'AND s.member_id = c.member_id AND s.status = \'active\' ' +
      'WHERE c.request_id=$1 AND c.member_id=$2 AND c.session_id=$3 ' +
      'AND c.posture=\'sanctuary\' AND c.resolved_from=$7 ' +
      'AND c.resolved_at >= NOW() - INTERVAL \'15 minutes\' ' +
      'AND c.resolved_at <= NOW() + INTERVAL \'30 seconds\' ' +
      'ON CONFLICT (request_id) DO NOTHING',
      [input.exchangeId,input.memberId,input.sessionId,
        S1B_PROVIDER,S1B_PURPOSE,S1B_DISCLOSURE,EXPLICIT_PREFLIGHT_SOURCE],
    );
  } catch {
    return { ok: false, code: 'PROCESSING_GRANT_STORE_UNAVAILABLE' };
  }
  return verifyAnthropicTurnGrant(input);
}

/** A protected model may not infer provider permission from the posture flag. */
export async function requireAnthropicTurnGrant(meta: Record<string, unknown> | undefined):
  Promise<void> {
  // Issuance and dispatch are independently default-off. A DB record alone
  // cannot promote a held design into live external processing.
  if (process.env.RF01_S1B_PROVIDER_DISPATCH_ENABLED !== '1') {
    throw new UnapprovedExternalProcessing();
  }
  const grant = await verifyAnthropicTurnGrant({
    memberId: meta?.userId,
    sessionId: meta?.sessionId,
    exchangeId: meta?.exchangeId,
  });
  if (!grant.ok) throw new UnapprovedExternalProcessing();
}
