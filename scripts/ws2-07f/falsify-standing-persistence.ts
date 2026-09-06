/**
 * WS2-07 · BUILD-07F — FALSIFICATION APPARATUS for the standing event stream.
 *
 * WHY THIS EXISTS. "A guard that has never failed against the code it guards is
 * a tautology" (design §11). Every persistence guard in
 * `database/migrations/20260906000001_developmental_observation_standing.sql`
 * is therefore run twice: once against a DEFICIENT VARIANT of that same
 * migration with exactly ONE protection removed — where it must FAIL — and once
 * against the migration as written, where it must PASS.
 *
 * THE VARIANTS ARE DERIVED, NOT WRITTEN. Each variant is produced by a named
 * excision applied to the real migration text at run time; an excision that
 * does not change the text ABORTS the run. There is no second schema file to
 * drift from the first, and no variant can silently become a no-op that reports
 * a red it never caused.
 *
 * ATTRIBUTION. For each variant the harness also asserts that every OTHER probe
 * still passes. A red is then attributable to the one omitted protection rather
 * than to a broken variant.
 *
 * THE LABORATORY IS NEVER PRODUCTION. The harness creates its own throwaway
 * databases, refuses any non-loopback host, and drops what it created. Deliberately
 * deficient schemas are not applied to a cluster that holds a member's work.
 *
 *   Usage:
 *     DOSE_LAB_URL='postgresql:///postgres?host=/var/lib/postgresql/07f/sock&port=55432' \
 *       npx tsx scripts/ws2-07f/falsify-standing-persistence.ts
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

const MIGRATION = join(
  process.cwd(),
  'database/migrations/20260906000001_developmental_observation_standing.sql',
);

/** The minimum scaffold a standing event needs to exist at all: an owner and a
 *  frozen reading to be about. Deliberately NOT the real tables — this lane
 *  falsifies the standing stream, not its neighbours. */
const SCAFFOLD = `
  CREATE TABLE members (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
  CREATE TABLE developmental_readings (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
`;

type Excision = { readonly name: string; readonly apply: (sql: string) => string };

/** Exactly one protection removed per variant. */
const VARIANTS: readonly Excision[] = [
  {
    name: 'D3-NO-UPDATE-GUARD',
    apply: (s) =>
      cut(
        s,
        `DROP TRIGGER IF EXISTS dose_no_update_check ON developmental_observation_standing_events;
CREATE TRIGGER dose_no_update_check
  BEFORE UPDATE ON developmental_observation_standing_events
  FOR EACH ROW EXECUTE FUNCTION dose_no_update();`,
      ),
  },
  {
    name: 'D3-NO-DELETE-GUARD',
    apply: (s) =>
      cut(
        s,
        `DROP TRIGGER IF EXISTS dose_no_single_delete_check ON developmental_observation_standing_events;
CREATE TRIGGER dose_no_single_delete_check
  BEFORE DELETE ON developmental_observation_standing_events
  FOR EACH ROW EXECUTE FUNCTION dose_no_single_delete();`,
      ),
  },
  {
    // The other side of the same ruling. Removing the CONDITION (not the
    // trigger) leaves a guard that refuses every deletion — including the
    // member's own deletion of their Work. Without this variant, a guard that
    // over-refuses would look identical to a guard that is correct.
    name: 'D3-DELETE-GUARD-UNCONDITIONAL',
    apply: (s) => {
      const withoutIf = cut(
        s,
        `  IF EXISTS (SELECT 1 FROM developmental_readings WHERE id = OLD.reading_id) THEN\n`,
      );
      return cut(withoutIf, `  END IF;\n`);
    },
  },
  {
    name: 'D7-NO-UNIQUE',
    apply: (s) => {
      const withoutUnique = cut(
        s,
        `  UNIQUE (member_id, reading_id, observation_key, event_index)\n`,
      );
      return replace(
        withoutUnique,
        `recorded_at timestamptz NOT NULL DEFAULT now(),`,
        `recorded_at timestamptz NOT NULL DEFAULT now()`,
      );
    },
  },
  {
    name: 'D2-UNSET-VALUE-WRITABLE',
    apply: (s) =>
      replace(
        s,
        `standing text NOT NULL CHECK (standing IN ('keep', 'dismiss', 'unresolved')),`,
        `standing text NOT NULL,`,
      ),
  },
  {
    name: 'D2-NULL-STANDING-WRITABLE',
    apply: (s) =>
      replace(
        s,
        `standing text NOT NULL CHECK (standing IN ('keep', 'dismiss', 'unresolved')),`,
        `standing text CHECK (standing IN ('keep', 'dismiss', 'unresolved')),`,
      ),
  },
];

