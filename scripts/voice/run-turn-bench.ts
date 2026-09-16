#!/usr/bin/env npx tsx
import { readFileSync } from 'fs';
import { decideTurn } from '../../lib/voice/turnArbiter';
import { evaluateTurnBench, evaluateTurnBenchByClass } from '../../lib/voice/turnBench';
import { parseTurnBenchCase } from '../../lib/voice/turnBenchCorpus';

const path = process.argv[2];
if (!path) {
  console.error('usage: npx tsx scripts/voice/run-turn-bench.ts <cases.jsonl>');
  process.exit(2);
}

const lines = readFileSync(path, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const cases = lines.map((line, i) => {
  try { return parseTurnBenchCase(JSON.parse(line)); }
  catch (error) { throw new Error(`line ${i + 1}: ${error instanceof Error ? error.message : String(error)}`); }
});

const scored = cases.map((c) => {
  const result = decideTurn(c.evidence);
  return {
    id: c.id,
    pauseClass: c.pauseClass,
    label: c.label,
    decision: result.decision,
    latencyMs: c.referenceLatencyMs,
  };
});

const summary = {
  overall: evaluateTurnBench(scored),
  byClass: evaluateTurnBenchByClass(scored),
};
console.log(JSON.stringify(summary, null, 2));
