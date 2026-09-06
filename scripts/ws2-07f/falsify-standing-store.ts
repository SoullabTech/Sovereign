/**
 * WS2-07 · BUILD-07F — FALSIFICATION APPARATUS for the standing WRITE BOUNDARY.
 *
 * The schema harness (falsify-standing-persistence.ts) proves what the database
 * refuses. This one proves what the boundary in `lib/manuscript/standing/store.ts`
 * refuses — ownership scoping, address coherence, staleness, and the ordering of
 * the expected-current test against the same-value no-op. None of those can be
 * expressed as a constraint, which is exactly why each is falsified here.
 *
 * SAME DISCIPLINE. Each deficient variant is DERIVED from the real store source
 * by one named excision, applied at run time; an excision that changes nothing
 * aborts the run. Every other probe must still pass under each variant, so a red
 * is attributable to the one omitted protection. The generated variants live in
 * a scratch directory that is emptied before and after the run — they are
 * evidence apparatus, never an alternate implementation.
 *
 * THE LABORATORY IS NEVER PRODUCTION: a throwaway database on a loopback
 * cluster, created and dropped by this harness.
 *
 *   Usage:
 *     DOSE_LAB_URL='postgresql:///postgres?host=/var/lib/postgresql/07f/sock&port=55432' \
 *       npx tsx scripts/ws2-07f/falsify-standing-store.ts
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import type { StandingRequest, StandingWriteResult, StandingEvent } from '@/lib/manuscript/standing/contract';

const ROOT = process.cwd();
const STORE = join(ROOT, 'lib/manuscript/standing/store.ts');
const VARIANT_DIR = join(ROOT, 'scripts/ws2-07f/.variants');
const LAB_DB = 'dose_store_lab';

interface StoreModule {
  currentStandings(memberId: string, readingId: string): Promise<readonly StandingEvent[]>;
  currentStanding(memberId: string, readingId: string, key: string): Promise<StandingEvent | null>;
  recordStanding(memberId: string, readingId: string, r: StandingRequest): Promise<StandingWriteResult>;
}

// --------------------------------------------------------------- variants ---

type Excision = { readonly name: string; readonly apply: (s: string) => string };

const sub = (s: string, from: string, to: string): string => {
  if (!s.includes(from)) throw new Error(`excision anchor not found: ${from}`);
  return s.replace(from, to);
};

/** Each removes exactly one protection. A bound-but-unused parameter is kept
 *  live by a trivially true predicate, so the variant differs from the real
 *  store in the PROTECTION only and not in its statement shape. */
const VARIANTS: readonly Excision[] = [
  {
    name: 'D1-NO-MEMBER-SCOPE-READ',
    apply: (s) => sub(s,
      `      WHERE member_id = $1 AND reading_id = $2
      ORDER BY observation_key, event_index DESC`,
      `      WHERE $1::uuid IS NOT NULL AND reading_id = $2
      ORDER BY observation_key, event_index DESC`),
  },
  {
    name: 'D1-NO-MEMBER-SCOPE-WRITE',
    apply: (s) => sub(s, `      WHERE r.id = $1 AND r.member_id = $2`,
                         `      WHERE r.id = $1 AND $2::uuid IS NOT NULL`),
  },
  {
    name: 'D4-KEY-ONLY-IDENTITY',
    apply: (s) => sub(s, `      WHERE member_id = $1 AND reading_id = $2 AND observation_key = $3
      ORDER BY event_index DESC
      LIMIT 1`,
                         `      WHERE member_id = $1 AND $2::uuid IS NOT NULL AND observation_key = $3
      ORDER BY event_index DESC
      LIMIT 1`),
  },
  {
    name: 'D7-NO-CAS',
    apply: (s) => sub(s, `        WHERE (SELECT id FROM cur)       IS NOT DISTINCT FROM $4::uuid`,
                         `        WHERE $4::uuid                   IS NOT DISTINCT FROM $4::uuid`),
  },
  {
    // The ordering, not the test: staleness decided AFTER the same-value no-op.
    name: 'D7-NOOP-BEFORE-CAS',
    apply: (s) => sub(s,
      `  if ((current?.id ?? null) !== token) return { outcome: 'refused', reason: 'stale_expectation' };`,
      `  if (current && current.standing === request.standing) return { outcome: 'unchanged', current };
  if ((current?.id ?? null) !== token) return { outcome: 'refused', reason: 'stale_expectation' };`),
  },
  {
    // MINIMAL BY CONSTRUCTION. `addressResolves` carries TWO protections —
    // reading ownership and observation resolution — so removing the whole call
    // would break member scoping as well and the red would not be attributable
    // (observed: the first run of this harness). The variant therefore drops
    // ONLY the observation half and keeps the ownership refusal.
    name: 'SEC5-NO-COHERENCE-GATE',
    apply: (s) => sub(s,
      `  if (address !== 'ok') return { outcome: 'refused', reason: address };`,
      `  if (address === 'reading_unknown') return { outcome: 'refused', reason: address };`),
  },
];

