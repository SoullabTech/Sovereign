#!/usr/bin/env tsx
/**
 * Writer's Studio dated beta grants — operator tool (founder rulings 2026-11-13, #1800).
 *
 * DRY RUN by default: prints what it would do (counts and ids only — never names or emails). Add --apply to write.
 * Every write is an append-only event in writers_studio_beta_grant_events; nothing is edited or deleted.
 *
 *   grant          --member <uuid> --actor <uuid> (--until YYYY-MM-DD | --days N) [--cohort beta-2026] [--reason text]
 *   extend         --member <uuid> --actor <uuid> (--until YYYY-MM-DD | --days N) [--reason text]
 *   revoke         --member <uuid> --actor <uuid> [--reason text]
 *   extend-cohort  --cohort <label> --actor <uuid> --until YYYY-MM-DD [--reason text]
 *                  Extends every member whose latest event is an ACTIVE grant/extend in that cohort, in one transaction.
 *   backfill-legacy --cohort <label> --actor <uuid> --until YYYY-MM-DD [--reason text]
 *                  Issues a dated grant to every current legacy tester (ops_contacts writers_studio_beta = true, active)
 *                  who has no active dated grant — the one shared cohort end date (ruling: the year starts when dated
 *                  grants ship). Run before switching WS_BETA_GRANT_MODE from 'transition' to 'dated'.
 *   status         --member <uuid>
 *
 * Expiry removes Pro capabilities only. This tool never touches Works, revisions, identity or export.
 * Release ledger #1938 Gate 4 is HOLD: issuing real grants in production needs the founder's go-ahead.
 */
import { query, transaction, closePool } from '@/lib/db/postgres';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COHORT = /^[a-z0-9][a-z0-9-]{0,39}$/;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const apply = process.argv.includes('--apply');

function fail(msg: string): never {
  console.error(msg);
  process.exit(2);
}

function uuidArg(name: string): string {
  const v = arg(name);
  if (!v || !UUID.test(v)) fail(`--${name} must be a member UUID`);
  return v.toLowerCase();
}

/** --until YYYY-MM-DD (end of that day UTC) or --days N from now. Must be in the future, at most 2 years out. */
function expiryArg(allowDays = true): Date {
  const until = arg('until');
  const days = arg('days');
  let d: Date;
  if (until && /^\d{4}-\d{2}-\d{2}$/.test(until)) d = new Date(`${until}T23:59:59Z`);
  else if (allowDays && days && /^\d+$/.test(days)) d = new Date(Date.now() + Number(days) * 86_400_000);
  else fail(allowDays ? 'Give --until YYYY-MM-DD or --days N' : 'Give --until YYYY-MM-DD');
  const max = Date.now() + 2 * 366 * 86_400_000;
  if (!(d.getTime() > Date.now()) || d.getTime() > max) fail('Expiry must be in the future and within two years');
  return d;
}

function reasonArg(): string | null {
  const r = arg('reason') ?? null;
  if (r && r.length > 500) fail('--reason is limited to 500 characters');
  return r;
}

function cohortArg(required: boolean): string | null {
  const c = arg('cohort');
  if (!c) return required ? fail('--cohort is required (lower-case letters, digits, dashes)') : null;
  if (!COHORT.test(c)) fail('--cohort must be lower-case letters, digits and dashes');
  return c;
}

const LATEST_ACTIVE_IN_COHORT = `
  SELECT DISTINCT ON (member_id) member_id, action, expires_at, cohort
    FROM writers_studio_beta_grant_events
   ORDER BY member_id, id DESC`;

