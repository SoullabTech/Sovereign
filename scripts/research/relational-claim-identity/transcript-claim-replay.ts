import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { segmentClaimUnits } from '../../../lib/maia/claimIdentityShadow/claimUnits';
import { bindGesture, classifyGesture } from '../../../lib/maia/claimIdentityShadow/gestureBinding';

interface Turn {
  id: string;
  role: string;
  content: string;
  createdAt?: string;
}
interface Snapshot { sessionId: string; turns: Turn[]; }

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) throw new Error('usage: transcript-claim-replay.ts <input.json> <output.json>');

const input = JSON.parse(fs.readFileSync(inputArg, 'utf8')) as Snapshot;
const hash = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

const events: unknown[] = [];
let priorAssistant: { turn: Turn; claims: ReturnType<typeof segmentClaimUnits> } | null = null;
for (const turn of input.turns) {
  if (turn.role === 'assistant' || turn.role === 'maia') {
    priorAssistant = { turn, claims: segmentClaimUnits(turn.id, turn.content) };
    continue;
  }
  if (turn.role !== 'user' && turn.role !== 'member') continue;

  const gesture = classifyGesture(turn.content);
  if (gesture === 'OTHER' || !priorAssistant) continue;
  const binding = bindGesture(turn.content, priorAssistant.claims);
  const target = binding.targetClaimId
    ? priorAssistant.claims.find((c) => c.claimId === binding.targetClaimId)
    : undefined;

  events.push({
    memberTurnHash: hash(turn.id),
    priorAssistantTurnHash: hash(priorAssistant.turn.id),
    gesture,
    outcome: binding.outcome,
    reason: binding.reason,
    candidateCount: binding.candidateClaimIds.length,
    targetClaimId: binding.targetClaimId ?? null,
    targetKind: target?.kind ?? null,
    targetSegmentationStatus: target?.segmentationStatus ?? null,
    targetStartChar: target?.startChar ?? null,
    targetEndChar: target?.endChar ?? null,
    targetTextHash: target?.exactTextHash ?? null,
  });
}
const output = {
  schema: 'RELATIONAL_CLAIM_IDENTITY_REPLAY_V1',
  zeroInfluence: true,
  sessionHash: hash(input.sessionId),
  turnCount: input.turns.length,
  eventCount: events.length,
  events,
};

fs.mkdirSync(path.dirname(outputArg), { recursive: true });
fs.writeFileSync(outputArg, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
