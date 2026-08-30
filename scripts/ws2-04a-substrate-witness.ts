/**
 * WS2-04A — SUBSTRATE ACCEPTANCE WITNESS.
 *
 * The final 04A step, not the first 04B one: 04B should inherit a substrate
 * that has been seen to work. Everything below runs against a DEVELOPMENT
 * database and a DISPOSABLE manuscript this script creates and then deletes.
 *
 * It never converts an existing draft. When given a manuscript id it COPIES
 * that manuscript's sections and draft into a new disposable manuscript, and
 * proves at the end that the original's bytes are untouched — a witness that
 * modified the thing it was witnessing would be worthless.
 *
 * Run:
 *   DATABASE_URL=<dev> npx tsx scripts/ws2-04a-substrate-witness.ts [manuscript-id]
 */

import { query, transaction } from '../lib/db/postgres';
import { convertDraftToSections } from '../lib/manuscript/sections/convertDraft';
import { createHash } from 'crypto';

const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 12);

/** Time one awaited step. The trigger checks run string_agg over every section
    of the draft on each write, so at book scale the question is not whether
    they are correct but whether they are affordable on a live writing
    surface. Measured rather than assumed. */
async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = process.hrtime.bigint();
  try {
    return await fn();
  } finally {
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    console.log(`    ⏱  ${label.padEnd(38)} ${ms.toFixed(1)} ms`);
  }
}

let passed = 0;
let failed = 0;
function check(label: string, ok: boolean, detail = '') {
  if (ok) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.log(`  ✗ ${label}${detail ? `  — ${detail}` : ''}`); }
}

const SYNTHETIC: { heading: string | null; body: string }[] = [
  { heading: 'Chapter One', body: 'The morning came.\nIt was cold.' },
  { heading: 'Chapter Two', body: 'She left before dawn.' },
  { heading: null, body: 'An unheaded interlude.' },
  { heading: 'Chapter Three', body: 'And did not return.' },
];

