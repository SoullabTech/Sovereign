import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { computeTranscriptShadow, type TranscriptTurn } from '../../../lib/maia/gestaltStandingShadow/transcriptShadow';

interface InputFile {
  sessionId: string;
  turns: TranscriptTurn[];
}

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) {
  throw new Error('usage: shadow-transcript-snapshot.ts <input.json> <output.json>');
}

const input = JSON.parse(fs.readFileSync(inputArg, 'utf8')) as InputFile;
const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const processScope = `session:${hash(input.sessionId).slice(0, 20)}`;

const prefixes = input.turns.map((_, index) => input.turns.slice(0, index + 1));
const snapshots = prefixes.map((turns, index) => {
  const shadow = computeTranscriptShadow(turns, processScope);
  const standingCounts: Record<string, number> = {};
  for (const item of shadow.field.standing) {
    standingCounts[item.useAs] = (standingCounts[item.useAs] ?? 0) + 1;
  }
  const relationCounts: Record<string, number> = {};
  for (const relation of shadow.field.relations) {
    relationCounts[relation.predicate] = (relationCounts[relation.predicate] ?? 0) + 1;
  }
  const last = turns[turns.length - 1];
  return {
    index,
    at: last.createdAt,
    role: last.role,
    turnHash: hash(last.id),
    contentHash: hash(last.content),
    contentChars: last.content.length,
    standingCounts,
    relationCounts,
    ambiguousStandingActCount: shadow.ambiguousStandingActs.length,
  };
});
const finalShadow = computeTranscriptShadow(input.turns, processScope);
const standingById = new Map(finalShadow.field.standing.map((item) => [item.objectId, item]));
const relationEvents = finalShadow.field.relations.map((relation) => ({
  predicate: relation.predicate,
  relationHash: hash(relation.id),
  subjectHash: hash(relation.subjectId),
  objectHash: hash(relation.objectId),
  actor: relation.actor,
  resultingObjectUseAs: standingById.get(relation.objectId)?.useAs ?? null,
  at: relation.createdAt,
}));

const projection = finalShadow.projection;
const ambiguousStandingActs = finalShadow.ambiguousStandingActs.map((act) => ({
  predicateCandidate: act.predicateCandidate,
  subjectHash: hash(act.subjectId),
  targetHash: hash(act.targetId),
  reason: act.reason,
}));
const output = {
  schema: 'GESTALT_STANDING_SHADOW_TELEMETRY_V1',
  generatedAt: new Date().toISOString(),
  zeroInfluence: {
    mode: 'out-of-band-read-only-snapshot',
    servingImport: false,
    promptInfluence: false,
    responseInfluence: false,
    memberMemoryWrite: false,
  },
  sessionHash: hash(input.sessionId),
  processScope,
  turnCount: input.turns.length,
  snapshots,
  relationEvents,
  ambiguousStandingActs,
  projectionCounts: {
    established: projection.established.length,
    adopted: projection.adopted.length,
    provisional: projection.provisional.length,
    unresolved: projection.unresolved.length,
    historicalOnly: projection.historicalOnly.length,
    open: projection.open.length,
  },
};

fs.mkdirSync(path.dirname(outputArg), { recursive: true });
fs.writeFileSync(outputArg, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ outputArg, turnCount: input.turns.length, relationEvents, ambiguousStandingActs, projectionCounts: output.projectionCounts }, null, 2));
