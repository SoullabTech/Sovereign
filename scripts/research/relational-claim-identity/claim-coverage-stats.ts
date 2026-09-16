import crypto from 'node:crypto';
import fs from 'node:fs';
import { segmentClaimUnits } from '../../../lib/maia/claimIdentityShadow/claimUnits';

interface Turn { id: string; role: string; content: string; }
interface Snapshot { sessionId: string; turns: Turn[]; }

const files = process.argv.slice(2);
if (!files.length) throw new Error('provide snapshot paths');

for (const file of files) {
  const input = JSON.parse(fs.readFileSync(file, 'utf8')) as Snapshot;
  const assistant = input.turns.filter((t) => t.role === 'assistant' || t.role === 'maia');
  const units = assistant.flatMap((t) => segmentClaimUnits(t.id, t.content));
  const byKind: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const u of units) {
    byKind[u.kind] = (byKind[u.kind] ?? 0) + 1;
    byStatus[u.segmentationStatus] = (byStatus[u.segmentationStatus] ?? 0) + 1;
  }
  const perTurn = assistant.map((t) => segmentClaimUnits(t.id, t.content).length);
  console.log(JSON.stringify({
    sessionHash: crypto.createHash('sha256').update(input.sessionId).digest('hex'),
    assistantTurns: assistant.length,
    claimUnits: units.length,
    byKind,
    byStatus,
    meanUnitsPerTurn: Number((units.length / Math.max(1, assistant.length)).toFixed(2)),
    maxUnitsPerTurn: Math.max(0, ...perTurn),
  }));
}
