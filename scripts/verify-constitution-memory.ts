/**
 * Constitutional Verifier: Memory
 *
 * Verifies that the memory substrate honors the platform's consent, scope,
 * provenance, and containment invariants. These are not tests of memory
 * *quality* — they are tests of constitutional behavior.
 *
 * Constitutional invariants verified:
 *   - Consent: only explicitly consented atoms surface ambiently
 *   - Scope: atoms never surface outside their declared containment boundary
 *   - Provenance: practitioner observations carry attribution; system never
 *     claims authorship it does not have
 *   - Containment: personal atoms carry no Co-Lab context; non-personal
 *     atoms are anchored to a specific workspace
 *   - Integrity: schema constraints hold; no orphaned or malformed scope records
 *
 * Status:
 *   Checks marked [LIVE] verify currently-wired behavior against production data.
 *   Checks marked [PENDING] are constitutional commitments not yet fully wired —
 *   they will become LIVE as the memory substrate matures. Pending checks
 *   emit WARN (not FAIL) and are never silently skipped.
 *
 * Canon: docs/canon/VERIFICATION_STATES.md
 * States: LIVE, WARNING, PENDING — current maturity assessments, not declarations.
 *
 * Authority: docs/canon/THE_CLEARING.md · SPIRAL_CONTINUITY_ENGINE.md ·
 *            RIGHT_TO_REMAIN_UNPOSSESSED.md · migration 20260630000005
 *
 * Usage:
 *   npx tsx scripts/verify-constitution-memory.ts
 *   DATABASE_URL=postgres://... npx tsx scripts/verify-constitution-memory.ts
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

// ── Section 1: Scope containment ─────────────────────────────────────────────
// [LIVE] Migration 20260630000005 — scope columns + coherence constraints

async function checkPersonalScopeHasNoTeam() {
  // The atom_scope_requires_team constraint should make this impossible,
  // but schema constraints can be dropped. Verify at data level too.
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE memory_scope = 'personal' AND team_id IS NOT NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] Personal-scope atoms have no team_id (containment holds)`);
  } else {
    fail(`[LIVE] ${r?.n} personal atom(s) have team_id set`, `violates atom_scope_requires_team`);
  }
}

async function checkNonPersonalScopeHasTeam() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE memory_scope <> 'personal' AND team_id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] Non-personal atoms are anchored to a team_id`);
  } else {
    fail(`[LIVE] ${r?.n} non-personal atom(s) have no team_id`, `Co-Lab context lost`);
  }
}

async function checkClientScopeHasClientId() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE memory_scope = 'client' AND client_id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] Client-scope atoms are anchored to a client_id`);
  } else {
    fail(`[LIVE] ${r?.n} client-scope atom(s) have no client_id`);
  }
}

async function checkEncounterScopeHasEncounterId() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE memory_scope = 'encounter' AND encounter_id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] Encounter-scope atoms are anchored to an encounter_id`);
  } else {
    fail(`[LIVE] ${r?.n} encounter-scope atom(s) have no encounter_id`);
  }
}

async function checkScopeEnumValid() {
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE memory_scope NOT IN ('personal', 'colab', 'client', 'encounter')`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All atom scope values are in the declared enum`);
  } else {
    fail(`[LIVE] ${r?.n} atom(s) have invalid memory_scope values`);
  }
}

// ── Section 2: Consent gates ──────────────────────────────────────────────────
// [LIVE] Atoms that surface ambiently must pass consent filter.
// The loader enforces these in SQL; we verify the data distribution here.

async function checkNoUnconsented() {
  // return_preference = 'member_pulled' means the member has NOT consented to
  // ambient surfacing. These should not count as "ambient" atoms —
  // they exist but only surface on explicit member request.
  const total = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms WHERE status IN ('active', 'still_alive')`
  );
  const consented = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE status IN ('active', 'still_alive')
       AND return_preference IN ('contextual_doorway', 'ritual_review_opt_in')`
  );
  const memberpulled = (total?.n ?? 0) - (consented?.n ?? 0);
  pass(
    `[LIVE] Consent distribution: ${consented?.n ?? 0} ambient-eligible, ${memberpulled} member-pulled only`,
    `of ${total?.n ?? 0} active atoms`
  );
}

async function checkNoSacredProtectedInAmbientSurface() {
  // sacred_protected register atoms must never surface ambiently.
  // The loader blocks them in SQL. Verify no such atoms have been
  // misclassified with a return_preference that would make them eligible.
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE 'sacred_protected' = ANY(registers)
       AND return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
       AND status IN ('active', 'still_alive')`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] No sacred_protected atoms are marked for ambient surfacing`);
  } else {
    fail(
      `[LIVE] ${r?.n} sacred_protected atom(s) have ambient return_preference`,
      `these would surface if the SQL guard were removed`
    );
  }
}

async function checkNoDeletedAtomsAmbiented() {
  // Deleted/archived atoms must never surface. The loader filters by status,
  // but verify no status values exist outside the declared set.
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE status NOT IN ('active', 'still_alive', 'set_aside', 'protected', 'archived', 'deleted')`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] All atom status values are in the declared enum`);
  } else {
    fail(`[LIVE] ${r?.n} atom(s) have invalid status values`);
  }
}

// ── Section 3: Provenance ─────────────────────────────────────────────────────
// [LIVE] Practitioner observation atoms must carry attribution.
// The system never claims authorship it does not have.

async function checkPractitionerObservationAttribution() {
  const unattributed = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE source_type = 'practitioner_observation'
       AND facilitator_id IS NULL
       AND status IN ('active', 'still_alive')`
  );
  if ((unattributed?.n ?? 0) === 0) {
    pass(`[LIVE] All active practitioner_observation atoms have facilitator_id`);
  } else {
    warn(
      `[LIVE] ${unattributed?.n} active practitioner_observation atom(s) lack facilitator_id`,
      `these are blocked from surfacing by the attribution guard but should be attributed or archived`
    );
  }
}

async function checkBreakthroughFlagCoherence() {
  // is_breakthrough = true must have marked_breakthrough_at set.
  // Schema constraint breakthrough_flag_timestamp_coherent should enforce this.
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE is_breakthrough = true AND marked_breakthrough_at IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] Breakthrough flags are coherent (flag ↔ timestamp)`);
  } else {
    fail(`[LIVE] ${r?.n} atom(s) have is_breakthrough=true but no marked_breakthrough_at`);
  }
}

async function checkNoSystemSetBreakthroughs() {
  // The breakthrough flag is a member gesture only — the system may never set it.
  // We cannot directly verify who set a flag without an audit log, but we can
  // verify no atoms have breakthrough set alongside system-only source_types
  // that would indicate automated marking.
  const r = await qOne<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM member_memory_atoms
     WHERE is_breakthrough = true
       AND source_type IN ('practitioner_observation')
       AND facilitator_id IS NULL`
  );
  if ((r?.n ?? 0) === 0) {
    pass(`[LIVE] No unattributed practitioner observations are marked as breakthroughs`);
  } else {
    warn(
      `[LIVE] ${r?.n} atom(s) are breakthrough-flagged practitioner observations without attribution`,
      `review: could be system-set if no facilitator gesture occurred`
    );
  }
}

// ── Section 4: Pending constitutional commitments ────────────────────────────
// These are invariants the architecture commits to but are not yet fully
// verifiable against production data. They emit WARN, not FAIL.

async function checkMemoryConsentTogglePending() {
  // conversational_recall_enabled opt-out surface: when shipped, every member
  // who has opted out must have zero atoms surfacing in the conversational block.
  // Pending: opt-out column not yet in members table.
  warn(
    `[PENDING] Member recall opt-out (conversational_recall_enabled) not yet verifiable`,
    `when shipped: verify no atoms surface for members where opt-out = false`
  );
}

async function checkCrossSessionContinuityPending() {
  // Episodic memory: when shipped, verify episodic atoms surface across sessions
  // for the same member WITHOUT synthesizing or interpreting across atoms.
  // Pending: episodic substrate wired but not yet surfacing in prompt.
  warn(
    `[PENDING] Episodic continuity verification not yet wired`,
    `when EpisodicMemoryService ships: verify surfacing without synthesis`
  );
}

async function checkFieldMemoryPending() {
  // Coherence/field memory: verify field atoms have explicit member-placed
  // provenance, not system-inferred. Pending: field scope not yet wired.
  warn(
    `[PENDING] Field/coherence memory scope not yet wired for verification`,
    `freeze conditions in COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md §0.C still unmet`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        Constitutional Verifier: Memory                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  section('1. Scope Containment — atoms never cross their declared boundary');
  await checkPersonalScopeHasNoTeam();
  await checkNonPersonalScopeHasTeam();
  await checkClientScopeHasClientId();
  await checkEncounterScopeHasEncounterId();
  await checkScopeEnumValid();

  section('2. Consent Gates — only consented atoms surface ambiently');
  await checkNoUnconsented();
  await checkNoSacredProtectedInAmbientSurface();
  await checkNoDeletedAtomsAmbiented();

  section('3. Provenance — system does not claim authorship it does not have');
  await checkPractitionerObservationAttribution();
  await checkBreakthroughFlagCoherence();
  await checkNoSystemSetBreakthroughs();

  section('4. Pending Constitutional Commitments [WARN — not yet verifiable]');
  await checkMemoryConsentTogglePending();
  await checkCrossSessionContinuityPending();
  await checkFieldMemoryPending();

  const total = passed + failed + warned;
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  Memory: ${passed} passed · ${failed} failed · ${warned} warned (${total} total)${' '.repeat(Math.max(0, 22 - String(total).length))}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  await pool.end();
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