const EXPECTED_RED: Record<string, readonly string[]> = {
  'D1-NO-MEMBER-SCOPE-READ': ['read-is-member-scoped'],
  'D1-NO-MEMBER-SCOPE-WRITE': ['write-is-member-scoped'],
  'D4-KEY-ONLY-IDENTITY': ['standing-does-not-transfer'],
  'D7-NO-CAS': ['stale-expectation-refused'],
  'D7-NOOP-BEFORE-CAS': ['staleness-tested-before-noop'],
  'SEC5-NO-COHERENCE-GATE': ['address-must-resolve'],
};

// ----------------------------------------------------------------- world ----

interface World { memberA: string; memberB: string; readingA: string; readingB: string }

const OBSERVATION = (key: string) => ({
  key, lens: 'development', phenomenon: 'recurrence',
  evidenceRefs: [{ kind: 'section', sectionId: '00000000-0000-4000-8000-000000000001' }],
  observation: 'A thing recurs.',
  doesNotEstablish: ['that the recurrence is a flaw'],
  structureDependency: { kind: 'independent' },
});

async function seedWorld(c: Client): Promise<World> {
  /* TRUNCATE, not DELETE: the 07F migration now refuses the deletion of a
     reading while its Work exists (R1), and a fixture must not be the thing
     that exercises — or is blocked by — a guard under test. */
  await c.query(`TRUNCATE developmental_observation_standing_events, developmental_readings,
                          member_manuscripts, members`);
  const m = await c.query(`INSERT INTO members DEFAULT VALUES RETURNING id`);
  const m2 = await c.query(`INSERT INTO members DEFAULT VALUES RETURNING id`);
  const ms = await c.query(`INSERT INTO member_manuscripts DEFAULT VALUES RETURNING id`);
  const reading = async (memberId: string): Promise<string> => {
    const r = await c.query(
      `INSERT INTO developmental_readings
         (manuscript_id, member_id, draft_id, revision_number, commissioned_lens,
          scope, read_state, coverage, input_fingerprint, outcome, observations,
          reader_provenance, classifier_provenance)
       VALUES ($1, $2, gen_random_uuid(), 1, 'development',
               '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'fp', 'reading', $3::jsonb,
               '{"model":"lab"}'::jsonb, '{"model":"lab"}'::jsonb)
       RETURNING id`,
      [ms.rows[0].id, memberId, JSON.stringify([OBSERVATION('o1'), OBSERVATION('o2')])]);
    return r.rows[0].id;
  };
  return {
    memberA: m.rows[0].id, memberB: m2.rows[0].id,
    readingA: await reading(m.rows[0].id), readingB: await reading(m.rows[0].id),
  };
}

// ---------------------------------------------------------------- probes ----

type Probe = {
  readonly key: string; readonly claim: string;
  readonly run: (s: StoreModule, w: World, c: Client) => Promise<void>;
};

const keep = (expected: string | null): StandingRequest =>
  ({ observationKey: 'o1', standing: 'keep', expectedCurrentEventId: expected });

async function expectEvents(c: Client, n: number, msg: string): Promise<void> {
  const r = await c.query(`SELECT count(*)::int AS n FROM developmental_observation_standing_events`);
  if (r.rows[0].n !== n) throw new Error(`${msg} (events: ${r.rows[0].n}, expected ${n})`);
}

