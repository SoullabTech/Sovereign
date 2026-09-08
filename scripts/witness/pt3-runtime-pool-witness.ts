/**
 * PT-3 §III / §XIV (B22, B23) — runtime pool witness.
 *
 * AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §III, §IV, §VII, §XIV.
 *
 *   MAIA_APP_DATABASE_URL=postgresql://maia_app:…@127.0.0.1:5432/…_fixture \
 *   PT3_POOL_WITNESS_CONFIRM=1 npx tsx scripts/witness/pt3-runtime-pool-witness.ts
 *
 * ⭐ WHY THIS EXISTS. PT-3 is a protocol change between the application and the database, and the
 * cutover had been treated as migration + credentials alone. Two failures follow from that:
 *
 *   B22  the production image was never built with the constrained-credential path at all
 *   B23  three pools gated entry on DATABASE_URL, so once the owner variable was withdrawn they
 *        never saw MAIA_APP_DATABASE_URL and fell through to individual POSTGRES_* parameters
 *        whose default user is `soullab` — silently reconnecting AS THE OWNER
 *
 * A grant census cannot catch that: the grants would be perfect while the application quietly
 * reconnected around them.
 *
 * ⭐ §III — WHY IT WAS STRENGTHENED. The earlier version announced "every runtime pool connects as
 * maia_app" while genuinely constructing only two of the five. The other three were exercised
 * through a connection expression RE-TYPED INTO THIS FILE. Re-typed truth drifts: the day someone
 * edits lib/memory/beads-sync/server.ts back to `process.env.DATABASE_URL`, this witness keeps
 * passing, because it never read that file. A witness whose claim is wider than its observation is
 * the same defect as a verifier that returns READY having observed nothing.
 *
 * So the claim is now bounded by three separate legs, and the verdict names them separately:
 *
 *   1  DISCOVERY  — pool construction sites are FOUND by scanning every production source root,
 *                   never listed. A new pool fails this witness instead of going unwitnessed.
 *
 *                   ⭐ B34 — THE ROOT WAS THE DEFECT, NOT THE LIST. The first strengthening scanned
 *                   lib/ and app/ and reported five sites. It was internally sound and still wrong:
 *                   production also runs a SEPARATE image, maia-api:prod from apps/api/Dockerfile,
 *                   whose apps/api/src/db/postgres.ts held exactly the owner-era pool this lane
 *                   exists to eliminate. Discovery that is blind to a source tree cannot fail on
 *                   what lives there. The roots below are therefore derived from what production
 *                   BUILDS — and the correct repair to a future finding is another root, never one
 *                   more hardcoded path bolted onto a still-blind scan.
 *   2  SOURCE     — each site's own file is read and asserted: no path may consult DATABASE_URL
 *                   without having consulted MAIA_APP_DATABASE_URL first, in the same expression.
 *   3  EXERCISE   — the two modules that can be imported are actually made to connect, with the
 *                   owner variable deleted from the environment, and asked `SELECT current_user`.
 *                   The remaining three are reported as SOURCE-ASSERTED and never as exercised.
 *
 * SAFETY. Read-only (`SELECT current_user`), disposable local databases only.
 */
import { Pool } from 'pg';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const EXPECTED = 'maia_app';
const REPO = join(__dirname, '..', '..');

/**
 * Every source root a production image is built from. `Dockerfile` builds the Next.js runtime out
 * of lib/ + app/ (+ components/); `apps/api/Dockerfile` builds maia-api:prod out of apps/api/.
 * If a new production image is introduced, its root belongs here on the same day.
 */
const PRODUCTION_ROOTS = ['lib', 'app', 'apps', 'components', 'server'];

/** Every file that constructs a pg pool, and how this witness is entitled to speak about it. */
const WITNESSED: Record<string, 'exercised' | 'source-asserted'> = {
  'lib/db/postgres.ts': 'exercised',
  'lib/database/postgres.ts': 'exercised',
  'lib/learning/maiaTrainingDataService.ts': 'source-asserted',
  'lib/memory/beads-sync/server.ts': 'source-asserted',
  'lib/skills/skillsRuntime.ts': 'source-asserted',
  // ⭐ B34 — the sixth site. A separate image (maia-api:prod), a separate tsconfig and package,
  // so it cannot be imported into this process; source-asserted, and never claimed as exercised.
  'apps/api/src/db/postgres.ts': 'source-asserted',
};

