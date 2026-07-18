import type { RefusalCheck } from './harness';

/**
 * Refusal 20 — Sanctuary content may never survive through backup restoration.
 *
 * Ruled by Kelly 2026-07-17 (incident SANC-20260614-01 closure). The failure
 * it forbids:
 *
 *   delete from live DB → restore a backup → Sanctuary content returns
 *
 * which would re-violate the same promise the deletion honored.
 *
 * STATUS: enforced by the S5 provenance substrate (2026-07-18), two layers:
 *
 *   1. DB layer — s5_refuse_tombstoned BEFORE INSERT triggers on the content
 *      lanes silently DROP any row that is tombstoned or inside a
 *      deletion-manifest scope. Triggers fire on COPY, so a data-only
 *      pg_restore into the live schema cannot resurrect forgotten rows.
 *   2. Restore path — scripts/restore-governed.sh preserves the governance
 *      tables across a full restore, re-applies them, and sweeps tombstoned/
 *      scoped rows afterward. The raw path (restore-db.sh) refuses unless
 *      explicitly overridden as ungoverned.
 *
 * The known incident (SANC-20260614-01) is seeded as the first first-class
 * deletion manifest with its exact predicates (session + window per lane).
 *
 * Restore-lane strengthening (merge-gate rehearsal, 2026-07-18): the mint
 * gates admit historical (unknown-historical) rows ONLY when the session has
 * declared the governed restore lane (SET s5.restore_lane = 'governed', set
 * exclusively by restore-governed.sh). Consequence: an UNGOVERNED raw replay
 * of any dump containing historical rows now fails loudly at the database —
 * the governed path is structurally unavoidable for historical dumps, proven
 * live on a production-shaped copy.
 *
 * Residual (named, not hidden): a full SCHEMA-REPLACING restore replays data
 * before pg_dump recreates the triggers, so that one path still depends on the
 * governed script's post-restore sweep. Hence grade B, not yet A.
 *
 * Behavioral demonstration: tests/constitutional/sanctuary-s5-behavioral-proof.ts
 * (PROOF B tombstone refusal, PROOF C scope refusal) + the Proof D governed
 * restore rehearsal (S5_MERGE_GATE_REHEARSAL_2026-07-18.md) — run with
 * DATABASE_URL against the local dev stack, never production.
 */

const MIGRATION = 'database/migrations/20260718000001_s5_provenance_substrate.sql';

export const check: RefusalCheck = {
  id: 'R20',
  refusal: 'Sanctuary content may never survive through backup restoration',
  grade: 'B',
  enforcedBy: `${MIGRATION} (tombstones + scopes + s5_refuse_tombstoned triggers) + scripts/restore-governed.sh + scripts/restore-db.sh refusal`,
  evidence: 'Ruled 2026-07-17; S5 substrate 2026-07-18; incident manifest seeded in-migration; behavioral proof PROOF B/C',
  violationAttempted: 'find the substrate absent: no tombstone tables, no restore-refusal triggers, no governed restore path, raw restore path ungated, incident manifest unseeded',
  passingAuthorizes: 'that restore filtering machinery exists structurally: tombstoned/scoped rows are refused at INSERT (incl. COPY) and the governed restore sweeps after full restores',
  passingDoesNotAuthorize: 'that an out-of-repo raw psql restore is impossible — that path remains operationally governed (founder presence), grade B residual',
  hostileForkMustChange: 'drop the triggers or tombstone tables from the migration, gut restore-governed.sh, or remove the restore-db.sh refusal — all visible diffs',

  run(io) {
    const migration = io.read(MIGRATION);

    if (migration.includes('CREATE TABLE IF NOT EXISTS provenance_tombstones')
      && migration.includes('CREATE TABLE IF NOT EXISTS deletion_manifests')
      && migration.includes('CREATE TABLE IF NOT EXISTS deletion_manifest_scopes')) {
      io.pass('Deletion manifests, scopes, and tombstones exist as first-class tables');
    } else {
      io.fail('Governance tables missing from S5 migration');
    }

    if (migration.includes('s5_refuse_tombstoned')
      && migration.includes('BEFORE INSERT ON conversation_turns')) {
      io.pass('Restore-refusal trigger armed on conversation_turns (fires on COPY — data-only restores filtered)');
    } else {
      io.fail('s5_refuse_tombstoned trigger not armed on conversation_turns');
    }

    if (migration.includes('SANC-20260614-01') && migration.includes('session_1781360679324')) {
      io.pass('Known incident seeded as first-class manifest with its exact predicates');
    } else {
      io.fail('Incident SANC-20260614-01 manifest not seeded');
    }

    const governed = io.read('scripts/restore-governed.sh');
    if (governed.includes('provenance_tombstones') && governed.includes('deletion_manifest_scopes')
      && governed.includes('RESTORE_AUTHORIZED_BY')) {
      io.pass('Governed restore path exists: preserves governance tables, sweeps after restore, requires named authorizer');
    } else {
      io.fail('scripts/restore-governed.sh missing or does not consume manifests/tombstones');
    }

    const raw = io.read('scripts/restore-db.sh');
    if (raw.includes('R20') && raw.includes('I_UNDERSTAND_THIS_RESTORE_IS_UNGOVERNED')) {
      io.pass('Raw restore path refuses by default (explicit ungoverned override required)');
    } else {
      io.fail('scripts/restore-db.sh does not refuse ungoverned restores');
    }

    io.note(
      'Residual (grade B): out-of-repo raw psql full restore bypasses both layers until swept',
      'operationally governed — founder-present restores via restore-governed.sh only'
    );
  },
};
