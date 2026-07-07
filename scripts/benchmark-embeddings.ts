/**
 * benchmark-embeddings.ts — READ-ONLY embedding benchmark
 *
 * Compares local Ollama `nomic-embed-text` against the stored OpenAI
 * `text-embedding-3-small` vectors already in episodic_memories.
 *
 * Method: for each memory, compute its top-K nearest neighbours under BOTH
 * models (cosine), then measure how much the two neighbour sets agree
 * (Jaccard). High agreement => the local model preserves the semantic
 * structure the OpenAI vectors encoded => safe to cut over + re-embed.
 *
 * Prints ONLY aggregate numbers + row ids — no member text leaves the host.
 * Reuses the already-stored OpenAI vectors, so it makes ZERO OpenAI calls.
 *
 * Run inside the prod container (has DATABASE_URL + OLLAMA_BASE_URL + pg):
 *   docker exec maia-sovereign sh -c 'npx tsx scripts/benchmark-embeddings.ts'
 */
import { Pool } from 'pg';

const OLLAMA = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

function parseVec(v: unknown): number[] {
  if (Array.isArray(v)) return v as number[];
  return String(v).replace(/^\[|\]$/g, '').split(',').map(Number).filter(x => !Number.isNaN(x));
}

async function embed(text: string): Promise<number[]> {
  const r = await fetch(`${OLLAMA}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt: text }),
  });
  if (!r.ok) throw new Error(`ollama ${r.status}: ${await r.text()}`);
  const j: any = await r.json();
  if (!j?.embedding?.length) throw new Error('ollama response missing embedding');
  return j.embedding as number[];
}

function topK(i: number, sims: number[][], k: number): Set<number> {
  return new Set(
    sims[i].map((s, j) => [s, j] as [number, number])
      .filter(([, j]) => j !== i)
      .sort((a, b) => b[0] - a[0])
      .slice(0, k)
      .map(([, j]) => j)
  );
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(
    `SELECT id,
            coalesce(experience_title,'')       AS title,
            coalesce(experience_description,'') AS descr,
            semantic_vector
       FROM episodic_memories
      WHERE semantic_vector IS NOT NULL
      ORDER BY id`
  );
  const n = rows.length;
  console.log(`corpus: ${n} episodic_memories rows with stored vectors`);
  if (n < 3) { console.log('too few rows to benchmark neighbour structure'); await pool.end(); return; }

  const openaiVecs = rows.map(r => parseVec(r.semantic_vector));
  console.log(`stored (OpenAI) vector dim: ${openaiVecs[0].length}`);

  const nomicVecs: number[][] = [];
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const text = `${rows[i].title} ${rows[i].descr}`.trim().slice(0, 4000) || ' ';
    nomicVecs.push(await embed(text));
  }
  console.log(`nomic (${MODEL}) vector dim: ${nomicVecs[0].length}  (embedded ${n} in ${((Date.now() - t0) / 1000).toFixed(1)}s)`);

  const simsO: number[][] = [], simsN: number[][] = [];
  for (let i = 0; i < n; i++) {
    simsO[i] = []; simsN[i] = [];
    for (let j = 0; j < n; j++) { simsO[i][j] = cosine(openaiVecs[i], openaiVecs[j]); simsN[i][j] = cosine(nomicVecs[i], nomicVecs[j]); }
  }

  console.log('\nneighbour-structure agreement (OpenAI vs nomic-embed-text):');
  for (const k of [3, 5, 10]) {
    if (k >= n) continue;
    let jac = 0;
    for (let i = 0; i < n; i++) {
      const a = topK(i, simsO, k), b = topK(i, simsN, k);
      let inter = 0; a.forEach(x => { if (b.has(x)) inter++; });
      jac += inter / (new Set([...a, ...b]).size || 1);
    }
    console.log(`  top-${k} Jaccard overlap: ${(jac / n).toFixed(3)}   (1.0 = identical neighbours)`);
  }
  await pool.end();
}

main().catch(e => { console.error('BENCH ERROR:', e?.message || e); process.exit(1); });