async function main() {
  const sourceId = process.argv[2] ?? null;

  const where = await query<{ db: string; host: string | null; user: string }>(
    `SELECT current_database() AS db,
            host(coalesce(inet_server_addr(), '127.0.0.1'::inet)) AS host,
            current_user AS "user"`);
  const w = where.rows[0];
  console.log(`\nWS2-04A SUBSTRATE WITNESS`);
  console.log(`  against  ${w.user}@${w.host}/${w.db}`);
  if (/prod/i.test(w.db)) { console.error('\n  refusing: this looks like production.\n'); process.exit(1); }

  /* ── 2 · schema exists ─────────────────────────────────────────────── */
  console.log('\n2 · schema');
  const cols = await query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'manuscript_draft_sections'`);
  const names = cols.rows.map((r) => r.column_name);
  check('manuscript_draft_sections exists', names.length > 0);
  for (const c of ['id', 'draft_id', 'position', 'text', 'source_section_id'])
    check(`  column ${c}`, names.includes(c));
  const dcols = await query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'manuscript_working_drafts'
        AND column_name IN ('section_addressable_at','section_conversion_version')`);
  check('draft carries conversion state', dcols.rows.length === 2);
  const trg = await query<{ tgname: string }>(
    `SELECT tgname FROM pg_trigger
      WHERE tgname IN ('manuscript_draft_sections_round_trip_check',
                       'manuscript_working_drafts_round_trip_check')
        AND tgdeferrable`);
  check('both deferred constraint triggers present', trg.rows.length === 2,
    `found ${trg.rows.length}`);

  /* ── 3 · disposable copy ───────────────────────────────────────────── */
  console.log('\n3 · disposable manuscript');
  let rows = SYNTHETIC;
  let content: string | null = null;
  let originalHash: string | null = null;
  let copyOwner: string | null = null;

  if (sourceId) {
    const s = await query<{ heading: string | null; body: string }>(
      `SELECT heading, body FROM manuscript_sections
        WHERE manuscript_id = $1 ORDER BY position ASC`, [sourceId]);
    const d = await query<{ content: string; member_id: string }>(
      `SELECT content, member_id FROM manuscript_working_drafts WHERE manuscript_id = $1`,
      [sourceId]);
    if (s.rows.length === 0 || d.rows.length === 0) {
      console.error(`  source ${sourceId} has no sections or no draft`); process.exit(1);
    }
    rows = s.rows;
    content = d.rows[0].content;
    originalHash = sha(content);
    /* The copy belongs to the SOURCE draft's member. Conversion is
       member-scoped, and a disposable manuscript owned by an arbitrary other
       member would be both wrong and unconvertible. */
    copyOwner = d.rows[0].member_id;
    console.log(`  copying from ${sourceId}: ${rows.length} sections, ${content.length} chars`);
  }

  let memberId = copyOwner;
  if (!memberId) {
    const member = await query<{ id: string }>(`SELECT id FROM members LIMIT 1`);
    if (member.rows.length === 0) { console.error('  no members in this database'); process.exit(1); }
    memberId = member.rows[0].id;
  }

  const { manuscriptId, draftId, draftContent } = await timed('copy into disposable manuscript', () => transaction(async (tx) => {
    const m = await tx.query<{ id: string }>(
      `INSERT INTO member_manuscripts (title) VALUES ($1) RETURNING id`,
      ['WS2-04A witness (disposable)']);
    const mid = m.rows[0].id;
    for (const [i, r] of rows.entries())
      await tx.query(
        `INSERT INTO manuscript_sections (manuscript_id, position, heading, body)
         VALUES ($1,$2,$3,$4)`, [mid, i, r.heading, r.body]);

    const text = content ?? rows.map((r) => {
      const h = r.heading?.trim();
      return (h ? `${h}\n\n` : '') + r.body + '\n';
    }).join('');

    const d = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_working_drafts (manuscript_id, member_id, content, base_source_hash)
       VALUES ($1,$2,$3,$4) RETURNING id`, [mid, memberId, text, 'witness']);
    return { manuscriptId: mid, draftId: d.rows[0].id, draftContent: text };
  }));
  check('disposable manuscript created', true);

  try {
    /* ── 4/5 · convert and prove ─────────────────────────────────────── */
    console.log('\n4 · convert');
    const result = await timed('convertDraftToSections', () =>
      convertDraftToSections(manuscriptId, memberId));
    console.log(`  → ${result.status}${result.refusal ? ` (${result.refusal}${result.detail ? ': ' + result.detail : ''})` : ''}`);
    check('conversion succeeded', result.status === 'converted');

    if (result.status === 'converted') {
      console.log('\n5 · proofs');
      const secs = await query<{ text: string; position: number; source_section_id: string | null }>(
        `SELECT text, position, source_section_id FROM manuscript_draft_sections
          WHERE draft_id = $1 ORDER BY position ASC`, [draftId]);
      check('section count matches source', secs.rows.length === rows.length,
        `${secs.rows.length} vs ${rows.length}`);
      const flat = secs.rows.map((r) => r.text).join('');
      check('sections flatten to the exact draft, byte for byte', flat === draftContent,
        `${sha(flat)} vs ${sha(draftContent)}`);
      check('every section carries source provenance',
        secs.rows.every((r) => r.source_section_id !== null));
      check('positions are 0..n-1 in order',
        secs.rows.every((r, i) => r.position === i));

      const rev = await query<{ content: string }>(
        `SELECT content FROM working_draft_revisions WHERE draft_id = $1
          ORDER BY revision_number DESC LIMIT 1`, [draftId]);
      check('pre-conversion revision exists and is byte-identical',
        rev.rows.length === 1 && rev.rows[0].content === draftContent);

      const state = await query<{ a: Date | null; v: string | null }>(
        `SELECT section_addressable_at AS a, section_conversion_version AS v
           FROM manuscript_working_drafts WHERE id = $1`, [draftId]);
      check('section_addressable_at set', state.rows[0].a !== null);
      check('section_conversion_version set', state.rows[0].v !== null);

      /* ── 6 · idempotency ───────────────────────────────────────────── */
      console.log('\n6 · idempotency');
      const again = await timed('second call (idempotent)', () =>
        convertDraftToSections(manuscriptId, memberId));
      check('second call returns already_converted', again.status === 'already_converted',
        again.status);
      const after = await query<{ n: string }>(
        `SELECT count(*) AS n FROM manuscript_draft_sections WHERE draft_id = $1`, [draftId]);
      check('no duplicate section rows', Number(after.rows[0].n) === rows.length);

      /* ── 7 · one-sided write must abort at COMMIT ──────────────────── */
      console.log('\n7 · deferred trigger aborts a one-sided write');
      let aborted = false;
      try {
        await timed('content-only write (must abort)', () => transaction(async (tx) => {
          await tx.query(
            `UPDATE manuscript_working_drafts SET content = content || $2 WHERE id = $1`,
            [draftId, ' DRIFT']);
        }));
      } catch { aborted = true; }
      check('content-only change refused', aborted);

      let aborted2 = false;
      try {
        await timed('section-only delete (must abort)', () => transaction(async (tx) => {
          await tx.query(
            `DELETE FROM manuscript_draft_sections WHERE draft_id = $1 AND position = $2`,
            [draftId, rows.length - 1]);
        }));
      } catch { aborted2 = true; }
      check('section-only change refused', aborted2);

      /* ── 8 · consistent write on both sides commits ────────────────── */
      console.log('\n8 · consistent write on both sides commits');
      let committed = false;
      try {
        await timed('consistent two-sided write (commits)', () => transaction(async (tx) => {
          await tx.query(
            `UPDATE manuscript_draft_sections SET text = text || $2
              WHERE draft_id = $1 AND position = $3`, [draftId, ' more', rows.length - 1]);
          await tx.query(
            `UPDATE manuscript_working_drafts SET content = content || $2 WHERE id = $1`,
            [draftId, ' more']);
        }));
        committed = true;
      } catch (e) { console.log(`    (${(e as Error).message.slice(0, 90)})`); }
      check('both-sides change committed', committed);
    }
  } finally {
    /* ── 9 · member deletion cascades ─────────────────────────────────── */
    console.log('\n9 · member deletion');
    let deleted = false;
    try {
      await timed('delete disposable manuscript (cascade)', () =>
        query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]));
      deleted = true;
    } catch (e) { console.log(`    ${(e as Error).message.slice(0, 120)}`); }
    check('manuscript deletion cascades — invariant never blocks it', deleted);
    const left = await query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_draft_sections WHERE draft_id = $1`, [draftId]);
    check('section rows removed with it', Number(left.rows[0].n) === 0);
  }

  /* ── 10 · the original was never touched ───────────────────────────── */
  if (sourceId && originalHash) {
    console.log('\n10 · the source manuscript');
    const d = await query<{ content: string }>(
      `SELECT content FROM manuscript_working_drafts WHERE manuscript_id = $1`, [sourceId]);
    check('original draft byte-identical to before the witness',
      d.rows.length === 1 && sha(d.rows[0].content) === originalHash);
    const s = await query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_draft_sections s
         JOIN manuscript_working_drafts d ON d.id = s.draft_id
        WHERE d.manuscript_id = $1`, [sourceId]);
    check('original was never converted', Number(s.rows[0].n) === 0);
  }

  console.log(`\n  ${passed} passed · ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error('witness failed:', e?.message ?? e); process.exit(1); });
