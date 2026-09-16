/**
 * C1-SELECTION-LAW-01 · pre-repair production-counterexample falsifier.
 *
 * Authority: founder handoff 2026-09-15 — take over the memory lane.
 * Scope: investigation only. No repair, no prompt change, no deployment.
 *
 * The frozen P1 corpus and W1 production corpus are the same session state. The only
 * material difference relevant here is the opaque retrospective probe wording.
 * A lawful selection mechanism may not lose the authoritative member-grounded path
 * merely because the member says "mentioned earlier" instead of "remember ... shared".
 */
import frozen from './l1-frozen-production-corpus.json';
import { recoverViaBridge } from '../../../lib/maia/continuity/sessionBridge';

interface Exchange {
  index: number;
  userMessage: string;
  maiaResponse: string;
}

const MARKER = 22;
const all = frozen.corpus as Exchange[];
const displaced = all.filter(e => e.index <= 37);
const activePrefix = all.filter(e => e.index >= 38 && e.index <= 39);

const probes = [
  { name: 'P1 frozen', probe: 'can you remember the phrase I shared with you eralier' },
  { name: 'W1 served', probe: 'what was that phrase I mentioned earlier?' },
  { name: 'paraphrase A', probe: 'can you recall the phrase I mentioned before?' },
  { name: 'paraphrase B', probe: 'do you remember what I said earlier?' },
  { name: 'paraphrase C', probe: 'what did I share with you before?' },
  { name: 'paraphrase D', probe: 'remind me what I said earlier' },
  { name: 'paraphrase E', probe: 'what was the thing I told you before?' },
  { name: 'paraphrase F', probe: 'can you bring back what I mentioned earlier?' },
] as const;

function run(probe: string) {
  const outcome = recoverViaBridge({ probe, activePrefix, displaced });
  const exchanges = outcome.kind === 'recovered' ? outcome.exchanges : [];
  return {
    kind: outcome.kind,
    indices: exchanges.map(e => e.index),
    via: [...new Set(exchanges.map(e => e.viaPrefixIndex))],
    marker: exchanges.some(e => e.index === MARKER),
  };
}

console.log('C1-SELECTION-LAW-01 · frozen-corpus paraphrase stability');
const results = probes.map(p => ({ ...p, ...run(p.probe) }));
for (const r of results) {
  console.log(`${r.marker ? '✅' : '❌'} ${r.name}`);
  console.log(`   ${JSON.stringify({ indices: r.indices, via: r.via, kind: r.kind })}`);
}

const p1 = results.find(r => r.name === 'P1 frozen')!;
const w1 = results.find(r => r.name === 'W1 served')!;

if (!p1.marker) {
  console.error('INSTRUMENT FAILURE: frozen P1 control no longer recovers marker 22');
  process.exit(2);
}

if (!w1.marker) {
  console.error('RED: exact W1 wording loses the authoritative member-grounded marker on the same frozen corpus');
  process.exit(1);
}

console.log('GREEN: W1 wording preserves the authoritative member-grounded path');
