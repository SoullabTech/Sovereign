import { createHash } from 'node:crypto';
import { query } from '@/lib/db/postgres';
import type { StandingEvidence } from '../../../scripts/research/structural-standing/standing-envelope';
import type {
  EvidenceManifestItem, HistoricalMemberRow, RelationalFieldPacket,
} from './types';

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');
const HISTORY_LIMIT = 8;

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
  return [...(result.rows ?? [])].reverse();
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
      sourceKind: 'conversation_turn',
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
