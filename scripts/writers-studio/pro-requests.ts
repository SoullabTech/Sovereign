#!/usr/bin/env tsx
/**
 * "Ask about Pro" requests — the founder's list (step C4; founder ruling 2026-11-13: answered personally).
 *
 *   list                               open requests: id, member id, when, note (no names/emails printed)
 *   answered --id <n> --by <uuid>      mark one answered after the founder has replied personally
 *
 * This tool grants nothing and sends nothing. Granting Pro is a separate act (scripts/writers-studio/beta-grants.ts or
 * a purchase, once checkout exists).
 */
import { query, closePool } from '@/lib/db/postgres';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === 'list') {
    const r = await query<{ id: string; member_id: string; created_at: Date; note: string | null }>(
      `SELECT id, member_id, created_at, note FROM writers_studio_pro_requests WHERE answered_at IS NULL ORDER BY created_at`, []);
    if (!r.rows.length) return console.log('No open requests.');
    for (const x of r.rows) console.log(`#${x.id} · member ${x.member_id} · ${x.created_at.toISOString()}${x.note ? ` · “${x.note}”` : ''}`);
    return;
  }
  if (cmd === 'answered') {
    const id = arg('id'); const by = arg('by');
    if (!id || !/^\d+$/.test(id) || !by || !/^[0-9a-f-]{36}$/i.test(by)) { console.error('--id <n> --by <founder member uuid>'); process.exit(2); }
    const owner = await query(`SELECT 1 FROM members WHERE id = $1 AND admin_role IN ('founder','cto')`, [by]);
    if (owner.rows.length !== 1) { console.error('--by must be a founder or CTO'); process.exit(2); }
    const r = await query(`UPDATE writers_studio_pro_requests SET answered_at = now(), answered_by = $2 WHERE id = $1 AND answered_at IS NULL RETURNING id`, [id, by]);
    console.log(r.rows.length ? `#${id} marked answered.` : `#${id} was not open.`);
    return;
  }
  console.error('Commands: list | answered --id <n> --by <uuid>'); process.exit(2);
}

main()
  .catch((e) => { console.error('Failed:', e?.message ?? e); process.exitCode = 1; })
  .finally(() => closePool().catch(() => {}));