/** Which probe each variant must break. Every other probe must still pass. */
const EXPECTED_RED: Record<string, readonly string[]> = {
  'D3-NO-UPDATE-GUARD': ['update-refused'],
  'D3-NO-DELETE-GUARD': ['single-delete-refused'],
  'D3-DELETE-GUARD-UNCONDITIONAL': ['work-cascade-permitted'],
  'D7-NO-UNIQUE': ['simultaneous-write-refused'],
  'D2-UNSET-VALUE-WRITABLE': ['standing-values-closed'],
  'D2-NULL-STANDING-WRITABLE': ['null-standing-refused'],
};

function cut(sql: string, fragment: string): string {
  if (!sql.includes(fragment)) {
    throw new Error(`excision fragment not found in the migration:\n${fragment}`);
  }
  return sql.replace(fragment, '');
}

function replace(sql: string, from: string, to: string): string {
  if (!sql.includes(from)) throw new Error(`excision anchor not found: ${from}`);
  return sql.replace(from, to);
}

// ---------------------------------------------------------------- probes ----

type Probe = { readonly key: string; readonly claim: string; readonly run: (c: Client, url: string) => Promise<void> };

/** Throws when the guard does not hold. Returning normally = the guard held. */
const PROBES: readonly Probe[] = [
  {
    key: 'update-refused',
    claim: 'a recorded standing event cannot be rewritten',
    run: async (c) => {
      const { member, reading } = await seed(c);
      await insertEvent(c, member, reading, 'o1', 0, 'keep');
      await mustFail(
        c,
        `UPDATE developmental_observation_standing_events SET standing = 'dismiss'`,
        'UPDATE was accepted',
      );
      const after = await c.query(
        `SELECT standing FROM developmental_observation_standing_events`,
      );
      if (after.rows[0].standing !== 'keep') throw new Error('the earlier event changed');
    },
  },
  {
    key: 'single-delete-refused',
    claim: 'one event cannot be erased while its Work exists',
    run: async (c) => {
      const { member, reading } = await seed(c);
      await insertEvent(c, member, reading, 'o1', 0, 'keep');
      await mustFail(
        c,
        `DELETE FROM developmental_observation_standing_events`,
        'per-event DELETE was accepted',
      );
      await expectCount(c, 1, 'the event did not survive the refused delete');
    },
  },
  {
    key: 'work-cascade-permitted',
    claim: "deleting the Work still takes its standing history with it",
    run: async (c) => {
      const { member, reading } = await seed(c);
      await insertEvent(c, member, reading, 'o1', 0, 'keep');
      await c.query(`DELETE FROM developmental_readings WHERE id = $1`, [reading]);
      await expectCount(c, 0, 'the cascade did not remove the stream');
    },
  },
  {
    key: 'simultaneous-write-refused',
    claim: 'two writers computing the same next index cannot both be accepted',
    run: async (c, url) => {
      const { member, reading } = await seed(c);
      await insertEvent(c, member, reading, 'o1', 0, 'keep');

      const a = new Client({ connectionString: url });
      const b = new Client({ connectionString: url });
      await a.connect();
      await b.connect();
      try {
        await a.query('BEGIN');
        await b.query('BEGIN');

        // The race must be REAL, not a fortunate interleaving: both writers
        // read the stream before either has committed, so both compute the
        // same next index. If they did not, the probe proved nothing and the
        // harness says so rather than recording a pass.
        const nextIndex = async (cl: Client): Promise<number> => {
          const r = await cl.query(
            `SELECT coalesce(max(event_index) + 1, 0)::int AS n
               FROM developmental_observation_standing_events
              WHERE member_id = $1 AND reading_id = $2 AND observation_key = $3`,
            [member, reading, 'o1'],
          );
          return r.rows[0].n;
        };
        const nA = await nextIndex(a);
        const nB = await nextIndex(b);
        if (nA !== nB) throw new Error(`no race occurred: ${nA} vs ${nB} — probe inconclusive`);

        const write = (cl: Client, index: number, standing: string) =>
          cl.query(
            `INSERT INTO developmental_observation_standing_events
               (member_id, reading_id, observation_key, event_index, standing)
             VALUES ($1, $2, $3, $4, $5)`,
            [member, reading, 'o1', index, standing],
          );

        await write(a, nA, 'dismiss');
        const loser = write(b, nB, 'unresolved').then(
          () => ({ ok: true }) as const,
          (e: unknown) => ({ ok: false, e }) as const,
        );
        await a.query('COMMIT');
        const outcome = await loser;
        if (outcome.ok) {
          await b.query('COMMIT').catch(() => undefined);
          throw new Error('both concurrent writes were accepted');
        }
        await b.query('ROLLBACK').catch(() => undefined);
      } finally {
        await a.end().catch(() => undefined);
        await b.end().catch(() => undefined);
      }

      const rows = await c.query(
        `SELECT event_index, count(*) AS n
           FROM developmental_observation_standing_events
          GROUP BY event_index HAVING count(*) > 1`,
      );
      if (rows.rowCount !== 0) throw new Error('two events share one index: "current" is ambiguous');
    },
  },
  {
    key: 'standing-values-closed',
    claim: 'no value outside keep · dismiss · unresolved can be stored',
    run: async (c) => {
      const { member, reading } = await seed(c);
      for (const bad of ['unset', 'investigate', 'cleared', '']) {
        await mustFail(
          c,
          `INSERT INTO developmental_observation_standing_events
             (member_id, reading_id, observation_key, event_index, standing)
           VALUES ('${member}', '${reading}', 'o1', 0, '${bad}')`,
          `standing '${bad}' was accepted`,
        );
      }
    },
  },
  {
    key: 'null-standing-refused',
    claim: 'absence is not storable as a value',
    run: async (c) => {
      const { member, reading } = await seed(c);
      await mustFail(
        c,
        `INSERT INTO developmental_observation_standing_events
           (member_id, reading_id, observation_key, event_index, standing)
         VALUES ('${member}', '${reading}', 'o1', 0, NULL)`,
        'a NULL standing was accepted',
      );
    },
  },
];

