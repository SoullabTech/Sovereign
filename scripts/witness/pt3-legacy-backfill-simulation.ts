/**
 * PT-3 §VIII.D — legacy backfill simulation.
 *
 * AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §V, §VI, §VIII.D.
 *
 * Seeds every legacy Source category the production census can find, then reports what the
 * migration produced — with member-declared history and migration-attributed legacy interpretation
 * kept apart, which is the whole point of §V:
 *
 *   "A migration may preserve legacy operational state AS legacy operational state. It may not
 *    rewrite that state as though the member explicitly declared it."
 *
 * Two modes, because the migration runs between them:
 *
 *   seed    against a database WITHOUT the PT-3 migration applied — creates pre-lifecycle history
 *   report  after the migration — reports what backfill did, and what it refused to decide
 *
 * SAFETY. Disposable databases only.
 */
import { randomUUID, createHash } from 'crypto';
import { Pool } from 'pg';

const sha = (s: string) => createHash('sha256').update(Buffer.from(s, 'utf-8')).digest('hex');
const URL_ = process.env.OWNER_DATABASE_URL ?? '';
const MODE = process.argv[2];

function assertDisposable(url: string) {
  const local = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url);
  const disposable = /\/[a-z0-9_]*(falsifier|fixture|shadow|disposable|legacy)[a-z0-9_]*(\?|$)/i.test(url);
  if (!local || !disposable) throw new Error('Refusing: OWNER_DATABASE_URL must be local and disposable.');
}

/** The tag by which the simulation finds its own fixtures again after the migration. */
const TAG = 'PT3SIM';

