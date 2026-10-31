import fs from 'node:fs';
import path from 'node:path';
import {
  sealR20DeletionLedger,
  verifyR20DeletionLedger,
  importR20DeletionLedger,
  r20LedgerErrorCode,
  type R20LedgerPaths,
} from '@/lib/recovery/r20DeletionLedger';
import { query, closePool } from '@/lib/db/postgres';

type Check = { name: string; pass: boolean; detail?: unknown };
const checks: Check[] = [];
const check = (name: string, pass: boolean, detail?: unknown) => {
  checks.push({ name, pass, ...(detail === undefined ? {} : { detail }) });
  if (!pass) throw new Error(`CHECK_FAILED:${name}`);
};
const expectedError = async (name: string, expected: string, fn: () => unknown | Promise<unknown>) => {
  let observed = 'NO_ERROR';
  try { await fn(); } catch (error) { observed = r20LedgerErrorCode(error); }
  check(name, observed === expected, { expected, observed });
};
const mode = (file: string) => (fs.statSync(file).mode & 0o777).toString(8);

async function main() {
  const sourceCommit = process.env.R20_CANDIDATE_COMMIT ?? '';
  const sourceTree = process.env.R20_CANDIDATE_TREE ?? '';
  if (!/^[a-f0-9]{40}$/.test(sourceCommit) || !/^[a-f0-9]{40}$/.test(sourceTree)) {
    throw new Error('EXACT_SOURCE_IDENTITY_REQUIRED');
  }
  const paths: R20LedgerPaths = {
    ledgerFile: process.env.R20_LEDGER_FILE!,
    highWaterFile: process.env.R20_HIGH_WATER_FILE!,
    keyFile: process.env.R20_LEDGER_KEY_FILE!,
  };
  if (![paths.ledgerFile, paths.highWaterFile, paths.keyFile].every(path.isAbsolute)) {
    throw new Error('ABSOLUTE_PATHS_REQUIRED');
  }
  await query(`
    CREATE TABLE deletion_manifests(
      id uuid PRIMARY KEY, reason_class text NOT NULL, incident_ref text,
      authorized_by text NOT NULL, executed_at timestamptz, created_at timestamptz NOT NULL, note text
    );
    CREATE TABLE deletion_manifest_scopes(
      id uuid PRIMARY KEY, manifest_id uuid NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
      table_name text NOT NULL, session_id text, member_id text,
      window_start timestamptz, window_end timestamptz
    );
    CREATE TABLE provenance_tombstones(
      id uuid PRIMARY KEY, manifest_id uuid NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
      object_kind text NOT NULL, object_id text NOT NULL, tombstoned_at timestamptz NOT NULL,
      UNIQUE(object_kind, object_id)
    );
  `);
  await query(`INSERT INTO deletion_manifests VALUES
    ('11111111-1111-4111-8111-111111111111','member_deletion',NULL,'fictional-owner',NULL,'2026-10-25T00:00:00Z','fictional only')`);
  await query(`INSERT INTO deletion_manifest_scopes VALUES
    ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','members',NULL,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',NULL,NULL)`);
  await query(`INSERT INTO provenance_tombstones VALUES
    ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','members','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','2026-10-25T00:00:01Z')`);

  const one = await sealR20DeletionLedger(paths);
  check('initial seal creates generation 1', one.sealed && one.generation === 1 && one.changed, one);
  verifyR20DeletionLedger(paths);
  check('generation 1 verifies', true);
  const ledgerOne = fs.readFileSync(paths.ledgerFile);
  const highOne = fs.readFileSync(paths.highWaterFile);
  const unchanged = await sealR20DeletionLedger(paths);
  check('unchanged database does not advance generation', unchanged.generation === 1 && !unchanged.changed, unchanged);

  await query(`INSERT INTO deletion_manifests VALUES
    ('44444444-4444-4444-8444-444444444444','member_deletion','fictional-second','fictional-owner',NULL,'2026-10-25T00:01:00Z','fictional only')`);
  await query(`INSERT INTO deletion_manifest_scopes VALUES
    ('55555555-5555-4555-8555-555555555555','44444444-4444-4444-8444-444444444444','synthetic_sessions','fictional-session',NULL,NULL,NULL)`);
  await query(`INSERT INTO provenance_tombstones VALUES
    ('66666666-6666-4666-8666-666666666666','44444444-4444-4444-8444-444444444444','synthetic_sessions','fictional-session','2026-10-25T00:01:01Z')`);
  const two = await sealR20DeletionLedger(paths);
  check('new deletion authority advances to generation 2', two.generation === 2 && two.changed, two);
  const verifiedTwo = verifyR20DeletionLedger(paths);
  check('generation 2 payload contains both acts',
    verifiedTwo.envelope.payload.manifests.length === 2 &&
    verifiedTwo.envelope.payload.scopes.length === 2 &&
    verifiedTwo.envelope.payload.tombstones.length === 2,
    { manifests: verifiedTwo.envelope.payload.manifests.length,
      scopes: verifiedTwo.envelope.payload.scopes.length,
      tombstones: verifiedTwo.envelope.payload.tombstones.length });
  const ledgerTwo = fs.readFileSync(paths.ledgerFile);
  const highTwo = fs.readFileSync(paths.highWaterFile);

  const tampered = JSON.parse(ledgerTwo.toString('utf8'));
  tampered.payload.manifests[0].authorized_by = 'tampered';
  fs.writeFileSync(paths.ledgerFile, JSON.stringify(tampered) + '\n', { mode: 0o600 });
  await expectedError('payload tamper is refused', 'R20_LEDGER_HMAC_INVALID', () => verifyR20DeletionLedger(paths));
  fs.writeFileSync(paths.ledgerFile, ledgerTwo, { mode: 0o600 });

  fs.writeFileSync(paths.ledgerFile, ledgerOne, { mode: 0o600 });
  fs.writeFileSync(paths.highWaterFile, highTwo, { mode: 0o600 });
  await expectedError('older valid ledger is refused by newer high-water', 'R20_LEDGER_STALE_GENERATION', () => verifyR20DeletionLedger(paths));
  fs.writeFileSync(paths.ledgerFile, ledgerTwo, { mode: 0o600 });
  fs.writeFileSync(paths.highWaterFile, highTwo, { mode: 0o600 });

  await query(`DELETE FROM provenance_tombstones WHERE id='33333333-3333-4333-8333-333333333333'`);
  await expectedError('database deletion-authority regression is refused', 'R20_LEDGER_DATABASE_REGRESSION', () => sealR20DeletionLedger(paths));
  await query(`INSERT INTO provenance_tombstones VALUES
    ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','members','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','2026-10-25T00:00:01Z')`);

  await query('TRUNCATE provenance_tombstones, deletion_manifest_scopes, deletion_manifests');
  const imported = await importR20DeletionLedger(paths);
  const counts = (await query<{m: string;s: string;t: string}>(`SELECT
    (SELECT count(*)::text FROM deletion_manifests) m,
    (SELECT count(*)::text FROM deletion_manifest_scopes) s,
    (SELECT count(*)::text FROM provenance_tombstones) t`)).rows[0];
  check('signed ledger repopulates emptied governance database',
    imported.generation === 2 && imported.manifests === 2 && imported.scopes === 2 && imported.tombstones === 2 &&
    counts?.m === '2' && counts?.s === '2' && counts?.t === '2', { imported, counts });
  const reseal = await sealR20DeletionLedger(paths);
  check('repopulated database matches generation 2 without advancement', reseal.generation === 2 && !reseal.changed, reseal);
  const modes = { ledgerMode: mode(paths.ledgerFile), highMode: mode(paths.highWaterFile), keyMode: mode(paths.keyFile) };
  check('ledger, high-water and key are owner-only files', modes.ledgerMode === '600' && modes.highMode === '600' && modes.keyMode === '600', modes);

  const result = {
    protocol: 'soullab.ws.r20.deletion-ledger-physical.v1',
    result: checks.every((c) => c.pass) && checks.length === 11 ? 'PASS' : 'FAIL',
    passed: checks.filter((c) => c.pass).length,
    failed: checks.filter((c) => !c.pass).length,
    checks,
    sourceCommit,
    sourceTree,
    candidateChangedPaths: Number(process.env.R20_CANDIDATE_CHANGED_PATHS ?? '0'),
    ledgerSourceSha256: process.env.R20_LEDGER_SOURCE_SHA256,
    finalGeneration: 2,
    coordinatedLedgerAndHighWaterRollbackTested: false,
    externalHighWaterCustodyRequired: true,
    transport: 'unix_socket_only', network: 'none', ephemeral: true,
    productionDataTouched: false, memberDataTouched: false,
    sourceModified: false, release: 'HOLD',
  };
  console.log(JSON.stringify(result, null, 2));
  if (result.result !== 'PASS') process.exitCode = 1;
}
main().finally(async () => { await closePool(); }).catch((error) => {
  console.error(JSON.stringify({ protocol:'soullab.ws.r20.deletion-ledger-physical.v1', result:'FAIL', error:r20LedgerErrorCode(error) }));
  process.exitCode = 1;
});
