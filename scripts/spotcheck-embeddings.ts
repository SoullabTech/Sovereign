/**
 * spotcheck-embeddings.ts — READ-ONLY query-relevance spot check
 *
 * Bounded human-sanity pass before an embedding cutover. For a handful of
 * real cues (leave-one-out: each cue is an actual memory; retrieve top-5 of
 * the OTHER memories), it judges whether the retrieved memories are
 * recognizably relevant to the cue — under BOTH the stored OpenAI vectors
 * and local nomic-embed-text.
 *
 * Relevance is scored by a LOCAL model (qwen2.5:7b via Ollama), so cue/memory
 * text never leaves the host. Only aggregate scores are printed to stdout.
 * A full human-readable report is written on-host to /tmp/spotcheck_report.txt
 * for the operator to eyeball directly.
 *
 * Reuses stored OpenAI vectors => ZERO OpenAI calls.
 *
 *   docker exec maia-sovereign sh -c 'npx tsx scripts/spotcheck-embeddings.ts'
 */
import { Pool } from 'pg';
import { writeFileSync } from 'fs';

const OLLAMA = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
const JUDGE_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const N_CUES = 6;
const K = 5;

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0; const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}
function parseVec(v: unknown): number[] {
  if (Array.isArray(v)) return v as number[];
  return String(v).replace(/^\[|\]$/g, '').split(',').map(Number).filter(x => !Number.isNaN(x));
}
async function embed(text: string): Promise<number[]> {
  const r = await fetch(`${OLLAMA}/api/embeddings`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
  });
  if (!r.ok) throw new Error(`ollama embed ${r.status}`);
  return (await r.json() as any).embedding as number[];
}
async function judge(cue: string, mem: string): Promise<number> {
  const prompt =
    `Rate how relevant a retrieved memory is to a cue.\n` +
    `CUE: """${cue.slice(0, 700)}"""\n` +
    `MEMORY: """${mem.slice(0, 700)}"""\n` +
    `Answer with ONLY one digit: 0 = unrelated, 1 = loosely related, 2 = clearly related.\nDigit:`;
  try {
    const r = await fetch(`${OLLAMA}/api/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: JUDGE_MODEL, prompt, stream: false, options: { temperature: 0, num_predict: 4 } }),
    });
    const m = String((await r.json() as any).response || '').match(/[012]/);
    return m ? Number(m[0]) : 0;
  } catch { return -1; } // -1 = judge error
}
function topK(cueVec: number[], vecs: number[][], skip: number): number[] {
  return vecs.map((v, j) => [cosine(cueVec, v), j] as [number, number])
    .filter(([, j]) => j !== skip)
    .sort((a, b) => b[0] - a[0]).slice(0, K).map(([, j]) => j);
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(
    `SELECT id, coalesce(experience_title,'') AS title, coalesce(experience_description,'') AS descr, semantic_vector
       FROM episodic_memories WHERE semantic_vector IS NOT NULL ORDER BY id`);
  const n = rows.length;
  const text = (i: number) => `${rows[i].title} ${rows[i].descr}`.trim();
  const openaiVecs = rows.map(r => parseVec(r.semantic_vector));
  const nomicVecs: number[][] = [];
  for (let i = 0; i < n; i++) nomicVecs.push(await embed(text(i) || ' '));

  const cueIdx = Array.from({ length: N_CUES }, (_, k) => Math.floor((k + 0.5) * n / N_CUES));
  const report: string[] = [`SPOT CHECK — OpenAI vs ${EMBED_MODEL}, judge=${JUDGE_MODEL}, ${n} memories\n`];
  let oaScoreSum = 0, noScoreSum = 0, oaHit = 0, noHit = 0, cnt = 0, judgeErr = 0;
  const perCue: string[] = [];

  for (const c of cueIdx) {
    const oaTop = topK(openaiVecs[c], openaiVecs, c);
    const noTop = topK(nomicVecs[c], nomicVecs, c);
    let oaS = 0, noS = 0, oaH = 0, noH = 0;
    report.push(`\n=== CUE id=${rows[c].id}: ${text(c).slice(0, 160)} ===`);
    report.push(`-- OpenAI top-${K} --`);
    for (const j of oaTop) { const s = await judge(text(c), text(j)); if (s < 0) judgeErr++; const sc = Math.max(0, s); oaS += sc; if (sc >= 1) oaH++; report.push(`  [${sc}] id=${rows[j].id}: ${text(j).slice(0, 120)}`); }
    report.push(`-- ${EMBED_MODEL} top-${K} --`);
    for (const j of noTop) { const s = await judge(text(c), text(j)); if (s < 0) judgeErr++; const sc = Math.max(0, s); noS += sc; if (sc >= 1) noH++; report.push(`  [${sc}] id=${rows[j].id}: ${text(j).slice(0, 120)}`); }
    oaScoreSum += oaS; noScoreSum += noS; oaHit += oaH; noHit += noH; cnt += K;
    perCue.push(`  cue id=${rows[c].id}: OpenAI mean=${(oaS / K).toFixed(2)} P@5=${(oaH / K).toFixed(2)} | ${EMBED_MODEL} mean=${(noS / K).toFixed(2)} P@5=${(noH / K).toFixed(2)}`);
  }
  await pool.end();
  writeFileSync('/tmp/spotcheck_report.txt', report.join('\n'));

  console.log(`\nquery-relevance spot check — ${N_CUES} cues x top-${K}, local judge=${JUDGE_MODEL}`);
  console.log('per-cue (relevance mean 0-2, precision@5 = fraction scored >=1):');
  perCue.forEach(l => console.log(l));
  console.log('\nOVERALL:');
  console.log(`  OpenAI          : mean=${(oaScoreSum / cnt).toFixed(2)}  P@5=${(oaHit / cnt).toFixed(2)}`);
  console.log(`  ${EMBED_MODEL} : mean=${(noScoreSum / cnt).toFixed(2)}  P@5=${(noHit / cnt).toFixed(2)}`);
  if (judgeErr) console.log(`  (judge errors: ${judgeErr})`);
  console.log('\nfull human-readable report written on-host: /tmp/spotcheck_report.txt (not exported)');
}
main().catch(e => { console.error('SPOTCHECK ERROR:', e?.message || e); process.exit(1); });