// ------------------------------------------------------------- machinery ----

async function seed(c: Client): Promise<{ member: string; reading: string }> {
  await c.query(`TRUNCATE developmental_observation_standing_events`);
  await c.query(`DELETE FROM developmental_readings`);
  await c.query(`DELETE FROM members`);
  const m = await c.query(`INSERT INTO members DEFAULT VALUES RETURNING id`);
  const r = await c.query(`INSERT INTO developmental_readings DEFAULT VALUES RETURNING id`);
  return { member: m.rows[0].id, reading: r.rows[0].id };
}

async function insertEvent(
  c: Client, member: string, reading: string, key: string, index: number, standing: string,
): Promise<void> {
  await c.query(
    `INSERT INTO developmental_observation_standing_events
       (member_id, reading_id, observation_key, event_index, standing)
     VALUES ($1, $2, $3, $4, $5)`,
    [member, reading, key, index, standing],
  );
}

async function mustFail(c: Client, sql: string, whenAccepted: string): Promise<void> {
  try {
    await c.query(sql);
  } catch {
    return;
  }
  throw new Error(whenAccepted);
}

async function expectCount(c: Client, n: number, message: string): Promise<void> {
  const r = await c.query(`SELECT count(*)::int AS n FROM developmental_observation_standing_events`);
  if (r.rows[0].n !== n) throw new Error(`${message} (rows: ${r.rows[0].n}, expected ${n})`);
}