const PROBES: readonly Probe[] = [
  {
    key: 'appends-and-does-not-rewrite',
    claim: 'a change appends a later event and leaves the earlier act intact',
    run: async (s, w, c) => {
      const first = await s.recordStanding(w.memberA, w.readingA, keep(null));
      if (first.outcome !== 'appended') throw new Error(`first act was ${first.outcome}`);
      const second = await s.recordStanding(w.memberA, w.readingA,
        { observationKey: 'o1', standing: 'dismiss', expectedCurrentEventId: first.event.id });
      if (second.outcome !== 'appended') throw new Error(`second act was ${second.outcome}`);
      await expectEvents(c, 2, 'the change did not append');
      const earlier = await c.query(
        `SELECT standing FROM developmental_observation_standing_events WHERE id = $1`, [first.event.id]);
      if (earlier.rows[0].standing !== 'keep') throw new Error('the earlier act was rewritten');
      const current = await s.currentStanding(w.memberA, w.readingA, 'o1');
      if (current?.standing !== 'dismiss') throw new Error('current is not the latest event');
    },
  },
  {
    key: 'same-value-is-a-noop',
    claim: 'repeating the current standing writes nothing',
    run: async (s, w, c) => {
      const first = await s.recordStanding(w.memberA, w.readingA, keep(null));
      if (first.outcome !== 'appended') throw new Error('setup failed');
      const again = await s.recordStanding(w.memberA, w.readingA, keep(first.event.id));
      if (again.outcome !== 'unchanged') throw new Error(`repeat was ${again.outcome}`);
      await expectEvents(c, 1, 'the repeat wrote an event');
    },
  },
  {
    key: 'stale-expectation-refused',
    claim: 'a caller acting from a superseded state is refused, not silently accepted',
    run: async (s, w, c) => {
      const first = await s.recordStanding(w.memberA, w.readingA, keep(null));
      if (first.outcome !== 'appended') throw new Error('setup failed');
      const second = await s.recordStanding(w.memberA, w.readingA,
        { observationKey: 'o1', standing: 'dismiss', expectedCurrentEventId: first.event.id });
      if (second.outcome !== 'appended') throw new Error('setup failed');
      /* The first caller never saw the second act and now writes from event 0. */
      const stale = await s.recordStanding(w.memberA, w.readingA,
        { observationKey: 'o1', standing: 'unresolved', expectedCurrentEventId: first.event.id });
      if (stale.outcome !== 'refused' || stale.reason !== 'stale_expectation') {
        throw new Error(`stale write was ${stale.outcome}`);
      }
      await expectEvents(c, 2, 'the stale write was persisted');
    },
  },
  {
    key: 'staleness-tested-before-noop',
    claim: 'a stale token whose value happens to match is refused, never reported unchanged',
    run: async (s, w, c) => {
      const first = await s.recordStanding(w.memberA, w.readingA, keep(null));
      if (first.outcome !== 'appended') throw new Error('setup failed');
      const second = await s.recordStanding(w.memberA, w.readingA,
        { observationKey: 'o1', standing: 'dismiss', expectedCurrentEventId: first.event.id });
      if (second.outcome !== 'appended') throw new Error('setup failed');
      /* Value matches CURRENT (dismiss); the token is the FIRST event. */
      const stale = await s.recordStanding(w.memberA, w.readingA,
        { observationKey: 'o1', standing: 'dismiss', expectedCurrentEventId: first.event.id });
      if (stale.outcome !== 'refused' || stale.reason !== 'stale_expectation') {
        throw new Error(`a stale caller was told "${stale.outcome}" — it was taught its token was current`);
      }
      await expectEvents(c, 2, 'the stale no-op wrote an event');
    },
  },
  {
    key: 'address-must-resolve',
    claim: 'an observation key that does not exist in the frozen reading is refused',
    run: async (s, w, c) => {
      const r = await s.recordStanding(w.memberA, w.readingA,
        { observationKey: 'o27', standing: 'keep', expectedCurrentEventId: null });
      if (r.outcome !== 'refused' || r.reason !== 'observation_unknown') {
        throw new Error(`an imaginary observation was ${r.outcome}`);
      }
      await expectEvents(c, 0, 'a standing was recorded against an observation that does not exist');
    },
  },
  {
    key: 'write-is-member-scoped',
    claim: "another member cannot record a standing on this member's reading",
    run: async (s, w, c) => {
      const r = await s.recordStanding(w.memberB, w.readingA, keep(null));
      if (r.outcome !== 'refused' || r.reason !== 'reading_unknown') {
        throw new Error(`member B's write was ${r.outcome}`);
      }
      await expectEvents(c, 0, "member B wrote into member A's stream");
    },
  },
  {
    key: 'read-is-member-scoped',
    claim: "another member cannot read this member's standing",
    run: async (s, w) => {
      const first = await s.recordStanding(w.memberA, w.readingA, keep(null));
      if (first.outcome !== 'appended') throw new Error('setup failed');
      const mine = await s.currentStandings(w.memberA, w.readingA);
      if (mine.length !== 1) throw new Error('the owner cannot see their own standing');
      const theirs = await s.currentStandings(w.memberB, w.readingA);
      if (theirs.length !== 0) throw new Error("member B read member A's standing");
    },
  },
  {
    key: 'standing-does-not-transfer',
    claim: 'the same key in a different reading is UNSET',
    run: async (s, w) => {
      const first = await s.recordStanding(w.memberA, w.readingA, keep(null));
      if (first.outcome !== 'appended') throw new Error('setup failed');
      const other = await s.currentStanding(w.memberA, w.readingB, 'o1');
      if (other !== null) throw new Error('a standing transferred to a different reading');
      const listed = await s.currentStandings(w.memberA, w.readingB);
      if (listed.length !== 0) throw new Error('a standing was projected into a different reading');
    },
  },
];

