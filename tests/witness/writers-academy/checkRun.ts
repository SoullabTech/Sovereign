/**
 * Runs the mechanical quote check over a recorded accuracy-witness run.
 *   npx tsx tests/witness/writers-academy/checkRun.ts tests/witness/writers-academy/runs/<file>.json
 * Prints, per MAIA turn, each quoted span and whether it appears in the passage MAIA was given.
 * ⛔ Claims about length, order or effect are marked by a reader in the record, not here.
 */
import fs from 'node:fs';
import { checkQuotes, passageFacts } from './teachingAccuracy';
import { PASSAGE_A, PASSAGE_B } from './accuracyPassages';

type Turn = { thread: string; turn: number; speaker: string; body: string };

const THREADS: Record<string, { id: string; text: string }> = {
  'c4796ac6-59b7-4b7f-b8c1-753558103944': PASSAGE_A,
  '505278df-ae18-4332-b3f6-b696a79ecb83': PASSAGE_B,
};

const turns = JSON.parse(fs.readFileSync(process.argv[2]!, 'utf8')) as Turn[];
for (const [thread, passage] of Object.entries(THREADS)) {
  const f = passageFacts(passage.text);
  console.log(`\n== ${passage.id} · sentence words ${f.sentences.map((s) => s.words).join(', ')} · longest #${f.longest} · falling ${f.strictlyFalling}`);
  for (const t of turns.filter((x) => x.thread === thread)) {
    if (t.speaker !== 'maia') { console.log(`  [${t.turn}] writer: ${t.body}`); continue; }
    const body = t.body.replace(/\[\[answer:[^\]]*\]\]/g, '');
    const checks = checkQuotes(body, passage.text);
    console.log(`  [${t.turn}] MAIA · ${checks.length} quote(s)`);
    for (const c of checks) console.log(`      ${c.faithful ? 'FAITHFUL ' : 'NOT FOUND'}  “${c.quote}”`);
  }
}
