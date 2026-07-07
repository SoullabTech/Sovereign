/**
 * reembed-episodic-nomic.ts — one-off migration
 *
 * Re-embeds episodic_memories.semantic_vector with the local nomic-embed-text
 * model (768d), replacing any prior OpenAI `text-embedding-3-small` vectors so
 * the whole column shares ONE embedding space — matching the local read/write
 * path after the VectorEmbeddingService cutover. A mixed read/write space is
 * worse than either model alone; this makes the space consistent.
 *
 * Safety: backs up the current vectors to an on-host file BEFORE overwriting.
 * Run AFTER the local-embedding code is deployed to the container:
 *   docker exec maia-sovereign sh -c 'npx tsx scripts/reembed-episodic-nomic.ts'
 */
import { Pool } from 'pg';
import { writeFileSync } from 'fs';
import { embedWithOllama } from '../lib/ai/localEmbeddingClient';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(
    `SELECT id,
            coalesce(experience_title,'')       AS title,
            coalesce(experience_description,'') AS descr,
            semantic_vector
       FROM episodic_memories
      ORDER BY id`
  );
  console.log(`episodic_memories rows: ${rows.length}`);

  const backupPath = '/tmp/episodic_vectors_backup.json';
  writeFileSync(backupPath, JSON.stringify(rows.map(r => ({ id: r.id, semantic_vector: r.semantic_vector }))));
  console.log(`backup of current vectors written on-host: ${backupPath}`);

  let updated = 0, skipped = 0, failed = 0;
  for (const r of rows) {
    const text = `${r.title} ${r.descr}`.trim();
    if (!text) { skipped++; continue; }
    try {
      const { embedding } = await embedWithOllama({ text });
      if (embedding?.length !== 768) { console.error(`id=${r.id}: unexpected dim ${embedding?.length}, left unchanged`); failed++; continue; }
      await pool.query(`UPDATE episodic_memories SET semantic_vector = $1::jsonb WHERE id = $2`, [JSON.stringify(embedding), r.id]);
      updated++;
    } catch (e: any) {
      console.error(`id=${r.id}: ${e?.message || e}`); failed++;
    }
  }
  console.log(`\nre-embed complete (model=nomic-embed-text 768d): updated=${updated} skipped=${skipped} failed=${failed}`);
  console.log(failed ? 'NOTE: some rows failed — restore from backup if needed before re-running.' : 'all embeddable rows now share the nomic embedding space.');
  await pool.end();
}
main().catch(e => { console.error('REEMBED ERROR:', e?.message || e); process.exit(1); });