// ------------------------------------------------------------- machinery ----

function labUrl(): string {
  const url = process.env.DOSE_LAB_URL;
  if (!url) throw new Error('DOSE_LAB_URL is required — this harness needs a throwaway cluster');
  const host = /host=([^&]+)/.exec(url)?.[1] ?? new URL(url).hostname;
  if (!(host.startsWith('/') || host === 'localhost' || host === '127.0.0.1')) {
    throw new Error(`refusing a non-loopback laboratory host: ${host}`);
  }
  return url;
}

const dbUrl = (base: string, db: string): string =>
  base.includes('?')
    ? base.replace(/^([^?]*\/)[^/?]*(\?.*)$/, `$1${db}$2`)
    : base.replace(/\/[^/]*$/, `/${db}`);

const SCAFFOLD = `
  CREATE TABLE members (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
  CREATE TABLE member_manuscripts (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
`;

async function main(): Promise<void> {
  const base = labUrl();
  const url = dbUrl(base, LAB_DB);

  const admin = new Client({ connectionString: base });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${LAB_DB}`);
  await admin.query(`CREATE DATABASE ${LAB_DB}`);
  await admin.end();

  /* The store is imported ONLY after the laboratory is the configured database:
     `lib/db/postgres` builds its pool at module load. */
  process.env.DATABASE_URL = url;

  const c = new Client({ connectionString: url });
  await c.connect();
  await c.query(SCAFFOLD);
  for (const m of ['20260904000001_developmental_readings.sql',
                   '20260906000001_developmental_observation_standing.sql']) {
    await c.query(readFileSync(join(ROOT, 'database/migrations', m), 'utf8'));
  }

  rmSync(VARIANT_DIR, { recursive: true, force: true });
  mkdirSync(VARIANT_DIR, { recursive: true });

  const source = readFileSync(STORE, 'utf8');
  const lines: { ok: boolean }[] = [];
  const record = (ok: boolean, text: string) => {
    lines.push({ ok });
    console.log(`${ok ? '  ok  ' : ' FAIL '} ${text}`);
  };

  const exercise = async (mod: StoreModule, variant: string | null): Promise<void> => {
    const red = variant ? EXPECTED_RED[variant] : [];
    for (const probe of PROBES) {
      const world = await seedWorld(c);
      let held = true;
      let detail = '';
      try {
        await probe.run(mod, world, c);
      } catch (e) {
        held = false;
        detail = e instanceof Error ? e.message : String(e);
      }
      if (!variant) {
        record(held, held ? `${probe.key}: ${probe.claim}` : `${probe.key}: ${detail}`);
      } else if (red.includes(probe.key)) {
        record(!held, `${variant} → ${probe.key} RED as required${held ? ' — BUT IT HELD' : `: ${detail}`}`);
      } else if (!held) {
        record(false, `${variant} → ${probe.key} broke too — the red is not attributable: ${detail}`);
      }
    }
  };

  try {
    console.log('BUILD-07F · write-boundary falsification\n');
    console.log('DEFICIENT VARIANTS — the named guard must FAIL, every other guard must hold\n');
    for (const variant of VARIANTS) {
      const code = variant.apply(source);
      if (code === source) throw new Error(`${variant.name}: excision changed nothing`);
      const file = join(VARIANT_DIR, `${variant.name}.ts`);
      writeFileSync(file, code);
      console.log(`· ${variant.name}`);
      const mod = (await import(file)) as StoreModule;
      await exercise(mod, variant.name);
    }

    console.log('\nSTORE AS WRITTEN — every guard must hold\n');
    await exercise((await import(STORE)) as StoreModule, null);
  } finally {
    rmSync(VARIANT_DIR, { recursive: true, force: true });
    await c.end().catch(() => undefined);
    const cleanup = new Client({ connectionString: base });
    await cleanup.connect();
    /* The store's own pool is still open on the laboratory database; it is
       module state and has no close in this process. Evict it, then drop. The
       pool's own error handler logs the eviction — silenced HERE ONLY, around
       the two cleanup statements, so a teardown notice cannot be mistaken for
       a probe result. */
    const noise = console.error;
    console.error = () => undefined;
    await cleanup.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()`, [LAB_DB]);
    await cleanup.query(`DROP DATABASE IF EXISTS ${LAB_DB}`);
    await cleanup.end();
    console.error = noise;
  }

  const failures = lines.filter((l) => !l.ok).length;
  console.log(`\n${lines.length} checks · ${failures} failures`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  rmSync(VARIANT_DIR, { recursive: true, force: true });
  console.error(`\nHARNESS ABORTED: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(2);
});
