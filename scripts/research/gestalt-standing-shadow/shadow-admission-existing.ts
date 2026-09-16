import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { adaptTranscript, type TranscriptTurn } from '../../../lib/maia/gestaltStandingShadow/transcriptShadow';

interface InputFile { sessionId: string; turns: TranscriptTurn[] }
const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) throw new Error('usage: shadow-admission-existing.ts <input.json> <output.json>');

const input = JSON.parse(fs.readFileSync(inputArg, 'utf8')) as InputFile;
const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const scope = `session:${hash(input.sessionId).slice(0, 20)}`;
const adapted = adaptTranscript(input.turns, scope);
const turnByEvidenceId = new Map(input.turns.map((turn) => [`turn:${turn.id}`, turn]));

function words(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(Boolean);
}

function hasExactMemberPhrase(sentence: string, priorMember: readonly TranscriptTurn[], width = 8): boolean {
  const target = words(sentence).join(' ');
  for (const turn of priorMember) {
    const w = words(turn.content);
    for (let i = 0; i <= w.length - width; i += 1) {
      if (target.includes(w.slice(i, i + width).join(' '))) return true;
    }
  }
  return false;
}

const standingActs = adapted.relations.filter((r) => r.predicate === 'CONFIRMS' || r.predicate === 'CONTESTS');
const boundEvents = standingActs.map((relation) => {
  const target = turnByEvidenceId.get(relation.objectId)!;
  const targetIndex = input.turns.findIndex((turn) => `turn:${turn.id}` === relation.objectId);
  const priorMember = input.turns.slice(0, targetIndex).filter((turn) => turn.role === 'user' || turn.role === 'member');
  const sentences = target.content.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
  return {
    binding: 'BOUND' as const,
    predicate: relation.predicate,
    targetTurnHash: hash(target.id),
    targetChars: target.content.length,
    sentenceCount: sentences.length,
    sentences: sentences.map((sentence) => ({
      sentenceHash: hash(sentence),
      chars: sentence.length,
      detectorClass: sentence.includes('?') ? 'QUESTION' : hasExactMemberPhrase(sentence, priorMember) ? 'GROUNDED_CANDIDATE' : 'CANDIDATE',
    })),
  };
});

const ambiguousEvents = adapted.ambiguousStandingActs.map((act) => {
  const target = turnByEvidenceId.get(act.targetId)!;
  const targetIndex = input.turns.findIndex((turn) => `turn:${turn.id}` === act.targetId);
  const priorMember = input.turns.slice(0, targetIndex).filter((turn) => turn.role === 'user' || turn.role === 'member');
  const sentences = target.content.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
  return {
    binding: 'AMBIGUOUS' as const,
    predicate: act.predicateCandidate,
    reason: act.reason,
    targetTurnHash: hash(target.id),
    targetChars: target.content.length,
    sentenceCount: sentences.length,
    sentences: sentences.map((sentence) => ({
      sentenceHash: hash(sentence),
      chars: sentence.length,
      detectorClass: sentence.includes('?') ? 'QUESTION' : hasExactMemberPhrase(sentence, priorMember) ? 'GROUNDED_CANDIDATE' : 'CANDIDATE',
    })),
  };
});
const events = [...boundEvents, ...ambiguousEvents];

const output = {
  schema: 'GESTALT_STANDING_SHADOW_ADMISSION_DETECTOR_V1',
  generatedAt: new Date().toISOString(),
  authority: 'detector-only; never grants standing',
  zeroInfluence: true,
  sessionHash: hash(input.sessionId),
  eventCount: events.length,
  events,
};

fs.mkdirSync(path.dirname(outputArg), { recursive: true });
fs.writeFileSync(outputArg, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ outputArg, eventCount: events.length, events }, null, 2));