async function insertEvent(
  q: (sql: string, p: unknown[]) => Promise<unknown>,
  memberId: string, action: 'grant' | 'extend' | 'revoke', expiresAt: Date | null,
  cohort: string | null, actor: string, reason: string | null,
) {
  await q(
    `INSERT INTO writers_studio_beta_grant_events (member_id, action, expires_at, cohort, actor_member_id, reason)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [memberId, action, expiresAt, cohort, actor, reason],
  );
}

async function main() {
  const cmd = process.argv[2];
  const mode = apply ? 'APPLY' : 'DRY RUN (add --apply to write)';

  if (cmd === 'status') {
    const member = uuidArg('member');
    const r = await query<{ action: string; expires_at: Date | null; cohort: string | null; occurred_at: Date }>(
      `SELECT action, expires_at, cohort, occurred_at FROM writers_studio_beta_grant_events
        WHERE member_id = $1 ORDER BY id DESC LIMIT 1`, [member]);
    const e = r.rows[0];
    if (!e) return console.log('No dated grant events for this member.');
    const active = e.action !== 'revoke' && !!e.expires_at && e.expires_at.getTime() > Date.now();
    console.log(`latest: ${e.action} · cohort ${e.cohort ?? '-'} · expires ${e.expires_at?.toISOString() ?? '-'} · ${active ? 'ACTIVE' : 'not active'}`);
    return;
  }

  if (cmd === 'grant' || cmd === 'extend' || cmd === 'revoke') {
    const member = uuidArg('member');
    const actor = uuidArg('actor');
    const reason = reasonArg();
    const expiresAt = cmd === 'revoke' ? null : expiryArg();
    const cohort = cmd === 'grant' ? cohortArg(false) : null;
    const exists = await query(`SELECT 1 FROM members WHERE id = $1`, [member]);
    if (exists.rows.length !== 1) fail('No member with that id');
    console.log(`${mode}: ${cmd} ${member}${expiresAt ? ` until ${expiresAt.toISOString()}` : ''}${cohort ? ` cohort ${cohort}` : ''}`);
    if (apply) {
      await insertEvent((s, p) => query(s, p), member, cmd, expiresAt, cohort, actor, reason);
      console.log('written.');
    }
    return;
  }

  if (cmd === 'extend-cohort') {
    const cohort = cohortArg(true)!;
    const actor = uuidArg('actor');
    const reason = reasonArg();
    const expiresAt = expiryArg(false);
    const r = await query<{ member_id: string; action: string; expires_at: Date | null; cohort: string | null }>(
      LATEST_ACTIVE_IN_COHORT, []);
    // The cohort label lives on the 'grant' event; extend events carry no cohort, so find each member's cohort from
    // their most recent grant and their standing from their latest event.
    const cohortOf = await query<{ member_id: string }>(
      `SELECT DISTINCT ON (member_id) member_id, cohort FROM writers_studio_beta_grant_events
        WHERE action = 'grant' ORDER BY member_id, id DESC`, []);
    const inCohort = new Set(cohortOf.rows.filter((x: any) => x.cohort === cohort).map((x) => x.member_id));
    const targets = r.rows.filter((x) =>
      inCohort.has(x.member_id) && x.action !== 'revoke' && x.expires_at && x.expires_at.getTime() > Date.now()
      && x.expires_at.getTime() < expiresAt.getTime());
    console.log(`${mode}: extend ${targets.length} active member(s) in cohort ${cohort} to ${expiresAt.toISOString()}`);
    if (apply && targets.length) {
      await transaction(async (tx) => {
        for (const t of targets) await insertEvent((s, p) => tx.query(s, p as any[]), t.member_id, 'extend', expiresAt, null, actor, reason);
      });
      console.log('written.');
    }
    return;
  }

  if (cmd === 'backfill-legacy') {
    const cohort = cohortArg(true)!;
    const actor = uuidArg('actor');
    const reason = reasonArg() ?? 'Dated grant for existing beta tester (founder ruling 2026-11-13: year starts when grants ship)';
    const expiresAt = expiryArg(false);
    const r = await query<{ member_id: string }>(
      `SELECT DISTINCT c.member_id
         FROM ops_contacts c
        WHERE c.member_id IS NOT NULL
          AND c.deleted_at IS NULL
          AND c.contact_type = 'beta_tester'
          AND c.pipeline_stage = 'active'
          AND c.metadata @> '{"writers_studio_beta": true}'::jsonb
          AND NOT EXISTS (
            SELECT 1 FROM (
              SELECT DISTINCT ON (member_id) member_id, action, expires_at
                FROM writers_studio_beta_grant_events WHERE member_id = c.member_id ORDER BY member_id, id DESC
            ) g
             WHERE g.action <> 'revoke' AND g.expires_at > now()
          )`, []);
    console.log(`${mode}: grant ${r.rows.length} current legacy tester(s) cohort ${cohort} until ${expiresAt.toISOString()}`);
    if (apply && r.rows.length) {
      await transaction(async (tx) => {
        for (const t of r.rows) await insertEvent((s, p) => tx.query(s, p as any[]), t.member_id, 'grant', expiresAt, cohort, actor, reason);
      });
      console.log('written.');
    }
    return;
  }

  fail('Commands: grant | extend | revoke | extend-cohort | backfill-legacy | status  (dry run unless --apply)');
}

main()
  .catch((e) => { console.error('Failed:', e?.message ?? e); process.exitCode = 1; })
  .finally(() => closePool().catch(() => {}));