function labUrl(): string {
  const url = process.env.DOSE_LAB_URL;
  if (!url) throw new Error('DOSE_LAB_URL is required — this harness needs a throwaway cluster');
  const host = /host=([^&]+)/.exec(url)?.[1] ?? new URL(url).hostname;
  const local = host.startsWith('/') || host === 'localhost' || host === '127.0.0.1';
  if (!local) throw new Error(`refusing a non-loopback laboratory host: ${host}`);
  return url;
}

function dbUrl(base: string, db: string): string {
  return base.includes('?')
    ? base.replace(/^([^?]*\/)[^/?]*(\?.*)$/, `$1${db}$2`)
    : base.replace(/\/[^/]*$/, `/${db}`);
}

async function withDatabase<T>(
  base: string, name: string, schema: string, fn: (c: Client, url: string) => Promise<T>,
): Promise<T> {
  const admin = new Client({ connectionString: base });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${name}`);
  await admin.query(`CREATE DATABASE ${name}`);
  await admin.end();

  const url = dbUrl(base, name);
  const c = new Client({ connectionString: url });
  await c.connect();
  try {
    await c.query(SCAFFOLD);
    await c.query(schema);
    return await fn(c, url);
  } finally {
    await c.end().catch(() => undefined);
    const cleanup = new Client({ connectionString: base });
    await cleanup.connect();
    await cleanup.query(`DROP DATABASE IF EXISTS ${name}`);
    await cleanup.end();
  }
}

type Line = { readonly ok: boolean; readonly text: string };

async function main(): Promise<void> {
  const base = labUrl();
  const migration = readFileSync(MIGRATION, 'utf8');
  const lines: Line[] = [];
  const record = (ok: boolean, text: string) => {
    lines.push({ ok, text });
    console.log(`${ok ? '  ok  ' : ' FAIL '} ${text}`);
  };

  console.log('BUILD-07F · persistence falsification\n');
  console.log('DEFICIENT VARIANTS — the named guard must FAIL, every other guard must hold\n');

  for (const variant of VARIANTS) {
    const sql = variant.apply(migration);
    if (sql === migration) throw new Error(`${variant.name}: excision changed nothing`);
    const red = EXPECTED_RED[variant.name];
    console.log(`· ${variant.name}`);
    await withDatabase(base, `dose_lab_${variant.name.toLowerCase().replace(/-/g, '_')}`, sql,
      async (c, url) => {
        for (const probe of PROBES) {
          const shouldBreak = red.includes(probe.key);
          let held = true;
          let detail = '';
          try {
            await probe.run(c, url);
          } catch (e) {
            held = false;
            detail = e instanceof Error ? e.message : String(e);
          }
          if (shouldBreak) {
            record(!held, `${variant.name} → ${probe.key} RED as required${held ? ' — BUT IT HELD' : `: ${detail}`}`);
          } else if (!held) {
            record(false, `${variant.name} → ${probe.key} broke too — the red is not attributable: ${detail}`);
          }
        }
      });
  }

  console.log('\nMIGRATION AS WRITTEN — every guard must hold\n');
  await withDatabase(base, 'dose_lab_repaired', migration, async (c, url) => {
    for (const probe of PROBES) {
      try {
        await probe.run(c, url);
        record(true, `${probe.key}: ${probe.claim}`);
      } catch (e) {
        record(false, `${probe.key}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  });

  const failures = lines.filter((l) => !l.ok).length;
  console.log(`\n${lines.length} checks · ${failures} failures`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(`\nHARNESS ABORTED: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(2);
});
