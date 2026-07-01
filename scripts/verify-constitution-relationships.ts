/**
 * Constitutional Verifier: Relationships
 *
 * Verifies that practitioner–client relationships, encounter ownership,
 * and shared access respect consent, scope, and referral integrity.
 *
 * Constitutional invariants verified:
 *   - Practitioner-client scope: clients belong to specific Co-Labs
 *   - Encounter ownership: encounters are Co-Lab-anchored
 *   - File share integrity: shares reference active files in scoped contexts
 *   - No orphaned relationships: participants reference valid encounters
 *   - Referral integrity: no dangling foreign keys in relationship tables
 *
 * Status:
 *   [LIVE] checks run against current production data.
 *   [PENDING] marks constitutional commitments not yet fully wired.
 *
 * Authority: docs/canon/ENCOUNTER_AS_PRIMITIVE.md ·
 *            docs/canon/RELATIONAL_FACULTIES.md ·
 *            ADRs 005–009
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://soullab@localhost:5432/maia_consciousness',
});

let passed = 0; let failed = 0; let warned = 0;

function pass(label: string, detail?: string) {
  console.log(`  ✅ PASS  ${label}${detail ? `  (${detail})` : ''}`);
  passed++;
}
function fail(label: string, detail?: string) {
  console.log(`  ❌ FAIL  ${label}${detail ? `  → ${detail}` : ''}`);
  failed++;
}
function warn(label: string, detail?: string) {
  console.log(`  ⚠️  WARN  ${label}${detail ? `  (${detail})` : ''}`);
  warned++;
}
function section(title: string) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 60 - title.length))}`);
}
async function q<T = Record<string, unknown>>(sql: string, p: unknown[] = []): Promise<T[]> {
  return (await pool.query(sql, p)).rows as T[];
}
async function qOne<T = Record<string, unknown>>(sql: string, p: unknown[] = []): Promise<T | null> {
  return (await q<T>(sql, p))[0] ?? null;
}

// ── Section 1: Client / People Scope ─────────────────────────────────────────

async function checkAllPeopleHaveTeam() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM studio_people WHERE team_id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All studio_people records have team_id`);
  } else {
    fail(`[LIVE] ${r?.n} studio_people record(s) have no team_id`, `scope lost after migration`);
  }
}

async function checkNoDuplicateClientEmailAcrossTeam() {
  // The unique index (team_id, lower(email)) prevents this at DB level.
  // Verify the index holds by checking for duplicates.
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM (
       SELECT team_id, lower(email), COUNT(*) AS c
       FROM studio_people
       WHERE email IS NOT NULL
       GROUP BY team_id, lower(email)
       HAVING COUNT(*) > 1
     ) dupes`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] No duplicate client emails within any Co-Lab`);
  } else {
    fail(`[LIVE] ${r?.n} duplicate (team_id, email) pair(s) in studio_people`);
  }
}

async function checkPeopleTeamExistsInStudioTeams() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM studio_people sp
     LEFT JOIN studio_teams st ON st.id = sp.team_id
     WHERE st.id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All studio_people.team_id values reference existing teams`);
  } else {
    fail(`[LIVE] ${r?.n} studio_people record(s) reference non-existent team_id`);
  }
}

// ── Section 2: Encounter Ownership ───────────────────────────────────────────

async function checkAllEncountersHaveTeam() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM encounters WHERE team_id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All encounters have team_id`);
  } else {
    fail(`[LIVE] ${r?.n} encounter(s) have no team_id`);
  }
}

async function checkEncounterParticipantsHaveValidEncounter() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM encounter_participants ep
     LEFT JOIN encounters e ON e.id = ep.encounter_id
     WHERE e.id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All encounter_participants reference valid encounters`);
  } else {
    fail(`[LIVE] ${r?.n} encounter_participant(s) reference non-existent encounter`);
  }
}

async function checkEncounterPractitionerExists() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM encounters e
     LEFT JOIN practitioners p ON p.id = e.practitioner_id
     WHERE p.id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All encounters have a valid practitioner`);
  } else {
    fail(`[LIVE] ${r?.n} encounter(s) reference non-existent practitioner_id`);
  }
}

// ── Section 3: Session Scope ──────────────────────────────────────────────────

async function checkAllSessionsHaveTeam() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM sessions WHERE team_id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All sessions have team_id`);
  } else {
    fail(`[LIVE] ${r?.n} session(s) have no team_id`);
  }
}

async function checkSessionsDoNotCrossTeamBoundary() {
  // A session's practitioner_id must belong to the same team as the session.
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM sessions s
     WHERE NOT EXISTS (
       SELECT 1 FROM studio_team_members stm
       JOIN practitioners p ON p.member_id = stm.member_id
       WHERE p.id = s.practitioner_id AND stm.team_id = s.team_id
     )`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All sessions are owned by a practitioner in the session's Co-Lab`);
  } else {
    warn(
      `[LIVE] ${r?.n} session(s) have practitioner_id not in session's team`,
      `may be legitimate if practitioner was removed from team post-session`
    );
  }
}

// ── Section 4: File Share Integrity ──────────────────────────────────────────

async function checkSharesReferenceActiveFiles() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM practitioner_file_shares pfs
     LEFT JOIN practitioner_files pf ON pf.id = pfs.file_id
     WHERE pf.id IS NULL OR pf.status = 'deleted'`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All active file shares reference non-deleted files`);
  } else {
    warn(
      `[LIVE] ${r?.n} file share(s) reference deleted or missing files`,
      `shares will 404 on redemption — deactivate stale shares`
    );
  }
}

async function checkNoExpiredActiveShares() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM practitioner_file_shares
     WHERE is_active = true
       AND expires_at IS NOT NULL
       AND expires_at < NOW()`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] No active shares have passed their expiry`);
  } else {
    warn(
      `[LIVE] ${r?.n} share(s) are marked active but past expiry`,
      `serve route should check expiry; consider a cleanup job`
    );
  }
}

// ── Section 5: Pending Constitutional Commitments ────────────────────────────

async function checkConsentToRelationshipPending() {
  // Relational Faculties canon: practitioner-client relationships require
  // explicit consent before encounter memory can accumulate.
  // Pending: consent table for client relationships not yet wired.
  warn(
    `[PENDING] Practitioner–client consent gate not yet verifiable`,
    `when wired: verify no client atoms exist without consent record`
  );
}

async function checkReferralIntegrityPending() {
  // When referral/consultation primitives ship, verify that referral chains
  // reference valid practitioners and that referred-to sessions are visible
  // only to the receiving practitioner, not the referrer.
  warn(
    `[PENDING] Referral integrity and consultation permission scope not yet wired`,
    `Co-Lab practice architecture: 4-layer (Platform→Co-Lab→Group→Encounter→Session Room)`
  );
}

async function checkEncounterOwnershipConsentPending() {
  // Encounter as Primitive canon: an encounter's content is owned by the
  // encounter, not the practitioner. Verify isolation when multi-practitioner
  // encounters ship.
  warn(
    `[PENDING] Multi-practitioner encounter ownership isolation not yet verifiable`,
    `when wired: verify each practitioner sees only their encounter context`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        Constitutional Verifier: Relationships                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  section('1. Client / People Scope');
  await checkAllPeopleHaveTeam();
  await checkNoDuplicateClientEmailAcrossTeam();
  await checkPeopleTeamExistsInStudioTeams();

  section('2. Encounter Ownership');
  await checkAllEncountersHaveTeam();
  await checkEncounterParticipantsHaveValidEncounter();
  await checkEncounterPractitionerExists();

  section('3. Session Scope');
  await checkAllSessionsHaveTeam();
  await checkSessionsDoNotCrossTeamBoundary();

  section('4. File Share Integrity');
  await checkSharesReferenceActiveFiles();
  await checkNoExpiredActiveShares();

  section('5. Pending Constitutional Commitments [WARN — not yet verifiable]');
  await checkConsentToRelationshipPending();
  await checkReferralIntegrityPending();
  await checkEncounterOwnershipConsentPending();

  const total = passed + failed + warned;
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  Relationships: ${passed} passed · ${failed} failed · ${warned} warned (${total} total)${' '.repeat(Math.max(0, 14 - String(total).length))}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  await pool.end();
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