async function seed(db: Pool) {
  const member = randomUUID();
  await db.query(
    `INSERT INTO members (id, passkey, username, password_hash, name, email, onboarded)
     VALUES ($1,$2,$3,$4,$5,$6,true)`,
    [member, `${TAG}-${member.slice(0, 8)}`, `pt3sim_${member.slice(0, 8)}`, 'x'.repeat(64),
     'PT-3 Legacy Sim', `pt3sim+${member.slice(0, 8)}@fixture.invalid`]);

  const mk = async (title: string, custody: string) => {
    const r = await db.query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title, provenance, source_custody)
       VALUES ($1,$2,'member_uploaded',$3) RETURNING id`, [member, `${TAG} ${title}`, custody]);
    return r.rows[0].id;
  };
  const arrival = async (mid: string | null, text: string) => {
    const r = await db.query<{ id: string }>(
      `INSERT INTO manuscript_source_arrivals
         (member_id, manuscript_id, source_kind, source_text, source_text_hash,
          extraction_method, extractor_version)
       VALUES ($1,$2,'member_supplied_text',$3,$4,'member-supplied','n/a') RETURNING id`,
      [member, mid, text, sha(text)]);
    return r.rows[0].id;
  };
  const sections = async (mid: string, n: number) => {
    for (let i = 0; i < n; i++) {
      await db.query(
        `INSERT INTO manuscript_sections (manuscript_id, position, heading, body)
         VALUES ($1,$2,$3,$4)`, [mid, i, `Heading ${i}`, `Body of section ${i}.`]);
    }
  };

  // A — the ordinary case: one arrival, sections. DETERMINABLE.
  const a = await mk('A one arrival', 'source_custodied');
  await arrival(a, 'The single arrival.'); await sections(a, 2);

  // B — several arrivals. AMBIGUOUS: the old runtime picked by created_at.
  const b = await mk('B multiple arrivals', 'source_custodied');
  await arrival(b, 'The first arrival.');
  await new Promise((r) => setTimeout(r, 15));
  await arrival(b, 'A later, different arrival.');
  await sections(b, 3);

  // C — sections, no arrival. Genuine legacy_interpreted_import.
  const c = await mk('C no arrival', 'legacy_interpreted_import');
  await sections(c, 1);

  // D — a member-written Work: no arrival, no sections. Must remain lawful and untouched.
  await mk('D blank member-written', 'legacy_interpreted_import');

  // E — an unclaimed arrival: uploaded, then abandoned before saving.
  await arrival(null, 'An arrival that never became a Work.');

  console.log(`seeded member ${member}`);
  console.log('  A one arrival + 2 sections        (determinable)');
  console.log('  B two arrivals + 3 sections       (ambiguous)');
  console.log('  C no arrival + 1 section          (legacy_interpreted_import)');
  console.log('  D no arrival, no sections         (member-written; must stay lawful)');
  console.log('  E unclaimed arrival, no Work      (documented state)');
}

async function report(db: Pool) {
  const rows = async <T extends Record<string, unknown>>(sql: string, p: unknown[] = []) =>
    (await db.query<T>(sql, p)).rows;

  const works = await rows<{ id: string; title: string; custody: string }>(
    `SELECT id, title, source_custody AS custody FROM member_manuscripts
      WHERE title LIKE $1 ORDER BY title`, [`${TAG}%`]);

  console.log('\n── what the migration produced, per Work ────────────────────────────');
  for (const w of works) {
    const reps = await rows<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_source_representations WHERE manuscript_id = $1`, [w.id]);
    const acts = await rows<{ act: string; provenance: string; actor: string | null; operative: boolean }>(
      `SELECT act, provenance, actor_member_id::text AS actor, operative
         FROM source_lifecycle_acts WHERE manuscript_id = $1 ORDER BY occurred_at, id`, [w.id]);
    const rec = await rows<{ kind: string }>(
      `SELECT kind FROM source_lifecycle_reconciliation WHERE manuscript_id = $1`, [w.id]);
    const op = await rows<{ id: string | null }>(
      `SELECT source_operative_representation($1) AS id`, [w.id]);

    console.log(`\n  ${w.title}  [${w.custody}]`);
    console.log(`    representations : ${reps[0].n}`);
    console.log(`    lifecycle acts  : ${acts.length === 0 ? '(none)' :
      acts.map((a) => `${a.act}/${a.provenance}${a.actor ? '' : '/no-actor'}`).join(', ')}`);
    console.log(`    reconciliation  : ${rec.length === 0 ? '(none)' : rec.map((r) => r.kind).join(', ')}`);
    console.log(`    operative rep   : ${op[0].id ? 'derived from history' : 'NONE — transitional compatibility'}`);
  }

  console.log('\n── the separation §V requires ───────────────────────────────────────');
  const split = await rows<{ provenance: string; n: string; actors: string }>(
    `SELECT provenance, count(*) AS n,
            count(actor_member_id)::text AS actors
       FROM source_lifecycle_acts a
      WHERE EXISTS (SELECT 1 FROM member_manuscripts m
                     WHERE m.id = a.manuscript_id AND m.title LIKE $1)
      GROUP BY provenance ORDER BY provenance`, [`${TAG}%`]);
  for (const s of split) {
    console.log(`  ${s.provenance.padEnd(17)} acts=${s.n}  carrying a member actor=${s.actors}`);
  }
  const laundered = split.find((s) => s.provenance === 'migration_legacy' && s.actors !== '0');
  console.log(
    laundered
      ? '\n  ✗ FAIL — a migration-attributed act carries a member actor. That is the laundering §V forbids.'
      : '\n  ✓ no migration-attributed act is signed with a member id — legacy stays legacy.');

  const open = await rows<{ kind: string; n: string }>(
    `SELECT kind, count(*) AS n FROM source_lifecycle_reconciliation
      WHERE resolved_at IS NULL GROUP BY kind ORDER BY kind`);
  console.log('\n── ambiguity returned as data, not resolved ─────────────────────────');
  if (open.length === 0) console.log('  (none)');
  for (const o of open) console.log(`  ${o.kind.padEnd(32)} ${o.n}`);
}

async function main() {
  assertDisposable(URL_);
  if (MODE !== 'seed' && MODE !== 'report') {
    throw new Error('usage: pt3-legacy-backfill-simulation.ts seed|report');
  }
  const db = new Pool({ connectionString: URL_, max: 4 });
  try { await (MODE === 'seed' ? seed(db) : report(db)); } finally { await db.end(); }
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(2); });