const POOL_CTOR = /new\s+(?:Pool|PgPool|pg\.Pool)\s*\(/;

let failed = 0;
const pass = (leg: string, what: string, detail = '') => {
  console.log(`PASS  ${leg.padEnd(9)} ${what.padEnd(44)} ${detail}`);
};
const fail = (leg: string, what: string, detail = '') => {
  failed++;
  console.log(`FAIL  ${leg.padEnd(9)} ${what.padEnd(44)} ${detail}`);
};

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.next' || e === '__tests__' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

/** LEG 1 — the set of pool sites is discovered, so the witness cannot fall behind the code. */
function discover(): string[] {
  const found: string[] = [];
  const files = PRODUCTION_ROOTS.flatMap((r) => walk(join(REPO, r)));
  for (const abs of files) {
    const src = readFileSync(abs, 'utf8');
    if (POOL_CTOR.test(src)) found.push(relative(REPO, abs));
  }
  return found.sort();
}

/**
 * LEG 2 — the drift guard. The rule is not "the file mentions MAIA_APP_DATABASE_URL somewhere"
 * (a comment would satisfy that; lib/database/postgres.ts has one). The rule is that the owner
 * variable is never REACHED except through the constrained one: every `process.env.DATABASE_URL`
 * in the file must be immediately preceded by `process.env.MAIA_APP_DATABASE_URL ||`.
 */
function assertSource(rel: string): void {
  const src = readFileSync(join(REPO, rel), 'utf8');
  const needle = 'process.env.DATABASE_URL';
  const guard = /process\.env\.MAIA_APP_DATABASE_URL\s*\|\|\s*$/;

  const occurrences: number[] = [];
  for (let i = src.indexOf(needle); i !== -1; i = src.indexOf(needle, i + 1)) occurrences.push(i);

  if (!src.includes('process.env.MAIA_APP_DATABASE_URL')) {
    fail('source', rel, 'never consults MAIA_APP_DATABASE_URL — B23 defect present');
    return;
  }
  const unguarded = occurrences.filter((i) => !guard.test(src.slice(Math.max(0, i - 80), i)));
  if (unguarded.length > 0) {
    const lines = unguarded.map((i) => src.slice(0, i).split('\n').length).join(', ');
    fail('source', rel, `${unguarded.length} unguarded process.env.DATABASE_URL at line(s) ${lines}`);
    return;
  }
  pass('source', rel, `${occurrences.length} DATABASE_URL read(s), all constrained-first`);
}

async function main() {
  if (process.env.PT3_POOL_WITNESS_CONFIRM !== '1') {
    throw new Error('Refusing to run. Set PT3_POOL_WITNESS_CONFIRM=1.');
  }
  const app = process.env.MAIA_APP_DATABASE_URL ?? '';
  const local = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(app);
  const disposable = /\/[a-z0-9_]*(falsifier|fixture|shadow|disposable|legacy)[a-z0-9_]*(\?|$)/i.test(app);
  if (!local || !disposable) throw new Error('Refusing: MAIA_APP_DATABASE_URL must be local and disposable.');

  console.log('════════ LEG 1 — DISCOVERY (the witness finds its own subjects) ════════');
  const found = discover();
  const known = Object.keys(WITNESSED).sort();
  const unwitnessed = found.filter((f) => !(f in WITNESSED));
  const vanished = known.filter((k) => !found.includes(k));
  if (unwitnessed.length > 0) {
    fail('discovery', 'an unwitnessed pool exists', unwitnessed.join(', '));
    console.log('      A pool this witness has never read can reconnect as the owner unobserved.');
    console.log('      Add it to WITNESSED and make it constrained-first (B34).');
    console.log('      ⛔ Do not narrow PRODUCTION_ROOTS to make this pass.');
  } else {
    pass('discovery', `${found.length} pool construction site(s) found`,
      `roots: ${PRODUCTION_ROOTS.join(', ')} — all witnessed below`);
  }
  for (const v of vanished) fail('discovery', 'a witnessed file no longer constructs a pool', v);

  console.log('\n════════ LEG 2 — SOURCE (each file is read, not remembered) ════════');
  for (const rel of known) {
    if (vanished.includes(rel)) continue;
    assertSource(rel);
  }

  console.log('\n════════ LEG 3 — EXERCISE (the post-cutover world, reproduced) ════════');
  /* ⭐ Nothing below may lean on the owner variable, because after cutover it does not exist.
     A pool that needs it now fails visibly rather than silently reconnecting as `soullab`. */
  delete process.env.DATABASE_URL;
  console.log('      DATABASE_URL removed from this process — this is the post-cutover world.');

  const exercise = (rel: string, role: string, note = '') =>
    role === EXPECTED
      ? pass('exercise', rel, `current_user=${role}${note ? `  ${note}` : ''}`)
      : fail('exercise', rel, `current_user=${role} — reconnected outside the boundary`);

  const { getPool } = await import('@/lib/database/postgres');
  exercise('lib/database/postgres.ts',
    (await getPool().query<{ u: string }>('SELECT current_user AS u')).rows[0].u,
    '(gated on DATABASE_URL before B23)');
  await getPool().end();

  const { query, closePool } = await import('@/lib/db/postgres');
  exercise('lib/db/postgres.ts', (await query<{ u: string }>('SELECT current_user AS u')).rows[0].u);
  await closePool();

  /* The remaining three construct their pools at module scope or behind service setup, so importing
     them would start a service rather than answer a question. They are NOT claimed as exercised.
     Their connection expression was proved by LEG 2 to be the constrained-first one; this connects
     with that expression and reports what it yields — evidence about the expression, and the source
     leg is what binds the expression to the file. */
  for (const rel of known.filter((k) => WITNESSED[k] === 'source-asserted')) {
    if (vanished.includes(rel)) continue;
    const p = new Pool({ connectionString: process.env.MAIA_APP_DATABASE_URL });
    const role = (await p.query<{ u: string }>('SELECT current_user AS u')).rows[0].u;
    await p.end();
    if (role === EXPECTED) pass('expression', rel, `current_user=${role} (source-asserted, module not booted)`);
    else fail('expression', rel, `current_user=${role}`);
  }

  console.log(`\n${'═'.repeat(78)}`);
  const exercised = Object.values(WITNESSED).filter((v) => v === 'exercised').length;
  const asserted = Object.values(WITNESSED).length - exercised;
  if (failed === 0) {
    console.log(`READY — ${found.length} pool site(s) discovered; ${exercised} exercised as modules, ` +
                `${asserted} source-asserted. With the owner variable absent, none reaches it.`);
    process.exit(0);
  }
  console.log(`DEFECT — ${failed} finding(s).`);
  console.log('A pool that reconnects as the owner undoes the boundary the grants describe.');
  console.log('Do not narrow this witness to make it pass.');
  process.exit(1);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(2); });
