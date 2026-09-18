import { createHash } from 'node:crypto';
import { query } from '@/lib/db/postgres';
import type { StandingEvidence } from '../../../scripts/research/structural-standing/standing-envelope';
import type {
  EvidenceManifestItem, HistoricalMemberRow, RelationalFieldPacket,
} from './types';

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');
const HISTORY_LIMIT = 8;
export const H8_CURRENT_SESSION_LIMIT = 4;
export const H8_CROSS_SESSION_LIMIT = 4;

export async function loadPriorMemberTurns(
  sessionId: string,
  currentExchangeId: string,
  limit = HISTORY_LIMIT,
): Promise<HistoricalMemberRow[]> {
  const result = await query<{
    id: string;
    exchangeId: string | null;
    content: string;
    createdAt: string;
  }>(
    `SELECT id::text AS id,
            exchange_id::text AS "exchangeId",
            content,
            created_at::text AS "createdAt"
       FROM conversation_turns
      WHERE session_id = $1
        AND role = 'user'
        AND (exchange_id IS NULL OR exchange_id::text <> $2)
      ORDER BY created_at DESC, seq DESC
      LIMIT $3`,
    [sessionId, currentExchangeId, limit],
  );
  return [...(result.rows ?? [])].reverse().map((row) => ({
    ...row,
    sourceKind: 'conversation_turn' as const,
  }));
}

/**
 * H8 cross-session continuity read.
 *
 * This is intentionally NOT loadConversationalRecallPref(): the live helper
 * defaults true on lookup failure. Invisible research must be stricter.
 *
 * The JOIN makes consent fail closed in the query itself:
 * - no member row -> no evidence
 * - NULL/FALSE preference -> no evidence
 * - query failure -> []
 *
 * Only member-authored turns are eligible. Assistant turns never become member
 * evidence merely because they appeared in a prior conversation.
 */
export async function loadH8CrossSessionMemberTurns(
  memberId: string,
  currentSessionId: string,
  limit = H8_CROSS_SESSION_LIMIT,
): Promise<HistoricalMemberRow[]> {
  if (!memberId || !currentSessionId || limit <= 0) return [];
  try {
    const result = await query<{
      id: string;
      exchangeId: string | null;
      content: string;
      createdAt: string;
    }>(
      `SELECT t.id::text AS id,
              t.exchange_id::text AS "exchangeId",
              t.content,
              t.created_at::text AS "createdAt"
         FROM conversation_turns t
         JOIN members m ON m.id = t.user_id
        WHERE t.user_id = $1
          AND m.conversational_recall_enabled IS TRUE
          AND t.role = 'user'
          AND t.session_id IS NOT NULL
          AND t.session_id <> $2
        ORDER BY t.created_at DESC, t.seq DESC
        LIMIT $3`,
      [memberId, currentSessionId, limit],
    );
    return [...(result.rows ?? [])].reverse().map((row) => ({
      ...row,
      sourceKind: 'cross_session_turn' as const,
    }));
  } catch (err) {
    console.warn(
      '[RELATIONAL-FIELD-SHADOW][H8] cross-session read failed closed',
      err instanceof Error ? err.name : typeof err,
    );
    return [];
  }
}

export function assembleRelationalFieldPacket(input: {
  readonly exchangeId: string;
  readonly userInput: string;
  readonly priorMemberTurns: readonly HistoricalMemberRow[];
}): RelationalFieldPacket {
  const prior = input.priorMemberTurns.slice(-HISTORY_LIMIT);
  const evidence: StandingEvidence[] = [];
  const manifest: EvidenceManifestItem[] = [];

  prior.forEach((row, index) => {
    const evidenceId = `E${index + 1}`;
    evidence.push({
      id: evidenceId,
      text: row.content,
      authoredBy: 'member',
      participationClass: 'authored',
      authority: 'situate',
    });
    manifest.push({
      evidenceId,
      sourceKind: row.sourceKind ?? 'conversation_turn',
      sourceRowId: row.id,
      exchangeId: row.exchangeId,
      contentSha256: sha256(row.content),
      createdAt: row.createdAt,
      current: false,
    });
  });

  const currentEvidenceId = `E${prior.length + 1}`;
  evidence.push({
    id: currentEvidenceId,
    text: input.userInput,
    authoredBy: 'member',
    participationClass: 'authored',
    authority: 'situate',
  });
  manifest.push({
    evidenceId: currentEvidenceId,
    sourceKind: 'current_request',
    sourceRowId: null,
    exchangeId: input.exchangeId,
    contentSha256: sha256(input.userInput),
    createdAt: null,
    current: true,
  });

  const packetDigest = sha256(JSON.stringify(manifest.map((m) => ({
    evidenceId: m.evidenceId,
    sourceKind: m.sourceKind,
    sourceRowId: m.sourceRowId,
    exchangeId: m.exchangeId,
    contentSha256: m.contentSha256,
    current: m.current,
  }))));

  return { evidence, currentEvidenceId, manifest, packetDigest };
}

export function assembleH8RelationalFieldPacket(input: {
  readonly exchangeId: string;
  readonly userInput: string;
  readonly currentSessionMemberTurns: readonly HistoricalMemberRow[];
  readonly crossSessionMemberTurns: readonly HistoricalMemberRow[];
}): RelationalFieldPacket {
  const priorMemberTurns = [
    ...input.crossSessionMemberTurns.slice(-H8_CROSS_SESSION_LIMIT),
    ...input.currentSessionMemberTurns.slice(-H8_CURRENT_SESSION_LIMIT),
  ];
  return assembleRelationalFieldPacket({
    exchangeId: input.exchangeId,
    userInput: input.userInput,
    priorMemberTurns,
  });
}
