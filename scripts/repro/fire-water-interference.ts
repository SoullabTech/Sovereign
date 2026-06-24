/**
 * Fire × Water — the first interference experiment (the first MEASURED field).
 *
 * Tests the Corpus Callosum model's central claim: can two sovereign intelligences generate meaningful
 * field information WITHOUT being synthesized? This harness does NOT merge Fire and Water into one
 * answer. It computes the RELATIONSHIP between their two sovereign readings on the SAME inputs and
 * PRESENTS the interference pattern. Derivation order (docs/lenses/RESONANT_FIELD_DOCTRINE): sovereign
 * reading → relationship → interference → (member). No synthesis, no verdict, no recommendation —
 * interference patterns are first-class observations, not conclusions.
 *
 * Pure computation over the existing observation fields (NO API calls):
 *   /tmp/fire-observations.json   (Fire v1.4, 24 situations)
 *   /tmp/water-observations.json  (Water v1,  the SAME 24 situations)
 *
 *   npx tsx scripts/repro/fire-water-interference.ts
 */

import { readFileSync } from 'fs';

type FireRow = { situation: string; p: { inJurisdiction: boolean; impulseQuality: string | null; vantage: string } };
type WaterRow = { situation: string; p: { inJurisdiction: boolean; currentQuality: string | null; vantage: string } };

const fire = (JSON.parse(readFileSync('/tmp/fire-observations.json', 'utf8')).results as FireRow[]);
const water = (JSON.parse(readFileSync('/tmp/water-observations.json', 'utf8')).results as WaterRow[]);

// Transparent, inspectable reduction of each lens's quality to a movement-state.
// (The interference is DERIVED from the actual readings via this visible rule — not asserted.)
const FIRE_STATE: Record<string, string> = {
  clean: 'moving', dimmed: 'arrested', tangled: 'arrested', reactive: 'charged', premature: 'charged', unclear: 'unreadable',
};
const WATER_STATE: Record<string, string> = {
  flowing: 'moving', releasing: 'moving', held: 'arrested', frozen: 'arrested', flooding: 'charged', murky: 'unreadable',
};

function stateOf(map: Record<string, string>, inJur: boolean, q: string | null): string {
  if (!inJur) return 'absent';
  if (!q) return 'unreadable';
  return map[q] ?? 'unreadable';
}

function relationship(f: string, w: string): string {
  if (f === 'absent' && w === 'absent') return 'NEITHER';
  if (f === 'absent') return 'WATER-ONLY';
  if (w === 'absent') return 'FIRE-ONLY';
  if (f === 'unreadable' || w === 'unreadable') return 'UNRESOLVED';
  if (f === 'arrested' && w === 'arrested') return 'STANDING-WAVE'; // both locate arrest (constructive)
  if (f === 'moving' && w === 'moving') return 'FLOW';             // both see movement (rare; coherence)
  if ((f === 'moving' && w === 'arrested') || (f === 'arrested' && w === 'moving')) return 'TENSION'; // divergent — most informative
  return 'CHARGED'; // at least one distorted/overwhelming movement
}

const byWater = new Map(water.map((r) => [r.situation, r]));
const tally: Record<string, number> = {};
const tensions: Array<{ s: string; f: FireRow; w: WaterRow }> = [];
let joined = 0;

console.log('FIRE × WATER — first interference field (computed from two sovereign readings, NOT synthesized)\n');
for (const f of fire) {
  const w = byWater.get(f.situation);
  if (!w) continue;
  joined++;
  const fs = stateOf(FIRE_STATE, f.p.inJurisdiction, f.p.impulseQuality);
  const ws = stateOf(WATER_STATE, w.p.inJurisdiction, w.p.currentQuality);
  const rel = relationship(fs, ws);
  tally[rel] = (tally[rel] || 0) + 1;
  if (rel === 'TENSION') tensions.push({ s: f.situation, f, w });
  console.log(
    `${rel.padEnd(13)} | Fire ${String(f.p.impulseQuality ?? '—').padEnd(9)}(${fs.padEnd(10)}) Water ${String(w.p.currentQuality ?? '—').padEnd(9)}(${ws.padEnd(10)}) | ${f.situation.slice(0, 56)}`,
  );
}

console.log('\n' + '═'.repeat(78));
console.log(`joined ${joined} shared situations`);
console.log('FIELD TALLY:', JSON.stringify(tally));
console.log('\nTENSIONS — divergent readings (one lens sees movement, the other sees arrest; the most informative interference):');
if (tensions.length === 0) console.log('  (none)');
for (const t of tensions) {
  console.log('\n  ' + t.s);
  console.log('  🔥 ' + t.f.p.vantage.replace(/\s+/g, ' ').slice(0, 160));
  console.log('  🌊 ' + t.w.p.vantage.replace(/\s+/g, ' ').slice(0, 160));
}
console.log('\n(NO synthesis line — the field is presented, not resolved.)');
