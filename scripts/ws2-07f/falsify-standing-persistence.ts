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

/**
 * The scaffold carries the REAL parent relationship, and this matters.
 *
 * An earlier version of this harness stubbed `developmental_readings` as a bare
 * id table with no manuscript above it — and then called a DIRECT delete of a
 * reading the "Work deletion" witness. That labelled the exact hole R1 found as
 * the proof that the hole was closed. The chain under test is two hops:
 *
 *   member_manuscripts → developmental_readings → standing events
 *
 * so the middle table is the canonical 07C migration, applied verbatim, and the
 * positive D3 witness deletes the MANUSCRIPT.
 */
const SCAFFOLD = `
  CREATE TABLE members (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
  CREATE TABLE member_manuscripts (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
`;

const READINGS_MIGRATION = join(
  process.cwd(), 'database/migrations/20260904000001_developmental_readings.sql');

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
    apply: (s) =>
      replace(
        s,
        `  IF EXISTS (SELECT 1 FROM developmental_readings WHERE id = OLD.reading_id) THEN
    RAISE EXCEPTION
      'standing event % cannot be deleted while its Work exists: a standing is withdrawn by taking another standing, and history is not erased piecemeal',
      OLD.id;
  END IF;`,
        `  RAISE EXCEPTION 'refused unconditionally: %', OLD.id;`,
      ),
  },
  {
    // R1. The middle link of the cascade path: without this trigger a reading
    // can be deleted while its Work stands, and the standing stream goes with
    // it through the very CASCADE that was supposed to mean "the member
    // deleted their Work".
    name: 'D3-NO-READING-DELETE-GUARD',
    apply: (s) =>
      cut(
        s,
        `DROP TRIGGER IF EXISTS developmental_readings_no_orphan_delete_check ON developmental_readings;
CREATE TRIGGER developmental_readings_no_orphan_delete_check
  BEFORE DELETE ON developmental_readings
  FOR EACH ROW EXECUTE FUNCTION developmental_readings_no_orphan_delete();`,
      ),
  },
  {
    // And its other side: a middle-link guard that refuses unconditionally
    // would block the member's own deletion of their Work two levels down.
    name: 'D3-READING-DELETE-GUARD-UNCONDITIONAL',
    apply: (s) =>
      replace(
        s,
        `  IF EXISTS (SELECT 1 FROM member_manuscripts WHERE id = OLD.manuscript_id) THEN
    RAISE EXCEPTION
      'developmental reading % cannot be deleted while its Work exists: a reading is superseded by a later reading, and the record it anchors is not erased beneath it',
      OLD.id;
  END IF;`,
        `  RAISE EXCEPTION 'refused unconditionally: %', OLD.id;`,
      ),
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
  'D3-NO-READING-DELETE-GUARD': ['reading-delete-refused'],
  'D3-READING-DELETE-GUARD-UNCONDITIONAL': ['work-cascade-permitted'],
  'D7-NO-UNIQUE': ['simultaneous-write-refused'],
  'D2-UNSET-VALUE-WRITABLE': ['standing-values-closed'],
  'D2-NULL-STANDING-WRITABLE': ['null-standing-refused'],
};

/** Every excision anchor must occur EXACTLY ONCE. Two delete guards now live in
 *  this migration and share phrasing; an anchor that matched either would make
 *  the variant — and therefore the red — ambiguous. */
function replace(sql: string, from: string, to: string): string {
  const count = sql.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`excision anchor occurs ${count} times, expected exactly once:\n${from}`);
  }
  return sql.replace(from, to);
}

const cut = (sql: string, fragment: string): string => replace(sql, fragment, '');

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
    key: 'reading-delete-refused',
    claim: 'a reading cannot be deleted out from under the Work it belongs to',
    run: async (c) => {
      /* R1's hole. If this passes only because no route issues the statement,
         the standing guard's inference — "the reading is gone, so the member
         deleted their Work" — is false, and the whole stream is erasable while
         the Work stands. */
      const { member, reading } = await seed(c);
      await insertEvent(c, member, reading, 'o1', 0, 'keep');
      await mustFail(
        c,
        `DELETE FROM developmental_readings WHERE id = '${reading}'`,
        'a reading was deleted while its Work existed',
      );
      await expectCount(c, 1, 'the standing stream did not survive the refused delete');
    },
  },
  {
    key: 'work-cascade-permitted',
    claim: "deleting the Work still takes the reading and its standing history with it",
    run: async (c) => {
      /* THE ACTUAL TWO-HOP PATH: manuscript → reading → standing events. The
         earlier version of this probe deleted the READING directly and called
         that the Work deletion; that is the hole, not the witness. */
      const { member, manuscript, reading } = await seed(c);
      await insertEvent(c, member, reading, 'o1', 0, 'keep');
      await c.query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscript]);
      const readings = await c.query(`SELECT count(*)::int AS n FROM developmental_readings`);
      if (readings.rows[0].n !== 0) throw new Error('the reading survived its Work');
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

const OBSERVATION = {
  key: 'o1', lens: 'development', phenomenon: 'recurrence',
  evidenceRefs: [{ kind: 'section', sectionId: '00000000-0000-4000-8000-000000000001' }],
  observation: 'A thing recurs.',
  doesNotEstablish: ['that the recurrence is a flaw'],
  structureDependency: { kind: 'independent' },
};

/** A Work, a frozen reading of it, and the member who owns both. The teardown
 *  uses TRUNCATE, which does not fire row triggers — the guards under test are
 *  exercised by the probes, never by the fixture. */
async function seed(c: Client): Promise<{ member: string; manuscript: string; reading: string }> {
  await c.query(`TRUNCATE developmental_observation_standing_events, developmental_readings,
                          member_manuscripts, members`);
  const m = await c.query(`INSERT INTO members DEFAULT VALUES RETURNING id`);
  const w = await c.query(`INSERT INTO member_manuscripts DEFAULT VALUES RETURNING id`);
  const r = await c.query(
    `INSERT INTO developmental_readings
       (manuscript_id, member_id, draft_id, revision_number, commissioned_lens,
        scope, read_state, coverage, input_fingerprint, outcome, observations,
        reader_provenance, classifier_provenance)
     VALUES ($1, $2, gen_random_uuid(), 1, 'development',
             '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'fp', 'reading', $3::jsonb,
             '{"model":"lab"}'::jsonb, '{"model":"lab"}'::jsonb)
     RETURNING id`,
    [w.rows[0].id, m.rows[0].id, JSON.stringify([OBSERVATION])]);
  return { member: m.rows[0].id, manuscript: w.rows[0].id, reading: r.rows[0].id };
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
    await c.query(readFileSync(READINGS_MIGRATION, 'utf8'));
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
